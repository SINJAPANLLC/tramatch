import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCargoListingSchema, insertTruckListingSchema, insertUserSchema } from "@shared/schema";
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

  const profileUpdateSchema = z.object({
    companyName: z.string().min(1).max(200).optional(),
    address: z.string().max(500).optional(),
    contactName: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    fax: z.string().max(20).optional(),
    email: z.string().email().max(200).optional(),
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

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `あなたは日本の運送・物流の専門家です。ユーザーが自然言語で入力した荷物情報を構造化データに変換してください。
以下のJSON形式で返してください。情報が不明な場合はそのフィールドを空文字にしてください。

{
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
  "vehicleType": "車種（以下から選択: 軽車両, 1t車, 1.5t車, 2t車, 3t車, 4t車, 5t車, 6t車, 7t車, 8t車, 10t車, 11t車, 13t車, 15t車, 増トン車, 大型車, トレーラー, フルトレーラー, その他）",
  "bodyType": "車体タイプ（以下から選択: 平ボディ, バン, ウイング, 冷蔵車, 冷凍車, ダンプ, タンクローリー, 車載車, その他）",
  "temperatureControl": "温度管理（以下から選択: 指定なし, 常温, 冷蔵（0〜10℃）, 冷凍（-18℃以下）, 定温）",
  "price": "運賃（数字のみ、例: 50000）",
  "transportType": "輸送形態（以下から選択: スポット, 定期）",
  "consolidation": "積合（可 or 不可）",
  "driverWork": "ドライバー作業（以下から選択: 手積み手降ろし, フォークリフト, クレーン, ゲート車, パレット, 作業なし（車上渡し）, その他）",
  "packageCount": "個数（例: 20パレット）",
  "loadingMethod": "荷姿（以下から選択: バラ積み, パレット積み, 段ボール, フレコン, その他）",
  "highwayFee": "高速代（以下から選択: 込み, 別途, 高速代なし）",
  "description": "備考"
}

JSONのみを返してください。説明文は不要です。`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        res.json({ fields: parsed });
      } catch {
        res.json({ fields: {} });
      }
    } catch (error) {
      console.error("Cargo parse error:", error);
      res.status(500).json({ message: "荷物情報の解析に失敗しました" });
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

  return httpServer;
}
