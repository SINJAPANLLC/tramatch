import OpenAI from "openai";
import { google } from "googleapis";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  ...(process.env.OPENAI_API_KEY ? {} : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL } : {}),
});

const TEMP_DIR = "/tmp/youtube-auto";

const VIDEO_TOPICS = [
  "求荷求車マッチングサービスとは？仕組みとメリットを解説",
  "空車を有効活用して売上を伸ばす方法",
  "荷主が信頼できる運送会社を見つけるコツ",
  "トラマッチで配車業務を効率化する方法",
  "2024年問題と運送業界のこれから",
  "物流コスト削減の最新テクニック",
  "帰り便活用で利益率を上げる方法",
  "運送会社が案件を獲得するための営業戦略",
  "求荷求車サイトの選び方と比較ポイント",
  "トラック運送業のDX化で業務を改善",
  "共同配送のメリットとデメリット",
  "チャーター便と混載便の使い分け方",
  "中小運送会社が生き残るための戦略",
  "物流業界の最新トレンドと将来展望",
  "燃料費高騰時代のコスト管理術",
  "配車計画をAIで最適化する方法",
  "運送契約の基礎知識と注意すべきポイント",
  "食品輸送における温度管理の重要性",
  "グリーン物流の推進と環境対策",
  "トラマッチの登録から利用開始までの流れ",
  "運送業界で差別化を図るブランディング術",
  "繁忙期の配車不足を解消するテクニック",
  "荷主と運送会社のWin-Winな関係づくり",
  "物流倉庫の選び方と効率的な在庫管理",
  "トラック運送業の開業に必要な許認可ガイド",
  "長距離輸送のコスト最適化テクニック",
  "求荷求車プラットフォームで売上アップした事例",
  "運送業の安全管理と事故防止対策",
  "AIを活用した次世代マッチングの仕組み",
  "運送業界の労働環境改善に向けた取り組み",
];

const SITE_URL = "https://tramatch-sinjapan.com";

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

function cleanupFiles(...files: string[]) {
  for (const f of files) {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
  }
}

export async function generateVideoScript(topic: string): Promise<{ title: string; script: string; description: string; tags: string[] }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `あなたは物流・運送業界の専門YouTubeチャンネル「トラマッチ公式」の台本作成者です。
視聴者は運送会社の経営者、配車担当者、荷主企業の物流担当者です。
トラマッチは求荷求車マッチングプラットフォームで、荷主と運送会社を効率的にマッチングするサービスです。
サイトURL: ${SITE_URL}`,
      },
      {
        role: "user",
        content: `以下のトピックでYouTube動画の台本を作成してください。
YouTubeアルゴリズムで評価される8〜12分の動画に最適化してください。

トピック: ${topic}

以下のJSON形式で出力してください:
{
  "title": "YouTube動画のタイトル（30文字以内、検索されやすく興味を引くもの。数字や疑問形を活用）",
  "script": "ナレーション台本（3000〜4000文字。以下の構成で:\n1. フック（最初の30秒で視聴者を引きつける問いかけや衝撃的な事実）\n2. チャンネル紹介（トラマッチ公式チャンネルです、と簡潔に）\n3. 本題（3〜5つのポイントに分けて詳しく解説。具体例や数字を交えて）\n4. 実践的なアドバイス（すぐに使える具体的なノウハウ）\n5. まとめ（要点を簡潔に振り返り）\n6. CTA（チャンネル登録・概要欄のトラマッチリンクへの誘導）\n自然な話し言葉で、「では」「さて」「ここで重要なのが」など接続詞を使って聞きやすく。「トラマッチ」への誘導は本題の中で2〜3回自然に含める）",
  "description": "YouTube概要欄のテキスト（500〜800文字。動画の要約、タイムスタンプ（00:00形式で章立て）、関連キーワード、トラマッチへのリンク・CTA含む）",
  "tags": ["関連タグ8〜12個。検索ボリュームを意識"]
}

概要欄には必ず以下を含めてください:
━━━━━━━━━━━━━━━━━
▼ トラマッチ公式サイト
${SITE_URL}

▼ 無料会員登録はこちら
${SITE_URL}/register

▼ お役立ちコラム記事
${SITE_URL}/column

▼ 求荷求車完全ガイド
${SITE_URL}/guide/kyukakyusha-complete
━━━━━━━━━━━━━━━━━`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("GPTからの応答がありません");

  return JSON.parse(content);
}

export async function generateAudio(script: string, jobId: string): Promise<string> {
  ensureTempDir();
  const audioPath = path.join(TEMP_DIR, `${jobId}.mp3`);

  const chunks: string[] = [];
  let remaining = script;
  while (remaining.length > 0) {
    if (remaining.length <= 4000) {
      chunks.push(remaining);
      break;
    }
    let splitAt = remaining.lastIndexOf("。", 4000);
    if (splitAt === -1 || splitAt < 2000) splitAt = 4000;
    else splitAt += 1;
    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt);
  }

  if (chunks.length === 1) {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: chunks[0],
      speed: 0.95,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(audioPath, buffer);
  } else {
    const chunkPaths: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(TEMP_DIR, `${jobId}_chunk${i}.mp3`);
      const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "nova",
        input: chunks[i],
        speed: 0.95,
      });
      const buffer = Buffer.from(await mp3.arrayBuffer());
      fs.writeFileSync(chunkPath, buffer);
      chunkPaths.push(chunkPath);
    }

    const listPath = path.join(TEMP_DIR, `${jobId}_list.txt`);
    fs.writeFileSync(listPath, chunkPaths.map((p) => `file '${p}'`).join("\n"));
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${audioPath}"`, { timeout: 60000 });

    cleanupFiles(listPath, ...chunkPaths);
  }

  return audioPath;
}

export async function generateVideo(audioPath: string, title: string, jobId: string): Promise<string> {
  ensureTempDir();
  const videoPath = path.join(TEMP_DIR, `${jobId}.mp4`);

  const escapedTitle = title.replace(/'/g, "'\\''").replace(/:/g, "\\:");
  const escapedBrand = "トラマッチ公式チャンネル".replace(/'/g, "'\\''");
  const escapedCta = "詳しくは概要欄のリンクから".replace(/'/g, "'\\''");

  const duration = getDuration(audioPath);

  const filterComplex = [
    `color=c=#0d9488:s=1920x1080:d=${duration}[bg]`,
    `[bg]drawtext=text='${escapedTitle}':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2-60:font=Noto Sans CJK JP[t1]`,
    `[t1]drawtext=text='${escapedBrand}':fontcolor=#99f6e4:fontsize=32:x=(w-text_w)/2:y=(h-text_h)/2+40:font=Noto Sans CJK JP[t2]`,
    `[t2]drawtext=text='${escapedCta}':fontcolor=#ccfbf1:fontsize=28:x=(w-text_w)/2:y=h-100:font=Noto Sans CJK JP`,
  ].join(";");

  const cmd = `ffmpeg -y -f lavfi -i "${filterComplex}" -i "${audioPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${videoPath}" 2>&1`;

  try {
    execSync(cmd, { timeout: 300000 });
  } catch (error: any) {
    console.error("ffmpeg error:", error?.message?.substring(0, 500));
    throw new Error("動画生成に失敗しました");
  }

  return videoPath;
}

function getDuration(audioPath: string): number {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`,
      { timeout: 10000 }
    ).toString().trim();
    return Math.ceil(parseFloat(result));
  } catch {
    return 120;
  }
}

export async function uploadToYoutube(
  videoPath: string,
  title: string,
  description: string,
  tags: string[]
): Promise<string> {
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("YouTube OAuth認証情報が設定されていません（YOUTUBE_OAUTH_CLIENT_ID, YOUTUBE_OAUTH_CLIENT_SECRET, YOUTUBE_OAUTH_REFRESH_TOKEN）");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: "22",
        defaultLanguage: "ja",
        defaultAudioLanguage: "ja",
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = response.data.id;
  if (!videoId) throw new Error("YouTube動画IDが取得できませんでした");

  return videoId;
}

export async function processAutoPublishJob(jobId: string): Promise<void> {
  try {
    await updateJobStatus(jobId, "generating_script");

    const job = await storage.getYoutubeAutoPublishJob(jobId);
    if (!job) throw new Error("ジョブが見つかりません");

    const scriptData = await generateVideoScript(job.topic);
    await updateJobFields(jobId, {
      script: scriptData.script,
      youtubeTitle: scriptData.title,
      youtubeDescription: scriptData.description,
      status: "generating_audio",
    });

    const audioPath = await generateAudio(scriptData.script, jobId);
    await updateJobFields(jobId, {
      audioUrl: audioPath,
      status: "generating_video",
    });

    const videoPath = await generateVideo(audioPath, scriptData.title, jobId);
    await updateJobFields(jobId, {
      videoUrl: videoPath,
      status: "uploading",
    });

    const youtubeVideoId = await uploadToYoutube(
      videoPath,
      scriptData.title,
      scriptData.description,
      scriptData.tags
    );

    await updateJobFields(jobId, {
      youtubeVideoId,
      status: "completed",
    });
    await storage.completeYoutubeAutoPublishJob(jobId);

    await storage.upsertYoutubeVideo({
      videoId: youtubeVideoId,
      title: scriptData.title,
      description: scriptData.description,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
      publishedAt: new Date(),
      channelTitle: "トラマッチ公式",
      duration: null,
      viewCount: 0,
      isVisible: true,
    });

    cleanupFiles(audioPath, videoPath);
    console.log(`[YouTube Auto] Job ${jobId} completed: ${youtubeVideoId}`);
  } catch (error: any) {
    console.error(`[YouTube Auto] Job ${jobId} failed:`, error?.message);
    await updateJobFields(jobId, {
      status: "failed",
      errorMessage: error?.message || "不明なエラー",
    });
  }
}

async function updateJobStatus(jobId: string, status: string) {
  await storage.updateYoutubeAutoPublishJob(jobId, { status });
}

async function updateJobFields(jobId: string, fields: Record<string, any>) {
  await storage.updateYoutubeAutoPublishJob(jobId, fields);
}

export async function runDailyAutoPublish(): Promise<{ started: number; topics: string[] }> {
  const usedTopics = await storage.getRecentAutoPublishTopics(30);
  const availableTopics = VIDEO_TOPICS.filter((t) => !usedTopics.includes(t));

  if (availableTopics.length === 0) {
    console.log("[YouTube Auto] No more unique topics available");
    return { started: 0, topics: [] };
  }

  const todayTopics = availableTopics.slice(0, 3);
  const jobIds: string[] = [];

  for (const topic of todayTopics) {
    const job = await storage.createYoutubeAutoPublishJob({ topic, status: "pending" });
    jobIds.push(job.id);
  }

  for (const jobId of jobIds) {
    processAutoPublishJob(jobId).catch((err) =>
      console.error(`[YouTube Auto] Background job ${jobId} error:`, err?.message)
    );
  }

  return { started: todayTopics.length, topics: todayTopics };
}

export function scheduleAutoPublish() {
  const runAt = 9;
  
  function scheduleNext() {
    const now = new Date();
    const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const next = new Date(jst);
    next.setHours(runAt, 0, 0, 0);
    if (next <= jst) {
      next.setDate(next.getDate() + 1);
    }

    const delay = next.getTime() - jst.getTime();
    console.log(`[YouTube Auto] Next auto-publish scheduled in ${Math.round(delay / 1000 / 60)} minutes (${next.toISOString()})`);

    setTimeout(async () => {
      try {
        console.log("[YouTube Auto] Starting daily auto-publish...");
        const result = await runDailyAutoPublish();
        console.log(`[YouTube Auto] Started ${result.started} jobs:`, result.topics);
      } catch (error: any) {
        console.error("[YouTube Auto] Scheduler error:", error?.message);
      }
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}
