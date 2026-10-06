import test, { after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "readora-test-"));
process.env.SQLITE_PATH = path.join(tmp, "test.sqlite");
delete process.env.DATABASE_URL;
delete process.env.VERCEL;
process.env.NODE_ENV = "test";
const { setup } = await import("../server/setup.js");
const { default: handler, calculateStats } = await import("../server/api.js");
const { transaction, closeDb } = await import("../server/db.js");
await setup({ demo: true });
const server = http.createServer(handler);
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
function client() {
  let cookie = "";
  return async (action, data = {}) => {
    const res = await fetch(base, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ action, ...data }),
    });
    if (res.headers.get("set-cookie"))
      cookie = res.headers.get("set-cookie").split(";")[0];
    return { status: res.status, ...(await res.json()) };
  };
}
const guest = client(),
  learner = client(),
  supervisor = client(),
  admin = client(),
  stranger = client();
const login = (c, username) =>
  c("login", { username, password: "ReadoraDemo123!" });
async function complete(c, id, allCorrect = true) {
  let r = await c("start", { exerciseId: id });
  assert.equal(r.status, 200);
  const attemptId = r.attempt.id;
  const snapshot = await transaction(async (db) =>
    JSON.parse(
      (
        await db.query("SELECT snapshot FROM attempts WHERE id=?", [attemptId])
      )[0].snapshot,
    ),
  );
  for (let i = 0; i < snapshot.sections.length; i++) {
    for (const q of snapshot.sections[i].questions) {
      r = await c("answer", {
        id: attemptId,
        questionId: q.id,
        selected: allCorrect ? q.correct : (q.correct + 1) % 4,
      });
      assert.equal(r.status, 200);
    }
    if (i < snapshot.sections.length - 1) {
      r = await c("next", { id: attemptId });
      assert.equal(r.status, 200);
    }
  }
  return c("finish", { id: attemptId });
}
after(async () => {
  await new Promise((r) => server.close(r));
  await closeDb();
  fs.rmSync(tmp, { recursive: true, force: true });
});
test("system workflow, permissions, scoring, and durable records", async (t) => {
  await t.test(
    "guest catalog does not expose answers; private routes require auth",
    async () => {
      const r = await guest("catalog");
      assert.equal(r.exercises.length, 8);
      assert.equal(JSON.stringify(r).includes("correct"), false);
      assert.equal((await guest("dashboard")).status, 401);
      assert.equal(
        (await guest("start", { exerciseId: "baseline" })).status,
        401,
      );
    },
  );
  await t.test("real sign-in, registration and role restrictions", async () => {
    for (const [c, u] of [
      [learner, "learner"],
      [supervisor, "supervisor"],
      [admin, "admin"],
    ])
      assert.equal((await login(c, u)).status, 200);
    assert.equal(
      (
        await stranger("register", {
          username: "outsider",
          password: "VeryStrongPassword123",
          name: "Outside learner",
          role: "learner",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await guest("register", {
          username: "hacker",
          password: "VeryStrongPassword123",
          name: "No",
          role: "admin",
        })
      ).status,
      400,
    );
    assert.equal((await learner("admin")).status, 403);
    assert.equal((await supervisor("dashboard")).status, 403);
    assert.equal((await learner("session")).user.role, "learner");
  });
  await t.test(
    "assessment is not skippable, answers stay private, and saved work resumes",
    async () => {
      const r = await learner("start", { exerciseId: "baseline" });
      assert.equal(r.attempt.section.questions[0].correct, undefined);
      assert.equal((await learner("finish", { id: r.attempt.id })).status, 400);
      assert.equal((await learner("next", { id: r.attempt.id })).status, 400);
      assert.equal(
        (await stranger("attempt", { id: r.attempt.id })).status,
        404,
      );
      const resumed = await learner("start", { exerciseId: "baseline" });
      assert.equal(resumed.attempt.id, r.attempt.id);
    },
  );
  let baselineResult;
  await t.test(
    "baseline grades server-side and awards correct XP",
    async () => {
      baselineResult = await complete(learner, "baseline");
      assert.equal(baselineResult.attempt.correct, 8);
      assert.equal(baselineResult.stats.overall, 100);
      assert.equal(baselineResult.stats.readingLevel, "Advanced");
      assert.equal(baselineResult.xpEarned, 50);
      assert.equal(baselineResult.stats.playerLevel, 1);
      assert.equal(baselineResult.stats.achievements.length, 2);
      assert.equal(
        (await learner("start", { exerciseId: "baseline" })).status,
        400,
      );
    },
  );
  await t.test(
    "duplicate completion is idempotent and answers cannot be changed",
    async () => {
      const id = baselineResult.attempt.id;
      const results = await Promise.all([
        learner("finish", { id }),
        learner("finish", { id }),
      ]);
      assert.ok(results.every((r) => r.xpEarned === 0));
      assert.equal((await learner("dashboard")).stats.xp, 50);
      assert.equal(
        (
          await learner("answer", {
            id,
            questionId: baselineResult.attempt.answers[0].questionId,
            selected: 2,
          })
        ).status,
        400,
      );
    },
  );
  await t.test(
    "repeat attempts affect comprehension but never duplicate XP or revoke achievements",
    async () => {
      const first = await complete(learner, "carroll-curious-alice");
      assert.equal(first.xpEarned, 30);
      const second = await complete(learner, "carroll-curious-alice", false);
      assert.equal(second.xpEarned, 0);
      assert.equal(second.stats.xp, 80);
      assert.equal(second.stats.total, 16);
      assert.equal(second.stats.overall, 75);
      assert.equal(second.stats.readingLevel, "Advanced");
      assert.ok(
        second.stats.achievements.some((a) => a.code === "clear-reader"),
      );
    },
  );
  let learnerId;
  await t.test(
    "supervisor consent codes, assignments, completion and revocation",
    async () => {
      learnerId = (await learner("session")).user.id;
      assert.equal(
        (
          await supervisor("assign", {
            learnerId,
            exerciseId: "aesop-hare-tortoise",
            dueDate: "2027-01-01",
          })
        ).status,
        403,
      );
      const invite = await learner("invite");
      assert.equal(invite.code.length, 12);
      assert.equal(
        (await supervisor("connect", { code: invite.code })).status,
        200,
      );
      assert.equal(
        (await supervisor("connect", { code: invite.code })).status,
        400,
      );
      assert.equal((await supervisor("supervisor")).learners.length, 1);
      assert.equal(
        (
          await supervisor("assign", {
            learnerId,
            exerciseId: "aesop-hare-tortoise",
            dueDate: "2027-01-01",
            note: "Focus on inference",
          })
        ).status,
        200,
      );
      assert.equal((await learner("dashboard")).assignments[0].done, false);
      await complete(learner, "aesop-hare-tortoise");
      assert.equal((await supervisor("supervisor")).assignments[0].done, true);
      const sup = (await supervisor("session")).user.id;
      await learner("disconnect", { supervisorId: sup });
      assert.equal((await supervisor("supervisor")).learners.length, 0);
      assert.equal((await learner("dashboard")).assignments.length, 0);
    },
  );
  await t.test(
    "admin CRUD preserves attempt snapshots; draft and deleted records leave public catalog",
    async () => {
      const all = await admin("admin");
      const e = all.exercises.find((e) => e.id === "carroll-curious-alice");
      const started = await learner("start", { exerciseId: e.id });
      assert.equal(
        (
          await admin("saveExercise", {
            ...e,
            title: "Updated title",
            published: false,
          })
        ).status,
        200,
      );
      assert.equal(
        (await guest("catalog")).exercises.some((x) => x.id === e.id),
        false,
      );
      assert.equal(
        (await learner("attempt", { id: started.attempt.id })).attempt.title,
        e.title,
      );
      assert.equal((await admin("deleteExercise", { id: e.id })).status, 200);
      assert.equal(
        (await learner("attempt", { id: started.attempt.id })).status,
        200,
      );
      assert.ok(
        (await learner("dashboard")).stats.history.some(
          (h) => h.title === e.title,
        ),
      );
      assert.equal(
        (await admin("deleteExercise", { id: "baseline" })).status,
        400,
      );
      const invalid = await admin("saveExercise", {
        ...e,
        id: undefined,
        sections: [],
      });
      assert.equal(invalid.status, 400);
      await setup();
      assert.equal(
        (await guest("catalog")).exercises.some((x) => x.id === e.id),
        false,
      );
    },
  );
  await t.test("server logout invalidates session", async () => {
    await learner("logout");
    assert.equal((await learner("session")).user, null);
    assert.equal((await learner("dashboard")).status, 401);
  });
});
test("level cutoffs use unrounded proportions, and no data is not a score", () => {
  const s = calculateStats([]);
  assert.equal(s.overall, null);
  assert.equal(s.readingLevel, "Not Assessed");
  const make = (correct, total) =>
    calculateStats([
      {
        exercise_id: "baseline",
        snapshot: JSON.stringify({ baseline: true }),
        answers: JSON.stringify(
          Array.from({ length: total }, (_, i) => ({
            skill: "Inference",
            correct: i < correct,
          })),
        ),
      },
    ]);
  assert.equal(make(149, 200).readingLevel, "Intermediate");
  assert.equal(make(99, 200).readingLevel, "Beginner");
  assert.equal(make(3, 4).readingLevel, "Advanced");
});
