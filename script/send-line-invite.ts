import { db } from "../server/db";
import { users, notificationTemplates } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail, replaceTemplateVariables } from "../server/notification-service";

async function main() {
  console.log("📨 公式LINE友達追加メール 全ユーザー一括送信 開始");

  const [template] = await db
    .select()
    .from(notificationTemplates)
    .where(
      and(
        eq(notificationTemplates.triggerEvent, "line_add_invite"),
        eq(notificationTemplates.channel, "email"),
        eq(notificationTemplates.isActive, true)
      )
    );

  if (!template) {
    console.error("❌ テンプレート 'line_add_invite' が見つかりません");
    process.exit(1);
  }

  console.log(`✅ テンプレート確認: ${template.name}`);
  console.log(`   件名: ${template.subject}`);

  const allUsers = await db
    .select()
    .from(users)
    .where(eq(users.approved, true));

  const targets = allUsers.filter(u => u.email);
  console.log(`📋 送信対象: ${targets.length} 件`);

  let sent = 0;
  let failed = 0;

  for (const user of targets) {
    const vars: Record<string, string> = {
      companyName: user.companyName || user.email || "お客様",
      userName: user.email || "",
      appBaseUrl: process.env.APP_BASE_URL || "https://tramatch-sinjapan.com",
    };

    const subject = replaceTemplateVariables(template.subject || "", vars);
    const body = replaceTemplateVariables(template.body || "", vars);

    try {
      const fresh = (sent + failed) > 0 && (sent + failed) % 20 === 0;
      const result = await sendEmail(user.email!, subject, body, { fresh });
      if (result.success) {
        sent++;
        console.log(`✅ [${sent}/${targets.length}] ${user.email}`);
      } else {
        failed++;
        console.error(`❌ 失敗: ${user.email} - ${result.error}`);
      }
    } catch (err) {
      failed++;
      console.error(`❌ エラー: ${user.email}`, err);
    }

    if (sent + failed < targets.length) {
      await new Promise(r => setTimeout(r, 12000));
    }
  }

  console.log(`\n🎉 送信完了: 成功${sent}件 / 失敗${failed}件`);
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
