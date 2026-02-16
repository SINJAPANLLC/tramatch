import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCargoListingSchema, insertTruckListingSchema, insertUserSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const permitUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `permit_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("PDF、JPG、PNGファイルのみアップロードできます"));
    }
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "ログインが必要です" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || req.session.role !== "admin") {
    return res.status(403).json({ message: "管理者権限が必要です" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use("/uploads", express.static(uploadDir));

  app.post("/api/upload/permit", permitUpload.single("permit"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "ファイルを選択してください" });
    }
    res.json({ filePath: `/uploads/${req.file.filename}`, fileName: req.file.originalname });
  });

  app.post("/api/register", async (req, res) => {
    try {
      const body = {
        ...req.body,
        username: req.body.email,
        userType: req.body.userType || "carrier",
      };
      const parsed = insertUserSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }

      const existingEmail = await storage.getUserByEmail(parsed.data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "このメールアドレスは既に登録されています" });
      }

      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      req.session.role = user.role;

      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "登録に失敗しました" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "メールアドレスとパスワードを入力してください" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "メールアドレスまたはパスワードが正しくありません" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "メールアドレスまたはパスワードが正しくありません" });
      }

      await storage.deleteSessionsByUserId(user.id);

      req.session.userId = user.id;
      req.session.role = user.role;

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "ログインに失敗しました" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "ログアウトに失敗しました" });
      }
      res.json({ message: "ログアウトしました" });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "未認証" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "ユーザーが見つかりません" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/cargo", async (_req, res) => {
    try {
      const listings = await storage.getCargoListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cargo listings" });
    }
  });

  app.get("/api/cargo/:id", async (req, res) => {
    try {
      const listing = await storage.getCargoListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Cargo listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cargo listing" });
    }
  });

  app.post("/api/cargo", requireAuth, async (req, res) => {
    try {
      const parsed = insertCargoListingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const listing = await storage.createCargoListing({ ...parsed.data }, req.session.userId as string);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create cargo listing" });
    }
  });

  app.delete("/api/cargo/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteCargoListing(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "Cargo listing not found" });
      }
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cargo listing" });
    }
  });

  app.get("/api/trucks", async (_req, res) => {
    try {
      const listings = await storage.getTruckListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck listings" });
    }
  });

  app.get("/api/trucks/:id", async (req, res) => {
    try {
      const listing = await storage.getTruckListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Truck listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck listing" });
    }
  });

  app.post("/api/trucks", requireAuth, async (req, res) => {
    try {
      const parsed = insertTruckListingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const listing = await storage.createTruckListing({ ...parsed.data }, req.session.userId as string);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create truck listing" });
    }
  });

  app.delete("/api/trucks/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTruckListing(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "Truck listing not found" });
      }
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete truck listing" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const cargo = await storage.getCargoListings();
      const trucks = await storage.getTruckListings();
      const allUsers = await storage.getAllUsers();
      res.json({
        cargoCount: cargo.length,
        truckCount: trucks.length,
        userCount: allUsers.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const safeUsers = allUsers.map(({ password, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  return httpServer;
}
