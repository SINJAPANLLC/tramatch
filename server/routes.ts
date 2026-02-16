import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCargoListingSchema, insertTruckListingSchema, insertUserSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";

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

  app.post("/api/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "このユーザー名は既に使われています" });
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
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "ユーザー名とパスワードを入力してください" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "ユーザー名またはパスワードが正しくありません" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "ユーザー名またはパスワードが正しくありません" });
      }

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
