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
const SITE_URL = "https://tramatch-sinjapan.com";

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

interface VideoSection {
  title: string;
  narration: string;
  keyPoint: string;
  imagePrompt: string;
}

interface EnhancedVideoScript {
  title: string;
  sections: VideoSection[];
  description: string;
  tags: string[];
  thumbnailPrompt: string;
}

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

function cleanupFiles(...files: string[]) {
  for (const f of files) {
    try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch {}
  }
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

function findJapaneseFont(): string | null {
  const candidates = [
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/google-noto-cjk/NotoSansCJKjp-Regular.otf",
    "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf",
    "/usr/share/fonts/truetype/takao-gothic/TakaoGothic.ttf",
    "/usr/share/fonts/truetype/vlgothic/VL-Gothic-Regular.ttf",
    "/usr/share/fonts/OTF/NotoSansCJKjp-Bold.otf",
    "/usr/share/fonts/TTF/NotoSansCJKjp-Bold.ttf",
  ];
  for (const f of candidates) {
    if (fs.existsSync(f)) return f;
  }
  try {
    const result = execSync("fc-list :lang=ja -f '%{file}\\n' 2>/dev/null | head -1", { timeout: 5000 }).toString().trim();
    if (result && fs.existsSync(result)) return result;
  } catch {}
  return null;
}

export async function generateVideoScript(topic: string): Promise<EnhancedVideoScript> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `あなたは物流・運送業界の専門YouTubeチャンネル「トラマッチ公式」の台本作成者です。
視聴者は運送会社の経営者、配車担当者、荷主企業の物流担当者です。
トラマッチは求荷求車マッチングプラットフォームで、荷主と運送会社を効率的にマッチングするサービスです。
サイトURL: ${SITE_URL}

【重要：構造化された台本ルール】
- 動画は5つのセクションで構成する（オープニング含む）
- 各セクションは独立したスライド画像と共に表示される
- 各セクションのナレーションは600〜800文字程度
- 台本は音声合成（TTS）で読み上げられるため：
  - 句読点を適切に使い、文を短くする
  - 「、」で適度に息継ぎポイントを作る
  - 数字は算用数字で書く
  - フィラーは入れない
  - 自然で落ち着いた話し言葉で`,
      },
      {
        role: "user",
        content: `以下のトピックでYouTube動画の構造化された台本を作成してください。
8〜12分の動画に最適化してください。

トピック: ${topic}

以下のJSON形式で出力してください:
{
  "title": "YouTube動画のタイトル（30文字以内、数字や疑問形で興味を引く）",
  "sections": [
    {
      "title": "セクションタイトル（例: オープニング）",
      "narration": "このセクションのナレーション台本（600〜800文字）",
      "keyPoint": "画面に表示するキーポイント（20文字以内の短いフレーズ）",
      "imagePrompt": "このセクションの背景画像を生成するための英語プロンプト。物流・トラック・倉庫・ビジネスに関連する、プロフェッショナルで高品質な写真風イメージ。テキストは含めない。例: Professional photo of modern logistics warehouse with trucks loading at dock, warm lighting, clean composition"
    }
  ],
  "description": "YouTube概要欄（500〜800文字。動画要約、タイムスタンプ00:00形式、トラマッチリンク含む）",
  "tags": ["関連タグ8〜12個"],
  "thumbnailPrompt": "サムネイル画像の英語プロンプト。目を引く、インパクトのある物流関連の画像。テキストは含めない。例: Dramatic aerial view of highway interchange with trucks, golden hour lighting, cinematic composition"
}

セクション構成ガイド:
1. オープニング - 視聴者を引きつけるフック、衝撃的な事実や問いかけ
2. 課題提起 - 業界の課題や問題点を具体的な数字で説明
3. 解決策 - 具体的な解決方法やテクニック（トラマッチの活用も含む）
4. 実践例 - 実際の活用事例やケーススタディ
5. まとめ＆CTA - 要点整理、チャンネル登録・トラマッチ誘導

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

  const parsed = JSON.parse(content);

  if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length < 3) {
    throw new Error("セクション構造が不正です");
  }

  return parsed as EnhancedVideoScript;
}

async function generateSlideImage(prompt: string, jobId: string, index: number): Promise<string> {
  ensureTempDir();
  const imagePath = path.join(TEMP_DIR, `${jobId}_slide_${index}.png`);

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${prompt}. High quality, 16:9 landscape format, professional photography style, no text or watermarks.`,
      n: 1,
      size: "1536x1024",
      quality: "medium",
    });

    const imageData = result.data?.[0]?.b64_json;
    if (!imageData) throw new Error("画像データなし");

    fs.writeFileSync(imagePath, Buffer.from(imageData, "base64"));
    console.log(`[YouTube Auto] Slide ${index} generated: ${imagePath}`);
    return imagePath;
  } catch (error: any) {
    console.error(`[YouTube Auto] Slide ${index} generation failed: ${error?.message?.substring(0, 200)}`);
    return createFallbackSlide(jobId, index);
  }
}

function createFallbackSlide(jobId: string, index: number): string {
  const imagePath = path.join(TEMP_DIR, `${jobId}_slide_${index}.png`);
  const colors = ["#0d9488", "#0891b2", "#0e7490", "#0369a1", "#1d4ed8"];
  const color = colors[index % colors.length];
  try {
    execSync(
      `ffmpeg -y -f lavfi -i "color=c='${color}':s=1920x1080:d=1" -frames:v 1 "${imagePath}" 2>/dev/null`,
      { timeout: 10000 }
    );
  } catch {
    execSync(
      `ffmpeg -y -f lavfi -i "color=c=0x0d9488:s=1920x1080:d=1" -frames:v 1 "${imagePath}" 2>/dev/null`,
      { timeout: 10000 }
    );
  }
  return imagePath;
}

export async function generateThumbnail(title: string, jobId: string, thumbnailPrompt?: string): Promise<string> {
  ensureTempDir();
  const thumbnailPath = path.join(TEMP_DIR, `${jobId}_thumb.png`);

  if (thumbnailPrompt) {
    try {
      const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt: `YouTube thumbnail image: ${thumbnailPrompt}. Vibrant colors, high contrast, eye-catching, cinematic, professional quality, 16:9 landscape, no text.`,
        n: 1,
        size: "1536x1024",
        quality: "medium",
      });

      const imageData = result.data?.[0]?.b64_json;
      if (imageData) {
        fs.writeFileSync(thumbnailPath, Buffer.from(imageData, "base64"));
        console.log(`[YouTube Auto] AI Thumbnail generated: ${thumbnailPath}`);

        const fontPath = findJapaneseFont();
        if (fontPath) {
          const thumbWithText = path.join(TEMP_DIR, `${jobId}_thumb_text.png`);
          const shortTitle = title.length > 20 ? title.substring(0, 20) : title;
          const escapedTitle = shortTitle.replace(/'/g, "'\\''").replace(/:/g, "\\:");
          try {
            execSync(
              `ffmpeg -y -i "${thumbnailPath}" -vf "drawtext=fontfile='${fontPath}':text='${escapedTitle}':fontsize=72:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.4:boxborderw=20" "${thumbWithText}" 2>/dev/null`,
              { timeout: 15000 }
            );
            fs.renameSync(thumbWithText, thumbnailPath);
          } catch {}
        }

        return thumbnailPath;
      }
    } catch (error: any) {
      console.error(`[YouTube Auto] AI Thumbnail failed: ${error?.message?.substring(0, 200)}`);
    }
  }

  const logoPath = path.join(process.cwd(), "server", "assets", "thumbnail_base.png");
  if (fs.existsSync(logoPath)) {
    fs.copyFileSync(logoPath, thumbnailPath);
    return thumbnailPath;
  }

  return "";
}

export async function generateAudio(script: string, jobId: string): Promise<string> {
  ensureTempDir();
  const audioPath = path.join(TEMP_DIR, `${jobId}.mp3`);

  const paragraphs = script.split(/\n\n+/).filter(p => p.trim());
  const chunks: string[] = [];

  let current = "";
  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > 3800 && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  if (chunks.length === 0) chunks.push(script);

  const chunkPaths: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkPath = path.join(TEMP_DIR, `${jobId}_chunk${i}.mp3`);
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: chunks[i],
      speed: 0.92,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(chunkPath, buffer);
    chunkPaths.push(chunkPath);
  }

  if (chunkPaths.length === 1) {
    fs.renameSync(chunkPaths[0], audioPath);
  } else {
    const silencePath = path.join(TEMP_DIR, `${jobId}_silence.mp3`);
    execSync(`ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.8 -q:a 9 "${silencePath}"`, { timeout: 10000 });

    const listPath = path.join(TEMP_DIR, `${jobId}_list.txt`);
    const listContent = chunkPaths.map((p, i) => {
      if (i < chunkPaths.length - 1) {
        return `file '${p}'\nfile '${silencePath}'`;
      }
      return `file '${p}'`;
    }).join("\n");
    fs.writeFileSync(listPath, listContent);
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${audioPath}"`, { timeout: 120000 });

    cleanupFiles(listPath, silencePath, ...chunkPaths);
  }

  return audioPath;
}

async function generateSectionAudios(sections: VideoSection[], jobId: string): Promise<{ paths: string[]; durations: number[] }> {
  const paths: string[] = [];
  const durations: number[] = [];

  for (let i = 0; i < sections.length; i++) {
    const sectionAudioPath = path.join(TEMP_DIR, `${jobId}_sec_audio_${i}.mp3`);
    const narration = sections[i].narration;

    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: narration,
      speed: 0.92,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(sectionAudioPath, buffer);

    const duration = getDuration(sectionAudioPath);
    paths.push(sectionAudioPath);
    durations.push(duration);
    console.log(`[YouTube Auto] Section ${i} audio: ${duration}s`);
  }

  return { paths, durations };
}

async function generateAllSlideImages(sections: VideoSection[], jobId: string): Promise<string[]> {
  const imagePaths: string[] = [];

  for (let i = 0; i < sections.length; i++) {
    console.log(`[YouTube Auto] Generating slide ${i + 1}/${sections.length}...`);
    const imagePath = await generateSlideImage(sections[i].imagePrompt, jobId, i);
    imagePaths.push(imagePath);
    if (i < sections.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return imagePaths;
}

function addTextOverlay(inputPath: string, outputPath: string, keyPoint: string, sectionTitle: string): boolean {
  const fontPath = findJapaneseFont();
  if (!fontPath) return false;

  try {
    const escapedPoint = keyPoint.replace(/'/g, "'\\''").replace(/:/g, "\\:");
    const escapedTitle = sectionTitle.replace(/'/g, "'\\''").replace(/:/g, "\\:");

    execSync(
      `ffmpeg -y -i "${inputPath}" -vf "` +
      `drawtext=fontfile='${fontPath}':text='${escapedTitle}':fontsize=36:fontcolor=white@0.9:x=60:y=40:box=1:boxcolor=black@0.5:boxborderw=12,` +
      `drawtext=fontfile='${fontPath}':text='${escapedPoint}':fontsize=56:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-120:box=1:boxcolor=black@0.6:boxborderw=16` +
      `" "${outputPath}" 2>/dev/null`,
      { timeout: 15000 }
    );
    return true;
  } catch {
    return false;
  }
}

export async function generateVideo(audioPath: string, title: string, jobId: string): Promise<string> {
  ensureTempDir();
  const videoPath = path.join(TEMP_DIR, `${jobId}.mp4`);
  const logoPath = path.join(process.cwd(), "server", "assets", "thumbnail_base.png");

  const duration = getDuration(audioPath);

  let cmd: string;
  if (fs.existsSync(logoPath)) {
    cmd = `ffmpeg -y -loop 1 -i "${logoPath}" -i "${audioPath}" -vf "scale=1920:1080" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -t ${duration} "${videoPath}" 2>&1`;
  } else {
    cmd = `ffmpeg -y -f lavfi -i "color=c=#0d9488:s=1920x1080:d=${duration}" -i "${audioPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${videoPath}" 2>&1`;
  }

  try {
    execSync(cmd, { timeout: 600000 });
  } catch (error: any) {
    console.error("ffmpeg error:", error?.message?.substring(0, 500));
    throw new Error("動画生成に失敗しました");
  }

  return videoPath;
}

async function composeSlideVideo(
  imagePaths: string[],
  audioPaths: string[],
  durations: number[],
  sections: VideoSection[],
  jobId: string
): Promise<string> {
  ensureTempDir();
  const videoPath = path.join(TEMP_DIR, `${jobId}.mp4`);
  const segmentPaths: string[] = [];

  for (let i = 0; i < imagePaths.length; i++) {
    const segPath = path.join(TEMP_DIR, `${jobId}_seg_${i}.mp4`);
    let slidePath = imagePaths[i];

    const textSlidePath = path.join(TEMP_DIR, `${jobId}_textslide_${i}.png`);
    const hasText = addTextOverlay(slidePath, textSlidePath, sections[i].keyPoint, sections[i].title);
    if (hasText && fs.existsSync(textSlidePath)) {
      slidePath = textSlidePath;
    }

    const dur = durations[i] + 1;

    try {
      execSync(
        `ffmpeg -y -loop 1 -i "${slidePath}" -i "${audioPaths[i]}" ` +
        `-vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,` +
        `fade=t=in:st=0:d=0.5,fade=t=out:st=${dur - 0.5}:d=0.5" ` +
        `-c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -pix_fmt yuv420p ` +
        `-shortest -t ${dur} "${segPath}" 2>/dev/null`,
        { timeout: 300000 }
      );
      segmentPaths.push(segPath);
    } catch (error: any) {
      console.error(`[YouTube Auto] Segment ${i} compose failed: ${error?.message?.substring(0, 200)}`);
      try {
        execSync(
          `ffmpeg -y -loop 1 -i "${imagePaths[i]}" -i "${audioPaths[i]}" ` +
          `-vf "scale=1920:1080" ` +
          `-c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -pix_fmt yuv420p ` +
          `-shortest -t ${dur} "${segPath}" 2>/dev/null`,
          { timeout: 300000 }
        );
        segmentPaths.push(segPath);
      } catch {
        console.error(`[YouTube Auto] Segment ${i} fallback also failed`);
      }
    }

    if (hasText) cleanupFiles(textSlidePath);
  }

  if (segmentPaths.length === 0) {
    throw new Error("セグメント動画の生成に失敗しました");
  }

  if (segmentPaths.length === 1) {
    fs.renameSync(segmentPaths[0], videoPath);
  } else {
    const concatListPath = path.join(TEMP_DIR, `${jobId}_concat.txt`);
    const concatContent = segmentPaths.map(p => `file '${p}'`).join("\n");
    fs.writeFileSync(concatListPath, concatContent);

    try {
      execSync(
        `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${videoPath}" 2>/dev/null`,
        { timeout: 300000 }
      );
    } catch {
      execSync(
        `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k "${videoPath}" 2>/dev/null`,
        { timeout: 600000 }
      );
    }

    cleanupFiles(concatListPath, ...segmentPaths);
  }

  console.log(`[YouTube Auto] Slide video composed: ${videoPath}`);
  return videoPath;
}

function getYoutubeClient() {
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("YouTube OAuth認証情報が設定されていません");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.youtube({ version: "v3", auth: oauth2Client });
}

export async function uploadToYoutube(
  videoPath: string,
  title: string,
  description: string,
  tags: string[]
): Promise<string> {
  const youtube = getYoutubeClient();

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

export async function uploadThumbnail(videoId: string, thumbnailPath: string): Promise<void> {
  if (!thumbnailPath || !fs.existsSync(thumbnailPath)) return;

  try {
    const youtube = getYoutubeClient();
    await youtube.thumbnails.set({
      videoId,
      media: {
        mimeType: "image/png",
        body: fs.createReadStream(thumbnailPath),
      },
    });
    console.log(`[YouTube Auto] Thumbnail uploaded for ${videoId}`);
  } catch (error: any) {
    console.error(`[YouTube Auto] Thumbnail upload failed: ${error?.message?.substring(0, 200)}`);
  }
}

export async function processAutoPublishJob(jobId: string): Promise<void> {
  const filesToCleanup: string[] = [];

  try {
    await updateJobStatus(jobId, "generating_script");

    const job = await storage.getYoutubeAutoPublishJob(jobId);
    if (!job) throw new Error("ジョブが見つかりません");

    console.log(`[YouTube Auto] Job ${jobId}: Generating enhanced script for "${job.topic}"...`);
    const scriptData = await generateVideoScript(job.topic);

    const fullScript = scriptData.sections.map(s => s.narration).join("\n\n");
    await updateJobFields(jobId, {
      script: fullScript,
      youtubeTitle: scriptData.title,
      youtubeDescription: scriptData.description,
      status: "generating_images",
    });

    console.log(`[YouTube Auto] Job ${jobId}: Generating ${scriptData.sections.length} slide images...`);
    const slideImages = await generateAllSlideImages(scriptData.sections, jobId);
    filesToCleanup.push(...slideImages);

    console.log(`[YouTube Auto] Job ${jobId}: Generating section audios...`);
    await updateJobStatus(jobId, "generating_audio");
    const { paths: audioPaths, durations } = await generateSectionAudios(scriptData.sections, jobId);
    filesToCleanup.push(...audioPaths);

    console.log(`[YouTube Auto] Job ${jobId}: Generating AI thumbnail...`);
    await updateJobStatus(jobId, "generating_thumbnail");
    const thumbnailPath = await generateThumbnail(scriptData.title, jobId, scriptData.thumbnailPrompt);
    if (thumbnailPath) filesToCleanup.push(thumbnailPath);

    console.log(`[YouTube Auto] Job ${jobId}: Composing slide video...`);
    await updateJobStatus(jobId, "generating_video");
    const videoPath = await composeSlideVideo(slideImages, audioPaths, durations, scriptData.sections, jobId);
    filesToCleanup.push(videoPath);

    await updateJobFields(jobId, {
      videoUrl: videoPath,
      status: "uploading",
    });

    console.log(`[YouTube Auto] Job ${jobId}: Uploading to YouTube...`);
    const youtubeVideoId = await uploadToYoutube(
      videoPath,
      scriptData.title,
      scriptData.description,
      scriptData.tags
    );

    if (thumbnailPath) {
      await uploadThumbnail(youtubeVideoId, thumbnailPath);
    }

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

    console.log(`[YouTube Auto] Job ${jobId} completed successfully: https://youtu.be/${youtubeVideoId}`);
  } catch (error: any) {
    console.error(`[YouTube Auto] Job ${jobId} failed:`, error?.message);
    await updateJobFields(jobId, {
      status: "failed",
      errorMessage: error?.message || "不明なエラー",
    });
  } finally {
    cleanupFiles(...filesToCleanup);
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

  const todayTopics = availableTopics.slice(0, 2);
  const jobIds: string[] = [];

  for (const topic of todayTopics) {
    const job = await storage.createYoutubeAutoPublishJob({ topic, status: "pending" });
    jobIds.push(job.id);
  }

  for (const jobId of jobIds) {
    processAutoPublishJob(jobId).catch((err) =>
      console.error(`[YouTube Auto] Background job ${jobId} error:`, err?.message)
    );
    await new Promise(r => setTimeout(r, 5000));
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
