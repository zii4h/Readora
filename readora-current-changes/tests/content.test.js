import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import collection from "../content/passages.json" with { type: "json" };
import { seedExercises, SKILLS } from "../server/sourced-content.js";
import { schema } from "../server/db.js";
import { migrateContent, insertExercise, contentHash } from "../server/content-migration.js";

test("every passage is an exact source extract, with only whitespace and section breaks changed", () => {
  const raw = fs.readFileSync(new URL("../content/sources/pg21.txt", import.meta.url), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), collection.sha256);
  const normalize = (s) => s.replace(/\s+/g, " ").trim();
  for (const p of collection.passages) {
    const original = raw.split(/\r?\n/).slice(p.startLine - 1, p.endLine).join("\n");
    assert.equal(normalize(p.sections.join(" ")), normalize(original), p.title);
    const e = seedExercises.find((e) => e.sections[0].text === p.sections[0]);
    assert.ok(e, `${p.title} is used`);
    assert.deepEqual(e.sections.map((s) => s.text), p.sections);
    assert.match(e.source, /George Fyler Townsend/);
    assert.match(e.source, /AI-assisted demo material/);
    assert.ok(e.source.length <= 1000);
    assert.deepEqual(new Set(e.sections.flatMap((s) => s.questions.map((q) => q.skill))), new Set(SKILLS));
    for (const q of e.sections.flatMap((s) => s.questions)) {
      assert.equal(q.options.length, 4);
      assert.ok(q.correct >= 0 && q.correct < 4);
      assert.ok(q.explanation);
    }
  }
  assert.equal(seedExercises.filter((e) => e.baseline).length, 1);
  assert.equal(seedExercises[0].sections.flatMap((s) => s.questions).length, 8);
  assert.equal(fs.readFileSync(new URL("../public/sources/pg21.txt", import.meta.url), "utf8"), raw);
});

test("migration replaces recognized prototypes, preserves modified/custom content and history, and runs once", async () => {
  const sqlite = new DatabaseSync(":memory:");
  const db = { query: async (sql, args = []) => sqlite.prepare(sql).all(...args) };
  try {
    for (const sql of schema) await db.query(sql);
    const prototype = { ...seedExercises[1], id: "legacy", title: "Test fixture", source: "Prototype fixture" };
    const baseline = { ...prototype, id: "baseline", baseline: true };
    const modified = { ...prototype, id: "modified" };
    const fingerprint = (e) => ({ id: e.id, title: e.title, source: e.source, hash: contentHash(e.sections) });
    const legacy = [prototype, baseline, modified].map(fingerprint);
    await insertExercise(db, prototype);
    await insertExercise(db, baseline);
    await insertExercise(db, { ...modified, title: "Administrator revision" });
    await insertExercise(db, { ...prototype, id: "custom" });
    await db.query("INSERT INTO users VALUES (?,?,?,?,?,?)", ["u", "u", "u", "test", "learner", "2026-10-05"]);
    const snapshot = JSON.stringify(prototype);
    await db.query("INSERT INTO attempts (id,user_id,exercise_id,snapshot,answers,started_at) VALUES (?,?,?,?,?,?)", ["a", "u", "legacy", snapshot, "[]", "2026-10-05"]);
    const result = await migrateContent(db, legacy);
    assert.deepEqual(result.skipped, ["modified"]);
    assert.equal((await db.query("SELECT * FROM exercises WHERE id='legacy'")).length, 0);
    assert.equal((await db.query("SELECT * FROM exercises WHERE id='baseline'"))[0].title, seedExercises[0].title);
    assert.equal((await db.query("SELECT * FROM exercises WHERE id='modified'"))[0].title, "Administrator revision");
    assert.equal((await db.query("SELECT * FROM exercises WHERE id='custom'")).length, 1);
    assert.equal((await db.query("SELECT * FROM attempts WHERE id='a'"))[0].snapshot, snapshot);
    await db.query("UPDATE exercises SET published=0 WHERE id=?", [seedExercises[1].id]);
    await db.query("DELETE FROM exercises WHERE id=?", [seedExercises[2].id]);
    assert.equal((await migrateContent(db, legacy)).applied, false);
    assert.equal((await db.query("SELECT * FROM exercises WHERE id=?", [seedExercises[1].id]))[0].published, 0);
    assert.equal((await db.query("SELECT * FROM exercises WHERE id=?", [seedExercises[2].id])).length, 0);
  } finally { sqlite.close(); }
});
