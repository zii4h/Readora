import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import { transaction, schema } from "./db.js";
import { seedExercises } from "./content.js";
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export async function setup({ demo = false } = {}) {
  return transaction(async (db) => {
    for (const sql of schema) await db.query(sql);
    if (
      Number(
        (await db.query("SELECT COUNT(*) AS count FROM exercises"))[0].count,
      ) === 0
    )
      for (const e of seedExercises)
        await db.query(
          "INSERT INTO exercises (id,title,level,category,description,minutes,source,published,baseline,content,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
          [
            e.id,
            e.title,
            e.level,
            e.category,
            e.description,
            e.minutes,
            e.source,
            e.published,
            e.baseline ? 1 : 0,
            JSON.stringify(e.sections),
            new Date().toISOString(),
          ],
        );
    const accounts = [];
    if (demo && !process.env.VERCEL && process.env.NODE_ENV !== "production")
      accounts.push(
        ["learner", "Alex Rivera", "learner", "ReadoraDemo123!"],
        ["supervisor", "Sam Rivera", "supervisor", "ReadoraDemo123!"],
        ["admin", "Catalog Administrator", "admin", "ReadoraDemo123!"],
      );
    if (process.env.ADMIN_PASSWORD) {
      if (process.env.ADMIN_PASSWORD.length < 12)
        throw Error("ADMIN_PASSWORD must be at least 12 characters.");
      accounts.push([
        process.env.ADMIN_USERNAME || "admin",
        process.env.ADMIN_NAME || "Administrator",
        "admin",
        process.env.ADMIN_PASSWORD,
      ]);
    }
    for (const [username, name, role, password] of accounts)
      await db.query(
        "INSERT INTO users (id,username,name,password,role,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(username) DO NOTHING",
        [
          randomUUID(),
          username,
          name,
          hashPassword(password),
          role,
          new Date().toISOString(),
        ],
      );
  });
}
