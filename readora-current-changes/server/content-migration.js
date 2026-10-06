import { createHash } from "node:crypto";
import legacy from "../content/legacy-seeds.json" with { type: "json" };
import { seedExercises } from "./sourced-content.js";
import { variedExercises } from "./varied-content.js";

export const contentHash = (sections) => createHash("sha256")
  .update(JSON.stringify(sections, (key, value) => key === "id" ? undefined : value)).digest("hex");

export async function insertExercise(db, e) {
  await db.query(
    "INSERT INTO exercises (id,title,level,category,description,minutes,source,published,baseline,content,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
    [e.id, e.title, e.level, e.category, e.description, e.minutes, e.source, e.published,
      e.baseline ? 1 : 0, JSON.stringify(e.sections), new Date().toISOString()],
  );
}

export async function migrateContent(db, legacySeeds = legacy) {
  await db.query("CREATE TABLE IF NOT EXISTS content_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const varietyVersion = "varied-reading-2026-10-06";
  if (!(await db.query("SELECT id FROM content_migrations WHERE id=?", [varietyVersion])).length) {
    for (const e of variedExercises) await insertExercise(db, e);
    await db.query("INSERT INTO content_migrations (id,applied_at) VALUES (?,?)", [varietyVersion, new Date().toISOString()]);
  }
  const version = "sourced-aesop-2026-10-05";
  if ((await db.query("SELECT id FROM content_migrations WHERE id=?", [version])).length)
    return { applied: false, skipped: [] };
  const skipped = [];
  for (const old of legacySeeds) {
    const row = (await db.query("SELECT * FROM exercises WHERE id=?", [old.id]))[0];
    if (!row) continue;
    if (row.title !== old.title || row.source !== old.source || contentHash(JSON.parse(row.content)) !== old.hash) {
  
      if (row.id !== "baseline" || row.source !== seedExercises[0].source) skipped.push(row.id);
      continue;
    }
   
    await db.query("DELETE FROM exercises WHERE id=?", [row.id]);
  }
  for (const e of seedExercises) await insertExercise(db, e);
  await db.query("INSERT INTO content_migrations (id,applied_at) VALUES (?,?)", [version, new Date().toISOString()]);
  return { applied: true, skipped };
}
