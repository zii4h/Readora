import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import handler from "./api.js";
import { setup } from "./setup.js";
if (!process.env.DATABASE_URL)
  await setup({ demo: true });
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
};
http
  .createServer(async (req, res) => {
    if (req.url.startsWith("/api")) return handler(req, res);
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = path.resolve("dist", "." + pathname);
    if (
      !file.startsWith(path.resolve("dist") + path.sep) &&
      file !== path.resolve("dist")
    ) {
      res.writeHead(403);
      return res.end();
    }
    const target =
      fs.existsSync(file) && fs.statSync(file).isFile()
        ? file
        : path.resolve("dist/index.html");
    if (!fs.existsSync(target)) {
      res.writeHead(404);
      return res.end("Run npm run dev for development or npm run build first.");
    }
    res.setHeader(
      "Content-Type",
      mime[path.extname(target)] || "application/octet-stream",
    );
    fs.createReadStream(target).pipe(res);
  })
  .listen(Number(process.env.PORT) || 3001, "0.0.0.0", () =>
    console.log(
      `Readora server running on http://localhost:${process.env.PORT || 3001}`,
    ),
  );
