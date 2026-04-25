import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectSeoMeta } from "./meta-injector";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    maxAge: "7d",
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }));

  app.use("/{*path}", async (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    try {
      let html = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      html = await injectSeoMeta(html, req.path);
      res.set("Content-Type", "text/html").send(html);
    } catch {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
