import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, writeFile, copyFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("injecting splash screen...");
  const indexPath = "dist/public/index.html";
  let html = await readFile(indexPath, "utf-8");
  const splashHtml = `<div id="splash-screen" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#fff;transition:opacity 0.4s ease-out"><img src="/splash-logo.jpg" alt="TRA MATCH" style="max-width:320px;width:60%;animation:splashPulse 1.5s ease-in-out infinite" /></div><style>@keyframes splashPulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}</style>`;
  html = html.replace('<div id="root"></div>', splashHtml + '<div id="root"></div>');
  await writeFile(indexPath, html);
  try { await copyFile("client/public/splash-logo.jpg", "dist/public/splash-logo.jpg"); } catch {}

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
