import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function createTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: false,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    tls: { rejectUnauthorized: false },
  });
}

function getEmailTransporter(): nodemailer.Transporter | null {
  if (!transporter) transporter = createTransporter();
  return transporter;
}

function resetTransporter(): nodemailer.Transporter | null {
  try { transporter?.close?.(); } catch (_) {}
  transporter = createTransporter();
  return transporter;
}

function wrapInEmailTemplate(subject: string, bodyText: string): string {
  const bodyHtml = bodyText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#0d9488;text-decoration:underline;word-break:break-all;">$1</a>')
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${subject}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP','Yu Gothic',Meiryo,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 16px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

<tr>
<td style="background-color:#0d9488;padding:20px 24px;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px;text-align:center;">
トラマッチ
</td>
</tr>
<tr>
<td style="color:rgba(255,255,255,0.85);font-size:11px;text-align:center;padding-top:2px;">
TRAMATCH
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:32px 24px 24px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="color:#18181b;font-size:15px;line-height:1.8;word-break:break-word;">
${bodyHtml}
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 24px 24px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e4e4e7;">
<tr>
<td style="padding-top:20px;color:#71717a;font-size:11px;line-height:1.6;text-align:center;">
本メールはトラマッチから自動送信されています。<br>
心当たりのない場合はお手数ですが本メールを破棄してください。<br><br>
合同会社SIN JAPAN<br>
<a href="https://tramatch-sinjapan.com" style="color:#0d9488;text-decoration:none;">tramatch-sinjapan.com</a>
</td>
</tr>
</table>
</td>
</tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}

const CONNECTION_ERRORS = ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EPIPE", "ENOTFOUND", "connection timeout", "socket timeout", "greeting never received"];

function isConnectionError(err: any): boolean {
  const msg = (err?.message || err?.code || "").toLowerCase();
  return CONNECTION_ERRORS.some(e => msg.includes(e.toLowerCase()));
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  { fresh = false }: { fresh?: boolean } = {},
): Promise<{ success: boolean; error?: string }> {
  let transport = fresh ? resetTransporter() : getEmailTransporter();
  if (!transport) return { success: false, error: "メール設定が未構成です" };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@tramatch-sinjapan.com";
  const isAlreadyHtml = /<\/?(?:div|table|tr|td|h[1-6]|p|br|a|span|img)\b/i.test(body);

  const mailOptions = isAlreadyHtml
    ? {
        from, to, subject,
        text: body.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        html: body,
      }
    : {
        from, to, subject,
        text: body,
        html: wrapInEmailTemplate(subject, body),
      };

  try {
    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (err: any) {
    if (isConnectionError(err)) {
      console.warn(`[Email] 接続エラー、コネクションをリセットして再試行: ${err.message}`);
      await new Promise(r => setTimeout(r, 5000));
      transport = resetTransporter();
      if (!transport) return { success: false, error: "メール設定が未構成です" };
      try {
        await transport.sendMail(mailOptions);
        return { success: true };
      } catch (retryErr: any) {
        console.error("[Email] 再試行も失敗:", retryErr.message);
        return { success: false, error: retryErr.message };
      }
    }
    console.error("Email send error:", err);
    return { success: false, error: err.message };
  }
}

export async function sendLineMessage(
  lineUserId: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return { success: false, error: "LINE設定が未構成です" };

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{ type: "text", text: message }],
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("LINE API error:", res.status, errorBody);
      return { success: false, error: `LINE API error: ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("LINE send error:", err);
    return { success: false, error: err.message };
  }
}

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function isLineConfigured(): boolean {
  return !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
}

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
}
