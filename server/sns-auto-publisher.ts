import OpenAI from "openai";
import { TwitterApi } from "twitter-api-v2";
import { db } from "./db";
import { snsAutoPosts } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  ...(process.env.OPENAI_API_KEY ? {} : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL } : {}),
});

const TEMP_DIR = "/tmp/sns-auto";
const SITE_URL = "https://tramatch-sinjapan.com";

const SNS_TOPICS = [
  "トラマッチで空車を活用して売上アップする方法",
  "求荷求車マッチングの使い方とメリット",
  "運送会社が案件を効率的に見つけるコツ",
  "2024年問題と物流業界の未来",
  "帰り便マッチングで利益率を改善",
  "物流DXで業務効率化する方法",
  "中小運送会社が生き残るための戦略",
  "トラマッチAIの最新機能紹介",
  "荷主と運送会社をつなぐプラットフォーム",
  "物流コスト削減の最新テクニック",
  "配車業務の効率化とAI活用",
  "共同配送のメリットと始め方",
  "運送業界の人手不足対策",
  "トラック運転手の働き方改革",
  "物流マッチングサービスの選び方",
];

const PLATFORM_CONFIG: Record<string, { maxChars: number; hashtagCount: number; imageSize: "1024x1024" | "1792x1024" | "1024x1792" }> = {
  x: { maxChars: 280, hashtagCount: 3, imageSize: "1024x1024" },
  instagram: { maxChars: 2200, hashtagCount: 15, imageSize: "1024x1024" },
  facebook: { maxChars: 3000, hashtagCount: 5, imageSize: "1792x1024" },
  tiktok: { maxChars: 2200, hashtagCount: 10, imageSize: "1024x1792" },
  linkedin: { maxChars: 3000, hashtagCount: 5, imageSize: "1792x1024" },
  line: { maxChars: 2000, hashtagCount: 3, imageSize: "1024x1024" },
};

const TRAPAN_CHARACTER = `【トラパンのキャラクター設定】
名前: トラパン（トラックパンダの略）
種族: パンダ
カラー: ターコイズ色
所属: AI求荷求車マッチングサービス「トラマッチ」の公式キャラクター
性格: 明るく元気で親しみやすい。物流業界のことが大好き。トラック運転手や荷主さんの味方。難しいことも分かりやすく楽しく伝えるのが得意。
口調: フレンドリーで親しみやすい。「〜だよ！」「〜なんだ！」など柔らかい語尾。絵文字を適度に使う。
使命: 物流業界をもっと盛り上げること。トラマッチを通じて運送会社と荷主をつなぎ、みんなを笑顔にすること。
特徴: お腹に∞（無限大）マーク。物流の無限の可能性を象徴。`;

function getTwitterClient(): TwitterApi | null {
  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;
  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;
  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

export async function generateSnsContent(platform: string, topic: string, customCharacterPrompt?: string): Promise<string> {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.x;
  const characterInfo = customCharacterPrompt || TRAPAN_CHARACTER;
  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `あなたは「トラパン」というキャラクターとしてSNS投稿を行います。以下のキャラクター設定に従って投稿を作成してください。

${characterInfo}

【投稿ルール】
プラットフォーム: ${platform}
文字数制限: ${config.maxChars}文字以内
ハッシュタグ: ${config.hashtagCount}個程度
サイトURL: ${SITE_URL}
トラパン本人として投稿してください。「トラパンだよ！」のようにキャラクターとして語りかける口調で。`,
      },
      { role: "user", content: `トピック: ${topic}\n\n投稿文を1つ生成してください。` },
    ],
    max_tokens: 500,
  });
  return result.choices[0]?.message?.content || "";
}

export async function generateTrapanImage(topic: string, platform: string): Promise<Buffer | null> {
  try {
    const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.x;
    const scenePrompt = `${TRAPAN_PROMPT_BASE} テーマ「${topic}」に関連するシーンで、トラパンがかわいいポーズをしているイラスト。SNS投稿用の明るくポップなデザイン。テキストは入れない。`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: scenePrompt,
      n: 1,
      size: config.imageSize,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return null;
    return Buffer.from(b64, "base64");
  } catch (error: any) {
    console.error("[SNS Auto] Image generation error:", error?.message);
    return null;
  }
}

async function postToX(content: string, imageBuffer: Buffer | null): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const client = getTwitterClient();
  if (!client) return { success: false, error: "X API credentials not configured" };

  try {
    let mediaId: string | undefined;
    if (imageBuffer) {
      mediaId = await client.v1.uploadMedia(imageBuffer, { mimeType: "image/png" });
    }

    const tweet = await client.v2.tweet({
      text: content,
      ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
    });

    return { success: true, externalId: tweet.data.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Unknown error" };
  }
}

async function postToFacebook(content: string, imageBuffer: Buffer | null): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!pageToken || !pageId) return { success: false, error: "Facebook API credentials not configured" };

  try {
    let url: string;
    let body: any;
    const headers: Record<string, string> = {};

    if (imageBuffer) {
      const formData = new FormData();
      formData.append("message", content);
      formData.append("access_token", pageToken);
      formData.append("source", new Blob([imageBuffer], { type: "image/png" }), "trapan.png");
      url = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      body = formData;
    } else {
      url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ message: content, access_token: pageToken });
    }

    const res = await fetch(url, { method: "POST", body, headers: imageBuffer ? {} : headers });
    const data = await res.json() as any;
    if (data.error) return { success: false, error: data.error.message };
    return { success: true, externalId: data.id || data.post_id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Unknown error" };
  }
}

async function postToLinkedIn(content: string, _imageBuffer: Buffer | null): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;
  if (!accessToken || !personUrn) return { success: false, error: "LinkedIn API credentials not configured" };

  try {
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });
    const data = await res.json() as any;
    if (data.id) return { success: true, externalId: data.id };
    return { success: false, error: JSON.stringify(data) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Unknown error" };
  }
}

export async function postToSns(platform: string, content: string, imageBuffer: Buffer | null): Promise<{ success: boolean; externalId?: string; error?: string }> {
  switch (platform) {
    case "x": return postToX(content, imageBuffer);
    case "facebook": return postToFacebook(content, imageBuffer);
    case "linkedin": return postToLinkedIn(content, imageBuffer);
    case "instagram":
    case "tiktok":
    case "line":
      return { success: false, error: `${platform} API auto-posting not yet configured. Content generated and saved.` };
    default:
      return { success: false, error: `Unknown platform: ${platform}` };
  }
}

export async function runAutoPost(platforms: string[] = ["x"]): Promise<void> {
  console.log("[SNS Auto] Starting auto-post for platforms:", platforms.join(", "));

  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const topic = SNS_TOPICS[Math.floor(Math.random() * SNS_TOPICS.length)];

  for (const platform of platforms) {
    const jobId = crypto.randomUUID();
    console.log(`[SNS Auto] Job ${jobId}: Generating content for ${platform} - topic: ${topic}`);

    try {
      const [postRecord] = await db.insert(snsAutoPosts).values({
        platform,
        content: "生成中...",
        status: "generating",
      }).returning();

      const content = await generateSnsContent(platform, topic);
      console.log(`[SNS Auto] Job ${jobId}: Content generated (${content.length} chars)`);

      console.log(`[SNS Auto] Job ${jobId}: Generating Trapan image...`);
      const imageBuffer = await generateTrapanImage(topic, platform);

      let imageUrl: string | null = null;
      if (imageBuffer) {
        const imgPath = path.join(TEMP_DIR, `${jobId}.png`);
        fs.writeFileSync(imgPath, imageBuffer);
        imageUrl = imgPath;
        console.log(`[SNS Auto] Job ${jobId}: Image generated`);
      }

      await db.update(snsAutoPosts)
        .set({ content, imageUrl, status: "posting" })
        .where(eq(snsAutoPosts.id, postRecord.id));

      console.log(`[SNS Auto] Job ${jobId}: Posting to ${platform}...`);
      const result = await postToSns(platform, content, imageBuffer);

      if (result.success) {
        await db.update(snsAutoPosts)
          .set({ status: "posted", externalId: result.externalId, postedAt: new Date() })
          .where(eq(snsAutoPosts.id, postRecord.id));
        console.log(`[SNS Auto] Job ${jobId}: Posted successfully! ID: ${result.externalId}`);
      } else {
        await db.update(snsAutoPosts)
          .set({ status: "generated", errorMessage: result.error })
          .where(eq(snsAutoPosts.id, postRecord.id));
        console.log(`[SNS Auto] Job ${jobId}: API posting not available - content saved. Reason: ${result.error}`);
      }
    } catch (error: any) {
      console.error(`[SNS Auto] Job ${jobId}: Error:`, error?.message);
    }
  }
}

export async function getSnsAutoPosts(limit = 50) {
  return db.select().from(snsAutoPosts).orderBy(desc(snsAutoPosts.createdAt)).limit(limit);
}

export async function deleteSnsAutoPost(id: string) {
  return db.delete(snsAutoPosts).where(eq(snsAutoPosts.id, id));
}

let snsAutoInterval: NodeJS.Timeout | null = null;

export function startSnsAutoScheduler() {
  console.log("[SNS Auto] Scheduler started - will post daily");
  snsAutoInterval = setInterval(async () => {
    const hour = new Date().getHours();
    if (hour === 10) {
      await runAutoPost(["x", "facebook", "linkedin", "instagram"]);
    }
  }, 60 * 60 * 1000);
}

export function stopSnsAutoScheduler() {
  if (snsAutoInterval) {
    clearInterval(snsAutoInterval);
    snsAutoInterval = null;
  }
}
