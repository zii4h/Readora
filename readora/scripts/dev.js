import { spawn } from "node:child_process";
const children = [
  spawn(process.execPath, ["--env-file-if-exists=.env", "server/local.js"], {
    stdio: "inherit",
  }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
    stdio: "inherit",
  }),
];
for (const sig of ["SIGINT", "SIGTERM"])
  process.on(sig, () => {
    children.forEach((c) => c.kill());
    process.exit();
  });
