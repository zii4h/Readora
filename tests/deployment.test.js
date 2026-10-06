import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "readora-deployment-"));
process.env.SQLITE_PATH = path.join(directory, "database.sqlite");
delete process.env.DATABASE_URL;
delete process.env.VERCEL;
delete process.env.ADMIN_PASSWORD;
process.env.NODE_ENV = "test";

const { transaction, schema, closeDb } = await import("../server/db.js");
const { insertExercise } = await import("../server/content-migration.js");
const { seedExercises: oldExercises } = await import("../server/content.js");
const { default: handler } = await import("../api/handler.js");

test("deployed API migrates an existing catalog on first request without manual setup", async () => {
  const server = http.createServer(handler);
  try {
    // Reproduce a deployed database that still contains the prototype catalog.
    await transaction(async (db) => {
      for (const sql of schema) await db.query(sql);
      for (const exercise of oldExercises) await insertExercise(db, exercise);
      await insertExercise(db, { ...oldExercises[1], id: "custom-reading", title: "Teacher's activity" });
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${server.address().port}`;
    const responses = await Promise.all(Array.from({ length: 3 }, () => fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "catalog" }),
    })));
    for (const response of responses) {
      assert.equal(response.status, 200);
      const { exercises } = await response.json();
      assert.equal(exercises.length, 9);
      assert.ok(exercises.some((e) => e.id === "custom-reading"));
      assert.ok(exercises.some((e) => e.id === "carroll-curious-alice"));
      const fables = exercises.filter((e) => e.id.startsWith("aesop-"));
      assert.equal(fables.length, 6);
      for (const exercise of fables) {
        assert.match(exercise.source, /https:\/\/www\.gutenberg\.org\/ebooks\/21/);
        assert.match(exercise.source, /\/sources\/pg21\.txt/);
      }
      assert.equal(exercises.some((e) => e.id === "last-bus"), false);
    }
    await transaction(async (db) => {
      assert.equal((await db.query("SELECT * FROM content_migrations")).length, 2);
      assert.equal((await db.query("SELECT * FROM users")).length, 0);
    });
  } finally {
    if (server.listening) await new Promise((resolve) => server.close(resolve));
    await closeDb();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
