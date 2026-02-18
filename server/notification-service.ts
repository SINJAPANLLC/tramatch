import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getEmailTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  const transport = getEmailTransporter();
  if (!transport) {
    return { success: false, error: "メール設定が未構成です" };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@tramatch.jp";

  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });
    return { success: true };
  } catch (err: any) {
    console.error("Email send error:", err);
    return { success: false, error: err.message };
  }
}

export async function sendLineMessage(
  lineUserId: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return { success: false, error: "LINE設定が未構成です" };
  }

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
