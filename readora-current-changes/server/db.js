import fs from "node:fs";
import path from "node:path";
let pool,
  sqlite,
  queue = Promise.resolve();
const remote = !!process.env.DATABASE_URL;
export async function transaction(fn) {
  if (remote) {
    if (!pool) {
      const { Pool } = await import("pg");
      pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn({
        remote: true,
        query: async (sql, args = []) => {
          let n = 0;
          return (
            await client.query(
              sql.replace(/\?/g, () => `$${++n}`),
              args,
            )
          ).rows;
        },
      });
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production")
    throw new Error(
      "DATABASE_URL is required in production. Run database setup before deploying.",
    );
  const run = queue.then(async () => {
    if (!sqlite) {
      const { DatabaseSync } = await import("node:sqlite");
      const file = process.env.SQLITE_PATH || ".data/readora.sqlite";
      fs.mkdirSync(path.dirname(file), { recursive: true });
      sqlite = new DatabaseSync(file);
      sqlite.exec(
        "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
      );
    }
    sqlite.exec("BEGIN IMMEDIATE");
    try {
      const result = await fn({
        remote: false,
        query: async (sql, args = []) => sqlite.prepare(sql).all(...args),
      });
      sqlite.exec("COMMIT");
      return result;
    } catch (e) {
      sqlite.exec("ROLLBACK");
      throw e;
    }
  });
  queue = run.catch(() => {});
  return run;
}
export async function closeDb() {
  if (pool) await pool.end();
  if (sqlite) sqlite.close();
}
export const schema = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('learner','supervisor','admin')), created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS exercises (id TEXT PRIMARY KEY, title TEXT NOT NULL, level TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, minutes INTEGER NOT NULL, source TEXT NOT NULL, published INTEGER NOT NULL, baseline INTEGER NOT NULL DEFAULT 0, content TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, exercise_id TEXT NOT NULL, snapshot TEXT NOT NULL, answers TEXT NOT NULL, section INTEGER NOT NULL DEFAULT 0, completed INTEGER NOT NULL DEFAULT 0, correct INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0, started_at TEXT NOT NULL, completed_at TEXT)`,
  `CREATE INDEX IF NOT EXISTS attempts_user ON attempts(user_id,completed)`,
  `CREATE TABLE IF NOT EXISTS rewards (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, exercise_id TEXT NOT NULL, xp INTEGER NOT NULL, PRIMARY KEY(user_id,exercise_id))`,
  `CREATE TABLE IF NOT EXISTS achievements (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, code TEXT NOT NULL, earned_at TEXT NOT NULL, PRIMARY KEY(user_id,code))`,
  `CREATE TABLE IF NOT EXISTS invitations (code TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS connections (learner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, supervisor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TEXT NOT NULL, PRIMARY KEY(learner_id,supervisor_id))`,
  `CREATE TABLE IF NOT EXISTS assignments (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, supervisor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, exercise_id TEXT NOT NULL, title TEXT NOT NULL, due_date TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at TEXT NOT NULL)`,
];
