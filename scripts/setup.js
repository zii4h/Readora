import { setup } from "../server/setup.js";
import { closeDb } from "../server/db.js";
await setup({ demo: process.env.DEMO_SEED === "1" });
console.log("Database ready. Existing content and accounts preserved.");
await closeDb();
