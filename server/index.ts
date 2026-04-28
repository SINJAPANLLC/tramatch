import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { dbPool } from "./db";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

if (process.env.NODE_ENV === "production") {
  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (key && !(key in process.env)) process.env[key] = val;
    }
  }
}

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

app.use(compression());

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const PgStore = connectPgSimple(session);

const pgStore = new PgStore({
  pool: dbPool,
  createTableIfMissing: true,
  pruneSessionInterval: 600,
  errorLog: (err: Error) => {
    console.error('Session store error:', err.message);
  },
});

app.use(
  session({
    store: pgStore,
    secret: process.env.SESSION_SECRET || "tramatch-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const { seedDatabase } = await import("./seed");
  try {
    await seedDatabase();
  } catch (e) {
    console.error("Seed error:", e);
  }

  await registerRoutes(httpServer, app);

  // 起動時：送信中のまま止まったキャンペーンを「中断」に回復
  setTimeout(async () => {
    try {
      const { storage } = await import("./storage");
      const campaigns = await storage.getEmailCampaigns();
      const stuckCampaigns = campaigns.filter(c => c.status === "sending");
      for (const c of stuckCampaigns) {
        await storage.updateEmailCampaign(c.id, { status: "interrupted" });
        console.log(`[Startup] キャンペーン「${c.name}」を中断状態に回復 (送信済:${c.sentCount}/${c.totalCount})`);
      }
    } catch (e) {
      console.error("[Startup] キャンペーン回復エラー:", e);
    }
  }, 3000);

  // 本番・開発どちらでもCRONを有効化
  setTimeout(async () => {
    try {
      if (process.env.NODE_ENV === "production") {
        const { scheduleAutoArticleGeneration } = await import("./auto-article-generator");
        scheduleAutoArticleGeneration();
        const { scheduleAutoPublish } = await import("./youtube-auto-publisher");
        scheduleAutoPublish();
      }
      const { scheduleLeadCrawler } = await import("./lead-crawler");
      scheduleLeadCrawler();
      console.log("[CRON] ✅ リードクローラースケジュール起動済み");
    } catch (e) {
      console.error("Scheduler init error:", e);
    }
  }, 10000);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
