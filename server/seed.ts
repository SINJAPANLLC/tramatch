import { db } from "./db";
import { users, notificationTemplates } from "@shared/schema";
import { sql, eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  const existingUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  if (Number(existingUsers[0].count) === 0) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminPassword2 = await bcrypt.hash("Kazuya8008", 10);
    await db.insert(users).values([
      {
        username: "admin",
        password: adminPassword,
        companyName: "トラマッチ運営",
        phone: "03-0000-0000",
        email: "admin@tramatch-sinjapan.com",
        userType: "admin",
        role: "admin",
        approved: true,
      },
      {
        username: "sinjapan",
        password: adminPassword2,
        companyName: "SIN JAPAN",
        phone: "03-0000-0001",
        email: "info@sinjapan.jp",
        userType: "admin",
        role: "admin",
        approved: true,
      },
    ]);
    console.log("Admin users created");
  } else {
    console.log("Database already has users, skipping seed.");
  }

  await seedEmailTemplates();
}

const defaultEmailTemplates = [
  {
    category: "auto_reply",
    channel: "email",
    name: "パスワードリセット",
    subject: "【トラマッチ】パスワードリセットのご案内",
    body: `{{companyName}} 様

以下のリンクからパスワードをリセットしてください。
このリンクは1時間有効です。

{{resetUrl}}

※このメールに心当たりがない場合は無視してください。

トラマッチ運営事務局`,
    triggerEvent: "password_reset",
  },
  {
    category: "auto_notification",
    channel: "email",
    name: "取引先招待",
    subject: "【トラマッチ】取引先招待のご案内",
    body: `{{companyName}}様よりトラマッチへの招待が届いています。

{{companyName}}様があなたを取引先として招待しました。
以下のリンクからトラマッチに登録して、取引を開始しましょう。

{{registerUrl}}

トラマッチ - 求荷求車マッチングプラットフォーム
{{appBaseUrl}}`,
    triggerEvent: "partner_invite",
  },
  {
    category: "auto_notification",
    channel: "email",
    name: "配車依頼書（荷主向け）",
    subject: "【トラマッチ】{{senderName}}より配車依頼書が届きました",
    body: `{{senderName}} 様より配車依頼書が届きました。

以下の内容をご確認ください。

※配車依頼書の詳細データはシステムより自動挿入されます。`,
    triggerEvent: "dispatch_request_shipper",
  },
  {
    category: "auto_notification",
    channel: "email",
    name: "配車依頼書（運送会社向け）",
    subject: "【トラマッチ】{{senderName}}より配車依頼書が届きました",
    body: `{{senderName}} 様より配車依頼書が届きました。

以下の内容をご確認ください。

※配車依頼書の詳細データはシステムより自動挿入されます。`,
    triggerEvent: "dispatch_request_transport",
  },
  {
    category: "auto_notification",
    channel: "email",
    name: "新着案件通知",
    subject: "【トラマッチ】新しい荷物が登録されました",
    body: `新しい荷物案件が登録されました。

出発地: {{departureArea}}
到着地: {{arrivalArea}}
荷物種類: {{cargoType}}
重量: {{weight}}
登録会社: {{companyName}}

トラマッチにログインして詳細をご確認ください。
{{appBaseUrl}}

トラマッチ運営事務局`,
    triggerEvent: "cargo_new",
  },
  {
    category: "auto_notification",
    channel: "email",
    name: "新着空車通知",
    subject: "【トラマッチ】新しい空車が登録されました",
    body: `新しい空車情報が登録されました。

現在地: {{currentArea}}
行先: {{destinationArea}}
車両タイプ: {{vehicleType}}
積載量: {{maxWeight}}
登録会社: {{companyName}}

トラマッチにログインして詳細をご確認ください。
{{appBaseUrl}}

トラマッチ運営事務局`,
    triggerEvent: "truck_new",
  },
  {
    category: "auto_notification",
    channel: "email",
    name: "請求書送信",
    subject: "【トラマッチ】請求書 {{invoiceNumber}}（{{billingMonth}}）",
    body: `{{companyName}} 御中

いつもトラマッチをご利用いただきありがとうございます。
請求書をお送りいたします。

請求書番号: {{invoiceNumber}}
請求月: {{billingMonth}}
合計金額（税込）: ¥{{totalAmount}}
お支払い期限: {{dueDate}}

※請求書の詳細データはシステムより自動挿入されます。

合同会社SIN JAPAN
トラマッチ運営事務局`,
    triggerEvent: "invoice_send",
  },
];

async function seedEmailTemplates() {
  for (const tmpl of defaultEmailTemplates) {
    const existing = await db.select().from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.channel, tmpl.channel),
        eq(notificationTemplates.triggerEvent, tmpl.triggerEvent)
      ));

    if (existing.length === 0) {
      await db.insert(notificationTemplates).values(tmpl);
      console.log(`Email template seeded: ${tmpl.name}`);
    }
  }
}
