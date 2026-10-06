import {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { transaction } from "./db.js";
import { hashPassword, ensureDatabaseReady } from "./setup.js";
import { SKILLS } from "./sourced-content.js";
const now = () => new Date().toISOString();
const digest = (x) => createHash("sha256").update(x).digest("hex");
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const requireRole = (user, ...roles) => {
  if (!user) fail("Please sign in to continue.", 401);
  if (!roles.includes(user.role))
    fail("You do not have access to this action.", 403);
};
const safeUser = (u) =>
  u && { id: u.id, name: u.name, username: u.username, role: u.role };
const str = (v, max = 200) =>
  typeof v === "string" && v.trim().length <= max ? v.trim() : "";
const obj = (e) => ({
  ...e,
  baseline: !!e.baseline,
  published: !!e.published,
  sections: JSON.parse(e.content),
});
function catalogItem(e) {
  const x = obj(e);
  return {
    id: x.id,
    title: x.title,
    level: x.level,
    category: x.category,
    description: x.description,
    minutes: x.minutes,
    source: x.source,
    published: x.published,
    baseline: x.baseline,
    skills: [
      ...new Set(x.sections.flatMap((s) => s.questions.map((q) => q.skill))),
    ],
    sectionCount: x.sections.length,
    questionCount: x.sections.reduce((n, s) => n + s.questions.length, 0),
  };
}
const level = (score) =>
  score < 50 ? "Beginner" : score < 75 ? "Intermediate" : "Advanced";
export const calculateStats = (attempts) => {
  const skills = Object.fromEntries(
    SKILLS.map((s) => [s, { correct: 0, total: 0, percent: null }]),
  );
  let correct = 0,
    total = 0;
  for (const a of attempts) {
    for (const x of JSON.parse(a.answers)) {
      skills[x.skill].total++;
      skills[x.skill].correct += x.correct ? 1 : 0;
      correct += x.correct ? 1 : 0;
      total++;
    }
  }
  for (const s of Object.values(skills))
    s.percent = s.total ? Math.round((100 * s.correct) / s.total) : null;
  const raw = total ? (100 * correct) / total : 0;
  return {
    skills,
    correct,
    total,
    overall: total ? Math.round(raw) : null,
    readingLevel: attempts.some((a) => JSON.parse(a.snapshot).baseline)
      ? level(raw)
      : "Not Assessed",
    completed: attempts.length,
    unique: new Set(attempts.map((a) => a.exercise_id)).size,
  };
};
async function stats(db, id) {
  const attempts = await db.query(
    "SELECT * FROM attempts WHERE user_id=? AND completed=1 ORDER BY completed_at DESC",
    [id],
  );
  const rewards = await db.query("SELECT * FROM rewards WHERE user_id=?", [id]);
  const xp = rewards.reduce((n, r) => n + r.xp, 0);
  return {
    ...calculateStats(attempts),
    xp,
    playerLevel: 1 + Math.floor(xp / 100),
    achievements: await db.query(
      "SELECT code,earned_at FROM achievements WHERE user_id=?",
      [id],
    ),
    history: attempts.map((a) => ({
      id: a.id,
      exerciseId: a.exercise_id,
      title: JSON.parse(a.snapshot).title,
      correct: a.correct,
      total: a.total,
      completedAt: a.completed_at,
      baseline: JSON.parse(a.snapshot).baseline,
    })),
  };
}
async function lockUser(db, id) {
  await db.query(
    `SELECT id FROM users WHERE id=?${db.remote ? " FOR UPDATE" : ""}`,
    [id],
  );
}
function attemptView(a) {
  const e = JSON.parse(a.snapshot),
    answers = JSON.parse(a.answers),
    sec = e.sections[a.section];
  return {
    id: a.id,
    title: e.title,
    level: e.level,
    source: e.source,
    baseline: e.baseline,
    sectionIndex: a.section,
    sectionCount: e.sections.length,
    completed: !!a.completed,
    correct: a.correct,
    total: a.total,
    answers,
    section: sec && {
      title: sec.title,
      text: sec.text,
      questions: sec.questions.map(({ correct, explanation, ...q }) => q),
    },
    answeredSection:
      !!sec &&
      sec.questions.every((q) => answers.some((a) => a.questionId === q.id)),
    allAnswered: e.sections
      .flatMap((s) => s.questions)
      .every((q) => answers.some((a) => a.questionId === q.id)),
    review: a.completed
      ? e.sections.map((s) => ({
          ...s,
          questions: s.questions.map((q) => ({
            ...q,
            answer: answers.find((a) => a.questionId === q.id),
          })),
        }))
      : undefined,
  };
}
function validateExercise(body) {
  const title = str(body.title, 120),
    description = str(body.description, 500),
    source = str(body.source, 1000),
    category = str(body.category, 60);
  if (
    !title ||
    !description ||
    !source ||
    !category ||
    !["Beginner", "Intermediate", "Advanced"].includes(body.level)
  )
    fail("Add a title, description, category, source, and valid level.");
  if (!Number.isInteger(body.minutes) || body.minutes < 1 || body.minutes > 60)
    fail("Reading time must be 1–60 minutes.");
  if (
    !Array.isArray(body.sections) ||
    body.sections.length < 1 ||
    body.sections.length > 12
  )
    fail("Add between 1 and 12 sections.");
  const sections = body.sections.map((s) => {
    if (
      !str(s.title, 120) ||
      !str(s.text, 12000) ||
      !Array.isArray(s.questions) ||
      !s.questions.length ||
      s.questions.length > 8
    )
      fail("Every section needs a heading, passage, and 1–8 questions.");
    return {
      id: randomUUID(),
      title: s.title.trim(),
      text: s.text.trim(),
      questions: s.questions.map((q) => {
        if (
          !SKILLS.includes(q.skill) ||
          !str(q.prompt, 500) ||
          !str(q.explanation, 1500) ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          q.options.some((o) => !str(o, 500)) ||
          !Number.isInteger(q.correct) ||
          q.correct < 0 ||
          q.correct > 3
        )
          fail(
            "Each question needs a skill, prompt, four options, a correct answer, and feedback.",
          );
        return {
          id: randomUUID(),
          skill: q.skill,
          prompt: q.prompt.trim(),
          options: q.options.map((x) => x.trim()),
          correct: q.correct,
          explanation: q.explanation.trim(),
        };
      }),
    };
  });
  return {
    title,
    description,
    source,
    category,
    level: body.level,
    minutes: body.minutes,
    published: body.published ? 1 : 0,
    sections,
  };
}
async function route(db, req, res, body) {
  const action = str(
    body.action ||
      new URL(req.url, "http://localhost").searchParams.get("action"),
    50,
  );
  const rawCookie = (req.headers.cookie || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("readora_session="))
    ?.slice(16);
  const token = rawCookie ? digest(rawCookie) : "";
  const session = token
    ? (
        await db.query(
          "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?",
          [token, now()],
        )
      )[0]
    : null;
  const user = session;
  const setCookie = (value, age) =>
    res.setHeader(
      "Set-Cookie",
      `readora_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.VERCEL || process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
  const newSession = async (u) => {
    const value = randomBytes(32).toString("hex");
    await db.query("DELETE FROM sessions WHERE expires_at<?", [now()]);
    await db.query(
      "INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)",
      [digest(value), u.id, new Date(Date.now() + 7 * 86400000).toISOString()],
    );
    setCookie(value, 604800);
    return safeUser(u);
  };
  if (action === "session")
    return {
      user: safeUser(user),
      demo:
        !process.env.VERCEL &&
        process.env.NODE_ENV !== "production" &&
        process.env.DEMO_SEED === "1",
    };
  if (["login", "register"].includes(action)) {
    const username = str(body.username, 40).toLowerCase(),
      password = typeof body.password === "string" ? body.password : "";
    if (
      !/^[a-z0-9_]{3,40}$/.test(username) ||
      password.length < 12 ||
      password.length > 128
    )
      fail(
        "Use a username with 3–40 letters, numbers or underscores, and a password with 12–128 characters.",
      );
    const ip = process.env.VERCEL
      ? String(
          req.headers["x-vercel-forwarded-for"] ||
            req.headers["x-forwarded-for"] ||
            "unknown",
        ).split(",")[0]
      : req.socket?.remoteAddress || "local";
    const key = digest(`${ip}:${username}`),
      r = (await db.query("SELECT * FROM rate_limits WHERE key=?", [key]))[0];
    if (r && r.reset_at > now() && r.count >= 10)
      fail("Too many attempts. Try again in 15 minutes.", 429);
    await db.query("DELETE FROM rate_limits WHERE reset_at<?", [now()]);
    await db.query(
      "INSERT INTO rate_limits (key,count,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1",
      [key, new Date(Date.now() + 900000).toISOString()],
    );
    const existing = (
      await db.query("SELECT * FROM users WHERE username=?", [username])
    )[0];
    if (action === "login") {
      const [salt, hash] = (
        existing?.password || "deadbeef:" + "0".repeat(128)
      ).split(":");
      const supplied = scryptSync(password, salt, 64);
      if (!existing || !timingSafeEqual(supplied, Buffer.from(hash, "hex")))
        return { error: "Incorrect username or password.", status: 401 };
      await db.query("DELETE FROM rate_limits WHERE key=?", [key]);
      return { user: await newSession(existing) };
    }
    const name = str(body.name, 80);
    if (!name || !["learner", "supervisor"].includes(body.role))
      fail("Add your name and select Learner or Supervisor.");
    if (existing)
      return { error: "That username is already taken.", status: 409 };
    const u = { id: randomUUID(), username, name, role: body.role };
    await db.query(
      "INSERT INTO users (id,username,name,password,role,created_at) VALUES (?,?,?,?,?,?)",
      [u.id, username, name, hashPassword(password), u.role, now()],
    );
    return { user: await newSession(u) };
  }
  if (action === "logout") {
    if (token) await db.query("DELETE FROM sessions WHERE token=?", [token]);
    setCookie("", 0);
    return { ok: true };
  }
  if (action === "catalog") {
    const rows = await db.query(
      "SELECT * FROM exercises WHERE published=1 AND baseline=0 ORDER BY title",
    );
    return { exercises: rows.map(catalogItem) };
  }
  if (action === "dashboard") {
    requireRole(user, "learner");
    const st = await stats(db, user.id);
    const exercises = (
      await db.query("SELECT * FROM exercises WHERE published=1 AND baseline=0")
    ).map(catalogItem);
    const measured = SKILLS.filter((s) => st.skills[s].total);
    const weakest = measured.length
      ? measured.reduce((a, b) =>
          st.skills[a].correct / st.skills[a].total <=
          st.skills[b].correct / st.skills[b].total
            ? a
            : b,
        )
      : null;
    const done = new Set(st.history.map((h) => h.exerciseId));
    let recommendations = exercises.filter(
      (e) =>
        e.level === st.readingLevel && (!weakest || e.skills.includes(weakest)),
    );
    recommendations.sort(
      (a, b) => Number(done.has(a.id)) - Number(done.has(b.id)),
    );
    const assignments = await db.query(
      "SELECT a.*,u.name AS supervisor_name FROM assignments a JOIN users u ON u.id=a.supervisor_id JOIN connections c ON c.learner_id=a.learner_id AND c.supervisor_id=a.supervisor_id WHERE a.learner_id=? ORDER BY a.due_date",
      [user.id],
    );
    const active = await db.query(
      "SELECT * FROM attempts WHERE user_id=? AND completed=0 ORDER BY started_at DESC",
      [user.id],
    );
    return {
      stats: st,
      weakest,
      recommendations: recommendations.slice(0, 3),
      assignments: assignments.map((a) => ({
        ...a,
        done: st.history.some(
          (h) =>
            h.exerciseId === a.exercise_id && h.completedAt >= a.created_at,
        ),
        available: exercises.some((e) => e.id === a.exercise_id),
      })),
      active: active.map((a) => ({
        id: a.id,
        title: JSON.parse(a.snapshot).title,
        section: a.section + 1,
        sections: JSON.parse(a.snapshot).sections.length,
      })),
      connections: await db.query(
        "SELECT u.id,u.name,u.username FROM connections c JOIN users u ON u.id=c.supervisor_id WHERE c.learner_id=?",
        [user.id],
      ),
    };
  }
  if (action === "start") {
    requireRole(user, "learner");
    await lockUser(db, user.id);
    const e = (
      await db.query("SELECT * FROM exercises WHERE id=? AND published=1", [
        str(body.exerciseId),
      ])
    )[0];
    if (!e) fail("This exercise is no longer available.", 404);
    if (
      e.baseline &&
      (
        await db.query(
          "SELECT id FROM attempts WHERE user_id=? AND exercise_id=? AND completed=1",
          [user.id, e.id],
        )
      ).length
    )
      fail("You have already completed your baseline assessment.");
    const active = (
      await db.query(
        "SELECT * FROM attempts WHERE user_id=? AND exercise_id=? AND completed=0 ORDER BY started_at DESC",
        [user.id, e.id],
      )
    )[0];
    if (active) return { attempt: attemptView(active) };
    const a = {
      id: randomUUID(),
      user_id: user.id,
      exercise_id: e.id,
      snapshot: JSON.stringify(obj(e)),
      answers: "[]",
      section: 0,
      completed: 0,
      correct: 0,
      total: 0,
      started_at: now(),
    };
    await db.query(
      "INSERT INTO attempts (id,user_id,exercise_id,snapshot,answers,section,completed,correct,total,started_at) VALUES (?,?,?,?,?,0,0,0,0,?)",
      [a.id, user.id, e.id, a.snapshot, a.answers, a.started_at],
    );
    return { attempt: attemptView(a) };
  }
  if (["attempt", "answer", "next", "finish"].includes(action)) {
    requireRole(user, "learner");
    await lockUser(db, user.id);
    const a = (
      await db.query("SELECT * FROM attempts WHERE id=? AND user_id=?", [
        str(body.id),
        user.id,
      ])
    )[0];
    if (!a) fail("Attempt not found.", 404);
    if (action === "attempt") return { attempt: attemptView(a) };
    if (a.completed) {
      if (action === "finish")
        return {
          attempt: attemptView(a),
          stats: await stats(db, user.id),
          xpEarned: 0,
          unlocked: [],
        };
      fail("This attempt is already complete.");
    }
    const e = JSON.parse(a.snapshot),
      answers = JSON.parse(a.answers),
      sec = e.sections[a.section];
    if (action === "answer") {
      const q = sec.questions.find((q) => q.id === body.questionId);
      if (
        !q ||
        !Number.isInteger(body.selected) ||
        body.selected < 0 ||
        body.selected > 3
      )
        fail("Choose a valid answer for this section.");
      if (answers.some((x) => x.questionId === q.id))
        fail("This answer has already been submitted.");
      answers.push({
        questionId: q.id,
        skill: q.skill,
        selected: body.selected,
        correct: body.selected === q.correct,
        correctIndex: q.correct,
        explanation: q.explanation,
      });
      a.answers = JSON.stringify(answers);
      await db.query("UPDATE attempts SET answers=? WHERE id=?", [
        a.answers,
        a.id,
      ]);
    }
    if (action === "next") {
      if (
        !sec.questions.every((q) => answers.some((x) => x.questionId === q.id))
      )
        fail("Answer every question before continuing.");
      if (a.section >= e.sections.length - 1)
        fail("You are on the final section.");
      a.section++;
      await db.query("UPDATE attempts SET section=? WHERE id=?", [
        a.section,
        a.id,
      ]);
    }
    if (action === "finish") {
      if (
        !e.sections
          .flatMap((s) => s.questions)
          .every((q) => answers.some((x) => x.questionId === q.id))
      )
        fail("Complete every section first.");
      a.correct = answers.filter((x) => x.correct).length;
      a.total = answers.length;
      a.completed = 1;
      a.completed_at = now();
      await db.query(
        "UPDATE attempts SET completed=1,correct=?,total=?,completed_at=? WHERE id=?",
        [a.correct, a.total, a.completed_at, a.id],
      );
      const reward = await db.query(
        "INSERT INTO rewards (user_id,exercise_id,xp) VALUES (?,?,?) ON CONFLICT(user_id,exercise_id) DO NOTHING RETURNING xp",
        [user.id, e.id, e.baseline ? 50 : 30],
      );
      const st = await stats(db, user.id);
      const eligible = ["first-step"];
      if (st.unique >= 3) eligible.push("three-chapters");
      if (st.unique >= 6) eligible.push("reading-rhythm");
      if (a.correct === a.total) eligible.push("clear-reader");
      if (
        SKILLS.every(
          (s) =>
            st.skills[s].total >= 5 &&
            st.skills[s].correct / st.skills[s].total >= 0.75,
        )
      )
        eligible.push("all-rounder");
      const unlocked = [];
      for (const code of eligible) {
        const rows = await db.query(
          "INSERT INTO achievements (user_id,code,earned_at) VALUES (?,?,?) ON CONFLICT(user_id,code) DO NOTHING RETURNING code",
          [user.id, code, now()],
        );
        if (rows.length) unlocked.push(code);
      }
      return {
        attempt: attemptView(a),
        stats: await stats(db, user.id),
        xpEarned: reward[0]?.xp || 0,
        unlocked,
      };
    }
    return { attempt: attemptView(a) };
  }
  if (action === "invite") {
    requireRole(user, "learner");
    await db.query("DELETE FROM invitations WHERE learner_id=?", [user.id]);
    const code = randomBytes(6).toString("hex").toUpperCase();
    await db.query(
      "INSERT INTO invitations (code,learner_id,expires_at) VALUES (?,?,?)",
      [code, user.id, new Date(Date.now() + 86400000).toISOString()],
    );
    return { code };
  }
  if (action === "connect") {
    requireRole(user, "supervisor");
    const code = str(body.code, 12).toUpperCase();
    const invite = (
      await db.query(
        `SELECT * FROM invitations WHERE code=? AND expires_at>?${db.remote ? " FOR UPDATE" : ""}`,
        [code, now()],
      )
    )[0];
    if (!invite)
      fail("This connection code is invalid, expired, or already used.");
    await db.query(
      "INSERT INTO connections (learner_id,supervisor_id,created_at) VALUES (?,?,?) ON CONFLICT(learner_id,supervisor_id) DO NOTHING",
      [invite.learner_id, user.id, now()],
    );
    await db.query("DELETE FROM invitations WHERE code=?", [code]);
    return { ok: true };
  }
  if (action === "disconnect") {
    requireRole(user, "learner", "supervisor");
    const learner = user.role === "learner" ? user.id : str(body.learnerId),
      supervisor =
        user.role === "supervisor" ? user.id : str(body.supervisorId);
    await db.query(
      "DELETE FROM connections WHERE learner_id=? AND supervisor_id=?",
      [learner, supervisor],
    );
    await db.query(
      "DELETE FROM assignments WHERE learner_id=? AND supervisor_id=?",
      [learner, supervisor],
    );
    return { ok: true };
  }
  if (action === "supervisor") {
    requireRole(user, "supervisor");
    const learners = await db.query(
      "SELECT u.id,u.name,u.username FROM connections c JOIN users u ON u.id=c.learner_id WHERE c.supervisor_id=?",
      [user.id],
    );
    const data = [];
    for (const l of learners) data.push({ ...l, stats: await stats(db, l.id) });
    const assignments = await db.query(
      "SELECT * FROM assignments WHERE supervisor_id=? ORDER BY due_date",
      [user.id],
    );
    return {
      learners: data,
      assignments: assignments.map((a) => ({
        ...a,
        done:
          data
            .find((l) => l.id === a.learner_id)
            ?.stats.history.some(
              (h) =>
                h.exerciseId === a.exercise_id && h.completedAt >= a.created_at,
            ) || false,
      })),
    };
  }
  if (action === "assign") {
    requireRole(user, "supervisor");
    const linked = (
      await db.query(
        `SELECT * FROM connections WHERE learner_id=? AND supervisor_id=?${db.remote ? " FOR UPDATE" : ""}`,
        [str(body.learnerId), user.id],
      )
    )[0];
    if (!linked) fail("Connect with this learner before assigning work.", 403);
    const e = (
      await db.query(
        "SELECT * FROM exercises WHERE id=? AND published=1 AND baseline=0",
        [str(body.exerciseId)],
      )
    )[0];
    if (!e) fail("Choose a published exercise.");
    const due = str(body.dueDate, 10);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(due) ||
      !Number.isFinite(Date.parse(due)) ||
      new Date(due).toISOString().slice(0, 10) !== due
    )
      fail("Choose a valid due date.");
    await db.query(
      "INSERT INTO assignments (id,learner_id,supervisor_id,exercise_id,title,due_date,note,created_at) VALUES (?,?,?,?,?,?,?,?)",
      [
        randomUUID(),
        linked.learner_id,
        user.id,
        e.id,
        e.title,
        due,
        str(body.note, 500),
        now(),
      ],
    );
    return { ok: true };
  }
  if (action === "deleteAssignment") {
    requireRole(user, "supervisor");
    await db.query("DELETE FROM assignments WHERE id=? AND supervisor_id=?", [
      str(body.id),
      user.id,
    ]);
    return { ok: true };
  }
  if (action === "admin") {
    requireRole(user, "admin");
    const exercises = (
      await db.query("SELECT * FROM exercises ORDER BY baseline DESC,title")
    ).map((e) => ({ ...catalogItem(e), sections: JSON.parse(e.content) }));
    const count = (await db.query("SELECT COUNT(*) AS count FROM users"))[0]
      .count;
    return { exercises, userCount: Number(count) };
  }
  if (action === "saveExercise") {
    requireRole(user, "admin");
    const e = validateExercise(body);
    const id = str(body.id) || randomUUID();
    const old = (await db.query("SELECT * FROM exercises WHERE id=?", [id]))[0];
    if (body.id && !old) fail("Exercise not found.", 404);
    if (old?.baseline) {
      if (!e.published) fail("The baseline must stay published.");
      if (
        !SKILLS.every((skill) =>
          e.sections.flatMap((s) => s.questions).some((q) => q.skill === skill),
        )
      )
        fail("The baseline must assess all four skills.");
    }
    await db.query(
      "INSERT INTO exercises (id,title,level,category,description,minutes,source,published,baseline,content,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,level=excluded.level,category=excluded.category,description=excluded.description,minutes=excluded.minutes,source=excluded.source,published=excluded.published,content=excluded.content,updated_at=excluded.updated_at",
      [
        id,
        e.title,
        e.level,
        e.category,
        e.description,
        e.minutes,
        e.source,
        e.published,
        old?.baseline || 0,
        JSON.stringify(e.sections),
        now(),
      ],
    );
    return { id };
  }
  if (action === "deleteExercise") {
    requireRole(user, "admin");
    const e = (
      await db.query("SELECT * FROM exercises WHERE id=?", [str(body.id)])
    )[0];
    if (!e) fail("Exercise not found.", 404);
    if (e.baseline) fail("The baseline assessment cannot be deleted.");
    await db.query("DELETE FROM exercises WHERE id=?", [e.id]);
    return { ok: true };
  }
  fail("Action not found.", 404);
}
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  try {
    if (req.method !== "POST" && req.method !== "GET")
      fail("Method not allowed.", 405);
    if (req.method === "POST") {
      const origin = req.headers.origin,
        host = req.headers.host;
      if (origin && new URL(origin).host !== host)
        fail("Request origin not allowed.", 403);
      if (!(req.headers["content-type"] || "").startsWith("application/json"))
        fail("Use application/json.", 415);
    }
    let body = req.body;
    if (!body) {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 200000) fail("Request is too large.", 413);
      }
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        fail("Invalid JSON.");
      }
    }
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        fail("Invalid JSON.");
      }
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      fail("Invalid request.");
    if (
      req.method === "GET" &&
      !["session", "catalog"].includes(
        new URL(req.url, "http://localhost").searchParams.get("action"),
      )
    )
      fail("Use POST for this action.", 405);
    await ensureDatabaseReady();
    const result = await transaction((db) => route(db, req, res, body));
    res.statusCode = result.status || 200;
    res.end(JSON.stringify(result));
  } catch (e) {
    res.statusCode = e.status || 500;
    if (!e.status) console.error(e);
    res.end(
      JSON.stringify({
        error: e.status
          ? e.message
          : "The server could not complete this request. Check the database configuration or try again.",
      }),
    );
  }
}
