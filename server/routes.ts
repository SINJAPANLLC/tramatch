import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCargoListingSchema, insertTruckListingSchema, insertUserSchema, insertAnnouncementSchema, insertPartnerSchema, insertTransportRecordSchema } from "@shared/schema";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import { ensureCompatibleFormat, speechToText } from "./replit_integrations/audio/client";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

      const { password, ...safeUser } = user;

      const admins = (await storage.getAllUsers()).filter((u) => u.role === "admin");
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "user_registered",
          title: "新規ユーザー登録",
          message: `${parsed.data.companyName} が新規登録しました。承認をお願いします。`,
          relatedId: user.id,
        });
      }

      res.status(201).json({ ...safeUser, message: "登録が完了しました。管理者の承認後にログインできます。" });
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

      if (!user.approved) {
        return res.status(403).json({ message: "アカウントはまだ承認されていません。管理者の承認をお待ちください。" });
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

  app.get("/api/companies/search", requireAuth, async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      if (!query.trim()) {
        return res.json([]);
      }
      const results = await storage.searchCompanies(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "企業検索に失敗しました" });
    }
  });

  app.get("/api/companies/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "企業情報が見つかりません" });
      }
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

      const allCargo = await storage.getCargoListings();
      const allTrucks = await storage.getTruckListings();
      const userCargo = allCargo.filter(c => c.userId === req.params.userId);
      const userTrucks = allTrucks.filter(t => t.userId === req.params.userId);

      const cargo1m = userCargo.filter(c => new Date(c.createdAt) >= oneMonthAgo).length;
      const cargo3m = userCargo.filter(c => new Date(c.createdAt) >= threeMonthsAgo).length;
      const truck1m = userTrucks.filter(t => new Date(t.createdAt) >= oneMonthAgo).length;
      const truck3m = userTrucks.filter(t => new Date(t.createdAt) >= threeMonthsAgo).length;

      const { password, id, role, approved, permitFile, username, ...companyData } = user;
      res.json({
        ...companyData,
        cargoCount1m: cargo1m,
        cargoCount3m: cargo3m,
        truckCount1m: truck1m,
        truckCount3m: truck3m,
      });
    } catch (error) {
      res.status(500).json({ message: "企業情報の取得に失敗しました" });
    }
  });

  const profileUpdateSchema = z.object({
    companyName: z.string().min(1).max(200).optional(),
    companyNameKana: z.string().max(200).optional(),
    address: z.string().max(500).optional(),
    postalCode: z.string().max(20).optional(),
    contactName: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    fax: z.string().max(20).optional(),
    email: z.string().email().max(200).optional(),
    paymentTerms: z.string().max(200).optional(),
    businessDescription: z.string().max(2000).optional(),
    representative: z.string().max(100).optional(),
    establishedDate: z.string().max(50).optional(),
    capital: z.string().max(50).optional(),
    employeeCount: z.string().max(50).optional(),
    businessArea: z.string().max(200).optional(),
    transportLicenseNumber: z.string().max(100).optional(),
    websiteUrl: z.string().max(500).optional(),
    invoiceRegistrationNumber: z.string().max(100).optional(),
    truckCount: z.string().max(50).optional(),
    officeLocations: z.string().max(500).optional(),
    majorClients: z.string().max(500).optional(),
    annualRevenue: z.string().max(50).optional(),
    bankInfo: z.string().max(200).optional(),
    closingMonth: z.string().max(20).optional(),
    closingDay: z.string().max(20).optional(),
    paymentMonth: z.string().max(20).optional(),
    paymentDay: z.string().max(20).optional(),
    memberOrganization: z.string().max(200).optional(),
    digitalTachographCount: z.string().max(20).optional(),
    gpsCount: z.string().max(20).optional(),
    safetyExcellenceCert: z.string().max(200).optional(),
    greenManagementCert: z.string().max(200).optional(),
    iso9000: z.string().max(200).optional(),
    iso14000: z.string().max(200).optional(),
    iso39001: z.string().max(200).optional(),
    cargoInsurance: z.string().max(200).optional(),
    bankName: z.string().max(200).optional(),
    bankBranch: z.string().max(200).optional(),
    accountType: z.string().max(20).optional(),
    accountNumber: z.string().max(50).optional(),
    accountHolderKana: z.string().max(200).optional(),
    plan: z.string().max(20).optional(),
    accountingContactName: z.string().max(100).optional(),
    accountingContactEmail: z.string().max(200).optional(),
    accountingContactPhone: z.string().max(20).optional(),
    accountingContactFax: z.string().max(20).optional(),
  });

  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const parsed = profileUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const data = parsed.data;
      if (data.email) {
        const existing = await storage.getUserByEmail(data.email);
        if (existing && existing.id !== req.session.userId) {
          return res.status(400).json({ message: "このメールアドレスは既に使用されています" });
        }
      }
      const user = await storage.updateUserProfile(req.session.userId as string, data);
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "プロフィールの更新に失敗しました" });
    }
  });

  app.patch("/api/user/password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "現在のパスワードと新しいパスワードを入力してください" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "新しいパスワードは6文字以上にしてください" });
      }
      const user = await storage.getUser(req.session.userId as string);
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ message: "現在のパスワードが正しくありません" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(user.id, hashedPassword);
      res.json({ message: "パスワードを変更しました" });
    } catch (error) {
      res.status(500).json({ message: "パスワードの変更に失敗しました" });
    }
  });

  app.patch("/api/user/plan", requireAuth, async (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan || !["free", "premium"].includes(plan)) {
        return res.status(400).json({ message: "無効なプランです" });
      }
      const user = await storage.updateUserProfile(req.session.userId as string, { plan });
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "プランの変更に失敗しました" });
    }
  });

  app.get("/api/cargo", async (_req, res) => {
    try {
      const listings = await storage.getCargoListings();

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const expirePromises: Promise<any>[] = [];
      for (const listing of listings) {
        if (listing.status !== "active") continue;
        const dateStr = listing.arrivalDate || listing.desiredDate;
        if (!dateStr) continue;
        const cleaned = dateStr.replace(/\//g, "-");
        const d = new Date(cleaned);
        if (isNaN(d.getTime())) continue;
        d.setHours(23, 59, 59, 999);
        if (d < now) {
          listing.status = "cancelled";
          expirePromises.push(storage.updateCargoStatus(listing.id, "cancelled"));
        }
      }
      if (expirePromises.length > 0) {
        await Promise.all(expirePromises);
      }

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
      storage.incrementCargoViewCount(req.params.id).catch(() => {});
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
      const currentUser = await storage.getUser(req.session.userId as string);
      if (currentUser && currentUser.plan !== "premium" && currentUser.role !== "admin") {
        return res.status(403).json({ message: "AI荷物登録にはプレミアムプランへの加入が必要です" });
      }
      const listingData = {
        ...parsed.data,
        companyName: parsed.data.companyName || currentUser?.companyName || "",
        contactPhone: parsed.data.contactPhone || currentUser?.phone || "",
        contactEmail: parsed.data.contactEmail || currentUser?.email || "",
      };
      const listing = await storage.createCargoListing(listingData, req.session.userId as string);

      const allUsers = await storage.getAllUsers();
      for (const u of allUsers) {
        if (u.id !== req.session.userId && u.approved) {
          await storage.createNotification({
            userId: u.id,
            type: "cargo_new",
            title: "新しい荷物が登録されました",
            message: `${listing.departureArea}→${listing.arrivalArea} ${listing.cargoType} ${listing.weight}`,
            relatedId: listing.id,
          });
        }
      }

      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create cargo listing" });
    }
  });

  app.patch("/api/cargo/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["active", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const cargoId = req.params.id as string;
      const listing = await storage.getCargoListing(cargoId);
      if (!listing) {
        return res.status(404).json({ message: "Cargo listing not found" });
      }
      if (status === "completed" && listing.userId === req.session.userId) {
        return res.status(403).json({ message: "自分の荷物を成約にすることはできません" });
      }
      if (status !== "completed" && listing.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (status === "completed") {
        const currentUser = await storage.getUser(req.session.userId as string);
        if (currentUser && currentUser.plan !== "premium" && currentUser.role !== "admin") {
          return res.status(403).json({ message: "荷物の成約にはプレミアムプランへの加入が必要です" });
        }
      }
      const updated = await storage.updateCargoStatus(cargoId, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cargo status" });
    }
  });

  app.patch("/api/cargo/:id", requireAuth, async (req, res) => {
    try {
      const cargoId = req.params.id as string;
      const listing = await storage.getCargoListing(cargoId);
      if (!listing) {
        return res.status(404).json({ message: "Cargo listing not found" });
      }
      if (listing.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updated = await storage.updateCargoListing(cargoId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cargo listing" });
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

  app.get("/api/dispatch-requests/:cargoId", requireAuth, async (req, res) => {
    try {
      const request = await storage.getDispatchRequestByCargoId(req.params.cargoId as string);
      res.json(request || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dispatch request" });
    }
  });

  app.post("/api/dispatch-requests", requireAuth, async (req, res) => {
    try {
      const { cargoId, userId, id, createdAt, sentAt, ...safeFields } = req.body;
      const request = await storage.createDispatchRequest({
        ...safeFields,
        cargoId: cargoId,
        userId: req.session.userId!,
        status: "draft",
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to create dispatch request" });
    }
  });

  app.patch("/api/dispatch-requests/:id", requireAuth, async (req, res) => {
    try {
      const { userId, id, cargoId, createdAt, sentAt, status, ...safeFields } = req.body;
      const updated = await storage.updateDispatchRequest(req.params.id as string, safeFields);
      if (!updated) {
        return res.status(404).json({ message: "Dispatch request not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dispatch request" });
    }
  });

  app.patch("/api/dispatch-requests/:id/send", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateDispatchRequest(req.params.id as string, {
        status: "sent",
        sentAt: new Date(),
      } as any);
      if (!updated) {
        return res.status(404).json({ message: "Dispatch request not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to send dispatch request" });
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
      const user = await storage.getUser(req.session.userId as string);
      const dataWithCompany = {
        ...req.body,
        companyName: req.body.companyName || user?.companyName || "",
        contactPhone: req.body.contactPhone || user?.phone || "",
        contactEmail: req.body.contactEmail || user?.email || "",
      };
      const parsed = insertTruckListingSchema.safeParse(dataWithCompany);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const listing = await storage.createTruckListing({ ...parsed.data }, req.session.userId as string);

      const allUsers = await storage.getAllUsers();
      for (const u of allUsers) {
        if (u.id !== req.session.userId && u.approved) {
          await storage.createNotification({
            userId: u.id,
            type: "truck_new",
            title: "新しい空車が登録されました",
            message: `${listing.currentArea}→${listing.destinationArea} ${listing.vehicleType} ${listing.maxWeight}`,
            relatedId: listing.id,
          });
        }
      }

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

  app.patch("/api/admin/users/:id/approve", requireAdmin, async (req, res) => {
    try {
      const user = await storage.approveUser(req.params.id as string);
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      await storage.createNotification({
        userId: user.id,
        type: "user_approved",
        title: "アカウント承認",
        message: "アカウントが承認されました。ログインしてサービスをご利用ください。",
      });

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "承認に失敗しました" });
    }
  });

  app.patch("/api/admin/users/:id/plan", requireAdmin, async (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan || !["free", "premium"].includes(plan)) {
        return res.status(400).json({ message: "無効なプランです" });
      }
      const user = await storage.updateUserProfile(req.params.id as string, { plan });
      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "プラン変更に失敗しました" });
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

  const aiUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
  });

  app.post("/api/ai/transcribe", aiUpload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "音声ファイルが必要です" });
      }
      const rawBuffer = Buffer.from(req.file.buffer);
      const { buffer: audioBuffer, format } = await ensureCompatibleFormat(rawBuffer);
      const transcript = await speechToText(audioBuffer, format);
      res.json({ text: transcript });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ message: "音声の文字起こしに失敗しました" });
    }
  });

  app.post("/api/ai/extract-text", aiUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "ファイルが必要です" });
      }
      const base64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype || "image/png";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "あなたは画像やドキュメントから運送・物流に関する情報を抽出するアシスタントです。画像内のテキストを読み取り、検索に使えるキーワード（出発地、到着地、日時、荷物の種類、重量、車種など）を抽出してください。結果は検索用のテキストとして簡潔にまとめてください。余計な説明は不要です。",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              {
                type: "text",
                text: "この画像から運送・物流に関する情報を抽出してください。検索用のテキストとして返してください。",
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const extractedText = response.choices[0]?.message?.content || "";
      res.json({ text: extractedText });
    } catch (error) {
      console.error("Text extraction error:", error);
      res.status(500).json({ message: "ファイルからのテキスト抽出に失敗しました" });
    }
  });

  app.post("/api/ai/parse-cargo", aiUpload.none(), async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "テキストが必要です" });
      }

      const cargoFieldSchema = `{
  "title": "タイトル（出発地→到着地 荷種 重量の形式）",
  "departureArea": "都道府県名のみ（例: 神奈川）",
  "departureAddress": "詳細住所（市区町村以下）",
  "arrivalArea": "都道府県名のみ（例: 大阪）",
  "arrivalAddress": "詳細住所（市区町村以下）",
  "desiredDate": "発日（YYYY/MM/DD形式）",
  "departureTime": "発時間（以下から選択: 指定なし, 午前中, 午後, 夕方以降, 終日可, 06:00〜20:00の1時間刻み）",
  "arrivalDate": "着日（YYYY/MM/DD形式）",
  "arrivalTime": "着時間（同上の選択肢から）",

  "cargoType": "荷種（例: 食品、機械部品、建材）",
  "weight": "重量（例: 5t、500kg）",
  "vehicleType": "車種（以下から選択、複数可: 軽車両, 1t車, 1.5t車, 2t車, 3t車, 4t車, 5t車, 6t車, 7t車, 8t車, 10t車, 11t車, 13t車, 15t車, 増トン車, 大型車, トレーラー, フルトレーラー, その他）",
  "bodyType": "車体タイプ（以下から選択、複数可: 平ボディ, バン, ウイング, 幌ウイング, 冷蔵車, 冷凍車, 冷凍冷蔵車, ダンプ, タンクローリー, 車載車, セルフローダー, セーフティローダー, ユニック, クレーン付き, パワーゲート付き, エアサス, コンテナ車, 海上コンテナ, 低床, 高床, その他）",
  "temperatureControl": "温度管理（以下から選択: 指定なし, 常温, 冷蔵（0〜10℃）, 冷凍（-18℃以下）, 定温）",
  "price": "運賃（税別、数字のみ、例: 50000。金額不明の場合は「要相談」）",
  "transportType": "輸送形態（以下から選択: スポット, 定期）",
  "consolidation": "積合（以下から選択: 不可, 可能）",
  "driverWork": "ドライバー作業（以下から選択: 手積み手降ろし, フォークリフト, クレーン, ゲート車, パレット, 作業なし（車上渡し）, その他）",
  "packageCount": "個数（例: 20パレット、1台）",
  "loadingMethod": "荷姿（以下から選択: パレット, バラ積み, 段ボール, フレコン, その他）",
  "highwayFee": "高速代（以下から選択: あり, なし）",
  "equipment": "必要装備（例: りん木、コンパネ、発泡、ラップ、ラッシング等）",
  "vehicleSpec": "車両指定（特定の車両指定がある場合）",
  "urgency": "緊急度（以下から選択: 通常, 至急）",
  "movingJob": "引っ越し案件の場合は「引っ越し案件」と設定",
  "contactPerson": "担当者名",
  "paymentDate": "入金予定日（YYYY/MM/DD形式または「月末締め翌月末払い」等のテキスト）",
  "description": "備考"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `あなたは日本の運送・物流の専門家です。ユーザーが自然言語で入力した荷物情報を構造化データに変換してください。

入力に複数の案件（荷物）が含まれている場合は、それぞれ個別のオブジェクトとして配列で返してください。
1件だけの場合も配列で返してください。

各案件のフォーマット:
${cargoFieldSchema}

返却形式:
{ "items": [ {案件1}, {案件2}, ... ] }

情報が不明な場合はそのフィールドを空文字にしてください。
vehicleTypeとbodyTypeは複数選択の場合カンマ区切りで返してください（例: "4t車, 10t車"）。
JSONのみを返してください。説明文は不要です。`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        if (parsed.items && Array.isArray(parsed.items)) {
          res.json({ items: parsed.items });
        } else {
          res.json({ items: [parsed] });
        }
      } catch {
        res.json({ items: [{}] });
      }
    } catch (error) {
      console.error("Cargo parse error:", error);
      res.status(500).json({ message: "荷物情報の解析に失敗しました" });
    }
  });

  app.post("/api/ai/cargo-chat", aiUpload.none(), async (req, res) => {
    try {
      const { messages, extractedFields } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "メッセージが必要です" });
      }

      const cargoFieldSchema = `{
  "title": "タイトル（出発地→到着地 荷種 重量の形式）",
  "departureArea": "都道府県名のみ（例: 神奈川）",
  "departureAddress": "詳細住所（市区町村以下）",
  "arrivalArea": "都道府県名のみ（例: 大阪）",
  "arrivalAddress": "詳細住所（市区町村以下）",
  "desiredDate": "発日（YYYY/MM/DD形式）",
  "departureTime": "発時間（以下から選択: 指定なし, 午前中, 午後, 夕方以降, 終日可, 06:00〜20:00の1時間刻み）",
  "arrivalDate": "着日（YYYY/MM/DD形式）",
  "arrivalTime": "着時間（同上の選択肢から）",

  "cargoType": "荷種（例: 食品、機械部品、建材）",
  "weight": "重量（例: 5t、500kg）",
  "vehicleType": "車種（以下から選択、複数可: 軽車両, 1t車, 1.5t車, 2t車, 3t車, 4t車, 5t車, 6t車, 7t車, 8t車, 10t車, 11t車, 13t車, 15t車, 増トン車, 大型車, トレーラー, フルトレーラー, その他）",
  "bodyType": "車体タイプ（以下から選択、複数可: 平ボディ, バン, ウイング, 幌ウイング, 冷蔵車, 冷凍車, 冷凍冷蔵車, ダンプ, タンクローリー, 車載車, セルフローダー, セーフティローダー, ユニック, クレーン付き, パワーゲート付き, エアサス, コンテナ車, 海上コンテナ, 低床, 高床, その他）",
  "temperatureControl": "温度管理（以下から選択: 指定なし, 常温, 冷蔵（0〜10℃）, 冷凍（-18℃以下）, 定温）",
  "price": "運賃（税別、数字のみ、例: 50000。金額不明の場合は「要相談」）",
  "transportType": "輸送形態（以下から選択: スポット, 定期）",
  "consolidation": "積合（以下から選択: 不可, 可能）",
  "driverWork": "ドライバー作業（以下から選択: 手積み手降ろし, フォークリフト, クレーン, ゲート車, パレット, 作業なし（車上渡し）, その他）",
  "packageCount": "個数（例: 20パレット、1台）",
  "loadingMethod": "荷姿（以下から選択: パレット, バラ積み, 段ボール, フレコン, その他）",
  "highwayFee": "高速代（以下から選択: あり, なし）",
  "equipment": "必要装備（例: りん木、コンパネ、発泡、ラップ、ラッシング等）",
  "vehicleSpec": "車両指定（特定の車両指定がある場合）",
  "urgency": "緊急度（以下から選択: 通常, 至急）",
  "movingJob": "引っ越し案件の場合は「引っ越し案件」と設定",
  "contactPerson": "担当者名",
  "paymentDate": "入金予定日（YYYY/MM/DD形式または「月末締め翌月末払い」等のテキスト）",
  "description": "備考"
}`;

      const systemPrompt = `あなたは「トラマッチ」の荷物登録AIアシスタントです。日本の運送・物流に精通しています。

あなたの役割:
1. ユーザーが入力した雑多なテキスト・データから荷物情報を抽出・整理する
2. 不足している情報があれば会話で確認する
3. 運賃について相談されたら、ルート・荷種・重量・距離から相場を提案する
4. 複数案件が含まれる場合はそれぞれ分けて処理する

運賃相場の目安（一般的な参考値）:
- 近距離（同一県内〜隣県）: 2t車 15,000〜25,000円、4t車 20,000〜35,000円、10t車 35,000〜55,000円
- 中距離（200〜400km）: 2t車 25,000〜40,000円、4t車 35,000〜60,000円、10t車 55,000〜80,000円
- 長距離（400km以上）: 2t車 40,000〜60,000円、4t車 60,000〜90,000円、10t車 80,000〜130,000円
- 冷凍・冷蔵は上記の1.2〜1.5倍
- 高速代込みの場合は上記に高速代を加算
これはあくまで目安で、荷物内容・時期・緊急度などで変動します。

応答のJSON形式（必ずこの形式で返してください）:
{
  "message": "ユーザーへの返答テキスト（親しみやすく、簡潔に）",
  "extractedFields": ${cargoFieldSchema} のうち抽出できたフィールドのみのオブジェクト（抽出できなかったフィールドは含めない）,
  "items": [複数案件の場合は各案件のフィールドオブジェクトの配列、1件または追加抽出なしの場合は空配列],
  "priceSuggestion": { "min": 最低額数字, "max": 最高額数字, "reason": "根拠の説明" } または null,
  "status": "extracting" | "confirming" | "ready" | "chatting"
}

statusの意味:
- "extracting": 情報を抽出中、まだ不足あり
- "confirming": 主要情報は揃った、ユーザーに確認中
- "ready": 登録準備完了
- "chatting": 雑談や質問への回答中

現在抽出済みのフィールド: ${extractedFields ? JSON.stringify(extractedFields) : "なし"}

重要:
- 返答は必ず有効なJSONで返してください
- messageは必ず日本語で、丁寧だが堅すぎない口調で
- 運賃の相談には積極的に応じて、具体的な金額を提案してください
- 大量のデータが来た場合は、整理して要約してから確認してください`;

      const apiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: apiMessages,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        res.json({
          message: parsed.message || "申し訳ございません、もう一度お試しください。",
          extractedFields: parsed.extractedFields || {},
          items: parsed.items || [],
          priceSuggestion: parsed.priceSuggestion || null,
          status: parsed.status || "chatting",
        });
      } catch {
        res.json({
          message: content,
          extractedFields: {},
          items: [],
          priceSuggestion: null,
          status: "chatting",
        });
      }
    } catch (error) {
      console.error("Cargo chat error:", error);
      res.status(500).json({ message: "AIとの通信に失敗しました" });
    }
  });

  app.post("/api/ai/truck-chat", aiUpload.none(), async (req, res) => {
    try {
      const { messages, extractedFields } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "メッセージが必要です" });
      }

      const truckFieldSchema = `{
  "title": "タイトル（車種 空車地→行先地の形式、例: 10t車 東京→大阪 空車あり）",
  "currentArea": "空車地の都道府県名のみ（例: 東京）",
  "destinationArea": "行先地の都道府県名のみ（例: 大阪）",
  "vehicleType": "車種（以下から選択: 軽車両, 1t車, 1.5t車, 2t車, 3t車, 4t車, 5t車, 6t車, 7t車, 8t車, 10t車, 11t車, 13t車, 15t車, 増トン車, 大型車, トレーラー, フルトレーラー, その他）",
  "bodyType": "車体タイプ（以下から選択: 平ボディ, バン, ウイング, 幌ウイング, 冷蔵車, 冷凍車, 冷凍冷蔵車, ダンプ, タンクローリー, 車載車, セルフローダー, セーフティローダー, ユニック, クレーン付き, パワーゲート付き, エアサス, コンテナ車, 海上コンテナ, 低床, 高床, その他）",
  "maxWeight": "最大積載量（例: 10t, 2t, 500kg）",
  "availableDate": "空車日（YYYY/MM/DD形式）",
  "price": "最低運賃（税別、数字のみ、例: 50000。金額不明の場合は空文字）",
  "description": "備考",
  "companyName": "会社名",
  "contactPhone": "電話番号",
  "contactEmail": "メールアドレス"
}`;

      const systemPrompt = `あなたは「トラマッチ」の空車登録AIアシスタントです。日本の運送・物流に精通しています。

あなたの役割:
1. ユーザーが入力した雑多なテキスト・データから空車情報を抽出・整理する
2. 不足している情報があれば会話で確認する
3. 運賃について相談されたら、ルート・車種・距離から相場を提案する
4. 複数案件が含まれる場合はそれぞれ分けて処理する

運賃相場の目安（一般的な参考値）:
- 近距離（同一県内〜隣県）: 2t車 15,000〜25,000円、4t車 20,000〜35,000円、10t車 35,000〜55,000円
- 中距離（200〜400km）: 2t車 25,000〜40,000円、4t車 35,000〜60,000円、10t車 55,000〜80,000円
- 長距離（400km以上）: 2t車 40,000〜60,000円、4t車 60,000〜90,000円、10t車 80,000〜130,000円
これはあくまで目安で、車種・時期・路線などで変動します。

応答のJSON形式（必ずこの形式で返してください）:
{
  "message": "ユーザーへの返答テキスト（親しみやすく、簡潔に）",
  "extractedFields": ${truckFieldSchema} のうち抽出できたフィールドのみのオブジェクト（抽出できなかったフィールドは含めない）,
  "items": [複数案件の場合は各案件のフィールドオブジェクトの配列、1件または追加抽出なしの場合は空配列],
  "priceSuggestion": { "min": 最低額数字, "max": 最高額数字, "reason": "根拠の説明" } または null,
  "status": "extracting" | "confirming" | "ready" | "chatting"
}

statusの意味:
- "extracting": 情報を抽出中、まだ不足あり
- "confirming": 主要情報は揃った、ユーザーに確認中
- "ready": 登録準備完了
- "chatting": 雑談や質問への回答中

現在抽出済みのフィールド: ${extractedFields ? JSON.stringify(extractedFields) : "なし"}

重要:
- 返答は必ず有効なJSONで返してください
- messageは必ず日本語で、丁寧だが堅すぎない口調で
- 運賃の相談には積極的に応じて、具体的な金額を提案してください
- 大量のデータが来た場合は、整理して要約してから確認してください`;

      const apiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: apiMessages,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        res.json({
          message: parsed.message || "申し訳ございません、もう一度お試しください。",
          extractedFields: parsed.extractedFields || {},
          items: parsed.items || [],
          priceSuggestion: parsed.priceSuggestion || null,
          status: parsed.status || "chatting",
        });
      } catch {
        res.json({
          message: content,
          extractedFields: {},
          items: [],
          priceSuggestion: null,
          status: "chatting",
        });
      }
    } catch (error) {
      console.error("Truck chat error:", error);
      res.status(500).json({ message: "AIとの通信に失敗しました" });
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifs = await storage.getNotificationsByUserId(req.session.userId as string);
      res.json(notifs);
    } catch (error) {
      res.status(500).json({ message: "通知の取得に失敗しました" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.session.userId as string);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "未読数の取得に失敗しました" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notif = await storage.markNotificationAsRead(req.params.id as string, req.session.userId as string);
      if (!notif) {
        return res.status(404).json({ message: "通知が見つかりません" });
      }
      res.json(notif);
    } catch (error) {
      res.status(500).json({ message: "通知の更新に失敗しました" });
    }
  });

  app.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.session.userId as string);
      res.json({ message: "全て既読にしました" });
    } catch (error) {
      res.status(500).json({ message: "通知の更新に失敗しました" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteNotification(req.params.id as string, req.session.userId as string);
      if (!deleted) {
        return res.status(404).json({ message: "通知が見つかりません" });
      }
      res.json({ message: "通知を削除しました" });
    } catch (error) {
      res.status(500).json({ message: "通知の削除に失敗しました" });
    }
  });

  // Announcements API (public: published only, admin: all CRUD)
  app.get("/api/announcements", async (_req, res) => {
    try {
      const all = await storage.getAnnouncements();
      const published = all.filter(a => a.isPublished);
      res.json(published);
    } catch (error) {
      res.status(500).json({ message: "お知らせの取得に失敗しました" });
    }
  });

  app.get("/api/admin/announcements", requireAdmin, async (_req, res) => {
    try {
      const all = await storage.getAnnouncements();
      res.json(all);
    } catch (error) {
      res.status(500).json({ message: "お知らせの取得に失敗しました" });
    }
  });

  app.post("/api/admin/announcements", requireAdmin, async (req, res) => {
    try {
      const parsed = insertAnnouncementSchema.parse(req.body);
      const created = await storage.createAnnouncement(parsed);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      res.status(500).json({ message: "お知らせの作成に失敗しました" });
    }
  });

  app.patch("/api/admin/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateAnnouncement(req.params.id as string, req.body);
      if (!updated) {
        return res.status(404).json({ message: "お知らせが見つかりません" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "お知らせの更新に失敗しました" });
    }
  });

  app.delete("/api/admin/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteAnnouncement(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "お知らせが見つかりません" });
      }
      res.json({ message: "お知らせを削除しました" });
    } catch (error) {
      res.status(500).json({ message: "お知らせの削除に失敗しました" });
    }
  });

  // Partner CRUD
  app.get("/api/partners", requireAuth, async (req, res) => {
    try {
      const list = await storage.getPartnersByUserId(req.session.userId!);
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "取引先の取得に失敗しました" });
    }
  });

  app.post("/api/partners", requireAuth, async (req, res) => {
    try {
      const parsed = insertPartnerSchema.safeParse({ ...req.body, userId: req.session.userId });
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).message });
      }
      const created = await storage.createPartner(parsed.data);
      res.json(created);
    } catch (error) {
      res.status(500).json({ message: "取引先の作成に失敗しました" });
    }
  });

  app.patch("/api/partners/:id", requireAuth, async (req, res) => {
    try {
      const partner = await storage.getPartner(req.params.id as string);
      if (!partner || partner.userId !== req.session.userId) {
        return res.status(404).json({ message: "取引先が見つかりません" });
      }
      const updated = await storage.updatePartner(req.params.id as string, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "取引先の更新に失敗しました" });
    }
  });

  app.delete("/api/partners/:id", requireAuth, async (req, res) => {
    try {
      const partner = await storage.getPartner(req.params.id as string);
      if (!partner || partner.userId !== req.session.userId) {
        return res.status(404).json({ message: "取引先が見つかりません" });
      }
      await storage.deletePartner(req.params.id as string);
      res.json({ message: "取引先を削除しました" });
    } catch (error) {
      res.status(500).json({ message: "取引先の削除に失敗しました" });
    }
  });

  // Transport Ledger CRUD
  app.get("/api/transport-records", requireAuth, async (req, res) => {
    try {
      const records = await storage.getTransportRecordsByUserId(req.session.userId!);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "管理簿の取得に失敗しました" });
    }
  });

  app.post("/api/transport-records", requireAuth, async (req, res) => {
    try {
      const parsed = insertTransportRecordSchema.safeParse({ ...req.body, userId: req.session.userId });
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).message });
      }
      const created = await storage.createTransportRecord(parsed.data);
      res.json(created);
    } catch (error) {
      res.status(500).json({ message: "記録の作成に失敗しました" });
    }
  });

  app.patch("/api/transport-records/:id", requireAuth, async (req, res) => {
    try {
      const record = await storage.getTransportRecord(req.params.id as string);
      if (!record || record.userId !== req.session.userId) {
        return res.status(404).json({ message: "記録が見つかりません" });
      }
      const updated = await storage.updateTransportRecord(req.params.id as string, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "記録の更新に失敗しました" });
    }
  });

  app.delete("/api/transport-records/:id", requireAuth, async (req, res) => {
    try {
      const record = await storage.getTransportRecord(req.params.id as string);
      if (!record || record.userId !== req.session.userId) {
        return res.status(404).json({ message: "記録が見つかりません" });
      }
      await storage.deleteTransportRecord(req.params.id as string);
      res.json({ message: "記録を削除しました" });
    } catch (error) {
      res.status(500).json({ message: "記録の削除に失敗しました" });
    }
  });

  // Admin: Send notification to users
  app.post("/api/admin/notifications/send", requireAdmin, async (req, res) => {
    try {
      const { title, message, target } = req.body;
      if (!title || !message) {
        return res.status(400).json({ message: "タイトルと本文は必須です" });
      }
      const allUsers = await storage.getAllUsers();
      let targetUsers = allUsers.filter(u => u.role !== "admin" && u.approved);
      if (target === "shippers") {
        targetUsers = targetUsers.filter(u => u.userType === "shipper");
      } else if (target === "carriers") {
        targetUsers = targetUsers.filter(u => u.userType === "carrier");
      }
      for (const user of targetUsers) {
        await storage.createNotification({
          userId: user.id,
          type: "admin_notification",
          title,
          message,
        });
      }
      res.json({ message: `${targetUsers.length}人に通知を送信しました`, count: targetUsers.length });
    } catch (error) {
      res.status(500).json({ message: "通知の送信に失敗しました" });
    }
  });

  // Admin: Revenue stats
  app.get("/api/admin/revenue-stats", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const cargo = await storage.getCargoListings();
      const trucks = await storage.getTruckListings();
      const totalUsers = allUsers.filter(u => u.role !== "admin").length;
      const approvedUsers = allUsers.filter(u => u.approved && u.role !== "admin").length;
      const totalCargo = cargo.length;
      const completedCargo = cargo.filter(c => c.status === "completed").length;
      const totalTrucks = trucks.length;
      res.json({ totalUsers, approvedUsers, totalCargo, completedCargo, totalTrucks });
    } catch (error) {
      res.status(500).json({ message: "収益データの取得に失敗しました" });
    }
  });

  // Admin: SEO Articles
  app.get("/api/admin/seo-articles", requireAdmin, async (req, res) => {
    try {
      const articles = await storage.getSeoArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "記事の取得に失敗しました" });
    }
  });

  app.post("/api/admin/seo-articles/generate", requireAdmin, async (req, res) => {
    try {
      const { topic, keywords, notes } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "テーマは必須です" });
      }
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `あなたはSEO記事のライターです。運送業界・物流業界に特化した高品質なSEO記事を日本語で作成してください。
記事は以下の構成で作成してください：
1. 魅力的なタイトル（H1）
2. 導入文（200文字程度）
3. 本文（H2/H3の見出しを使って構造化、合計2000〜3000文字）
4. まとめ

マークダウン形式で出力してください。`
          },
          {
            role: "user",
            content: `テーマ: ${topic}\nキーワード: ${keywords || "なし"}\n備考: ${notes || "なし"}`
          }
        ],
        max_tokens: 4000,
      });
      const content = completion.choices[0]?.message?.content || "";
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : topic;

      const article = await storage.createSeoArticle({
        topic,
        keywords: keywords || null,
        title,
        content,
        status: "draft",
      });
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "記事の生成に失敗しました" });
    }
  });

  app.patch("/api/admin/seo-articles/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSeoArticle(req.params.id as string, req.body);
      if (!updated) {
        return res.status(404).json({ message: "記事が見つかりません" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "記事の更新に失敗しました" });
    }
  });

  app.delete("/api/admin/seo-articles/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSeoArticle(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "記事が見つかりません" });
      }
      res.json({ message: "記事を削除しました" });
    } catch (error) {
      res.status(500).json({ message: "記事の削除に失敗しました" });
    }
  });

  // Admin: Settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllAdminSettings();
      const settingsMap: Record<string, string> = {};
      for (const s of settings) {
        settingsMap[s.key] = s.value;
      }
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ message: "設定の取得に失敗しました" });
    }
  });

  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const entries = Object.entries(req.body) as [string, string][];
      for (const [key, value] of entries) {
        await storage.setAdminSetting(key, value);
      }
      res.json({ message: "設定を保存しました" });
    } catch (error) {
      res.status(500).json({ message: "設定の保存に失敗しました" });
    }
  });

  return httpServer;
}
