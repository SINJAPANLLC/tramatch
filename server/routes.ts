import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import compression from "compression";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, dbPool } from "./db";
import { insertCargoListingSchema, insertTruckListingSchema, insertUserSchema, insertAnnouncementSchema, insertPartnerSchema, insertTransportRecordSchema, insertNotificationTemplateSchema, insertContactInquirySchema, insertAgentSchema, notificationTemplates } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { sendEmail, sendLineMessage, isEmailConfigured, isLineConfigured, replaceTemplateVariables } from "./notification-service";
import { pingGoogleSitemap } from "./auto-article-generator";

let _openai: any = null;
function getOpenAI() {
  if (!_openai) {
    const OpenAI = require("openai").default;
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      ...(process.env.OPENAI_API_KEY ? {} : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL } : {}),
    });
  }
  return _openai;
}

async function resolveEmailTemplate(
  triggerEvent: string,
  variables: Record<string, string>,
  defaultSubject: string,
  defaultBody: string
): Promise<{ subject: string; body: string } | null> {
  try {
    const allTemplates = await db.select().from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.channel, "email"),
        eq(notificationTemplates.triggerEvent, triggerEvent),
      ));
    if (allTemplates.length > 0) {
      const active = allTemplates.find(t => t.isActive);
      if (!active) return null;
      return {
        subject: replaceTemplateVariables(active.subject || defaultSubject, variables),
        body: replaceTemplateVariables(active.body, variables),
      };
    }
  } catch (err) {
    console.error(`Template lookup failed for ${triggerEvent}:`, err);
  }
  return {
    subject: replaceTemplateVariables(defaultSubject, variables),
    body: replaceTemplateVariables(defaultBody, variables),
  };
}

function isAgentAutoEmail(email: string): boolean {
  return /^agent-[a-z]+@tramatch/.test(email);
}

const openai = new Proxy({} as any, {
  get(_target, prop) {
    return getOpenAI()[prop];
  }
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

function generateInvoiceEmailHtml(invoice: any, adminInfo?: any): string {
  const statusLabel = invoice.status === "paid" ? "入金済み" : invoice.status === "overdue" ? "支払い期限超過" : "未入金";
  const appBaseUrl = process.env.APP_BASE_URL || "https://tramatch-sinjapan.com";
  const paymentUrl = `${appBaseUrl}/payment`;

  const bankName = adminInfo?.bankName || "";
  const bankBranch = adminInfo?.bankBranch || "";
  const accountType = adminInfo?.accountType || "普通";
  const accountNumber = adminInfo?.accountNumber || "";
  const accountHolderKana = adminInfo?.accountHolderKana || "";
  const adminAddress = adminInfo?.address || "神奈川県愛甲郡愛川町中津7287";
  const adminPostalCode = adminInfo?.postalCode || "2430303";
  const formattedPostalCode = adminPostalCode.length === 7 ? `${adminPostalCode.slice(0, 3)}-${adminPostalCode.slice(3)}` : adminPostalCode;
  const adminPhone = adminInfo?.phone || "046-212-2325";

  const descriptionLines = (invoice.description || "月額利用料").split("\n");
  const descriptionRows = descriptionLines.map((line: string) => {
    return `<tr><td style="padding:10px;border:1px solid #ddd;">${line}</td>
        <td style="padding:10px;text-align:right;border:1px solid #ddd;"></td></tr>`;
  }).join("");

  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN',sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#333;">
  <div style="text-align:center;border-bottom:3px solid #0d9488;padding-bottom:15px;margin-bottom:20px;">
    <h1 style="color:#0d9488;margin:0;font-size:24px;">請求書</h1>
    <p style="margin:5px 0 0;color:#666;font-size:14px;">トラマッチ - 求荷求車マッチングプラットフォーム</p>
  </div>
  <table style="width:100%;margin-bottom:20px;font-size:14px;">
    <tr><td style="width:50%;vertical-align:top;">
      <p style="margin:0 0 5px;"><strong>請求書番号:</strong> ${invoice.invoiceNumber}</p>
      <p style="margin:0 0 5px;"><strong>請求日:</strong> ${new Date(invoice.createdAt).toLocaleDateString("ja-JP")}</p>
      <p style="margin:0 0 5px;"><strong>お支払い期限:</strong> ${invoice.dueDate}</p>
      <p style="margin:0 0 5px;"><strong>ステータス:</strong> ${statusLabel}</p>
    </td><td style="width:50%;vertical-align:top;text-align:right;">
      <p style="margin:0 0 3px;font-weight:bold;">発行元</p>
      <p style="margin:0 0 2px;">合同会社SIN JAPAN</p>
      <p style="margin:0 0 2px;">〒${formattedPostalCode}</p>
      <p style="margin:0 0 2px;">${adminAddress}</p>
      <p style="margin:0 0 2px;">Tel: ${adminPhone}</p>
      <p style="margin:0;">info@sinjapan.jp</p>
    </td></tr>
  </table>
  <div style="background:#f8f9fa;padding:15px;border-radius:6px;margin-bottom:20px;">
    <p style="margin:0 0 5px;font-weight:bold;">請求先</p>
    <p style="margin:0;font-size:16px;">${invoice.companyName} 御中</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <thead><tr style="background:#0d9488;color:white;">
      <th style="padding:10px;text-align:left;border:1px solid #0d9488;">項目</th>
      <th style="padding:10px;text-align:right;border:1px solid #0d9488;">金額</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:10px;border:1px solid #ddd;">${descriptionLines[0] || "月額利用料"}</td>
          <td style="padding:10px;text-align:right;border:1px solid #ddd;">¥${invoice.amount.toLocaleString()}</td></tr>
      <tr><td style="padding:10px;border:1px solid #ddd;">消費税（10%）</td>
          <td style="padding:10px;text-align:right;border:1px solid #ddd;">¥${invoice.tax.toLocaleString()}</td></tr>
      <tr style="background:#f8f9fa;font-weight:bold;">
        <td style="padding:10px;border:1px solid #ddd;">合計金額（税込）</td>
        <td style="padding:10px;text-align:right;border:1px solid #ddd;color:#0d9488;font-size:18px;">¥${invoice.totalAmount.toLocaleString()}</td></tr>
    </tbody>
  </table>
  <div style="background:#f0fdfa;padding:15px;border-radius:6px;border:1px solid #99f6e4;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-weight:bold;color:#0d9488;">お振込先</p>
    <table style="font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:3px 15px 3px 0;color:#666;">銀行名</td><td style="padding:3px 0;font-weight:bold;">${bankName}</td></tr>
      <tr><td style="padding:3px 15px 3px 0;color:#666;">支店名</td><td style="padding:3px 0;font-weight:bold;">${bankBranch}</td></tr>
      <tr><td style="padding:3px 15px 3px 0;color:#666;">口座種別</td><td style="padding:3px 0;font-weight:bold;">${accountType}</td></tr>
      <tr><td style="padding:3px 15px 3px 0;color:#666;">口座番号</td><td style="padding:3px 0;font-weight:bold;">${accountNumber}</td></tr>
      <tr><td style="padding:3px 15px 3px 0;color:#666;">口座名義</td><td style="padding:3px 0;font-weight:bold;">${accountHolderKana}</td></tr>
    </table>
    <p style="margin:10px 0 0;font-size:13px;color:#666;">※振込手数料はお客様のご負担となります。</p>
  </div>
  <div style="text-align:center;margin-bottom:20px;">
    <p style="margin:0 0 10px;font-size:14px;color:#333;">クレジットカードでのお支払いも可能です</p>
    <a href="${paymentUrl}" style="display:inline-block;background:#0d9488;color:white;text-decoration:none;padding:12px 30px;border-radius:6px;font-size:16px;font-weight:bold;">カード決済はこちら</a>
  </div>
  <div style="text-align:center;padding-top:15px;border-top:1px solid #eee;color:#999;font-size:12px;">
    <p>合同会社SIN JAPAN ｜ トラマッチ</p>
  </div>
</body></html>`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(compression());
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

      const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
      const now = new Date().toISOString();

      (async () => {
        let locationStr = "";
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?lang=ja&fields=status,country,regionName,city`);
          const geo = await geoRes.json();
          if (geo.status === "success") {
            locationStr = [geo.country, geo.regionName, geo.city].filter(Boolean).join(" ");
          }
        } catch {}
        storage.updateUserProfile(user.id, {
          lastLoginAt: now,
          lastLoginIp: clientIp,
          lastLoginLocation: locationStr || undefined,
        }).catch(() => {});

        storage.createAuditLog({
          userId: user.id,
          userName: user.companyName || user.username,
          action: "login",
          targetType: "session",
          details: `ログイン（IP: ${clientIp}${locationStr ? `, ${locationStr}` : ""}）`,
          ipAddress: clientIp,
        }).catch(() => {});
      })();
    } catch (error) {
      console.error("Login error:", error);
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

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "メールアドレスを入力してください" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "パスワードリセットメールを送信しました" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.createPasswordResetToken(user.id, tokenHash, expiresAt);

      const appBaseUrl = process.env.APP_BASE_URL || "https://tramatch-sinjapan.com";
      const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;

      const resolved = await resolveEmailTemplate(
        "password_reset",
        { companyName: user.companyName, resetUrl },
        "【トラマッチ】パスワードリセットのご案内",
        `{{companyName}} 様\n\n以下のリンクからパスワードをリセットしてください。\nこのリンクは1時間有効です。\n\n{{resetUrl}}\n\n※このメールに心当たりがない場合は無視してください。\n\nトラマッチ運営事務局`
      );
      if (!resolved) {
        return res.status(500).json({ message: "メールテンプレートが無効です" });
      }
      const emailResult = await sendEmail(user.email, resolved.subject, resolved.body);

      if (!emailResult.success) {
        console.error("Password reset email failed:", emailResult.error);
      }

      res.json({ message: "パスワードリセットメールを送信しました" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "エラーが発生しました" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "トークンとパスワードが必要です" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "パスワードは6文字以上で入力してください" });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const resetToken = await storage.getPasswordResetToken(tokenHash);
      if (!resetToken) {
        return res.status(400).json({ message: "無効なリセットリンクです" });
      }

      if (resetToken.used) {
        return res.status(400).json({ message: "このリセットリンクは既に使用されています" });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "リセットリンクの有効期限が切れています。再度リクエストしてください。" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      await storage.markPasswordResetTokenUsed(tokenHash);

      res.json({ message: "パスワードが正常にリセットされました" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "パスワードリセットに失敗しました" });
    }
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "未認証" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "ユーザーが見つかりません" });
    }
    const { password, adminMemo, lastLoginAt, lastLoginIp, lastLoginLocation, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/onboarding-progress", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const [user, cargoCount, truckCount, partners] = await Promise.all([
        storage.getUser(userId),
        storage.getCargoCountByUserId(userId),
        storage.getTruckCountByUserId(userId),
        storage.getPartnersByUserId(userId),
      ]);
      if (!user) return res.status(404).json({ message: "ユーザーが見つかりません" });

      const profileComplete = !!(user.companyName && user.phone && user.address && user.representative);

      res.json({
        profileComplete,
        cargoCount,
        truckCount,
        partnerCount: partners.length,
        notificationSettingDone: !!(user.notifyEmail || user.notifyLine),
      });
    } catch (error) {
      res.status(500).json({ message: "オンボーディング情報の取得に失敗しました" });
    }
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
      const targetUserId = req.params.userId;
      const [user, userCargo, userTrucks] = await Promise.all([
        storage.getUser(targetUserId),
        storage.getCargoListingsByUserId(targetUserId),
        storage.getTruckListingsByUserId(targetUserId),
      ]);
      if (!user) {
        return res.status(404).json({ message: "企業情報が見つかりません" });
      }

      const cargoCompleted = userCargo.filter(c => c.status === "completed").length;
      const cargoRegistered = userCargo.length;
      const truckCompleted = userTrucks.filter(t => t.status === "completed").length;
      const truckRegistered = userTrucks.length;

      const registrationDate = user.registrationDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long" }) : null);

      const { password, id, role, approved, permitFile, username, ...companyData } = user;
      res.json({
        ...companyData,
        cargoCount1m: cargoCompleted,
        cargoCount3m: cargoRegistered,
        truckCount1m: truckCompleted,
        truckCount3m: truckRegistered,
        registrationDate,
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
    registrationDate: z.string().max(50).optional(),
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
    lineUserId: z.string().max(100).optional(),
    notifySystem: z.boolean().optional(),
    notifyEmail: z.boolean().optional(),
    notifyLine: z.boolean().optional(),
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
      if (!plan || !["free", "premium", "premium_full"].includes(plan)) {
        return res.status(400).json({ message: "無効なプランです" });
      }
      if (plan === "premium_full") {
        const existing = await storage.getPendingPlanChangeRequest(req.session.userId as string);
        if (existing) {
          return res.status(400).json({ message: "既にプラン変更の申請中です" });
        }
        const currentUser = await storage.getUser(req.session.userId as string);
        if (!currentUser) {
          return res.status(404).json({ message: "ユーザーが見つかりません" });
        }
        await storage.createPlanChangeRequest({
          userId: req.session.userId as string,
          currentPlan: currentUser.plan,
          requestedPlan: "premium_full",
        });
        const admins = (await storage.getAllUsers()).filter(u => u.role === "admin");
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: "plan_change",
            title: "プラン変更申請",
            message: `${currentUser.companyName}がプレミアムプラン（¥5,500/月）への変更を申請しました`,
            relatedId: currentUser.id,
          });
        }
        return res.json({ message: "プラン変更の申請を送信しました。管理者の承認をお待ちください。", pending: true });
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

  app.get("/api/plan-change-requests/pending", requireAuth, async (req, res) => {
    try {
      const request = await storage.getPendingPlanChangeRequest(req.session.userId as string);
      res.json({ pending: !!request, request: request || null });
    } catch (error) {
      res.status(500).json({ message: "申請状況の取得に失敗しました" });
    }
  });

  app.get("/api/admin/plan-change-requests", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getPlanChangeRequests();
      const allUsers = await storage.getAllUsers();
      const enriched = requests.map(r => {
        const user = allUsers.find(u => u.id === r.userId);
        return { ...r, companyName: user?.companyName || "不明", email: user?.email || "" };
      });
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "プラン変更申請の取得に失敗しました" });
    }
  });

  app.patch("/api/admin/plan-change-requests/:id/approve", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const adminNote = req.body?.adminNote;
      const requests = await storage.getPlanChangeRequests();
      const request = requests.find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ message: "申請が見つかりません" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "この申請は既に処理済みです" });
      }
      await storage.updateUserProfile(request.userId, { plan: request.requestedPlan });
      const updated = await storage.updatePlanChangeRequestStatus(id, "approved", adminNote);
      await storage.createNotification({
        userId: request.userId,
        type: "plan_change",
        title: "プラン変更承認",
        message: `プレミアムプラン（¥5,500/月）への変更が承認されました`,
      });
      res.json(updated);
    } catch (error) {
      console.error("Plan change approve error:", error);
      res.status(500).json({ message: "承認に失敗しました" });
    }
  });

  app.patch("/api/admin/plan-change-requests/:id/reject", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const adminNote = req.body?.adminNote;
      const requests = await storage.getPlanChangeRequests();
      const request = requests.find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ message: "申請が見つかりません" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "この申請は既に処理済みです" });
      }
      const updated = await storage.updatePlanChangeRequestStatus(id, "rejected", adminNote);
      await storage.createNotification({
        userId: request.userId,
        type: "plan_change",
        title: "プラン変更却下",
        message: `プレミアムプランへの変更申請が却下されました${adminNote ? `（理由: ${adminNote}）` : ""}`,
      });
      res.json(updated);
    } catch (error) {
      console.error("Plan change reject error:", error);
      res.status(500).json({ message: "却下に失敗しました" });
    }
  });

  app.post("/api/user-add-requests", requireAuth, async (req, res) => {
    try {
      const { name, email, password, role, note } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "担当者名、メールアドレス、パスワードは必須です" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "パスワードは8文字以上で入力してください" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "このメールアドレスは既に登録されています" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const request = await storage.createUserAddRequest({
        requesterId: req.session.userId as string,
        name,
        email,
        password: hashedPassword,
        role: role || "member",
        note: note || null,
      });
      const requester = await storage.getUser(req.session.userId as string);
      const admins = (await storage.getAllUsers()).filter(u => u.role === "admin");
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "user_add_request",
          title: "ユーザー追加申請",
          message: `${requester?.companyName || "不明"}から「${name}」のユーザー追加申請がありました`,
          relatedId: request.id,
        });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "ユーザー追加申請に失敗しました" });
    }
  });

  app.get("/api/company-members", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const allUsers = await storage.getAllUsers();
      const members = allUsers.filter((u: any) => u.addedByUserId === userId && u.approved);
      const safeMembers = members.map((u: any) => ({
        id: u.id,
        contactName: u.contactName,
        email: u.email,
        role: u.role,
        approved: u.approved,
        companyName: u.companyName,
        addedByUserId: u.addedByUserId,
      }));
      res.json(safeMembers);
    } catch (error) {
      res.status(500).json({ message: "メンバー一覧の取得に失敗しました" });
    }
  });

  app.get("/api/user-add-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getUserAddRequestsByRequesterId(req.session.userId as string);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "申請一覧の取得に失敗しました" });
    }
  });

  app.get("/api/admin/user-add-requests", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getUserAddRequests();
      const allUsers = await storage.getAllUsers();
      const enriched = requests.map(r => {
        const requester = allUsers.find(u => u.id === r.requesterId);
        return { ...r, requesterCompanyName: requester?.companyName || "不明", requesterEmail: requester?.email || "" };
      });
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "ユーザー追加申請の取得に失敗しました" });
    }
  });

  app.patch("/api/admin/user-add-requests/:id/approve", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const adminNote = req.body?.adminNote;
      const requests = await storage.getUserAddRequests();
      const request = requests.find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ message: "申請が見つかりません" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "この申請は既に処理済みです" });
      }
      const existingUser = await storage.getUserByEmail(request.email);
      if (existingUser) {
        return res.status(400).json({ message: "このメールアドレスは既に登録されています" });
      }
      const requester = await storage.getUser(request.requesterId);
      const newUser = await storage.createUser({
        username: request.email,
        email: request.email,
        password: request.password,
        companyName: requester?.companyName || request.name,
        contactName: request.name,
        phone: requester?.phone || "未設定",
        userType: requester?.userType || "carrier",
        plan: requester?.plan || "free",
        addedByUserId: request.requesterId,
      });
      await storage.updateUserProfile(newUser.id, { approved: true });
      const updated = await storage.updateUserAddRequestStatus(id, "approved", adminNote);
      await storage.createNotification({
        userId: request.requesterId,
        type: "user_add_request",
        title: "ユーザー追加承認",
        message: `「${request.name}」のユーザー追加申請が承認されました。ログイン可能です。`,
      });
      res.json(updated);
    } catch (error) {
      console.error("User add approve error:", error);
      res.status(500).json({ message: "承認に失敗しました" });
    }
  });

  app.patch("/api/admin/user-add-requests/:id/reject", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const adminNote = req.body?.adminNote;
      const requests = await storage.getUserAddRequests();
      const request = requests.find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ message: "申請が見つかりません" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "この申請は既に処理済みです" });
      }
      const updated = await storage.updateUserAddRequestStatus(id, "rejected", adminNote);
      await storage.createNotification({
        userId: request.requesterId,
        type: "user_add_request",
        title: "ユーザー追加却下",
        message: `「${request.name}」のユーザー追加申請が却下されました${adminNote ? `（理由: ${adminNote}）` : ""}`,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "却下に失敗しました" });
    }
  });

  app.get("/api/public/counts", async (_req, res) => {
    try {
      const [activeCargo, activeTrucks] = await Promise.all([
        storage.getActiveCargoCount(),
        storage.getActiveTruckCount(),
      ]);
      res.json({ cargoCount: activeCargo, truckCount: activeTrucks });
    } catch (error) {
      res.json({ cargoCount: 0, truckCount: 0 });
    }
  });

  async function expireOldCargoListings(listings: any[]) {
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
  }

  app.get("/api/cargo", async (_req, res) => {
    try {
      const listings = await storage.getCargoListings();
      await expireOldCargoListings(listings);
      const activeListings = listings.filter(l => l.status === "active").map(({ privateNote, ...rest }) => rest);
      res.json(activeListings);
    } catch (error) {
      console.error("Failed to fetch cargo listings:", error);
      res.status(500).json({ message: "荷物一覧の取得に失敗しました" });
    }
  });

  app.get("/api/my-cargo", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getCargoListingsByUserId(req.session.userId as string);
      await expireOldCargoListings(listings);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "荷物一覧の取得に失敗しました" });
    }
  });

  app.get("/api/cargo/by-user/:userId", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getCargoListingsByUserId(req.params.userId as string);
      const activeListings = listings.filter(l => l.status === "active").map(({ privateNote, ...rest }) => rest);
      res.json(activeListings);
    } catch (error) {
      res.status(500).json({ message: "荷物一覧の取得に失敗しました" });
    }
  });

  app.get("/api/cargo/:id", requireAuth, async (req, res) => {
    try {
      const listing = await storage.getCargoListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "荷物情報が見つかりません" });
      }
      storage.incrementCargoViewCount(req.params.id).catch(() => {});
      if (listing.userId !== req.session.userId) {
        const { privateNote, ...publicListing } = listing;
        return res.json(publicListing);
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "荷物情報の取得に失敗しました" });
    }
  });

  app.post("/api/cargo", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId as string);
      if (currentUser && currentUser.plan !== "premium" && currentUser.plan !== "premium_full" && currentUser.role !== "admin") {
        return res.status(403).json({ message: "AI荷物登録にはβ版プレミアムプランへの加入が必要です" });
      }
      const bodyWithDefaults = {
        ...req.body,
        companyName: req.body.companyName || currentUser?.companyName || "",
        contactPhone: req.body.contactPhone || currentUser?.phone || "",
        contactEmail: req.body.contactEmail || currentUser?.email || "",
      };
      const parsed = insertCargoListingSchema.safeParse(bodyWithDefaults);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const listingData = parsed.data;
      const listing = await storage.createCargoListing(listingData, req.session.userId as string);

      storage.createAuditLog({
        userId: req.session.userId as string,
        userName: currentUser?.companyName || currentUser?.username || "",
        action: "create",
        targetType: "cargo",
        targetId: listing.id,
        details: `荷物登録: ${listing.departureArea}→${listing.arrivalArea} ${listing.cargoType || ""}`,
        ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "",
      }).catch(() => {});

      res.status(201).json(listing);

      const sessionUserId = req.session.userId as string;
      const host = req.get("host") || "";
      setImmediate(async () => {
        try {
          const allUsers = await storage.getAllUsers();
          const appBaseUrl = process.env.APP_BASE_URL || `https://${host}`;
          const cargoVars = {
            departureArea: listing.departureArea || "",
            arrivalArea: listing.arrivalArea || "",
            cargoType: listing.cargoType || "",
            weight: listing.weight || "",
            companyName: currentUser?.companyName || "",
            appBaseUrl,
          };
          for (const u of allUsers) {
            if (u.id !== sessionUserId && u.approved) {
              await storage.createNotification({
                userId: u.id,
                type: "cargo_new",
                title: "新しい荷物が登録されました",
                message: `${listing.departureArea}→${listing.arrivalArea} ${listing.cargoType} ${listing.weight}`,
                relatedId: listing.id,
              });

              if (u.notifyEmail && u.email && isEmailConfigured() && !isAgentAutoEmail(u.email)) {
                try {
                  const resolved = await resolveEmailTemplate(
                    "cargo_new",
                    cargoVars,
                    "【トラマッチ】新しい荷物が登録されました",
                    `新しい荷物案件が登録されました。\n\n出発地: ${listing.departureArea}\n到着地: ${listing.arrivalArea}\n荷物種類: ${listing.cargoType}\n重量: ${listing.weight}\n\nトラマッチにログインして詳細をご確認ください。`
                  );
                  if (resolved) await sendEmail(u.email, resolved.subject, resolved.body);
                } catch (emailErr) {
                  console.error(`Cargo new email failed for ${u.email}:`, emailErr);
                }
              }
            }
          }
        } catch (bgErr) {
          console.error("Background cargo notification error:", bgErr);
        }
      });
    } catch (error) {
      console.error("Failed to create cargo listing:", error);
      res.status(500).json({ message: "荷物の登録に失敗しました" });
    }
  });

  app.patch("/api/cargo/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["active", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "無効なステータスです" });
      }
      const cargoId = req.params.id as string;
      const listing = await storage.getCargoListing(cargoId);
      if (!listing) {
        return res.status(404).json({ message: "荷物情報が見つかりません" });
      }
      if (status === "completed" && listing.userId === req.session.userId) {
        return res.status(403).json({ message: "自分の荷物を成約にすることはできません" });
      }
      if (status !== "completed" && listing.userId !== req.session.userId) {
        return res.status(403).json({ message: "この操作を行う権限がありません" });
      }
      if (status === "completed") {
        const currentUser = await storage.getUser(req.session.userId as string);
        if (currentUser && currentUser.plan !== "premium" && currentUser.plan !== "premium_full" && currentUser.role !== "admin") {
          return res.status(403).json({ message: "荷物の成約にはβ版プレミアムプランへの加入が必要です" });
        }
      }
      const acceptedByUserId = status === "completed" ? req.session.userId as string : undefined;
      const updated = await storage.updateCargoStatus(cargoId, status, acceptedByUserId);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "荷物ステータスの更新に失敗しました" });
    }
  });

  app.get("/api/contracted-cargo", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getContractedCargoByUserId(req.session.userId as string);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "受託荷物一覧の取得に失敗しました" });
    }
  });

  app.patch("/api/cargo/:id", requireAuth, async (req, res) => {
    try {
      const cargoId = req.params.id as string;
      const listing = await storage.getCargoListing(cargoId);
      if (!listing) {
        return res.status(404).json({ message: "荷物情報が見つかりません" });
      }
      if (listing.userId !== req.session.userId) {
        return res.status(403).json({ message: "この操作を行う権限がありません" });
      }
      const updated = await storage.updateCargoListing(cargoId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "荷物情報の更新に失敗しました" });
    }
  });

  app.delete("/api/cargo/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteCargoListing(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "荷物情報が見つかりません" });
      }
      const currentUser = await storage.getUser(req.session.userId as string);
      storage.createAuditLog({
        userId: req.session.userId as string,
        userName: currentUser?.companyName || currentUser?.username || "",
        action: "delete",
        targetType: "cargo",
        targetId: req.params.id,
        details: "荷物削除",
        ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "",
      }).catch(() => {});
      res.json({ message: "削除しました" });
    } catch (error) {
      res.status(500).json({ message: "荷物の削除に失敗しました" });
    }
  });

  app.get("/api/dispatch-requests/:cargoId", requireAuth, async (req, res) => {
    try {
      const request = await storage.getDispatchRequestByCargoId(req.params.cargoId as string);
      res.json(request || null);
    } catch (error) {
      res.status(500).json({ message: "配車依頼書の取得に失敗しました" });
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
      res.status(500).json({ message: "配車依頼書の作成に失敗しました" });
    }
  });

  app.patch("/api/dispatch-requests/:id", requireAuth, async (req, res) => {
    try {
      const { userId, id, cargoId, createdAt, sentAt, status, ...safeFields } = req.body;
      const updated = await storage.updateDispatchRequest(req.params.id as string, safeFields);
      if (!updated) {
        return res.status(404).json({ message: "配車依頼書が見つかりません" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "配車依頼書の更新に失敗しました" });
    }
  });

  app.patch("/api/dispatch-requests/:id/send", requireAuth, async (req, res) => {
    try {
      const dispatchRequest = await storage.getDispatchRequest(req.params.id as string);
      if (!dispatchRequest) {
        return res.status(404).json({ message: "配車依頼書が見つかりません" });
      }

      const updated = await storage.updateDispatchRequest(req.params.id as string, {
        status: "sent",
        sentAt: new Date(),
      } as any);
      if (!updated) {
        return res.status(404).json({ message: "配車依頼書が見つかりません" });
      }

      const cargo = await storage.getCargoListing(dispatchRequest.cargoId);
      const recipientEmail = cargo?.contactEmail;
      const isContracted = cargo?.listingType === "contracted";

      if (recipientEmail && isEmailConfigured()) {
        const senderUser = await storage.getUser(req.session.userId as string);
        const senderName = senderUser?.companyName || dispatchRequest.transportCompany || "トラマッチユーザー";

        const fmtRow = (label: string, value: string | null | undefined) => {
          if (!value) return "";
          return `<tr><td style="padding:6px 12px;background:#f8f9fa;font-weight:bold;white-space:nowrap;border:1px solid #dee2e6;width:140px">${label}</td><td style="padding:6px 12px;border:1px solid #dee2e6">${value}</td></tr>`;
        };

        const fareNum = dispatchRequest.fare ? parseInt(dispatchRequest.fare.replace(/[^0-9]/g, ""), 10) : 0;
        const taxAmount = Math.floor(fareNum * 0.1);
        const totalAmount = fareNum + taxAmount;

        let emailSubject: string;
        let emailHtml: string;

        if (isContracted) {
          const shipperResolved = await resolveEmailTemplate(
            "dispatch_request_shipper",
            { senderName },
            `【トラマッチ】{{senderName}}より車番連絡が届きました`,
            `{{senderName}} 様より車番連絡が届きました。`
          );
          emailSubject = shipperResolved?.subject || `【トラマッチ】${senderName}より車番連絡が届きました`;
          emailHtml = `
          <div style="font-family:'Hiragino Sans','Meiryo',sans-serif;max-width:700px;margin:0 auto;color:#333">
            <div style="background:#40E0D0;padding:16px 24px;border-radius:8px 8px 0 0">
              <h1 style="color:white;margin:0;font-size:20px">トラマッチ 車番連絡</h1>
            </div>
            <div style="padding:24px;border:1px solid #dee2e6;border-top:none;border-radius:0 0 8px 8px">
              <p style="margin:0 0 16px">${shipperResolved?.body || ""}</p>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">車両・ドライバー情報</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("運送会社", dispatchRequest.transportCompany)}
                ${fmtRow("実運送会社", dispatchRequest.actualTransportCompany)}
                ${fmtRow("車両番号", dispatchRequest.vehicleNumber)}
                ${fmtRow("ドライバー名", dispatchRequest.driverName)}
                ${fmtRow("ドライバー連絡先", dispatchRequest.driverPhone)}
                ${fmtRow("担当者", dispatchRequest.contactPerson)}
              </table>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">運行情報</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("積込日", dispatchRequest.loadingDate)}
                ${fmtRow("積込時間", dispatchRequest.loadingTime)}
                ${fmtRow("積込場所", dispatchRequest.loadingPlace)}
                ${fmtRow("卸し日", dispatchRequest.unloadingDate)}
                ${fmtRow("卸し時間", dispatchRequest.unloadingTime)}
                ${fmtRow("卸し場所", dispatchRequest.unloadingPlace)}
              </table>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">荷物情報</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("荷種", dispatchRequest.cargoType)}
                ${fmtRow("重量/車種", dispatchRequest.weightVehicle)}
                ${fmtRow("車両装備", dispatchRequest.vehicleEquipment)}
                ${fmtRow("備考", dispatchRequest.notes)}
              </table>

              ${dispatchRequest.transportCompanyNotes ? `<h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">注意事項</h2><p style="white-space:pre-wrap">${dispatchRequest.transportCompanyNotes}</p>` : ""}

              <div style="margin-top:24px;padding:12px;background:#f0fffe;border-radius:6px;font-size:12px;color:#666">
                <p style="margin:0">このメールはトラマッチ（tramatch-sinjapan.com）から自動送信されています。</p>
              </div>
            </div>
          </div>`;
        } else {
          const transportResolved = await resolveEmailTemplate(
            "dispatch_request_transport",
            { senderName },
            `【トラマッチ】{{senderName}}より配車依頼書が届きました`,
            `{{senderName}} 様より配車依頼書が届きました。`
          );
          emailSubject = transportResolved?.subject || `【トラマッチ】${senderName}より配車依頼書が届きました`;
          emailHtml = `
          <div style="font-family:'Hiragino Sans','Meiryo',sans-serif;max-width:700px;margin:0 auto;color:#333">
            <div style="background:#40E0D0;padding:16px 24px;border-radius:8px 8px 0 0">
              <h1 style="color:white;margin:0;font-size:20px">トラマッチ 配車依頼書</h1>
            </div>
            <div style="padding:24px;border:1px solid #dee2e6;border-top:none;border-radius:0 0 8px 8px">
              <p style="margin:0 0 16px">${transportResolved?.body || ""}</p>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">運行情報</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("運送会社", dispatchRequest.transportCompany)}
                ${fmtRow("荷主会社", dispatchRequest.shipperCompany)}
                ${fmtRow("担当者", dispatchRequest.contactPerson)}
              </table>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">積込・卸し</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("積込日", dispatchRequest.loadingDate)}
                ${fmtRow("積込時間", dispatchRequest.loadingTime)}
                ${fmtRow("積込場所", dispatchRequest.loadingPlace)}
                ${fmtRow("卸し日", dispatchRequest.unloadingDate)}
                ${fmtRow("卸し時間", dispatchRequest.unloadingTime)}
                ${fmtRow("卸し場所", dispatchRequest.unloadingPlace)}
              </table>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">荷物情報</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("荷種", dispatchRequest.cargoType)}
                ${fmtRow("総重量", dispatchRequest.totalWeight)}
                ${fmtRow("重量/車種", dispatchRequest.weightVehicle)}
                ${fmtRow("車両装備", dispatchRequest.vehicleEquipment)}
                ${fmtRow("備考", dispatchRequest.notes)}
              </table>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">運賃情報</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("運賃", fareNum > 0 ? `¥${fareNum.toLocaleString()}` : dispatchRequest.fare)}
                ${fmtRow("高速代", dispatchRequest.highwayFee)}
                ${fmtRow("待機料", dispatchRequest.waitingFee)}
                ${fmtRow("附帯作業料", dispatchRequest.additionalWorkFee)}
                ${fmtRow("燃料サーチャージ", dispatchRequest.fuelSurcharge)}
                ${fareNum > 0 ? fmtRow("消費税", `¥${taxAmount.toLocaleString()}`) : ""}
                ${fareNum > 0 ? fmtRow("合計（税込）", `¥${totalAmount.toLocaleString()}`) : ""}
                ${fmtRow("支払方法", dispatchRequest.paymentMethod)}
                ${fmtRow("入金予定日", dispatchRequest.paymentDueDate)}
              </table>

              <h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">車両・ドライバー</h2>
              <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
                ${fmtRow("車両番号", dispatchRequest.vehicleNumber)}
                ${fmtRow("ドライバー名", dispatchRequest.driverName)}
                ${fmtRow("ドライバー連絡先", dispatchRequest.driverPhone)}
              </table>

              ${dispatchRequest.transportCompanyNotes ? `<h2 style="font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px">運送会社備考</h2><p style="white-space:pre-wrap">${dispatchRequest.transportCompanyNotes}</p>` : ""}

              <div style="margin-top:24px;padding:12px;background:#f0fffe;border-radius:6px;font-size:12px;color:#666">
                <p style="margin:0">このメールはトラマッチ（tramatch-sinjapan.com）から自動送信されています。</p>
              </div>
            </div>
          </div>`;
        }

        const emailResult = await sendEmail(recipientEmail, emailSubject, emailHtml);

        if (!emailResult.success) {
          console.error("Dispatch request email failed:", emailResult.error);
        }
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "配車依頼書の送信に失敗しました" });
    }
  });

  app.get("/api/my-trucks", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getTruckListingsByUserId(req.session.userId as string);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "空車一覧の取得に失敗しました" });
    }
  });

  app.get("/api/trucks", async (_req, res) => {
    try {
      const listings = await storage.getTruckListings();
      res.json(listings);
    } catch (error) {
      console.error("Failed to fetch truck listings:", error);
      res.status(500).json({ message: "空車一覧の取得に失敗しました" });
    }
  });

  app.get("/api/trucks/:id", requireAuth, async (req, res) => {
    try {
      const listing = await storage.getTruckListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "空車情報が見つかりません" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "空車情報の取得に失敗しました" });
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

      storage.createAuditLog({
        userId: req.session.userId as string,
        userName: user?.companyName || user?.username || "",
        action: "create",
        targetType: "truck",
        targetId: listing.id,
        details: `空車登録: ${listing.currentArea}→${listing.destinationArea} ${listing.vehicleType || ""}`,
        ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "",
      }).catch(() => {});

      res.status(201).json(listing);

      const sessionUserId = req.session.userId as string;
      const host = req.get("host") || "";
      setImmediate(async () => {
        try {
          const allUsers = await storage.getAllUsers();
          const appBaseUrl = process.env.APP_BASE_URL || `https://${host}`;
          const truckVars = {
            currentArea: listing.currentArea || "",
            destinationArea: listing.destinationArea || "",
            vehicleType: listing.vehicleType || "",
            maxWeight: listing.maxWeight || "",
            companyName: user?.companyName || "",
            appBaseUrl,
          };
          for (const u of allUsers) {
            if (u.id !== sessionUserId && u.approved) {
              await storage.createNotification({
                userId: u.id,
                type: "truck_new",
                title: "新しい空車が登録されました",
                message: `${listing.currentArea}→${listing.destinationArea} ${listing.vehicleType} ${listing.maxWeight}`,
                relatedId: listing.id,
              });

              if (u.notifyEmail && u.email && isEmailConfigured() && !isAgentAutoEmail(u.email)) {
                try {
                  const resolved = await resolveEmailTemplate(
                    "truck_new",
                    truckVars,
                    "【トラマッチ】新しい空車が登録されました",
                    `新しい空車情報が登録されました。\n\n現在地: ${listing.currentArea}\n行先: ${listing.destinationArea}\n車両タイプ: ${listing.vehicleType}\n積載量: ${listing.maxWeight}\n\nトラマッチにログインして詳細をご確認ください。`
                  );
                  if (resolved) await sendEmail(u.email, resolved.subject, resolved.body);
                } catch (emailErr) {
                  console.error(`Truck new email failed for ${u.email}:`, emailErr);
                }
              }
            }
          }
        } catch (bgErr) {
          console.error("Background truck notification error:", bgErr);
        }
      });
    } catch (error) {
      res.status(500).json({ message: "空車の登録に失敗しました" });
    }
  });

  app.patch("/api/trucks/:id", requireAuth, async (req, res) => {
    try {
      const truckId = req.params.id as string;
      const listing = await storage.getTruckListing(truckId);
      if (!listing) {
        return res.status(404).json({ message: "空車情報が見つかりません" });
      }
      if (listing.userId !== req.session.userId) {
        return res.status(403).json({ message: "この操作を行う権限がありません" });
      }
      const allowedFields = ["title", "currentArea", "destinationArea", "vehicleType", "bodyType", "maxWeight", "availableDate", "price", "description", "status"];
      const safeBody: Record<string, any> = {};
      for (const key of allowedFields) {
        if (key in req.body) safeBody[key] = req.body[key];
      }
      const updated = await storage.updateTruckListing(truckId, safeBody);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "空車情報の更新に失敗しました" });
    }
  });

  app.delete("/api/trucks/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTruckListing(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "空車情報が見つかりません" });
      }
      const currentUser = await storage.getUser(req.session.userId as string);
      storage.createAuditLog({
        userId: req.session.userId as string,
        userName: currentUser?.companyName || currentUser?.username || "",
        action: "delete",
        targetType: "truck",
        targetId: req.params.id,
        details: "空車削除",
        ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "",
      }).catch(() => {});
      res.json({ message: "削除しました" });
    } catch (error) {
      res.status(500).json({ message: "空車の削除に失敗しました" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const [cargoCount, truckCount, allUsers] = await Promise.all([
        storage.getTotalCargoCount(),
        storage.getTotalTruckCount(),
        storage.getAllUsers(),
      ]);
      res.json({
        cargoCount,
        truckCount,
        userCount: allUsers.length,
      });
    } catch (error) {
      res.status(500).json({ message: "統計情報の取得に失敗しました" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const safeUsers = allUsers.map(({ password, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "ユーザー一覧の取得に失敗しました" });
    }
  });

  app.get("/api/admin/active-sessions", requireAdmin, async (_req, res) => {
    try {
      const result = await dbPool.query(
        "SELECT sess FROM session WHERE expire > NOW()"
      );
      const activeUserIds = new Set<string>();
      for (const row of result.rows) {
        const sess = typeof row.sess === "string" ? JSON.parse(row.sess) : row.sess;
        if (sess?.userId) {
          activeUserIds.add(sess.userId);
        }
      }
      res.json(Array.from(activeUserIds));
    } catch (error) {
      res.status(500).json({ message: "アクティブセッションの取得に失敗しました" });
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

      const appBaseUrl = `${req.protocol}://${req.get("host")}`;
      const resolved = await resolveEmailTemplate(
        "user_approved",
        {
          companyName: user.companyName || "",
          contactName: user.contactName || "",
          email: user.email || "",
          appBaseUrl,
        },
        "【トラマッチ】アカウントが承認されました",
        `${user.companyName} 様\n\nご登録ありがとうございます。\n\nアカウントが承認されましたので、以下のリンクからログインしてサービスをご利用いただけます。\n\n${appBaseUrl}/login\n\nトラマッチ運営事務局\n合同会社SIN JAPAN`
      );
      if (resolved && user.email) {
        await sendEmail(user.email, resolved.subject, resolved.body);
      }

      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "approve",
        targetType: "user",
        targetId: user.id,
        details: `ユーザー「${user.companyName}」を承認`,
        ipAddress: req.ip,
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
      if (!plan || !["free", "premium", "premium_full"].includes(plan)) {
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

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const targetUser = await storage.getUser(req.params.id as string);
      if (!targetUser) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      const updatedUser = await storage.updateUserProfile(req.params.id as string, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "更新に失敗しました" });
      }
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "edit",
        targetType: "user",
        targetId: req.params.id as string,
        details: `ユーザー「${targetUser.companyName}」の情報を編集`,
        ipAddress: req.ip,
      });
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "ユーザー情報の更新に失敗しました" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { companyName, contactName, email, phone, password, role } = req.body;
      if (!companyName || !email || !phone || !password) {
        return res.status(400).json({ message: "企業名、メール、電話番号、パスワードは必須です" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "このメールアドレスは既に登録されています" });
      }
      const existingUsername = await storage.getUserByUsername(email);
      if (existingUsername) {
        return res.status(400).json({ message: "このユーザー名は既に使用されています" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const isAdmin = role === "admin";
      const newUser = await storage.createUser({
        username: email,
        password: hashedPassword,
        companyName,
        contactName: contactName || "",
        email,
        phone,
        userType: "both",
        role: isAdmin ? "admin" : "user",
        approved: true,
        plan: "free",
      });
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "create",
        targetType: "user",
        targetId: newUser.id,
        details: `ユーザー「${companyName}」を管理者が追加${isAdmin ? "（管理者権限）" : ""}`,
        ipAddress: req.ip,
      });
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "ユーザーの追加に失敗しました" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["admin", "user"].includes(role)) {
        return res.status(400).json({ message: "無効な役割です" });
      }
      const targetUser = await storage.getUser(req.params.id as string);
      if (!targetUser) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      if (targetUser.id === req.session.userId) {
        return res.status(400).json({ message: "自分自身の役割は変更できません" });
      }
      await storage.updateUserProfile(req.params.id as string, { role });
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "update",
        targetType: "user",
        targetId: req.params.id as string,
        details: `ユーザー「${targetUser.companyName}」の役割を${role === "admin" ? "管理者" : "一般ユーザー"}に変更`,
        ipAddress: req.ip,
      });
      res.json({ message: "役割を変更しました" });
    } catch (error) {
      res.status(500).json({ message: "役割の変更に失敗しました" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id as string);
      const deleted = await storage.deleteUser(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
      }
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "delete",
        targetType: "user",
        targetId: req.params.id as string,
        details: `ユーザー「${user?.companyName}」を削除`,
        ipAddress: req.ip,
      });
      res.json({ message: "削除しました" });
    } catch (error) {
      res.status(500).json({ message: "ユーザーの削除に失敗しました" });
    }
  });

  app.patch("/api/admin/cargo/:id", requireAdmin, async (req, res) => {
    try {
      const listing = await storage.getCargoListing(req.params.id as string);
      if (!listing) {
        return res.status(404).json({ message: "荷物情報が見つかりません" });
      }
      const cargoAllowed = ["title", "departureArea", "departureAddress", "arrivalArea", "arrivalAddress", "desiredDate", "arrivalDate", "departureTime", "arrivalTime", "cargoType", "weight", "vehicleType", "bodyType", "temperatureControl", "price", "highwayFee", "transportType", "consolidation", "driverWork", "packageCount", "loadingMethod", "urgency", "description", "status"];
      const safeBody: Record<string, any> = {};
      for (const key of cargoAllowed) { if (key in req.body) safeBody[key] = req.body[key]; }
      const updated = await storage.updateCargoListing(req.params.id as string, safeBody);
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "edit",
        targetType: "cargo",
        targetId: req.params.id as string,
        details: `荷物「${listing.title}」を管理者が編集`,
        ipAddress: req.ip,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "荷物情報の更新に失敗しました" });
    }
  });

  app.delete("/api/admin/cargo/:id", requireAdmin, async (req, res) => {
    try {
      const listing = await storage.getCargoListing(req.params.id as string);
      if (!listing) {
        return res.status(404).json({ message: "荷物情報が見つかりません" });
      }
      await storage.deleteCargoListing(req.params.id as string);
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "delete",
        targetType: "cargo",
        targetId: req.params.id as string,
        details: `荷物「${listing.title}」を管理者が削除`,
        ipAddress: req.ip,
      });
      res.json({ message: "削除しました" });
    } catch (error) {
      res.status(500).json({ message: "荷物の削除に失敗しました" });
    }
  });

  app.patch("/api/admin/trucks/:id", requireAdmin, async (req, res) => {
    try {
      const listing = await storage.getTruckListing(req.params.id as string);
      if (!listing) {
        return res.status(404).json({ message: "空車情報が見つかりません" });
      }
      const truckAllowed = ["title", "currentArea", "destinationArea", "vehicleType", "truckCount", "bodyType", "maxWeight", "availableDate", "price", "description", "status"];
      const safeBody: Record<string, any> = {};
      for (const key of truckAllowed) { if (key in req.body) safeBody[key] = req.body[key]; }
      const updated = await storage.updateTruckListing(req.params.id as string, safeBody);
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "edit",
        targetType: "truck",
        targetId: req.params.id as string,
        details: `車両「${listing.title}」を管理者が編集`,
        ipAddress: req.ip,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "空車情報の更新に失敗しました" });
    }
  });

  app.delete("/api/admin/trucks/:id", requireAdmin, async (req, res) => {
    try {
      const listing = await storage.getTruckListing(req.params.id as string);
      if (!listing) {
        return res.status(404).json({ message: "空車情報が見つかりません" });
      }
      await storage.deleteTruckListing(req.params.id as string);
      const admin = await storage.getUser(req.session.userId as string);
      await storage.createAuditLog({
        userId: req.session.userId as string,
        userName: admin?.companyName || "管理者",
        action: "delete",
        targetType: "truck",
        targetId: req.params.id as string,
        details: `車両「${listing.title}」を管理者が削除`,
        ipAddress: req.ip,
      });
      res.json({ message: "削除しました" });
    } catch (error) {
      res.status(500).json({ message: "空車の削除に失敗しました" });
    }
  });

  app.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      const action = req.query.action as string | undefined;
      const targetType = req.query.targetType as string | undefined;
      const userId = req.query.userId as string | undefined;
      const [logs, total] = await Promise.all([
        storage.getAuditLogs(limit, offset, { action, targetType, userId }),
        storage.getAuditLogCount({ action, targetType, userId }),
      ]);
      res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      res.status(500).json({ message: "操作ログの取得に失敗しました" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactInquirySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "入力内容に誤りがあります", errors: fromError(parsed.error).toString() });
      }
      const inquiry = await storage.createContactInquiry(parsed.data);
      res.status(201).json({ message: "お問い合わせを送信しました", inquiry });
    } catch (error) {
      res.status(500).json({ message: "送信に失敗しました" });
    }
  });

  app.get("/api/admin/contact-inquiries", requireAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "取得に失敗しました" });
    }
  });

  app.get("/api/admin/contact-inquiries/unread-count", requireAdmin, async (req, res) => {
    try {
      const count = await storage.getUnreadContactCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "取得に失敗しました" });
    }
  });

  app.patch("/api/admin/contact-inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const { status, adminNote } = req.body;
      if (!status || !["unread", "read", "replied", "closed"].includes(status)) {
        return res.status(400).json({ message: "無効なステータスです" });
      }
      const updated = await storage.updateContactInquiryStatus(req.params.id, status, adminNote);
      if (!updated) {
        return res.status(404).json({ message: "お問い合わせが見つかりません" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "更新に失敗しました" });
    }
  });

  app.delete("/api/admin/contact-inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteContactInquiry(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "お問い合わせが見つかりません" });
      }
      res.json({ message: "削除しました" });
    } catch (error) {
      res.status(500).json({ message: "削除に失敗しました" });
    }
  });

  app.post("/api/partners/invite", requireAuth, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "メールアドレスを入力してください" });
      }
      const user = await storage.getUser(req.session.userId as string);
      if (!user) {
        return res.status(401).json({ message: "ユーザーが見つかりません" });
      }

      const appBaseUrl = process.env.APP_BASE_URL || "https://tramatch-sinjapan.com";
      const resolved = await resolveEmailTemplate(
        "partner_invite",
        { companyName: user.companyName, registerUrl: `${appBaseUrl}/register`, appBaseUrl },
        "【トラマッチ】取引先招待のご案内",
        `{{companyName}}様よりトラマッチへの招待が届いています。\n\n{{companyName}}様があなたを取引先として招待しました。\n以下のリンクからトラマッチに登録して、取引を開始しましょう。\n\n{{registerUrl}}\n\nトラマッチ - 求荷求車マッチングプラットフォーム\n{{appBaseUrl}}`
      );
      if (!resolved) {
        return res.status(500).json({ message: "メールテンプレートが無効です" });
      }
      const emailResult = await sendEmail(email, resolved.subject, resolved.body);

      if (!emailResult.success) {
        return res.status(500).json({ message: "招待メールの送信に失敗しました: " + (emailResult.error || "") });
      }

      res.json({ message: "招待メールを送信しました" });
    } catch (error) {
      res.status(500).json({ message: "招待の送信に失敗しました" });
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
      const { ensureCompatibleFormat, speechToText } = await import("./replit_integrations/audio/client");
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
            content: `あなたは画像やドキュメントから運送・物流に関する情報を正確に読み取るアシスタントです。
画像内のテキストをすべて読み取り、タブ区切りのテキストデータとして忠実に再現してください。

重要なルール:
- 表やスプレッドシートの画像の場合、ヘッダー行を含めてすべての行をタブ区切りで出力してください
- 1行も漏らさず、すべてのデータを抽出してください
- 値はそのまま転記し、解釈や変換はしないでください
- 手書きや自然文の画像の場合は、読み取ったテキストをそのまま出力してください
- 余計な説明や前置きは不要です。データのみ返してください`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
              },
              {
                type: "text",
                text: "この画像内のすべてのテキストデータを読み取って、タブ区切り形式で出力してください。表の場合は全行を漏れなく抽出してください。",
              },
            ],
          },
        ],
        max_tokens: 8000,
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

      const trainingExamples = await storage.getAiTrainingExamples("cargo");
      let fewShotSection = "";
      if (trainingExamples.length > 0) {
        const examples = trainingExamples.slice(0, 15).map((ex, i) => {
          storage.incrementAiTrainingUseCount(ex.id);
          return `例${i + 1}:\n入力: ${ex.inputText}\n正解出力: ${ex.expectedOutput}${ex.note ? `\n補足: ${ex.note}` : ""}`;
        });
        fewShotSection = `\n\n===== 学習済みの変換例（これらのパターンを参考にしてください） =====\n${examples.join("\n\n")}\n===== 学習例ここまで =====\n`;
      }

      const cargoFieldSchema = `{
  "title": "タイトル（出発地→到着地 荷種 重量の形式）",
  "departureArea": "都道府県名のみ（例: 神奈川）",
  "departureAddress": "詳細住所（市区町村以下）",
  "arrivalArea": "都道府県名のみ（例: 大阪）",
  "arrivalAddress": "詳細住所（市区町村以下）",
  "desiredDate": "発日（YYYY/MM/DD形式）",
  "departureTime": "発時間（以下から選択: 指定なし, 午前中, 午後, 夕方以降, 終日可, 0:00〜24:00の1時間刻み）",
  "arrivalDate": "着日（YYYY/MM/DD形式）",
  "arrivalTime": "着時間（以下から選択: 指定なし, 午前中, 午後, 夕方以降, 終日可, 0:00〜24:00の1時間刻み）",

  "cargoType": "荷種（例: 食品、機械部品、建材）",
  "weight": "重量（例: 5t、500kg）",
  "vehicleType": "車種（以下から選択、複数可: 軽車両, 1t車, 1.5t車, 2t車, 3t車, 4t車, 5t車, 6t車, 7t車, 8t車, 10t車, 11t車, 13t車, 15t車, 増トン車, 大型車, トレーラー, フルトレーラー, その他）",
  "bodyType": "車体タイプ（以下から選択、複数可: 平ボディ, バン, 箱車, ウイング, 幌ウイング, 冷蔵車, 冷凍車, 冷凍冷蔵車, ダンプ, タンクローリー, 車載車, セルフローダー, セーフティローダー, ユニック, クレーン付き, パワーゲート付き, エアサス, コンテナ車, 海上コンテナ, 低床, 高床, ショート, ロング, ワイド, ワイドロング, その他）",
  "temperatureControl": "温度管理（以下から選択: 指定なし, 常温, 冷蔵（0〜10℃）, 冷凍（-18℃以下）, 定温）",
  "price": "運賃（税別、数字のみ、例: 50000。金額不明の場合は「要相談」）",
  "transportType": "輸送形態（以下から選択: スポット, 定期）",
  "consolidation": "積合（以下から選択: 不可, 可能）",
  "driverWork": "ドライバー作業（以下から選択: 手積み手降ろし, フォークリフト, クレーン, ゲート車, パレット, 作業なし, その他）",
  "packageCount": "個数（例: 20パレット、1台）",
  "loadingMethod": "荷姿（以下から選択: パレット, バラ積み, 段ボール, フレコン, その他）",
  "highwayFee": "高速代（以下から選択: 込み, 別途, 高速代なし）",
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

重要: 現在の日付は${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}です。日付が年を省略している場合は、必ず${new Date().getFullYear()}年として扱ってください。過去の年を設定しないでください。

入力に複数の案件（荷物）が含まれている場合は、それぞれ個別のオブジェクトとして配列で返してください。
1件だけの場合も配列で返してください。

各案件のフォーマット:
${cargoFieldSchema}

返却形式:
{ "items": [ {案件1}, {案件2}, ... ] }

データ解析の注意点（非常に重要）:
- 物流業界の略語・表記ゆれを正しく理解すること:
  - 「発」「積地」「積込」「積み」= departureArea/departureAddress（積む場所）
  - 「着」「卸地」「卸先」「降ろし」「おろし」「納品先」= arrivalArea/arrivalAddress（降ろす場所）
  - 「W」「ウイング」= bodyType: "ウイング"
  - 「PG」「パワゲ」= bodyType: "パワーゲート付き"
  - 「4t」「4トン」= vehicleType: "4t車"、「大型」= vehicleType: "大型車"
  - 「箱」= bodyType: "箱車"
  - 「高速込」= highwayFee: "込み"、「高速別」= highwayFee: "別途"
  - 「手積み」「手降ろし」「手積手降」= driverWork: "手積み手降ろし"
  - 「フォーク」= driverWork: "フォークリフト"
  - 「パレ」= loadingMethod: "パレット"、「バラ」= loadingMethod: "バラ積み"
- 住所から都道府県を推測すること（例: 「横浜市」→ "神奈川"、「熊谷」→ "埼玉"、「香取市」→ "千葉"）
- 日付の表記ゆれに対応（「3/5」「3月5日」「3.5」→ "YYYY/03/05"）
- 数字だけの日付は文脈で判断（「24積み25」→ 24日に積み、25日に降ろし）
- 時間の表記ゆれに対応（「朝8時」「8時」「AM8」→ "8:00"）
- FAXや掲示板からコピーした書式、カンマ区切りやタブ区切りのデータにも対応すること

短文・メモ形式の解析パターン:
- 「24積み25」→ desiredDate: 当月24日、arrivalDate: 当月25日
- 「熊谷積み」→ departureArea: "埼玉", departureAddress: "熊谷"
- 「香取市」→ 文脈で判断（積み地の後なら着地）
- 「4トン50」「4t50」→ vehicleType: "4t車", price: "50000"（2桁金額は万円単位）
- 「大型80」→ vehicleType: "大型車", price: "80000"
- 金額が2桁の場合は万円単位（50→50000）、5桁以上や「￥20000」のようにはっきり書かれている場合はそのまま
- 「中原区～所沢」「A～B」「A→B」→ departureAddress/arrivalAddressに分割
- 「8:00～9:00」→ departureTime: "8:00"（時間帯は開始時間を採用）
- 「12:00指定」→ arrivalTime: "12:00"
- 「朝当日」「当日」→ arrivalDate = desiredDate
- titleは自動生成: 「{departureArea}→{arrivalArea} {cargoType} {vehicleType}」

車種・車体の解析:
- 「2tL」「2tロング」→ vehicleType: "2t車", bodyType: "ロング"
- 「2tワイド」→ vehicleType: "2t車", bodyType: "ワイド"
- 「2tLかワイド」→ vehicleType: "2t車", bodyType: "ロング, ワイド"（複数選択）
- 「ショート」「ロング」「ワイド」「ワイドロング」はbodyTypeの選択肢として入れる
- 「W」は文脈で判断: 車体タイプなら「ウイング」、サイズなら「ワイド」
- 引越し・家具運搬: bodyTypeに「箱車」を含める、movingJob: "引っ越し案件"
- 「手伝いあり」→ descriptionに記載

情報が不明な場合はそのフィールドを空文字にしてください。入力テキストに明記されていない情報は絶対に勝手に推測して入れないこと。特にloadingMethod（荷姿）、driverWork（作業）、consolidation（積合）、temperatureControl（温度管理）等は明確な記載がある場合のみ設定。
vehicleTypeとbodyTypeは複数選択の場合カンマ区切りで返してください（例: "4t車, 10t車"）。
JSONのみを返してください。説明文は不要です。${fewShotSection}`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: text.length > 1000 ? 10000 : 4000,
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

      const chatTrainingExamples = await storage.getAiTrainingExamples("cargo");
      let chatFewShotSection = "";
      if (chatTrainingExamples.length > 0) {
        const examples = chatTrainingExamples.slice(0, 10).map((ex, i) => {
          storage.incrementAiTrainingUseCount(ex.id);
          return `例${i + 1}:\n入力: ${ex.inputText}\n正解出力: ${ex.expectedOutput}${ex.note ? `\n補足: ${ex.note}` : ""}`;
        });
        chatFewShotSection = `\n\n===== 学習済みの変換例（これらのパターンを参考に精度を上げてください） =====\n${examples.join("\n\n")}\n===== 学習例ここまで =====\n`;
      }

      const cargoFieldSchema = `{
  "title": "タイトル（出発地→到着地 荷種 重量の形式）",
  "departureArea": "都道府県名のみ（例: 神奈川）",
  "departureAddress": "詳細住所（市区町村以下）",
  "arrivalArea": "都道府県名のみ（例: 大阪）",
  "arrivalAddress": "詳細住所（市区町村以下）",
  "desiredDate": "発日（YYYY/MM/DD形式）",
  "departureTime": "発時間（以下から選択: 指定なし, 午前中, 午後, 夕方以降, 終日可, 0:00〜24:00の1時間刻み）",
  "arrivalDate": "着日（YYYY/MM/DD形式）",
  "arrivalTime": "着時間（以下から選択: 指定なし, 午前中, 午後, 夕方以降, 終日可, 0:00〜24:00の1時間刻み）",

  "cargoType": "荷種（例: 食品、機械部品、建材）",
  "weight": "重量（例: 5t、500kg）",
  "vehicleType": "車種（以下から選択、複数可: 軽車両, 1t車, 1.5t車, 2t車, 3t車, 4t車, 5t車, 6t車, 7t車, 8t車, 10t車, 11t車, 13t車, 15t車, 増トン車, 大型車, トレーラー, フルトレーラー, その他）",
  "bodyType": "車体タイプ（以下から選択、複数可: 平ボディ, バン, 箱車, ウイング, 幌ウイング, 冷蔵車, 冷凍車, 冷凍冷蔵車, ダンプ, タンクローリー, 車載車, セルフローダー, セーフティローダー, ユニック, クレーン付き, パワーゲート付き, エアサス, コンテナ車, 海上コンテナ, 低床, 高床, ショート, ロング, ワイド, ワイドロング, その他）",
  "temperatureControl": "温度管理（以下から選択: 指定なし, 常温, 冷蔵（0〜10℃）, 冷凍（-18℃以下）, 定温）",
  "price": "運賃（税別、数字のみ、例: 50000。金額不明の場合は「要相談」）",
  "transportType": "輸送形態（以下から選択: スポット, 定期）",
  "consolidation": "積合（以下から選択: 不可, 可能）",
  "driverWork": "ドライバー作業（以下から選択: 手積み手降ろし, フォークリフト, クレーン, ゲート車, パレット, 作業なし, その他）",
  "packageCount": "個数（例: 20パレット、1台）",
  "loadingMethod": "荷姿（以下から選択: パレット, バラ積み, 段ボール, フレコン, その他）",
  "highwayFee": "高速代（以下から選択: 込み, 別途, 高速代なし）",
  "equipment": "必要装備（例: りん木、コンパネ、発泡、ラップ、ラッシング等）",
  "vehicleSpec": "車両指定（特定の車両指定がある場合）",
  "urgency": "緊急度（以下から選択: 通常, 至急）",
  "movingJob": "引っ越し案件の場合は「引っ越し案件」と設定",
  "contactPerson": "担当者名",
  "paymentDate": "入金予定日（YYYY/MM/DD形式または「月末締め翌月末払い」等のテキスト）",
  "description": "備考"
}`;

      const systemPrompt = `あなたは「トラマッチ」の荷物登録AIアシスタントです。日本の運送・物流に精通しています。

重要: 現在の日付は${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}です。日付が年を省略している場合は、必ず${new Date().getFullYear()}年として扱ってください。過去の年を設定しないでください。

あなたの役割:
1. ユーザーが入力した雑多なテキスト・データから荷物情報を正確に抽出・整理する
2. 不足している情報があれば会話で確認する
3. 運賃について相談されたら、ルート・荷種・重量・距離から相場を提案する
4. 複数案件が含まれる場合はそれぞれ分けて処理する

データ解析の注意点（非常に重要）:
- 物流業界でよく使われる略語や表記を正しく理解すること:
  - 「発」「積地」「積込」「積み」= departureArea/departureAddress（積む場所）
  - 「着」「卸地」「卸先」「降ろし」「おろし」「納品先」= arrivalArea/arrivalAddress（降ろす場所）
  - 「W」「ウイング」= bodyType: "ウイング"
  - 「冷凍」「レイトウ」= temperatureControl: "冷凍（-18℃以下）"
  - 「冷蔵」= temperatureControl: "冷蔵（0〜10℃）"
  - 「PG」「パワゲ」= bodyType: "パワーゲート付き"
  - 「ユニック」「クレーン」= bodyType にそれぞれ対応
  - 「4t」「4トン」= vehicleType: "4t車"
  - 「大型」= vehicleType: "大型車"
  - 「増トン」「増t」= vehicleType: "増トン車"
  - 「箱」= bodyType: "箱車"
  - 「高速込」「高速込み」= highwayFee: "込み"
  - 「高速別」「高速別途」= highwayFee: "別途"
  - 「手積み」「手降ろし」「手積手降」= driverWork: "手積み手降ろし"
  - 「フォーク」= driverWork: "フォークリフト"
  - 「パレ」= loadingMethod: "パレット"  
  - 「バラ」= loadingMethod: "バラ積み"
  - 「至急」「急ぎ」= urgency: "至急"
  - 「引越」「引っ越し」= movingJob: "引っ越し案件"
- 住所から都道府県を推測すること（例: 「横浜市」→ departureArea: "神奈川"、「熊谷」→ departureArea: "埼玉"、「香取市」→ arrivalArea: "千葉"）
- 日付の表記ゆれに対応（「3/5」「3月5日」「3.5」→ desiredDate: "YYYY/03/05"）
- 数字だけの日付は文脈で判断（「24積み25」→ 24日に積み、25日に降ろし）
- 時間の表記ゆれに対応（「朝8時」「8時」「AM8」→ departureTime: "8:00"）
- 複数行のデータや表形式のデータも正確にパースすること
- FAXや掲示板からコピーした書式、カンマ区切りやタブ区切りのデータにも対応すること
- テキスト全体を必ず読み込み、見落としがないようにすること

短文・メモ形式の解析パターン（非常に重要）:
運送業界では以下のような超短文メモやLINE/チャットの短い文章で案件が流れてきます。正しく解析してください:
- 「24積み25」→ desiredDate: 当月24日、arrivalDate: 当月25日（数字+積み+数字 = 積み日と降ろし日）
- 「熊谷積み」→ departureArea: "埼玉", departureAddress: "熊谷"（地名+積み = 発地）
- 「香取市」→ 前後の文脈で発地か着地か判断（積み地の後なら着地）→ arrivalArea: "千葉", arrivalAddress: "香取市"
- 「4トン50」「4t50」→ vehicleType: "4t車", price: "50000"（車種+金額。50=50000円、35=35000円のように万円単位で省略されることが多い）
- 「大型80」→ vehicleType: "大型車", price: "80000"
- 「10t W」→ vehicleType: "10t車", bodyType: "ウイング"
- 金額が2桁の場合は万円単位（50→50000、35→35000、80→80000）、5桁以上や「￥20000」のようにはっきり書かれている場合はそのまま
- 「中原区～所沢」「A～B」「A→B」→ departureAddress: "中原区", arrivalAddress: "所沢"
- 「8:00～9:00」「8時～9時」→ departureTime: "8:00"（時間帯の場合は開始時間を採用）
- 「12:00指定」→ arrivalTime: "12:00"
- 「朝当日」「朝イチ」→ departureTime: "午前中"、着日 = 発日と同日
- 「当日」→ arrivalDate = desiredDate（同日着）
- titleは自動生成すること: 「{departureArea}→{arrivalArea} {cargoType} {vehicleType}」の形式で作成。荷種不明の場合は「{departureArea}→{arrivalArea} {vehicleType}」

車種・車体の解析（非常に重要）:
- 「2tL」「2tロング」「2トンロング」→ vehicleType: "2t車", bodyType: "ロング"
- 「2tワイド」「2トンワイド」→ vehicleType: "2t車", bodyType: "ワイド"  
- 「2tLかワイド」「2tロングかワイド」→ vehicleType: "2t車", bodyType: "ロング, ワイド"（複数選択）
- 「ショート」「ロング」「ワイド」「ワイドロング」はbodyTypeの選択肢として入れる
- 「W」は文脈で判断: 車体タイプとして使われていれば「ウイング」、サイズ指定なら「ワイド」
- 引越し案件・家具運搬の場合: bodyType に「箱車」を含める（ウイングではない）、movingJob: "引っ越し案件"
- 「手伝いあり」「荷主手伝い」→ description に記載（ドライバー以外の手伝いがある意味）

運賃相場の目安（一般的な参考値）:
- 近距離（同一県内〜隣県）: 2t車 15,000〜25,000円、4t車 20,000〜35,000円、10t車 35,000〜55,000円
- 中距離（200〜400km）: 2t車 25,000〜40,000円、4t車 35,000〜60,000円、10t車 55,000〜80,000円
- 長距離（400km以上）: 2t車 40,000〜60,000円、4t車 60,000〜90,000円、10t車 80,000〜130,000円
- 冷凍・冷蔵は上記の1.2〜1.5倍
- 高速代込みの場合は上記に高速代を加算
これはあくまで目安で、荷物内容・時期・緊急度などで変動します。

応答のJSON形式（必ずこの形式で返してください）:
{
  "message": "ユーザーへの返答テキスト（自然な日本語の会話文のみ。絶対にJSONデータ、フィールド名、配列、オブジェクトを含めないこと）",
  "extractedFields": ${cargoFieldSchema} のうち抽出できたフィールドのみのオブジェクト（抽出できなかったフィールドは含めない）,
  "items": [複数案件の場合は各案件のフィールドオブジェクトの配列、1件または追加抽出なしの場合は空配列],
  "priceSuggestion": { "min": 最低額数字, "max": 最高額数字, "reason": "根拠の説明" } または null,
  "status": "extracting" | "confirming" | "ready" | "chatting"
}

【最重要ルール】messageフィールドには絶対にJSONデータを入れないこと:
- messageには「"items":」「"departureArea":」「"vehicleType":」等のJSON構文を絶対に含めない
- 荷物データはすべてitemsフィールドとextractedFieldsフィールドに入れること。messageにはデータの中身を書かない
- ユーザーが「○件ある」「もっとある」等と言った場合も、messageは自然な会話で返し、データはitemsに入れる
- 良いmessage例: 「28件の荷物を確認しました。すべてフォームに順番に反映していきます。」
- 悪いmessage例: 「以下の荷物を検出しました: {"title":"埼玉→東京"...」← これは絶対NG

statusの意味:
- "extracting": 情報を抽出中、まだ不足あり
- "confirming": 主要情報は揃った、ユーザーに確認中
- "ready": 登録準備完了
- "chatting": 雑談や質問への回答中

現在抽出済みのフィールド: ${extractedFields ? JSON.stringify(extractedFields) : "なし"}

重要:
- 返答は必ず有効なJSONで返してください
- messageは必ず日本語で、丁寧だが堅すぎない口調で
- messageにはJSON構造、フィールド名、配列、オブジェクト、技術的なデータ構造を絶対に含めないこと。messageはユーザーへの自然な会話文のみにすること。
- messageにextractedFieldsやitemsの中身をテキストとして書かないこと。データはextractedFieldsとitemsフィールドに入れればフォームに自動反映される。
- 複数荷物を検出した場合のmessageの例: 「○件の荷物情報を読み取りました。1件目をフォームに反映しています。内容を確認して掲載してください。」
- 単一荷物の場合のmessageの例: 「荷物情報を読み取りました。右側のフォームに反映しています。内容を確認して掲載してください。」
- 運賃の相談には積極的に応じて、具体的な金額を提案してください
- 大量のデータが来た場合は、整理して要約してから確認してください。ただし要約はmessageに自然な日本語で書き、生データやJSONは含めないこと。
- 入力データからできるだけ多くの情報を漏れなく抽出してください
- ユーザーの入力テキストに明記されていない情報は絶対に勝手に推測して入れないこと。特にloadingMethod（荷姿）、driverWork（作業）、consolidation（積合）、temperatureControl（温度管理）等は、テキストに明確に記載がある場合のみ設定すること。記載がなければ空文字にすること${chatFewShotSection}`;

      const lastUserMsg = messages[messages.length - 1];
      const lastUserText = lastUserMsg?.content || "";
      const lineCount = lastUserText.split(/\n/).filter((l: string) => l.trim()).length;
      const isBulkData = lastUserText.length > 300 && lineCount >= 3;

      if (isBulkData) {
        console.log(`[cargo-chat] Bulk data detected (${lastUserText.length} chars, ${lineCount} lines). Using parse-first approach.`);
        const parseResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `あなたは日本の運送・物流の専門家です。ユーザーが自然言語で入力した荷物情報を構造化データに変換してください。結果はJSON形式で返してください。

重要: 現在の日付は${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}です。日付が年を省略している場合は、必ず${new Date().getFullYear()}年として扱ってください。

入力に複数の案件（荷物）が含まれている場合は、それぞれ個別のオブジェクトとして配列で返してください。
1件だけの場合も配列で返してください。すべての荷物を漏れなく抽出してください。

各案件のフォーマット:
${cargoFieldSchema}

返却形式（JSON）:
{ "items": [ {案件1}, {案件2}, ... ] }

データ解析の注意点:
- 「W」「ウイング」= bodyType: "ウイング"
- 「PG」「パワゲ」= bodyType: "パワーゲート付き"
- 「4t」「4トン」= vehicleType: "4t車"、「大型」= vehicleType: "大型車"
- 「箱」= bodyType: "箱車"
- 「高速込」= highwayFee: "込み"、「高速別」= highwayFee: "別途"
- 住所から都道府県を推測（「横浜市」→"神奈川"、「熊谷」→"埼玉"、「江東区」→"東京"）
- 日付の表記ゆれ（「3/5」→"${new Date().getFullYear()}/03/05"）
- 時間の表記ゆれ（「8時」→"8:00"）
- 金額が2桁の場合は万円単位（50→50000）
- 「当日」→ arrivalDate = desiredDate
- 「貸切」→ consolidation: "不可"
- titleは自動生成: 「{departureArea}→{arrivalArea} {cargoType} {vehicleType}」
- 引越し案件: bodyType="箱車", movingJob="引っ越し案件"
- 情報がないフィールドは空文字にすること${chatFewShotSection}`,
            },
            { role: "user", content: lastUserText },
          ],
          max_tokens: 16000,
          response_format: { type: "json_object" },
        });

        const parseContent = parseResponse.choices[0]?.message?.content || "{}";
        let parsedItems: Record<string, unknown>[] = [];
        try {
          const parsed = JSON.parse(parseContent);
          parsedItems = parsed.items && Array.isArray(parsed.items) ? parsed.items : [parsed];
        } catch {
          try {
            const itemsMatch = parseContent.match(/"items"\s*:\s*(\[[\s\S]*)/);
            if (itemsMatch) {
              let itemsStr = itemsMatch[1];
              let depth = 0;
              let endIdx = 0;
              for (let i = 0; i < itemsStr.length; i++) {
                if (itemsStr[i] === '[') depth++;
                if (itemsStr[i] === ']') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
              }
              if (endIdx > 0) {
                itemsStr = itemsStr.substring(0, endIdx).replace(/,\s*([}\]])/g, "$1");
                try { parsedItems = JSON.parse(itemsStr); } catch {}
              }
            }
          } catch {}
        }

        const itemCount = parsedItems.length;
        const firstItem = itemCount > 0 ? parsedItems[0] : {};
        const msg = itemCount > 1
          ? `${itemCount}件の荷物情報を読み取りました。1件目をフォームに反映しています。内容を確認して掲載してください。`
          : itemCount === 1
            ? "荷物情報を読み取りました。フォームに反映しています。内容を確認して掲載してください。"
            : "入力内容から荷物情報を読み取れませんでした。もう少し詳しく入力してください。";

        console.log(`[cargo-chat] Parse-first extracted ${itemCount} items`);

        return res.json({
          message: msg,
          extractedFields: itemCount === 1 ? firstItem : {},
          items: parsedItems,
          priceSuggestion: null,
          status: itemCount > 0 ? "confirming" : "extracting",
        });
      }

      const apiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const inputLength = messages.reduce((sum: number, m: { content: string }) => sum + (m.content?.length || 0), 0);
      const maxTokens = inputLength > 2000 ? 10000 : inputLength > 500 ? 4000 : 2000;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: apiMessages,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        const parsedItems = parsed.items || [];
        const parsedFields = parsed.extractedFields || {};
        if (parsedItems.length === 0 && Object.keys(parsedFields).length === 0 && lastUserText.length > 100) {
          console.log("[cargo-chat] AI returned empty items/fields for substantial input, retrying with parse...");
          const retryResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `あなたは日本の運送・物流の専門家です。ユーザーが入力した荷物情報を構造化データに変換してください。
入力に複数の案件が含まれている場合は配列で返してください。
重要: 現在の日付は${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}です。
各案件のフォーマット: ${cargoFieldSchema}
返却形式: { "items": [ {案件1}, {案件2}, ... ] }
住所から都道府県を推測、日付の表記ゆれに対応、金額2桁は万円単位。
titleは自動生成: 「{departureArea}→{arrivalArea} {cargoType} {vehicleType}」
JSONのみを返してください。${chatFewShotSection}`,
              },
              { role: "user", content: lastUserText },
            ],
            max_tokens: 16000,
            response_format: { type: "json_object" },
          });
          const retryContent = retryResponse.choices[0]?.message?.content || "{}";
          try {
            const retryParsed = JSON.parse(retryContent);
            const retryItems = retryParsed.items && Array.isArray(retryParsed.items) ? retryParsed.items : [retryParsed];
            const retryCount = retryItems.length;
            console.log(`[cargo-chat] Retry extracted ${retryCount} items`);
            return res.json({
              message: retryCount > 1
                ? `${retryCount}件の荷物情報を読み取りました。1件目をフォームに反映しています。内容を確認して掲載してください。`
                : "荷物情報を読み取りました。フォームに反映しています。",
              extractedFields: retryCount === 1 ? retryItems[0] : {},
              items: retryItems,
              priceSuggestion: null,
              status: "confirming",
            });
          } catch {}
        }
        res.json({
          message: parsed.message || "荷物情報を読み取りました。フォームに反映しています。",
          extractedFields: parsedFields,
          items: parsedItems,
          priceSuggestion: parsed.priceSuggestion || null,
          status: parsed.status || "chatting",
        });
      } catch {
        let fallbackMsg = "荷物情報を処理中です。フォームに反映しています。";
        let fallbackItems: Record<string, unknown>[] = [];
        try {
          const msgMatch = content.match(/"message"\s*:\s*"([^"]+)"/);
          if (msgMatch) fallbackMsg = msgMatch[1];
          const itemsMatch = content.match(/"items"\s*:\s*(\[[\s\S]*)/);
          if (itemsMatch) {
            let itemsStr = itemsMatch[1];
            let depth = 0;
            let endIdx = 0;
            for (let i = 0; i < itemsStr.length; i++) {
              if (itemsStr[i] === '[') depth++;
              if (itemsStr[i] === ']') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
            }
            if (endIdx > 0) {
              itemsStr = itemsStr.substring(0, endIdx).replace(/,\s*([}\]])/g, "$1");
              try { fallbackItems = JSON.parse(itemsStr); } catch {}
            }
          }
        } catch {}
        res.json({
          message: fallbackMsg,
          extractedFields: {},
          items: fallbackItems,
          priceSuggestion: null,
          status: fallbackItems.length > 0 ? "extracting" : "chatting",
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

      const truckTrainingExamples = await storage.getAiTrainingExamples("truck");
      let truckFewShotSection = "";
      if (truckTrainingExamples.length > 0) {
        const examples = truckTrainingExamples.slice(0, 10).map((ex, i) => {
          storage.incrementAiTrainingUseCount(ex.id);
          return `例${i + 1}:\n入力: ${ex.inputText}\n正解出力: ${ex.expectedOutput}${ex.note ? `\n補足: ${ex.note}` : ""}`;
        });
        truckFewShotSection = `\n\n===== 学習済みの変換例 =====\n${examples.join("\n\n")}\n===== 学習例ここまで =====\n`;
      }

      const truckFieldSchema = `{
  "title": "タイトル（車種 空車地→行先地の形式、例: 10t車 東京→大阪 空車あり）",
  "currentArea": "空車地の都道府県名のみ（例: 東京）",
  "destinationArea": "行先地の都道府県名のみ（例: 大阪）",
  "vehicleType": "車種（以下から選択: 軽車両, 1t車, 1.5t車, 2t車, 3t車, 4t車, 5t車, 6t車, 7t車, 8t車, 10t車, 11t車, 13t車, 15t車, 増トン車, 大型車, トレーラー, フルトレーラー, その他）",
  "bodyType": "車体タイプ（以下から選択: 平ボディ, バン, ウイング, 幌ウイング, 冷蔵車, 冷凍車, 冷凍冷蔵車, ダンプ, タンクローリー, 車載車, セルフローダー, セーフティローダー, ユニック, クレーン付き, パワーゲート付き, エアサス, コンテナ車, 海上コンテナ, 低床, 高床, その他）",
  "truckCount": "台数（例: 1, 2, 3。数字のみ）",
  "maxWeight": "最大積載量（例: 10t, 2t, 500kg）",
  "availableDate": "空車日（YYYY/MM/DD形式）",
  "price": "最低運賃（税別、数字のみ、例: 50000。金額不明の場合は空文字）",
  "description": "備考",
  "companyName": "会社名",
  "contactPhone": "電話番号",
  "contactEmail": "メールアドレス"
}`;

      const systemPrompt = `あなたは「トラマッチ」の空車登録AIアシスタントです。日本の運送・物流に精通しています。

重要: 現在の日付は${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}です。日付が年を省略している場合は、必ず${new Date().getFullYear()}年として扱ってください。過去の年を設定しないでください。

あなたの役割:
1. ユーザーが入力した雑多なテキスト・データから空車情報を正確に抽出・整理する
2. 不足している情報があれば会話で確認する
3. 運賃について相談されたら、ルート・車種・距離から相場を提案する
4. 複数案件が含まれる場合はそれぞれ分けて処理する

データ解析の注意点（非常に重要）:
- 物流業界でよく使われる略語や表記を正しく理解すること:
  - 「W」「ウイング」= bodyType: "ウイング"
  - 「冷凍」「レイトウ」= bodyType: "冷凍車"
  - 「冷蔵」= bodyType: "冷蔵車"
  - 「PG」「パワゲ」= bodyType: "パワーゲート付き"
  - 「ユニック」「クレーン」= bodyType にそれぞれ対応
  - 「4t」「4トン」= vehicleType: "4t車"
  - 「大型」= vehicleType: "大型車"
  - 「増トン」「増t」= vehicleType: "増トン車"
  - 「箱」= bodyType: "バン"
  - 「平」「平ボデー」= bodyType: "平ボディ"
- 住所から都道府県を推測すること（例: 「横浜市」→ currentArea: "神奈川"、「熊谷」→ currentArea: "埼玉"、「市川市」→ currentArea: "千葉"）
- 日付の表記ゆれに対応（「3/5」「3月5日」「3.5」→ availableDate: "YYYY/03/05"）
- 複数行のデータや表形式のデータも正確にパースすること
- FAXや掲示板からコピーした書式、カンマ区切りやタブ区切りのデータにも対応すること
- テキスト全体を必ず読み込み、見落としがないようにすること

短文・メモ形式の解析パターン（非常に重要）:
運送業界では以下のような超短文メモやLINE/チャットの短い文章で案件が流れてきます。正しく解析してください:
- 「東京 空車あり 3/7」→ currentArea: "東京", availableDate: "YYYY/03/07"
- 「神奈川→大阪 10tW」→ currentArea: "神奈川", destinationArea: "大阪", vehicleType: "10t車", bodyType: "ウイング"
- 「4t平 埼玉空き 3月5日」→ vehicleType: "4t車", bodyType: "平ボディ", currentArea: "埼玉", availableDate: "YYYY/03/05"
- 「大型冷凍 千葉→東北方面」→ vehicleType: "大型車", bodyType: "冷凍車", currentArea: "千葉", destinationArea: "東北方面"
- 金額が2桁の場合は万円単位（50→50000、35→35000、80→80000）、5桁以上や「￥20000」のようにはっきり書かれている場合はそのまま
- 「A→B」「A～B」= currentArea→destinationArea
- titleは自動生成すること: 「{vehicleType} {currentArea}→{destinationArea} 空車あり」の形式で作成

車種・車体の解析（非常に重要）:
- 「2tL」「2tロング」「2トンロング」→ vehicleType: "2t車", bodyType: "ロング" ではなく description に「ロング」と記載
- 「2tワイド」「2トンワイド」→ vehicleType: "2t車", description に「ワイド」と記載
- 「W」は文脈で判断: 車体タイプとして使われていれば「ウイング」
- bodyTypeの選択肢に合致するもののみbodyTypeに設定、それ以外はdescriptionに記載

運賃相場の目安（一般的な参考値）:
- 近距離（同一県内〜隣県）: 2t車 15,000〜25,000円、4t車 20,000〜35,000円、10t車 35,000〜55,000円
- 中距離（200〜400km）: 2t車 25,000〜40,000円、4t車 35,000〜60,000円、10t車 55,000〜80,000円
- 長距離（400km以上）: 2t車 40,000〜60,000円、4t車 60,000〜90,000円、10t車 80,000〜130,000円
これはあくまで目安で、車種・時期・路線などで変動します。

応答のJSON形式（必ずこの形式で返してください）:
{
  "message": "ユーザーへの返答テキスト（自然な日本語の会話文のみ。絶対にJSONデータ、フィールド名、配列、オブジェクトを含めないこと）",
  "extractedFields": ${truckFieldSchema} のうち抽出できたフィールドのみのオブジェクト（抽出できなかったフィールドは含めない）,
  "items": [複数案件の場合は各案件のフィールドオブジェクトの配列、1件または追加抽出なしの場合は空配列],
  "priceSuggestion": { "min": 最低額数字, "max": 最高額数字, "reason": "根拠の説明" } または null,
  "status": "extracting" | "confirming" | "ready" | "chatting"
}

【最重要ルール】messageフィールドには絶対にJSONデータを入れないこと:
- messageには「"items":」「"currentArea":」「"vehicleType":」等のJSON構文を絶対に含めない
- 空車データはすべてitemsフィールドとextractedFieldsフィールドに入れること。messageにはデータの中身を書かない
- ユーザーが「○件ある」「もっとある」等と言った場合も、messageは自然な会話で返し、データはitemsに入れる
- 良いmessage例: 「3台分の空車情報を確認しました。1台目をフォームに反映しています。」
- 悪いmessage例: 「以下の空車を検出しました: {"title":"10t車 東京→大阪"...」← これは絶対NG

statusの意味:
- "extracting": 情報を抽出中、まだ不足あり
- "confirming": 主要情報は揃った、ユーザーに確認中
- "ready": 登録準備完了
- "chatting": 雑談や質問への回答中

現在抽出済みのフィールド: ${extractedFields ? JSON.stringify(extractedFields) : "なし"}

重要:
- 返答は必ず有効なJSONで返してください
- messageは必ず日本語で、丁寧だが堅すぎない口調で
- messageにはJSON構造、フィールド名、配列、オブジェクト、技術的なデータ構造を絶対に含めないこと。messageはユーザーへの自然な会話文のみにすること。
- messageにextractedFieldsやitemsの中身をテキストとして書かないこと。データはextractedFieldsとitemsフィールドに入れればフォームに自動反映される。
- 複数空車を検出した場合のmessageの例: 「○台分の空車情報を読み取りました。1台目をフォームに反映しています。内容を確認して掲載してください。」
- 単一空車の場合のmessageの例: 「空車情報を読み取りました。右側のフォームに反映しています。内容を確認して掲載してください。」
- 運賃の相談には積極的に応じて、具体的な金額を提案してください
- 大量のデータが来た場合は、整理して要約してから確認してください。ただし要約はmessageに自然な日本語で書き、生データやJSONは含めないこと。
- 入力データからできるだけ多くの情報を漏れなく抽出してください
- ユーザーの入力テキストに明記されていない情報は絶対に勝手に推測して入れないこと。テキストに明確に記載がある場合のみ設定すること。記載がなければ空文字にすること${truckFewShotSection}`;

      const lastTruckUserMsg = messages[messages.length - 1];
      const lastTruckUserText = lastTruckUserMsg?.content || "";
      const truckLineCount = lastTruckUserText.split(/\n/).filter((l: string) => l.trim()).length;
      const isTruckBulkData = lastTruckUserText.length > 300 && truckLineCount >= 3;

      if (isTruckBulkData) {
        console.log(`[truck-chat] Bulk data detected (${lastTruckUserText.length} chars, ${truckLineCount} lines). Using parse-first approach.`);
        const truckParseResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `あなたは運送データのパーサーです。入力テキストから空車情報を抽出してJSON配列で返してください。

フィールドスキーマ: ${truckFieldSchema}

ルール:
- 各行/各エントリを個別の空車案件として解析する
- 略語を正しく展開: W=ウイング, PG=パワーゲート付き, 箱=バン, 平=平ボディ, 冷凍=冷凍車, 冷蔵=冷蔵車
- 車種の数字表記: 4t=4t車, 10t=10t車, 大型=大型車, 増トン=増トン車
- 都道府県の推測: 横浜→神奈川, 熊谷→埼玉, 市川→千葉 等
- 金額が2桁なら万円単位(50→50000)
- 日付の年省略は${new Date().getFullYear()}年
- titleは自動生成: 「{vehicleType} {currentArea}→{destinationArea} 空車あり」

必ず以下のJSON形式で返してください:
{"items": [各案件のオブジェクト配列]}`,
            },
            { role: "user", content: lastTruckUserText },
          ],
          max_tokens: 8000,
          response_format: { type: "json_object" },
        });

        const truckParseContent = truckParseResponse.choices[0]?.message?.content || "{}";
        try {
          const truckParsed = JSON.parse(truckParseContent);
          const truckItems = truckParsed.items || [];
          const truckFirst = truckItems.length > 0 ? truckItems[0] : {};
          const truckRemaining = truckItems.length > 1 ? truckItems.slice(1) : [];
          res.json({
            message: truckItems.length > 1
              ? `${truckItems.length}台分の空車情報を読み取りました。1台目をフォームに反映しています。内容を確認して掲載してください。`
              : "空車情報を読み取りました。右側のフォームに反映しています。内容を確認して掲載してください。",
            extractedFields: truckFirst,
            items: truckRemaining,
            priceSuggestion: null,
            status: truckItems.length > 0 ? "confirming" : "extracting",
          });
          return;
        } catch {
          console.log("[truck-chat] Bulk parse failed, falling back to normal chat");
        }
      }

      const apiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const truckInputLen = messages.reduce((sum: number, m: { content: string }) => sum + (m.content?.length || 0), 0);
      const truckMaxTokens = truckInputLen > 2000 ? 8000 : truckInputLen > 500 ? 4000 : 2000;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: apiMessages,
        max_tokens: truckMaxTokens,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        res.json({
          message: parsed.message || "空車情報を読み取りました。",
          extractedFields: parsed.extractedFields || {},
          items: parsed.items || [],
          priceSuggestion: parsed.priceSuggestion || null,
          status: parsed.status || "chatting",
        });
      } catch {
        let truckFallbackMsg = "空車情報を処理中です。";
        try {
          const m = content.match(/"message"\s*:\s*"([^"]+)"/);
          if (m) truckFallbackMsg = m[1];
        } catch {}
        res.json({
          message: truckFallbackMsg,
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

  app.post("/api/ai/feedback", requireAuth, async (req, res) => {
    try {
      const { category, originalInput, aiOutput, correctedOutput, correctedFields } = req.body;
      if (!originalInput || !aiOutput || !correctedOutput) {
        return res.status(400).json({ message: "必要なデータが不足しています" });
      }
      const log = await storage.createAiCorrectionLog({
        category: category || "cargo",
        originalInput,
        aiOutput: JSON.stringify(aiOutput),
        correctedOutput: JSON.stringify(correctedOutput),
        correctedFields: correctedFields ? JSON.stringify(correctedFields) : null,
        userId: req.session.userId as string,
      });
      res.json(log);
    } catch (error) {
      console.error("AI feedback error:", error);
      res.status(500).json({ message: "フィードバックの保存に失敗しました" });
    }
  });

  app.get("/api/admin/ai-training", requireAdmin, async (_req, res) => {
    try {
      const examples = await storage.getAllAiTrainingExamples();
      res.json(examples);
    } catch (error) {
      console.error("AI training fetch error:", error);
      res.status(500).json({ message: "学習データの取得に失敗しました" });
    }
  });

  app.post("/api/admin/ai-training", requireAdmin, async (req, res) => {
    try {
      const { category, inputText, expectedOutput, note } = req.body;
      if (!inputText || !expectedOutput) {
        return res.status(400).json({ message: "入力テキストと期待出力が必要です" });
      }
      const example = await storage.createAiTrainingExample({
        category: category || "cargo",
        inputText,
        expectedOutput: typeof expectedOutput === "string" ? expectedOutput : JSON.stringify(expectedOutput),
        note,
        isActive: true,
        createdBy: req.session.userId as string,
      });
      res.json(example);
    } catch (error) {
      res.status(500).json({ message: "学習データの作成に失敗しました" });
    }
  });

  app.patch("/api/admin/ai-training/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateAiTrainingExample(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "学習データが見つかりません" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "学習データの更新に失敗しました" });
    }
  });

  app.delete("/api/admin/ai-training/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAiTrainingExample(req.params.id);
      res.json({ message: "学習データを削除しました" });
    } catch (error) {
      res.status(500).json({ message: "学習データの削除に失敗しました" });
    }
  });

  app.get("/api/admin/ai-corrections", requireAdmin, async (_req, res) => {
    try {
      const logs = await storage.getAiCorrectionLogs(100);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "修正ログの取得に失敗しました" });
    }
  });

  app.post("/api/admin/ai-corrections/:id/promote", requireAdmin, async (req, res) => {
    try {
      const example = await storage.promoteAiCorrectionToExample(req.params.id);
      if (!example) return res.status(404).json({ message: "修正ログが見つかりません" });
      res.json(example);
    } catch (error) {
      res.status(500).json({ message: "学習データへの昇格に失敗しました" });
    }
  });

  app.delete("/api/admin/ai-corrections/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAiCorrectionLog(req.params.id);
      res.json({ message: "修正ログを削除しました" });
    } catch (error) {
      res.status(500).json({ message: "修正ログの削除に失敗しました" });
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

  // Transport Ledger Excel Export
  app.get("/api/transport-records/export", requireAuth, async (req, res) => {
    try {
      let records = await storage.getTransportRecordsByUserId(req.session.userId as string);
      const { dateFrom, dateTo, shipperName } = req.query as Record<string, string>;
      if (dateFrom) {
        records = records.filter(r => (r.transportDate || "") >= dateFrom);
      }
      if (dateTo) {
        records = records.filter(r => (r.transportDate || "") <= dateTo);
      }
      if (shipperName) {
        records = records.filter(r => (r.shipperName || "").includes(shipperName));
      }
      const data = records.map(r => ({
        "運送日": r.transportDate || "",
        "荷主名": r.shipperName || "",
        "発地": r.departureArea || "",
        "着地": r.arrivalArea || "",
        "荷種": r.cargoDescription || "",
        "車種": r.vehicleType || "",
        "運賃": r.fare || "",
        "実運送会社": r.transportCompany || "",
        "ドライバー名": r.driverName || "",
        "ドライバー電話": r.driverPhone || "",
        "車両番号": r.vehicleNumber || "",
        "ステータス": r.status || "",
        "備考": r.notes || "",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "実運送体制管理簿");

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=transport-ledger.xlsx");
      res.send(buffer);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "エクスポートに失敗しました" });
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

  // Admin: Send notification to users (multi-channel)
  app.post("/api/admin/notifications/send", requireAdmin, async (req, res) => {
    try {
      const { title, message, target, channels, userIds } = req.body;
      if (!title || !message) {
        return res.status(400).json({ message: "タイトルと本文は必須です" });
      }
      const selectedChannels: string[] = channels || ["system"];
      const allUsers = await storage.getAllUsers();
      let targetUsers = allUsers.filter(u => u.approved);
      if (target === "selected" && Array.isArray(userIds) && userIds.length > 0) {
        const idSet = new Set(userIds);
        targetUsers = targetUsers.filter(u => idSet.has(u.id));
      } else if (target === "shippers") {
        targetUsers = targetUsers.filter(u => u.userType === "shipper");
      } else if (target === "carriers") {
        targetUsers = targetUsers.filter(u => u.userType === "carrier");
      }

      const results = { system: 0, email: 0, line: 0, emailErrors: 0, lineErrors: 0 };

      for (const user of targetUsers) {
        if (selectedChannels.includes("system") && user.notifySystem) {
          await storage.createNotification({
            userId: user.id,
            type: "admin_notification",
            title,
            message,
          });
          results.system++;
        }

        if (selectedChannels.includes("email") && user.notifyEmail && user.email) {
          const emailResult = await sendEmail(user.email, `【トラマッチ】${title}`, message);
          if (emailResult.success) results.email++;
          else results.emailErrors++;
        }

        if (selectedChannels.includes("line") && user.notifyLine && user.lineUserId) {
          const lineResult = await sendLineMessage(user.lineUserId, `${title}\n\n${message}`);
          if (lineResult.success) results.line++;
          else results.lineErrors++;
        }
      }

      res.json({
        message: `通知を送信しました`,
        count: targetUsers.length,
        results,
      });
    } catch (error) {
      res.status(500).json({ message: "通知の送信に失敗しました" });
    }
  });

  // Admin: Get notification channel configuration status
  app.get("/api/admin/notification-channels/status", requireAdmin, async (_req, res) => {
    res.json({
      system: { configured: true, label: "システム通知" },
      email: { configured: isEmailConfigured(), label: "メール通知" },
      line: { configured: isLineConfigured(), label: "LINE通知" },
    });
  });

  // Admin: Send test notification
  app.post("/api/admin/notification-channels/test", requireAdmin, async (req, res) => {
    try {
      const { channel, to } = req.body;
      if (!channel) return res.status(400).json({ message: "チャネルは必須です" });

      if (channel === "email") {
        if (!to) return res.status(400).json({ message: "送信先メールアドレスは必須です" });
        const result = await sendEmail(to, "【トラマッチ】テスト通知", "これはトラマッチからのテストメールです。正常に受信できています。");
        return res.json({ success: result.success, error: result.error });
      }

      if (channel === "line") {
        if (!to) return res.status(400).json({ message: "LINE User IDは必須です" });
        const result = await sendLineMessage(to, "【トラマッチ】テスト通知\n\nこれはトラマッチからのテスト通知です。正常に受信できています。");
        return res.json({ success: result.success, error: result.error });
      }

      return res.status(400).json({ message: "不明なチャネルです" });
    } catch (error) {
      res.status(500).json({ message: "テスト送信に失敗しました" });
    }
  });

  app.get("/api/admin/email-template-info", requireAdmin, async (_req, res) => {
    res.json([
      {
        triggerEvent: "password_reset",
        name: "パスワードリセット",
        description: "パスワードリセット時に送信されるメール",
        variables: [
          { key: "companyName", label: "会社名" },
          { key: "resetUrl", label: "リセットURL" },
        ],
      },
      {
        triggerEvent: "partner_invite",
        name: "取引先招待",
        description: "取引先を招待する際に送信されるメール",
        variables: [
          { key: "companyName", label: "招待元会社名" },
          { key: "registerUrl", label: "登録URL" },
          { key: "appBaseUrl", label: "サイトURL" },
        ],
      },
      {
        triggerEvent: "dispatch_request_shipper",
        name: "配車依頼書（荷主向け）",
        description: "成約時の車番連絡メール（件名と冒頭文が編集可能、詳細データは自動挿入）",
        variables: [
          { key: "senderName", label: "送信者名" },
        ],
      },
      {
        triggerEvent: "dispatch_request_transport",
        name: "配車依頼書（運送会社向け）",
        description: "配車依頼書メール（件名と冒頭文が編集可能、詳細データは自動挿入）",
        variables: [
          { key: "senderName", label: "送信者名" },
        ],
      },
      {
        triggerEvent: "cargo_new",
        name: "新着案件通知",
        description: "新しい荷物が登録された際に全ユーザーへ送信されるメール",
        variables: [
          { key: "departureArea", label: "出発地" },
          { key: "arrivalArea", label: "到着地" },
          { key: "cargoType", label: "荷物種類" },
          { key: "weight", label: "重量" },
          { key: "companyName", label: "登録会社名" },
          { key: "appBaseUrl", label: "サイトURL" },
        ],
      },
      {
        triggerEvent: "truck_new",
        name: "新着空車通知",
        description: "新しい空車が登録された際に全ユーザーへ送信されるメール",
        variables: [
          { key: "currentArea", label: "現在地" },
          { key: "destinationArea", label: "行先" },
          { key: "vehicleType", label: "車両タイプ" },
          { key: "maxWeight", label: "積載量" },
          { key: "companyName", label: "登録会社名" },
          { key: "appBaseUrl", label: "サイトURL" },
        ],
      },
      {
        triggerEvent: "invoice_send",
        name: "請求書送信",
        description: "請求書メール（件名が編集可能、請求書HTMLは自動生成）",
        variables: [
          { key: "companyName", label: "請求先会社名" },
          { key: "invoiceNumber", label: "請求書番号" },
          { key: "billingMonth", label: "請求月" },
          { key: "totalAmount", label: "合計金額" },
          { key: "dueDate", label: "支払期限" },
        ],
      },
    ]);
  });

  // Admin: Notification Templates CRUD
  app.get("/api/admin/notification-templates", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const channel = req.query.channel as string | undefined;
      let templates;
      if (channel) {
        templates = await storage.getNotificationTemplatesByChannel(channel);
        if (category) {
          templates = templates.filter((t: any) => t.category === category);
        }
      } else if (category) {
        templates = await storage.getNotificationTemplatesByCategory(category);
      } else {
        templates = await storage.getNotificationTemplates();
      }
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "テンプレートの取得に失敗しました" });
    }
  });

  app.post("/api/admin/notification-templates", requireAdmin, async (req, res) => {
    try {
      const parsed = insertNotificationTemplateSchema.parse(req.body);
      const template = await storage.createNotificationTemplate(parsed);
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromError(error).message });
      }
      res.status(500).json({ message: "テンプレートの作成に失敗しました" });
    }
  });

  app.patch("/api/admin/notification-templates/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const template = await storage.updateNotificationTemplate(id, req.body);
      if (!template) return res.status(404).json({ message: "テンプレートが見つかりません" });
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "テンプレートの更新に失敗しました" });
    }
  });

  app.delete("/api/admin/notification-templates/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteNotificationTemplate(id);
      if (!deleted) return res.status(404).json({ message: "テンプレートが見つかりません" });
      res.json({ message: "テンプレートを削除しました" });
    } catch (error) {
      res.status(500).json({ message: "テンプレートの削除に失敗しました" });
    }
  });

  // Admin: AI generate notification template
  app.post("/api/admin/notification-templates/generate", requireAdmin, async (req, res) => {
    try {
      const { category, channel, purpose, tone } = req.body;
      if (!purpose) {
        return res.status(400).json({ message: "目的は必須です" });
      }
      const categoryLabels: Record<string, string> = {
        auto_reply: "自動返信",
        auto_notification: "自動通知",
        regular: "通常通知",
      };
      const channelLabels: Record<string, string> = {
        system: "システム通知（アプリ内通知）",
        email: "メール通知",
        line: "LINE通知",
      };
      const ch = channel || "system";
      const cat = category || "regular";
      const categoryLabel = categoryLabels[cat] || cat;
      const channelLabel = channelLabels[ch] || ch;
      const toneLabel = tone === "formal" ? "フォーマルなビジネス文体" : tone === "friendly" ? "親しみやすいカジュアル文体" : "標準的なビジネス文体";

      const isEmail = ch === "email";
      const isLine = ch === "line";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `あなたは物流マッチングプラットフォーム「トラマッチ」の通知テンプレート作成アシスタントです。
以下の条件でテンプレートを作成してください：
- 通知チャネル: ${channelLabel}
- カテゴリ: ${categoryLabel}
- 文体: ${toneLabel}
- プラットフォーム名: トラマッチ
- 業界: 物流・運送業
- テンプレート変数として {{会社名}}, {{ユーザー名}}, {{日付}}, {{荷物名}}, {{出発地}}, {{到着地}}, {{車両タイプ}} などが使えます
${isLine ? "- LINE通知は短く簡潔に（200文字程度）。件名は不要です。" : ""}
${isEmail ? "- メール通知にはメール件名（subject）を含めてください。" : ""}
${!isEmail ? "- subjectフィールドは空文字列にしてください。" : ""}

JSON形式で以下を返してください（日本語で）:
{
  "name": "テンプレート名",
  "subject": "${isEmail ? "メール件名" : ""}",
  "body": "本文（改行は\\nで表現）",
  "triggerEvent": "トリガーイベント説明（自動系の場合）"
}`
          },
          { role: "user", content: `目的: ${purpose}` }
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ message: "AI生成に失敗しました" });
      }
      const generated = JSON.parse(content);
      res.json({
        name: generated.name || "新規テンプレート",
        subject: generated.subject || "",
        body: generated.body || "",
        triggerEvent: generated.triggerEvent || null,
        category: cat,
        channel: ch,
      });
    } catch (error) {
      console.error("AI template generation error:", error);
      res.status(500).json({ message: "AI生成に失敗しました" });
    }
  });

  // Admin: Revenue stats
  app.get("/api/admin/revenue-stats", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const cargo = await storage.getCargoListings();
      const trucks = await storage.getTruckListings();
      const allPayments = await storage.getAllPayments();

      const nonAdminUsers = allUsers.filter(u => u.role !== "admin");
      const totalUsers = nonAdminUsers.length;
      const approvedUsers = nonAdminUsers.filter(u => u.approved).length;
      const totalCargo = cargo.length;
      const completedCargo = cargo.filter(c => c.status === "completed");
      const completedCargoCount = completedCargo.length;
      const totalTrucks = trucks.length;

      const freePlanUsers = nonAdminUsers.filter(u => u.plan === "free").length;
      const betaPremiumUsers = nonAdminUsers.filter(u => u.plan === "premium").length;
      const premiumUsers = nonAdminUsers.filter(u => u.plan === "premium_full").length;
      const addedUsers = nonAdminUsers.filter(u => u.addedByUserId && u.approved).length;

      const premiumParentUsers = nonAdminUsers.filter(u => u.plan === "premium_full" && !u.addedByUserId && u.approved);
      const expectedMonthlyRevenue = premiumParentUsers.reduce((sum, parent) => {
        const childCount = nonAdminUsers.filter(u => u.addedByUserId === parent.id && u.approved).length;
        return sum + 5500 + (childCount * 2750);
      }, 0);

      const completedPayments = allPayments.filter(p => p.status === "completed");
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

      const now = new Date();
      const thisMonthPayments = completedPayments.filter(p => {
        const d = new Date(p.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const monthlyRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

      const parsePrice = (priceStr: string | null | undefined): number => {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9]/g, "");
        return parseInt(cleaned, 10) || 0;
      };

      const completedCargoDetails = completedCargo.map(c => ({
        id: c.id,
        cargoNumber: c.cargoNumber,
        title: c.title,
        departureArea: c.departureArea,
        arrivalArea: c.arrivalArea,
        cargoType: c.cargoType,
        price: c.price,
        priceValue: parsePrice(c.price),
        companyName: c.companyName,
        desiredDate: c.desiredDate,
        createdAt: c.createdAt,
      }));

      const totalTradeVolume = completedCargoDetails.reduce((sum, c) => sum + c.priceValue, 0);

      const monthlyData: Record<string, { cargo: number; trucks: number; users: number; revenue: number; tradeVolume: number }> = {};
      for (let m = 0; m < 12; m++) {
        const key = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
        monthlyData[key] = { cargo: 0, trucks: 0, users: 0, revenue: 0, tradeVolume: 0 };
      }
      cargo.forEach(c => {
        const d = new Date(c.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[key]) monthlyData[key].cargo++;
        if (c.status === "completed" && monthlyData[key]) {
          monthlyData[key].tradeVolume += parsePrice(c.price);
        }
      });
      trucks.forEach(t => {
        const d = new Date(t.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[key]) monthlyData[key].trucks++;
      });
      nonAdminUsers.forEach(u => {
        if (u.registrationDate) {
          const d = new Date(u.registrationDate);
          if (!isNaN(d.getTime())) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (monthlyData[key]) monthlyData[key].users++;
          }
        }
      });
      completedPayments.forEach(p => {
        const d = new Date(p.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[key]) monthlyData[key].revenue += p.amount;
      });

      res.json({
        totalUsers,
        approvedUsers,
        totalCargo,
        completedCargoCount,
        totalTrucks,
        freePlanUsers,
        betaPremiumUsers,
        premiumUsers,
        addedUsers,
        expectedMonthlyRevenue,
        totalRevenue,
        monthlyRevenue,
        totalTradeVolume,
        completedCargoDetails,
        monthlyData,
        recentPayments: allPayments.slice(0, 10).map(p => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          description: p.description,
          createdAt: p.createdAt,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "収益データの取得に失敗しました" });
    }
  });

  // Public: Column articles (SEO)
  app.get("/api/columns", async (_req, res) => {
    try {
      const articles = await storage.getPublishedSeoArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "記事の取得に失敗しました" });
    }
  });

  app.get("/api/columns/popular", async (_req, res) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 10;
      const articles = await storage.getPopularSeoArticles(limit);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "人気記事の取得に失敗しました" });
    }
  });

  app.get("/api/columns/category/:category", async (req, res) => {
    try {
      const articles = await storage.getSeoArticlesByCategory(req.params.category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "カテゴリ記事の取得に失敗しました" });
    }
  });

  app.get("/api/columns/:slug", async (req, res) => {
    try {
      const article = await storage.getSeoArticleBySlug(req.params.slug);
      if (!article || article.status !== "published") {
        return res.status(404).json({ message: "記事が見つかりません" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "記事の取得に失敗しました" });
    }
  });

  app.get("/api/columns/:slug/related", async (req, res) => {
    try {
      const article = await storage.getSeoArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "記事が見つかりません" });
      }
      const related = await storage.getRelatedSeoArticles(article.id, article.category || "kyukakyusha", 5);
      res.json(related);
    } catch (error) {
      res.status(500).json({ message: "関連記事の取得に失敗しました" });
    }
  });

  app.post("/api/columns/:slug/view", async (req, res) => {
    try {
      const article = await storage.getSeoArticleBySlug(req.params.slug);
      if (article) {
        await storage.incrementSeoArticleViewCount(article.id);
      }
      res.json({ success: true });
    } catch (error) {
      res.json({ success: true });
    }
  });

  app.get("/api/youtube-videos", async (_req, res) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 6;
      const videos = await storage.getVisibleYoutubeVideos(limit);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "動画の取得に失敗しました" });
    }
  });

  app.post("/api/admin/youtube/fetch", requireAdmin, async (_req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const channelId = process.env.YOUTUBE_CHANNEL_ID;
      if (!apiKey || !channelId) {
        return res.status(400).json({ message: "YOUTUBE_API_KEY と YOUTUBE_CHANNEL_ID の環境変数を設定してください" });
      }

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=date&type=video&key=${apiKey}`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        const errBody = await searchRes.text();
        return res.status(500).json({ message: `YouTube API エラー: ${errBody}` });
      }
      const searchData = await searchRes.json() as any;
      const items = searchData.items || [];

      let savedCount = 0;
      for (const item of items) {
        const videoId = item.id?.videoId;
        if (!videoId) continue;
        await storage.upsertYoutubeVideo({
          videoId,
          title: item.snippet?.title || "",
          description: item.snippet?.description || "",
          thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
          publishedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
          channelTitle: item.snippet?.channelTitle || "",
          duration: null,
          viewCount: 0,
          isVisible: true,
        });
        savedCount++;
      }

      res.json({ message: `${savedCount}件の動画を取得しました`, count: savedCount });
    } catch (error) {
      res.status(500).json({ message: "YouTube動画の取得に失敗しました" });
    }
  });

  app.get("/api/admin/youtube-videos", requireAdmin, async (_req, res) => {
    try {
      const videos = await storage.getYoutubeVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "動画の取得に失敗しました" });
    }
  });

  app.patch("/api/admin/youtube-videos/:id/visibility", requireAdmin, async (req, res) => {
    try {
      const { isVisible } = req.body;
      const video = await storage.updateYoutubeVideoVisibility(req.params.id, isVisible);
      if (!video) return res.status(404).json({ message: "動画が見つかりません" });
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "更新に失敗しました" });
    }
  });

  app.delete("/api/admin/youtube-videos/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteYoutubeVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "削除に失敗しました" });
    }
  });

  app.post("/api/admin/youtube/auto-publish", requireAdmin, async (_req, res) => {
    try {
      const { runDailyAutoPublish } = await import("./youtube-auto-publisher");
      const result = await runDailyAutoPublish();
      res.json({ message: `${result.started}本の動画生成を開始しました`, ...result });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "自動投稿の開始に失敗しました" });
    }
  });

  app.post("/api/admin/youtube/auto-publish-single", requireAdmin, async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic) return res.status(400).json({ message: "トピックを指定してください" });
      const { processAutoPublishJob } = await import("./youtube-auto-publisher");
      const job = await storage.createYoutubeAutoPublishJob({ topic, status: "pending" });
      processAutoPublishJob(job.id).catch((err: any) =>
        console.error(`[YouTube Auto] Single job ${job.id} error:`, err?.message)
      );
      res.json({ message: "動画生成を開始しました", jobId: job.id });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "動画生成の開始に失敗しました" });
    }
  });

  app.get("/api/admin/youtube/auto-publish-jobs", requireAdmin, async (_req, res) => {
    try {
      const jobs = await storage.getYoutubeAutoPublishJobs(50);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "ジョブの取得に失敗しました" });
    }
  });

  // Admin: Email Campaigns
  app.get("/api/admin/email-campaigns", requireAdmin, async (_req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "キャンペーンの取得に失敗しました" });
    }
  });

  app.get("/api/admin/email-campaigns/:id", requireAdmin, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ message: "キャンペーンが見つかりません" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "キャンペーンの取得に失敗しました" });
    }
  });

  app.post("/api/admin/email-campaigns", requireAdmin, async (req, res) => {
    try {
      const { name, subject, body, recipients, totalCount } = req.body;
      if (!name || !subject || !body || !recipients) {
        return res.status(400).json({ message: "必須項目を入力してください" });
      }
      const recipientList = recipients.split("\n").map((e: string) => e.trim()).filter((e: string) => e && e.includes("@"));
      const campaign = await storage.createEmailCampaign({
        name,
        subject,
        body,
        recipients,
        totalCount: totalCount || recipientList.length,
        status: "draft",
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "キャンペーンの作成に失敗しました" });
    }
  });

  app.patch("/api/admin/email-campaigns/:id", requireAdmin, async (req, res) => {
    try {
      const campaign = await storage.updateEmailCampaign(req.params.id, req.body);
      if (!campaign) return res.status(404).json({ message: "キャンペーンが見つかりません" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "キャンペーンの更新に失敗しました" });
    }
  });

  app.delete("/api/admin/email-campaigns/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEmailCampaign(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "キャンペーンの削除に失敗しました" });
    }
  });

  app.post("/api/admin/email-campaigns/:id/send", requireAdmin, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ message: "キャンペーンが見つかりません" });
      if (campaign.status === "sending") return res.status(400).json({ message: "送信中です" });

      const recipientList = campaign.recipients.split("\n").map(e => e.trim()).filter(e => e && e.includes("@"));
      if (recipientList.length === 0) return res.status(400).json({ message: "送信先がありません" });

      await storage.updateEmailCampaign(campaign.id, {
        status: "sending",
        totalCount: recipientList.length,
        sentCount: 0,
        failedCount: 0,
        sentAt: new Date(),
      });

      res.json({ message: `${recipientList.length}件のメール送信を開始しました` });

      (async () => {
        let sentCount = 0;
        let failedCount = 0;
        for (const email of recipientList) {
          try {
            const result = await sendEmail(email, campaign.subject, campaign.body);
            if (result.success) {
              sentCount++;
            } else {
              failedCount++;
              console.error(`Email failed to ${email}: ${result.error}`);
            }
          } catch (err) {
            failedCount++;
            console.error(`Email error to ${email}:`, err);
          }
          await storage.updateEmailCampaign(campaign.id, { sentCount, failedCount });
          await new Promise(r => setTimeout(r, 500));
        }
        await storage.updateEmailCampaign(campaign.id, {
          status: failedCount === recipientList.length ? "failed" : "completed",
          sentCount,
          failedCount,
        });
      })();
    } catch (error) {
      res.status(500).json({ message: "送信の開始に失敗しました" });
    }
  });

  // Admin: Email Leads
  app.get("/api/admin/email-leads", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const leads = await storage.getEmailLeads(status || undefined, limit, offset);
      const total = await storage.getEmailLeadCount(status || undefined);
      const todaySent = await storage.getTodaySentLeadCount();
      const newCount = await storage.getEmailLeadCount("new");
      const sentCount = await storage.getEmailLeadCount("sent");
      const failedCount = await storage.getEmailLeadCount("failed");
      res.json({ leads, total, todaySent, newCount, sentCount, failedCount });
    } catch (error) {
      res.status(500).json({ message: "リードの取得に失敗しました" });
    }
  });

  app.delete("/api/admin/email-leads/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEmailLead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "リードの削除に失敗しました" });
    }
  });

  app.post("/api/admin/email-leads/crawl", requireAdmin, async (req, res) => {
    try {
      const count = req.body.count ? parseInt(req.body.count) : undefined;
      res.json({ message: "クロールを開始しました。バックグラウンドで実行中です。" });
      const { crawlLeadsWithAI } = await import("./lead-crawler");
      crawlLeadsWithAI(count).catch(err => console.error("[Lead Crawler] Manual crawl failed:", err));
    } catch (error) {
      res.status(500).json({ message: "クロールの開始に失敗しました" });
    }
  });

  app.post("/api/admin/email-leads/crawl-url", requireAdmin, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ message: "URLを入力してください" });
      const { crawlLeadsFromUrl } = await import("./lead-crawler");
      const found = await crawlLeadsFromUrl(url);
      res.json({ message: `${found}件のリードを取得しました`, found });
    } catch (error) {
      res.status(500).json({ message: "URLクロールに失敗しました" });
    }
  });

  app.post("/api/admin/email-leads/send-now", requireAdmin, async (req, res) => {
    try {
      const { sendDailyLeadEmails } = await import("./lead-crawler");
      res.json({ message: "メール送信を開始しました。バックグラウンドで実行中です。" });
      sendDailyLeadEmails().catch(err => console.error("[Lead Email] Manual send failed:", err));
    } catch (error) {
      res.status(500).json({ message: "送信の開始に失敗しました" });
    }
  });

  app.post("/api/admin/email-leads/import", requireAdmin, async (req, res) => {
    try {
      const { leads } = req.body;
      if (!leads || !Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ message: "インポートデータがありません" });
      }
      let added = 0;
      for (const lead of leads) {
        if (!lead.email || !lead.companyName) continue;
        const existing = await storage.getEmailLeadByEmail(lead.email);
        if (existing) continue;
        await storage.createEmailLead({
          companyName: lead.companyName,
          email: lead.email,
          fax: lead.fax || null,
          phone: lead.phone || null,
          website: lead.website || null,
          address: lead.address || null,
          industry: lead.industry || "一般貨物/利用運送",
          source: "manual_import",
          status: "new",
        });
        added++;
      }
      res.json({ message: `${added}件のリードをインポートしました`, added });
    } catch (error) {
      res.status(500).json({ message: "インポートに失敗しました" });
    }
  });

  app.patch("/api/admin/email-leads/settings", requireAdmin, async (req, res) => {
    try {
      const { subject, body } = req.body;
      if (subject) await storage.setAdminSetting("lead_email_subject", subject);
      if (body) await storage.setAdminSetting("lead_email_body", body);
      res.json({ message: "設定を保存しました" });
    } catch (error) {
      res.status(500).json({ message: "設定の保存に失敗しました" });
    }
  });

  app.get("/api/admin/email-leads/settings", requireAdmin, async (_req, res) => {
    try {
      const subject = await storage.getAdminSetting("lead_email_subject");
      const body = await storage.getAdminSetting("lead_email_body");
      res.json({ subject: subject || "", body: body || "" });
    } catch (error) {
      res.status(500).json({ message: "設定の取得に失敗しました" });
    }
  });

  app.post("/api/admin/email-campaigns/test-send", requireAdmin, async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      if (!to || !subject || !body) return res.status(400).json({ message: "必須項目を入力してください" });
      const result = await sendEmail(to, subject, body);
      if (result.success) {
        res.json({ message: "テストメールを送信しました" });
      } else {
        res.status(500).json({ message: result.error || "送信に失敗しました" });
      }
    } catch (error) {
      res.status(500).json({ message: "テスト送信に失敗しました" });
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

  function generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 60);
    const dateStr = new Date().toISOString().slice(0, 10);
    const rand = Math.random().toString(36).substring(2, 6);
    return `${dateStr}-${rand}-${base || "article"}`;
  }

  app.post("/api/admin/seo-articles/generate", requireAdmin, async (req, res) => {
    try {
      const { topic, keywords, notes, autoPublish, category } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "テーマは必須です" });
      }
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `あなたはSEOに強い物流業界専門のコラムライターです。「トラマッチ」という求荷求車マッチングプラットフォームのコラム記事を作成してください。

記事の要件：
1. SEOに最適化されたタイトル（# 見出し）- キーワードを含む
2. 読者を引き込む導入文（200文字程度）
3. 本文（## と ### の見出しで構造化、合計2000〜3000文字）
  - 具体的なデータや事例を含める
  - 読者にとって実用的な情報を提供
  - 自然にキーワードを含める（キーワード密度2-3%）
  - トラマッチのサービスを自然に紹介
4. まとめ・結論

重要な出力ルール：
- マークダウン形式で出力してください
- 見出しは ## や ### のマークダウン記法のみを使い、「H2:」「H3:」のようなプレフィックスは絶対に付けないでください
- HTMLタグは使わないでください（<h2>、<h3>、<p>などは不可）
- 正しい例: ## 求荷求車とは
- 間違った例: ## H2: 求荷求車とは

最後にJSON形式でメタ情報を出力してください：
---META---
{"metaDescription": "160文字以内のSEO用ディスクリプション", "faq": [{"question": "質問1", "answer": "回答1"}, {"question": "質問2", "answer": "回答2"}, {"question": "質問3", "answer": "回答3"}]}`
          },
          {
            role: "user",
            content: `テーマ: ${topic}\nキーワード: ${keywords || "なし"}\n備考: ${notes || "なし"}`
          }
        ],
        max_tokens: 4000,
      });
      const rawContent = completion.choices[0]?.message?.content || "";
      let content = rawContent;
      let metaDescription = "";
      let faq: string | null = null;
      const metaMatch = rawContent.match(/---META---\s*(\{[\s\S]*?\})/);
      if (metaMatch) {
        content = rawContent.replace(/---META---[\s\S]*$/, "").trim();
        try {
          const meta = JSON.parse(metaMatch[1]);
          metaDescription = meta.metaDescription || "";
          if (meta.faq && Array.isArray(meta.faq)) {
            faq = JSON.stringify(meta.faq);
          }
        } catch {}
      }
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : topic;
      const slug = generateSlug(title);
      const wordCount = content.replace(/[#*\-\n\s]/g, "").length;

      const article = await storage.createSeoArticle({
        topic,
        keywords: keywords || null,
        title,
        slug,
        metaDescription: metaDescription || null,
        content,
        status: autoPublish ? "published" : "draft",
        autoGenerated: false,
        category: category || "kyukakyusha",
        wordCount,
        faq,
      });
      if (autoPublish) {
        pingGoogleSitemap();
      }
      res.json(article);
    } catch (error) {
      console.error("SEO article generation error:", error);
      res.status(500).json({ message: "記事の生成に失敗しました" });
    }
  });

  app.patch("/api/admin/seo-articles/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSeoArticle(req.params.id as string, req.body);
      if (!updated) {
        return res.status(404).json({ message: "記事が見つかりません" });
      }
      if (req.body.status === "published") {
        pingGoogleSitemap();
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

  const prefectureToRomaji: Record<string, string> = {
    "北海道": "hokkaido", "青森": "aomori", "岩手": "iwate", "宮城": "miyagi",
    "秋田": "akita", "山形": "yamagata", "福島": "fukushima",
    "茨城": "ibaraki", "栃木": "tochigi", "群馬": "gunma", "埼玉": "saitama",
    "千葉": "chiba", "東京": "tokyo", "神奈川": "kanagawa",
    "新潟": "niigata", "富山": "toyama", "石川": "ishikawa", "福井": "fukui",
    "山梨": "yamanashi", "長野": "nagano", "岐阜": "gifu", "静岡": "shizuoka",
    "愛知": "aichi", "三重": "mie",
    "滋賀": "shiga", "京都": "kyoto", "大阪": "osaka", "兵庫": "hyogo",
    "奈良": "nara", "和歌山": "wakayama",
    "鳥取": "tottori", "島根": "shimane", "岡山": "okayama", "広島": "hiroshima",
    "山口": "yamaguchi",
    "徳島": "tokushima", "香川": "kagawa", "愛媛": "ehime", "高知": "kochi",
    "福岡": "fukuoka", "佐賀": "saga", "長崎": "nagasaki", "熊本": "kumamoto",
    "大分": "oita", "宮崎": "miyazaki", "鹿児島": "kagoshima", "沖縄": "okinawa",
  };

  function getPrefectureRomaji(prefecture: string): string {
    const short = prefecture.replace(/[都府県]$/, "");
    return prefectureToRomaji[short] || short;
  }

  app.get("/api/admin/agents/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAgentStats();
      res.json(stats);
    } catch (error) {
      console.error("Agent stats error:", error);
      res.status(500).json({ message: "エージェント統計の取得に失敗しました" });
    }
  });

  app.get("/api/admin/agents", requireAdmin, async (req, res) => {
    try {
      const allAgents = await storage.getAgents();
      res.json(allAgents);
    } catch (error) {
      res.status(500).json({ message: "代理店一覧の取得に失敗しました" });
    }
  });

  app.get("/api/admin/agents/:id", requireAdmin, async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) return res.status(404).json({ message: "代理店が見つかりません" });
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "代理店の取得に失敗しました" });
    }
  });

  app.post("/api/admin/agents", requireAdmin, async (req, res) => {
    try {
      const parsed = insertAgentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "入力内容に誤りがあります", errors: parsed.error.errors });
      }

      const prefectureRomaji = getPrefectureRomaji(parsed.data.prefecture);
      const loginEmail = parsed.data.email || `agent-${prefectureRomaji}@tramatch-sinjapan.com`;
      const defaultPassword = `agent${Date.now().toString(36)}`;
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const username = `agent_${prefectureRomaji}_${Date.now()}`;

      const existingUser = await storage.getUserByEmail(loginEmail);
      let userId: string | undefined;
      let passwordToReturn: string | undefined;

      if (!existingUser) {
        const newUser = await storage.createUser({
          username,
          password: hashedPassword,
          companyName: parsed.data.companyName,
          contactName: parsed.data.contactName || "",
          phone: parsed.data.phone || "",
          email: loginEmail,
          userType: "carrier",
          role: "user",
          address: parsed.data.address || "",
        } as any);
        await storage.approveUser(newUser.id);
        userId = newUser.id;
        passwordToReturn = defaultPassword;
      }

      const agent = await storage.createAgent({
        ...parsed.data,
        userId: userId || null,
        loginEmail: userId ? loginEmail : null,
      });

      await storage.createAuditLog({
        userId: (req as any).user?.id,
        userName: (req as any).user?.contactName || (req as any).user?.companyName,
        action: "create",
        targetType: "agent",
        targetId: agent.id,
        details: `代理店「${agent.companyName}」(${agent.prefecture})を登録${userId ? ` / アカウント作成 (${loginEmail})` : ""}`,
        ipAddress: req.ip,
      });
      res.status(201).json({ ...agent, generatedPassword: passwordToReturn });
    } catch (error: any) {
      console.error("Agent creation error:", error);
      res.status(500).json({ message: "代理店の登録に失敗しました" });
    }
  });

  app.patch("/api/admin/agents/:id", requireAdmin, async (req, res) => {
    try {
      const updateSchema = insertAgentSchema.partial();
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "入力内容に誤りがあります", errors: parsed.error.errors });
      }
      const agent = await storage.updateAgent(req.params.id, parsed.data);
      if (!agent) return res.status(404).json({ message: "代理店が見つかりません" });

      if (agent.userId) {
        const userUpdate: Record<string, any> = {};
        if (parsed.data.companyName !== undefined) userUpdate.companyName = parsed.data.companyName;
        if (parsed.data.contactName !== undefined) userUpdate.contactName = parsed.data.contactName;
        if (parsed.data.phone !== undefined) userUpdate.phone = parsed.data.phone;
        if (parsed.data.address !== undefined) userUpdate.address = parsed.data.address;
        if (parsed.data.fax !== undefined) userUpdate.fax = parsed.data.fax;
        if (Object.keys(userUpdate).length > 0) {
          await storage.updateUserProfile(agent.userId, userUpdate);
        }
      }

      await storage.createAuditLog({
        userId: (req as any).user?.id,
        userName: (req as any).user?.contactName || (req as any).user?.companyName,
        action: "update",
        targetType: "agent",
        targetId: agent.id,
        details: `代理店「${agent.companyName}」(${agent.prefecture})を更新`,
        ipAddress: req.ip,
      });
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "代理店の更新に失敗しました" });
    }
  });

  app.delete("/api/admin/agents/:id", requireAdmin, async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) return res.status(404).json({ message: "代理店が見つかりません" });
      await storage.deleteAgent(req.params.id);
      await storage.createAuditLog({
        userId: (req as any).user?.id,
        userName: (req as any).user?.contactName || (req as any).user?.companyName,
        action: "delete",
        targetType: "agent",
        targetId: req.params.id,
        details: `代理店「${agent.companyName}」(${agent.prefecture})を削除`,
        ipAddress: req.ip,
      });
      res.json({ message: "代理店を削除しました" });
    } catch (error) {
      res.status(500).json({ message: "代理店の削除に失敗しました" });
    }
  });

  app.post("/api/admin/agents/:id/create-account", requireAdmin, async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) return res.status(404).json({ message: "代理店が見つかりません" });
      if (agent.userId) return res.status(400).json({ message: "この代理店にはすでにアカウントがあります" });

      const prefectureRomaji = getPrefectureRomaji(agent.prefecture);
      const loginEmail = agent.email || `agent-${prefectureRomaji}@tramatch-sinjapan.com`;
      const defaultPassword = `agent${Date.now().toString(36)}`;
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const username = `agent_${prefectureRomaji}_${Date.now()}`;

      const existingUser = await storage.getUserByEmail(loginEmail);
      if (existingUser) {
        return res.status(400).json({ message: `メールアドレス「${loginEmail}」は既に使用されています。別のメールアドレスを設定してください。` });
      }

      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        companyName: agent.companyName,
        contactName: agent.contactName || "",
        phone: agent.phone || "",
        email: loginEmail,
        userType: "carrier",
        role: "user",
        address: agent.address || "",
      } as any);
      await storage.approveUser(newUser.id);
      await storage.updateAgent(agent.id, { userId: newUser.id, loginEmail });
      await storage.createAuditLog({
        userId: (req as any).user?.id,
        userName: (req as any).user?.contactName || (req as any).user?.companyName,
        action: "create",
        targetType: "agent_account",
        targetId: agent.id,
        details: `代理店「${agent.companyName}」のログインアカウントを作成 (${loginEmail})`,
        ipAddress: req.ip,
      });
      res.json({ loginEmail, generatedPassword: defaultPassword });
    } catch (error: any) {
      console.error("Agent account creation error:", error);
      res.status(500).json({ message: "アカウント作成に失敗しました" });
    }
  });

  app.post("/api/admin/agents/:id/reset-password", requireAdmin, async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) return res.status(404).json({ message: "代理店が見つかりません" });
      if (!agent.userId) return res.status(400).json({ message: "この代理店にはアカウントがありません" });

      const newPassword = `agent${Date.now().toString(36)}`;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(agent.userId, hashedPassword);
      await storage.createAuditLog({
        userId: (req as any).user?.id,
        userName: (req as any).user?.contactName || (req as any).user?.companyName,
        action: "update",
        targetType: "agent_account",
        targetId: agent.id,
        details: `代理店「${agent.companyName}」のパスワードをリセット`,
        ipAddress: req.ip,
      });
      res.json({ newPassword, loginEmail: agent.loginEmail });
    } catch (error) {
      res.status(500).json({ message: "パスワードリセットに失敗しました" });
    }
  });

  app.post("/api/admin/agents/bulk-create-accounts", requireAdmin, async (req, res) => {
    try {
      const allAgents = await storage.getAgents();
      const agentsWithoutAccount = allAgents.filter(a => !a.userId);
      const results: Array<{ prefecture: string; loginEmail: string; password: string }> = [];
      const skipped: string[] = [];

      for (const agent of agentsWithoutAccount) {
        const prefectureRomaji = getPrefectureRomaji(agent.prefecture);
        const loginEmail = agent.email || `agent-${prefectureRomaji}@tramatch-sinjapan.com`;
        const defaultPassword = `agent${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const username = `agent_${prefectureRomaji}_${Date.now()}`;

        const existingUser = await storage.getUserByEmail(loginEmail);
        if (existingUser) {
          skipped.push(`${agent.prefecture}: メール「${loginEmail}」が既に使用中`);
          continue;
        }

        const newUser = await storage.createUser({
          username,
          password: hashedPassword,
          companyName: agent.companyName,
          contactName: agent.contactName || "",
          phone: agent.phone || "",
          email: loginEmail,
          userType: "carrier",
          role: "user",
          address: agent.address || "",
        } as any);
        await storage.approveUser(newUser.id);
        await storage.updateAgent(agent.id, { userId: newUser.id, loginEmail });
        results.push({ prefecture: agent.prefecture, loginEmail, password: defaultPassword });
      }

      await storage.createAuditLog({
        userId: (req as any).user?.id,
        userName: (req as any).user?.contactName || (req as any).user?.companyName,
        action: "create",
        targetType: "agent_account",
        targetId: "bulk",
        details: `代理店アカウント一括作成: ${results.length}件作成, ${skipped.length}件スキップ`,
        ipAddress: req.ip,
      });

      res.json({ created: results.length, skipped: skipped.length, results, skippedDetails: skipped });
    } catch (error: any) {
      console.error("Bulk account creation error:", error);
      res.status(500).json({ message: "一括アカウント作成に失敗しました" });
    }
  });

  // Square Payment - Process card payment
  const squarePaymentSchema = z.object({
    sourceId: z.string().min(1),
    planType: z.enum(["premium", "premium_full"]),
  });

  const PLAN_PRICES: Record<string, number> = {
    premium: 5500,
    premium_full: 5500,
  };

  app.post("/api/payments/square", requireAuth, async (req, res) => {
    try {
      const parsed = squarePaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "決済情報が不正です", errors: parsed.error.errors });
      }

      const { sourceId, planType } = parsed.data;
      const amount = PLAN_PRICES[planType];
      const description = "β版プレミアムプラン月額料金";

      const accessToken = process.env.SQUARE_ACCESS_TOKEN;
      const locationId = process.env.SQUARE_LOCATION_ID;

      if (!accessToken || !locationId) {
        return res.status(500).json({ message: "Square決済の設定が完了していません" });
      }

      const squareClient = new SquareClient({
        token: accessToken,
        environment: process.env.SQUARE_ENVIRONMENT === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
      });

      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      const payment = await storage.createPayment({
        userId: req.session.userId!,
        amount,
        currency: "JPY",
        squarePaymentId: null,
        status: "pending",
        description,
      });

      const response = await squareClient.payments.create({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(amount),
          currency: "JPY",
        },
        locationId,
      });

      const squarePaymentId = response.payment?.id || null;
      const squareStatus = response.payment?.status;
      const finalStatus = squareStatus === "COMPLETED" ? "completed" : "failed";

      await storage.updatePaymentStatus(payment.id, finalStatus, squarePaymentId);

      res.json({
        success: finalStatus === "completed",
        paymentId: payment.id,
        status: finalStatus,
      });
    } catch (error: any) {
      console.error("Square payment error:", error);
      if (error instanceof SquareError) {
        const errorCode = error.errors?.[0]?.code || "";
        const japaneseMessages: Record<string, string> = {
          "INSUFFICIENT_FUNDS": "カードの残高が不足しています。別のカードをお試しください。",
          "CARD_DECLINED": "カードが拒否されました。カード発行会社にお問い合わせください。",
          "INVALID_CARD": "カード情報が無効です。入力内容をご確認ください。",
          "CARD_EXPIRED": "カードの有効期限が切れています。",
          "CVV_FAILURE": "セキュリティコード（CVV）が正しくありません。",
          "INVALID_EXPIRATION": "有効期限が正しくありません。",
          "ADDRESS_VERIFICATION_FAILURE": "住所の確認に失敗しました。",
          "GENERIC_DECLINE": "カードが拒否されました。別のカードをお試しください。",
          "TEMPORARILY_UNAVAILABLE": "一時的にサービスが利用できません。しばらくしてから再度お試しください。",
        };
        const message = japaneseMessages[errorCode] || "カード決済に失敗しました。別のカードをお試しください。";
        return res.status(400).json({ message });
      }
      res.status(500).json({ message: "決済処理中にエラーが発生しました。しばらくしてから再度お試しください。" });
    }
  });

  // Get payment history
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByUser(req.session.userId!);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "決済履歴の取得に失敗しました" });
    }
  });

  // ===== Invoice Management (Admin) =====

  app.get("/api/admin/invoices", requireAdmin, async (_req, res) => {
    try {
      const allInvoices = await storage.getInvoices();
      res.json(allInvoices);
    } catch (error) {
      res.status(500).json({ message: "請求書一覧の取得に失敗しました" });
    }
  });

  app.get("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id as string);
      if (!invoice) return res.status(404).json({ message: "請求書が見つかりません" });
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "請求書の取得に失敗しました" });
    }
  });

  app.post("/api/admin/invoices/generate", requireAdmin, async (req, res) => {
    try {
      const { userIds, billingMonth } = req.body;
      if (!billingMonth) return res.status(400).json({ message: "請求月を指定してください" });

      const allUsers = await storage.getAllUsers();
      const targetUsers = userIds && userIds.length > 0
        ? allUsers.filter((u: any) => userIds.includes(u.id))
        : allUsers.filter((u: any) => u.role !== "admin" && u.approved && (u.plan === "premium" || u.plan === "premium_full"));

      const generated: any[] = [];
      for (const user of targetUsers) {
        const accountAmount = user.plan === "premium_full" ? 5500 : 0;
        if (accountAmount === 0) continue;

        const addedUsers = allUsers.filter((u: any) => u.addedByUserId === user.id && u.approved);
        const addedUserCount = addedUsers.length;
        const addedUserAmount = addedUserCount * 2750;
        const totalAmount = accountAmount + addedUserAmount;
        const tax = totalAmount - Math.floor(totalAmount / 1.1);
        const baseAmount = totalAmount - tax;
        const invoiceNumber = await storage.getNextInvoiceNumber();

        const [year, month] = billingMonth.split("-");
        const dueMonth = parseInt(month) + 1;
        const dueYear = dueMonth > 12 ? parseInt(year) + 1 : parseInt(year);
        const dueMonthStr = dueMonth > 12 ? 1 : dueMonth;
        const dueDate = `${dueYear}-${String(dueMonthStr).toString().padStart(2, "0")}-末日`;

        let description = `トラマッチ プレミアムプラン月額利用料（${billingMonth}）¥5,500（税込）`;
        if (addedUserCount > 0) {
          description += `\n追加ユーザー ${addedUserCount}名 × ¥2,750（税込） = ¥${addedUserAmount.toLocaleString()}`;
        }

        const invoice = await storage.createInvoice({
          invoiceNumber,
          userId: user.id,
          companyName: user.companyName,
          email: user.email,
          planType: user.plan,
          amount: baseAmount,
          tax,
          totalAmount,
          billingMonth,
          dueDate,
          description,
        });
        generated.push(invoice);
      }

      res.json({ message: `${generated.length}件の請求書を発行しました`, invoices: generated });
    } catch (error) {
      console.error("Invoice generation error:", error);
      res.status(500).json({ message: "請求書の発行に失敗しました" });
    }
  });

  app.post("/api/admin/invoices/:id/send", requireAdmin, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id as string);
      if (!invoice) return res.status(404).json({ message: "請求書が見つかりません" });

      const admins = (await storage.getAllUsers()).filter(u => u.role === "admin");
      const adminInfo = admins.find(a => a.email === "info@sinjapan.jp") || admins.find(a => a.address && a.bankName) || admins[0] || null;
      const invoiceHtml = generateInvoiceEmailHtml(invoice, adminInfo);
      const invoiceResolved = await resolveEmailTemplate(
        "invoice_send",
        { companyName: invoice.companyName || "", invoiceNumber: invoice.invoiceNumber || "", billingMonth: invoice.billingMonth || "", totalAmount: invoice.totalAmount?.toLocaleString() || "0", dueDate: invoice.dueDate || "" },
        `【トラマッチ】請求書 {{invoiceNumber}}（{{billingMonth}}）`,
        ""
      );
      const result = await sendEmail(
        invoice.email,
        invoiceResolved?.subject || `【トラマッチ】請求書（${invoice.billingMonth}）`,
        invoiceHtml
      );

      if (result.success) {
        await storage.updateInvoiceSentAt(invoice.id, new Date());
        res.json({ message: "請求書をメールで送信しました" });
      } else {
        res.status(500).json({ message: `メール送信に失敗しました: ${result.error}` });
      }
    } catch (error) {
      console.error("Invoice send error:", error);
      res.status(500).json({ message: "請求書の送信に失敗しました" });
    }
  });

  app.post("/api/admin/invoices/bulk-send", requireAdmin, async (req, res) => {
    try {
      const { invoiceIds } = req.body;
      if (!invoiceIds || invoiceIds.length === 0) return res.status(400).json({ message: "請求書を選択してください" });

      const admins = (await storage.getAllUsers()).filter(u => u.role === "admin");
      const adminInfo = admins.find(a => a.email === "info@sinjapan.jp") || admins.find(a => a.address && a.bankName) || admins[0] || null;
      let sentCount = 0;
      let failCount = 0;
      for (const id of invoiceIds) {
        const invoice = await storage.getInvoice(id);
        if (!invoice) continue;

        const invoiceHtml = generateInvoiceEmailHtml(invoice, adminInfo);
        const bulkInvoiceResolved = await resolveEmailTemplate(
          "invoice_send",
          { companyName: invoice.companyName || "", invoiceNumber: invoice.invoiceNumber || "", billingMonth: invoice.billingMonth || "", totalAmount: invoice.totalAmount?.toLocaleString() || "0", dueDate: invoice.dueDate || "" },
          `【トラマッチ】請求書 {{invoiceNumber}}（{{billingMonth}}）`,
          ""
        );
        const result = await sendEmail(
          invoice.email,
          bulkInvoiceResolved?.subject || `【トラマッチ】請求書（${invoice.billingMonth}）`,
          invoiceHtml
        );

        if (result.success) {
          await storage.updateInvoiceSentAt(invoice.id, new Date());
          sentCount++;
        } else {
          failCount++;
        }
      }

      res.json({ message: `${sentCount}件送信成功、${failCount}件失敗` });
    } catch (error) {
      res.status(500).json({ message: "一括送信に失敗しました" });
    }
  });

  app.patch("/api/admin/invoices/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["unpaid", "paid", "overdue", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "無効なステータスです" });
      }
      const paidAt = status === "paid" ? new Date() : undefined;
      const invoice = await storage.updateInvoiceStatus(req.params.id as string, status, paidAt);
      if (!invoice) return res.status(404).json({ message: "請求書が見つかりません" });
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "ステータスの更新に失敗しました" });
    }
  });

  app.delete("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteInvoice(req.params.id as string);
      if (!deleted) return res.status(404).json({ message: "請求書が見つかりません" });
      res.json({ message: "請求書を削除しました" });
    } catch (error) {
      res.status(500).json({ message: "請求書の削除に失敗しました" });
    }
  });

  // Sitemap.xml - dynamic generation
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const baseUrl = `${_req.protocol}://${_req.get("host")}`;
      const articles = await storage.getPublishedSeoArticles();

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "daily" },
        { loc: "/cargo", priority: "0.9", changefreq: "hourly" },
        { loc: "/trucks", priority: "0.9", changefreq: "hourly" },
        { loc: "/column", priority: "0.8", changefreq: "daily" },
        { loc: "/column/kyukakyusha", priority: "0.9", changefreq: "daily" },
        { loc: "/column/truck-order", priority: "0.9", changefreq: "daily" },
        { loc: "/column/carrier-sales", priority: "0.9", changefreq: "daily" },
        { loc: "/guide/kyukakyusha-complete", priority: "1.0", changefreq: "weekly" },
        { loc: "/compare/kyukakyusha-sites", priority: "0.9", changefreq: "monthly" },
        { loc: "/alternative/trabox", priority: "0.9", changefreq: "monthly" },
        { loc: "/guide", priority: "0.5", changefreq: "monthly" },
        { loc: "/faq", priority: "0.5", changefreq: "monthly" },
        { loc: "/contact", priority: "0.4", changefreq: "monthly" },
        { loc: "/company-info", priority: "0.4", changefreq: "monthly" },
        { loc: "/terms", priority: "0.3", changefreq: "yearly" },
        { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
        { loc: "/login", priority: "0.6", changefreq: "monthly" },
        { loc: "/register", priority: "0.6", changefreq: "monthly" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      for (const article of articles) {
        const lastmod = new Date(article.createdAt).toISOString().split("T")[0];
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/column/${encodeURIComponent(article.slug)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).send("Sitemap generation failed");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (_req, res) => {
    const baseUrl = `${_req.protocol}://${_req.get("host")}`;
    const content = [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /admin/*",
      "Disallow: /home",
      "Disallow: /my-cargo",
      "Disallow: /my-trucks",
      "Disallow: /completed-cargo",
      "Disallow: /cancelled-cargo",
      "Disallow: /partners",
      "Disallow: /transport-ledger",
      "Disallow: /payment",
      "Disallow: /services",
      "Disallow: /settings",
      "",
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join("\n");
    res.set("Content-Type", "text/plain");
    res.send(content);
  });

  return httpServer;
}
