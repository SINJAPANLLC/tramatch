import { storage } from "./storage";
import { sendEmail } from "./notification-service";
import dns from "dns/promises";

const DAILY_SEND_LIMIT = 20; // 1日20通に制限（スパム対策）
const SEND_INTERVAL_MS = 180000; // 3分間隔（スパム対策）
const CRAWL_BATCH_SIZE = 50;

// セッション内でクロール済みドメインを記録（重複回避）
const crawledDomainsCache = new Set<string>();

const SEARCH_QUERIES = [
  // 基本クエリ
  "一般貨物自動車運送事業 会社概要",
  "一般貨物 運送会社 お問い合わせ",
  "貨物利用運送事業 会社",
  "利用運送 株式会社 連絡先",
  "トラック運送 株式会社",
  "運輸株式会社 会社概要",
  "運送株式会社 お問い合わせ",
  "一般貨物 チャーター便",
  "長距離 運送会社 株式会社",
  "冷凍冷蔵 運送 株式会社",
  "物流会社 倉庫 運送",
  "陸運 株式会社 会社概要",
  "求車 求荷 運送会社",
  "トラック 運輸 会社概要",
  "貨物運送 許可 事業者",
  "運送会社 配車 お問い合わせ",
  "3PL 物流 株式会社",
  "特別積合せ 運送 株式会社",
  "運送会社 メールアドレス 会社概要",
  "運輸 株式会社 mail 会社概要",
  "運送 株式会社 info@ 会社概要",
  "一般貨物 運送 連絡先 メール",
  "物流会社 採用 お問い合わせ メール",
  "運送会社 一覧 連絡先",
  "トラック運送 事業者 電話 メール",
  "貨物運送 会社情報 連絡先",
  "中小運送会社 株式会社 会社概要",
  "運送会社 有限会社 会社概要",
  "有限会社 運送 連絡先",
  "有限会社 運輸 お問い合わせ",
  "合同会社 運送 物流",
  "運送業 創業 会社概要",
  "自家用 貨物 輸送 事業者",
  "引越し 運送 一般貨物 会社概要",
  "ルート配送 運送 株式会社",
  "幹線輸送 運送会社 会社概要",
  "地場輸送 運送 株式会社",
  "食品 輸送 運送 会社概要",
  "建材 輸送 運送 株式会社",
  "産廃 運送 一般貨物 会社概要",
  "危険物 輸送 運送 株式会社",
  "精密機器 輸送 運送会社",
  "医療機器 輸送 物流 会社概要",
  "農産物 輸送 運送 株式会社",
  "鋼材 輸送 運送 会社概要",
  "土木 建設資材 輸送 運送",
  "コンテナ 輸送 運送 株式会社",
  "海上コンテナ 陸送 運送会社",
  "港湾 輸送 運送 株式会社",
  "空港 輸送 運送会社 会社概要",
  "軽貨物 配送 会社 会社概要",
  "軽貨物 運送 株式会社 連絡先",
  "宅配 急配 株式会社 会社概要",
  "路線便 運送 会社概要",
  "定温 輸送 運送 株式会社",
  "医薬品 輸送 物流 会社概要",
  "重量物 輸送 運送 株式会社",
  "引越 会社 お問い合わせ メール",
  "協同組合 運送 連絡先",
  "運送業 協同組合 一覧",
  "トレーラー 輸送 会社概要",
  "タンクローリー 輸送 運送会社",
  "バルク 輸送 運送 株式会社",
  "宅急便 代理店 運送 会社概要",
  "フォワーダー 運送 会社概要",
  "航空貨物 陸送 運送 株式会社",
  "国際物流 運送 会社概要",
  "通関 物流 運送 会社概要",
  "共同配送 運送 株式会社",
  "帰り便 求荷 運送 会社概要",
  "スポット 運送 株式会社",
  "配送代行 物流 会社概要",
  "EC 物流 運送 株式会社",
  "倉庫 配送 3PL 会社概要",
  "集荷 配送 運送 会社概要",
  // 車両タイプ別
  "10トン車 運送 会社概要",
  "4トン車 運送 株式会社",
  "2トン車 配送 会社概要",
  "ウイング車 運送 会社概要",
  "平ボディ 輸送 運送 株式会社",
  "冷凍車 運送 会社概要",
  "保冷車 輸送 株式会社",
  "タンクローリー 運送 株式会社",
  "ダンプ 輸送 運送 株式会社",
  "ユニック車 輸送 会社概要",
  "セミトレーラー 輸送 会社概要",
  "フルトレーラー 輸送 株式会社",
  "ローダー 輸送 運送 株式会社",
  "幌車 運送 会社概要",
  "バン車 配送 株式会社",
  // 荷物・業界別
  "自動車部品 輸送 運送 会社概要",
  "電子部品 輸送 物流 株式会社",
  "紙・パルプ 輸送 運送 会社概要",
  "化学品 輸送 運送 株式会社",
  "飲料 輸送 運送 会社概要",
  "酒類 輸送 運送 株式会社",
  "青果物 輸送 運送 会社概要",
  "水産物 輸送 冷凍 株式会社",
  "米穀 輸送 運送 会社概要",
  "家電 輸送 配送 株式会社",
  "家具 輸送 配送 会社概要",
  "繊維 輸送 運送 株式会社",
  "書籍 輸送 配送 会社概要",
  "医薬品 GDP 物流 会社概要",
  "廃棄物 収集 輸送 株式会社",
  "リサイクル 輸送 運送 会社概要",
  "液体 タンク 輸送 株式会社",
  "ガス 輸送 運送 会社概要",
  "燃料 輸送 運送 株式会社",
  "石油 輸送 タンクローリー 会社概要",
  // ルート・地域別
  "東名 輸送 運送 株式会社",
  "名神 輸送 運送 会社概要",
  "北陸 輸送 運送 株式会社",
  "東北 輸送 運送 会社概要",
  "九州 輸送 運送 株式会社",
  "関東 関西 幹線 輸送 会社概要",
  "中四国 輸送 運送 株式会社",
  "沖縄 輸送 運送 会社概要",
  "北海道 輸送 運送 株式会社",
  "東京 大阪 幹線 輸送 会社概要",
  // 規模・形態別
  "中小 運送会社 株式会社 メール",
  "個人 運送 一人親方 会社概要",
  "家族経営 運送 株式会社",
  "老舗 運送会社 創業 昭和",
  "ドライバー 直用 運送 株式会社",
  "協力会社 運送 下請け 株式会社",
  "傭車 運送 株式会社 会社概要",
  "実運送 株式会社 会社概要",
  // 特殊輸送
  "美術品 輸送 運送 会社概要",
  "金融機器 輸送 警備 会社概要",
  "遺体 輸送 運送 株式会社",
  "放射性物質 輸送 運送 会社概要",
  "超重量 特殊 輸送 会社概要",
  "プラント 輸送 運送 株式会社",
  "風車 輸送 特殊 会社概要",
  "橋梁 部材 輸送 株式会社",
  // デジタル系
  "運送会社 ホームページ お問い合わせフォーム メール",
  "物流会社 公式サイト contact メール",
  "運輸会社 公式 HP info メールアドレス",
  "軽貨物 個人事業主 配送 メール",
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4})/g;
const FAX_REGEX = /(?:FAX|fax|Fax|ファクス|ファックス)[：:\s]*([0-9\-\s]+)/g;

const EXCLUDED_EMAIL_DOMAINS = [
  "example.com", "test.com", "gmail.com", "yahoo.co.jp", "hotmail.com",
  "outlook.com", "icloud.com", "googlemail.com", "yahoo.com",
  "tramatch-sinjapan.com", "sinjapan.jp",
];

function isValidCompanyEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (EXCLUDED_EMAIL_DOMAINS.includes(domain)) return false;
  if (email.includes("noreply") || email.includes("no-reply") || email.includes("mailer-daemon")) return false;
  return true;
}

const STRONG_TRANSPORT_KEYWORDS = [
  "一般貨物自動車運送事業", "一般貨物運送", "特定貨物自動車運送",
  "貨物利用運送事業", "利用運送", "第一種利用運送", "第二種利用運送",
  "貨物自動車運送事業法", "運送事業許可", "運送業許可",
  "国土交通省認可", "関東運輸局", "近畿運輸局", "中部運輸局",
  "求車", "求荷", "帰り便", "混載", "チャーター便",
];

const TRANSPORT_KEYWORDS = [
  "運送", "運輸", "物流", "貨物", "トラック", "配送", "輸送", "ロジスティクス",
  "logistics", "transport", "freight", "cargo",
  "軽貨物", "引越", "倉庫", "陸運", "3PL",
  "特別積合", "宅配", "急便", "エクスプレス",
  "トレーラー", "ウイング車", "平ボディ", "冷凍車", "冷蔵車",
  "4t", "10t", "大型車", "中型車", "配車",
];

const NON_TRANSPORT_KEYWORDS = [
  "不動産", "マンション", "賃貸", "分譲", "戸建", "ホテル", "旅館",
  "レストラン", "カフェ", "美容", "エステ", "クリニック", "病院",
  "学校", "塾", "予備校", "保険", "証券", "銀行",
  "セミナー", "イベント", "展示会", "内覧", "見学",
  "弁護士", "税理士", "行政書士事務所", "司法書士",
  "プログラミング", "IT企業", "ソフトウェア開発",
  "飲食店", "居酒屋", "寿司", "ラーメン",
  "タクシー", "ハイヤー", "バス", "観光バス", "旅行", "ツアー",
];

const PORTAL_DOMAINS = [
  "imitsu.jp", "baseconnect.in", "biz.ne.jp", "houjin.jp",
  "clearworks.co.jp", "job-gear.jp", "townwork.net",
  "navit-j.com", "mapion.co.jp", "ekiten.jp", "itp.ne.jp",
  "ashita-office.com", "freee.co.jp", "minkabu.jp",
  "hakopro.jp", "lnews.jp", "e-logit.com",
  "faq.", "wikipedia.org", "google.com", "bing.com",
  "yahoo.co.jp", "indeed.com", "indeedworks.com",
  "metro.tokyo.lg.jp", "prtimes.jp", "salesnow.jp",
  "doraever.jp", "mynavi.jp", "rikunabi.com",
];

function isPortalSite(url: string): boolean {
  try {
    const domain = new URL(url).hostname;
    return PORTAL_DOMAINS.some(d => domain.includes(d));
  } catch { return false; }
}

function getTextContent(html: string): string {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .substring(0, 8000);
}

function isTransportCompany(html: string, url: string): boolean {
  if (isPortalSite(url)) return false;

  const textContent = getTextContent(html);
  const lowerText = textContent.toLowerCase();
  const lowerUrl = url.toLowerCase();

  let strongScore = 0;
  for (const kw of STRONG_TRANSPORT_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase()) || lowerUrl.includes(kw.toLowerCase())) {
      strongScore++;
    }
  }
  if (strongScore >= 1) return true;

  let transportScore = 0;
  for (const kw of TRANSPORT_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase()) || lowerUrl.includes(kw.toLowerCase())) {
      transportScore++;
    }
  }

  let nonTransportScore = 0;
  for (const kw of NON_TRANSPORT_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase())) {
      nonTransportScore++;
    }
  }

  if (transportScore < 2) return false;
  if (nonTransportScore >= transportScore) return false;
  return true;
}

function detectIndustry(html: string): string {
  const text = getTextContent(html).toLowerCase();
  if (text.includes("一般貨物自動車運送") || text.includes("一般貨物運送")) {
    if (text.includes("利用運送")) return "一般貨物/利用運送";
    return "一般貨物自動車運送事業";
  }
  if (text.includes("利用運送") || text.includes("貨物利用運送")) return "貨物利用運送事業";
  if (text.includes("特別積合")) return "特別積合せ貨物運送";
  if (text.includes("軽貨物")) return "軽貨物運送";
  if (text.includes("引越")) return "引越運送";
  if (text.includes("冷凍") || text.includes("冷蔵")) return "冷凍冷蔵運送";
  if (text.includes("倉庫") && text.includes("物流")) return "倉庫/物流";
  if (text.includes("3pl") || text.includes("ロジスティクス") || text.includes("logistics")) return "3PL/ロジスティクス";
  if (text.includes("運送") || text.includes("運輸")) return "一般貨物/利用運送";
  return "物流関連";
}

async function fetchPageContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en;q=0.9",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return "";
    const text = await res.text();
    return text;
  } catch {
    return "";
  }
}

function extractContactInfo(html: string): { emails: string[]; phones: string[]; faxes: string[] } {
  const mailtoEmails = (html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi) || [])
    .map(m => m.replace(/^mailto:/i, ""));

  const decodedHtml = html
    .replace(/&#64;/g, "@")
    .replace(/&#x40;/g, "@")
    .replace(/\[at\]/gi, "@")
    .replace(/（at）/gi, "@")
    .replace(/\(at\)/gi, "@")
    .replace(/\[dot\]/gi, ".")
    .replace(/（dot）/gi, ".");

  const jsEmailPattern = /['"]([a-zA-Z0-9._%+\-]+)['"][\s]*\+[\s]*['"]@['"][\s]*\+[\s]*['"]([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})['"]/g;
  const jsEmails: string[] = [];
  let jsMatch;
  while ((jsMatch = jsEmailPattern.exec(html)) !== null) {
    jsEmails.push(jsMatch[1] + "@" + jsMatch[2]);
  }

  const textContent = decodedHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const allEmails = [...mailtoEmails, ...jsEmails, ...(textContent.match(EMAIL_REGEX) || [])];
  const emailSet = new Set(allEmails.filter(isValidCompanyEmail));
  const emails = Array.from(emailSet);

  const phoneSet = new Set(textContent.match(PHONE_REGEX) || []);
  const phones = Array.from(phoneSet);

  const faxes: string[] = [];
  let faxMatch;
  const faxRegex = new RegExp(FAX_REGEX.source, "g");
  while ((faxMatch = faxRegex.exec(textContent)) !== null) {
    faxes.push(faxMatch[1].trim());
  }
  const faxSet = new Set(faxes);

  return { emails: emails.slice(0, 5), phones: phones.slice(0, 3), faxes: Array.from(faxSet).slice(0, 3) };
}

function extractCompanyName(html: string, url: string): string {
  // 1. LD+JSON構造化データから会社名を抽出（最も正確）
  try {
    const ldJsonMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const m of ldJsonMatches) {
      try {
        const data = JSON.parse(m[1]);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item.name && (item["@type"] === "Organization" || item["@type"] === "LocalBusiness" || item["@type"] === "Corporation")) {
            const n = String(item.name).trim();
            if (n.length > 1 && n.length < 60) return n;
          }
        }
      } catch {}
    }
  } catch {}

  // 2. OGP site_name
  const ogSiteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
  if (ogSiteMatch) {
    const n = ogSiteMatch[1].trim();
    if (n.length > 1 && n.length < 60) return n;
  }

  // 3. 会社名らしいパターンをHTML本文から抽出
  const companyPatterns = [
    /(?:会社名|社名|商号)[：:\s]*([^\s<]{2,30}(?:株式会社|有限会社|合同会社|協同組合|一般社団法人|公益社団法人|合資会社|合名会社))/,
    /((?:株式会社|有限会社|合同会社|協同組合|一般社団法人|合資会社|合名会社)[^\s<]{1,25})/,
    /([^\s<]{1,25}(?:株式会社|有限会社|合同会社|協同組合))/,
  ];
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
  for (const pat of companyPatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      const n = m[1].trim();
      if (n.length > 2 && n.length < 50) return n;
    }
  }

  // 4. ページタイトルから抽出（区切り文字で分割）
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    const parts = titleMatch[1].split(/[|\-–—\/｜]/);
    for (const part of parts) {
      const t = part.trim();
      if (t.length > 2 && t.length < 50 &&
          (t.includes("株式会社") || t.includes("有限会社") || t.includes("合同会社") ||
           t.includes("運送") || t.includes("運輸") || t.includes("物流"))) {
        return t;
      }
    }
    // タイトル全体（短い場合）
    const full = titleMatch[1].replace(/\s*[|\-–—].*$/, "").trim();
    if (full.length > 2 && full.length < 50) return full;
  }

  // 5. ドメイン名をフォールバック
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

async function findEmailOnRelatedPages(baseUrl: string, baseHtml?: string): Promise<{ emails: string[]; phones: string[]; faxes: string[] } | null> {
  try {
    const urlObj = new URL(baseUrl);
    const origin = urlObj.origin;
    const relatedPaths = ["/contact", "/contact/", "/company/", "/about/", "/access/", "/inquiry/", "/company/outline/", "/company/about/", "/gaiyou/", "/outline/", "/info/", "/corporate/", "/company-info/", "/toiawase/"];

    if (baseHtml) {
      const linkPattern = /href=["']([^"']*(?:contact|company|about|gaiyou|outline|inquiry|toiawase|info|概要|問[いい]合[わわ]せ)[^"']*)["']/gi;
      let m;
      while ((m = linkPattern.exec(baseHtml)) !== null) {
        try {
          const linkedUrl = new URL(m[1], baseUrl).href;
          if (new URL(linkedUrl).hostname === urlObj.hostname && !relatedPaths.includes(new URL(linkedUrl).pathname)) {
            relatedPaths.push(new URL(linkedUrl).pathname);
          }
        } catch {}
      }
    }

    for (const path of relatedPaths) {
      const relatedUrl = origin + path;
      if (relatedUrl === baseUrl) continue;
      const html = await fetchPageContent(relatedUrl);
      if (html && html.length > 500) {
        const info = extractContactInfo(html);
        if (info.emails.length > 0) {
          console.log(`[Lead Crawler] Found email on related page: ${relatedUrl}`);
          return info;
        }
      }
      await new Promise(r => setTimeout(r, 500));
    }
    return null;
  } catch {
    return null;
  }
}

const COMMON_EMAIL_PREFIXES = [
  "info", "contact", "mail", "office", "inquiry", "soumu", "eigyo",
  "hanbai", "support", "jimukyoku", "honsha", "recruit", "sales",
  "webmaster", "admin", "service", "logi", "butsuryu", "unso",
  "kaisha", "center", "general", "total", "main", "post",
];

async function guessCompanyEmail(domain: string): Promise<string | null> {
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) return null;
    const guessedEmail = `info@${domain}`;
    console.log(`[Lead Crawler] Domain ${domain} has MX records, guessing: ${guessedEmail}`);
    return guessedEmail;
  } catch {
    return null;
  }
}

export async function crawlLeadsFromUrl(url: string): Promise<number> {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    if (crawledDomainsCache.has(domain)) {
      return 0;
    }
    crawledDomainsCache.add(domain);
  } catch { return 0; }

  console.log(`[Lead Crawler] Crawling: ${url}`);
  const html = await fetchPageContent(url);
  if (!html) return 0;

  if (!isTransportCompany(html, url)) {
    console.log(`[Lead Crawler] Skipped (not transport): ${url}`);
    return 0;
  }

  let { emails, phones, faxes } = extractContactInfo(html);
  const companyName = extractCompanyName(html, url);

  if (emails.length === 0) {
    console.log(`[Lead Crawler] No email on main page, checking related pages for: ${url}`);
    const relatedInfo = await findEmailOnRelatedPages(url, html);
    if (relatedInfo) {
      emails = relatedInfo.emails;
      if (relatedInfo.phones.length > 0) phones = relatedInfo.phones;
      if (relatedInfo.faxes.length > 0) faxes = relatedInfo.faxes;
    }
  }

  if (emails.length === 0) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, "");
      if (domain.endsWith(".co.jp") || domain.endsWith(".jp") || domain.endsWith(".com")) {
        const guessed = await guessCompanyEmail(domain);
        if (guessed) emails = [guessed];
      }
    } catch { }
  }

  if (emails.length === 0) {
    console.log(`[Lead Crawler] No email found anywhere for: ${companyName} (${url})`);
    return 0;
  }

  let added = 0;

  for (const email of emails) {
    const existing = await storage.getEmailLeadByEmail(email);
    if (existing) {
      console.log(`[Lead Crawler] Duplicate email skipped: ${email}`);
      continue;
    }

    try {
      const industry = detectIndustry(html);
      await storage.createEmailLead({
        companyName,
        email,
        fax: faxes[0] || null,
        phone: phones[0] || null,
        website: url,
        address: null,
        industry,
        source: url,
        status: "new",
      });
      added++;
      console.log(`[Lead Crawler] ✓ New lead saved: ${companyName} <${email}>`);
    } catch (err) {
      console.error(`[Lead Crawler] Failed to save lead ${email}:`, err);
    }
  }

  return added;
}

const DIRECTORY_SOURCES = [
  // logi-today.com（ページ拡充）
  "https://www.logi-today.com/company-list",
  "https://www.logi-today.com/company-list?page=2",
  "https://www.logi-today.com/company-list?page=3",
  "https://www.logi-today.com/company-list?page=4",
  "https://www.logi-today.com/company-list?page=5",
  "https://www.logi-today.com/company-list?page=6",
  "https://www.logi-today.com/company-list?page=7",
  "https://www.logi-today.com/company-list?page=8",
  "https://www.logi-today.com/company-list?page=9",
  "https://www.logi-today.com/company-list?page=10",
  "https://www.logi-today.com/company-list?page=11",
  "https://www.logi-today.com/company-list?page=12",
  "https://www.logi-today.com/company-list?page=13",
  "https://www.logi-today.com/company-list?page=14",
  "https://www.logi-today.com/company-list?page=15",
  "https://www.logi-today.com/company-list?page=16",
  "https://www.logi-today.com/company-list?page=17",
  "https://www.logi-today.com/company-list?page=18",
  "https://www.logi-today.com/company-list?page=19",
  "https://www.logi-today.com/company-list?page=20",
  // transport-guide.jp（ページ拡充）
  "https://transport-guide.jp/company/",
  "https://transport-guide.jp/company/?page=2",
  "https://transport-guide.jp/company/?page=3",
  "https://transport-guide.jp/company/?page=4",
  "https://transport-guide.jp/company/?page=5",
  "https://transport-guide.jp/company/?page=6",
  "https://transport-guide.jp/company/?page=7",
  "https://transport-guide.jp/company/?page=8",
  "https://transport-guide.jp/company/?page=9",
  "https://transport-guide.jp/company/?page=10",
  // 物流・運送業専門ポータル
  "https://www.trabox.ne.jp/company/",
  "https://www.butsuryu.or.jp/member/",
  "https://www.logistics.jp/company/",
  "https://www.cargo-work.com/",
  "https://www.e-butsuryu.jp/company/",
  "https://www.jils.or.jp/member/",
  "https://www.zen-unyu.or.jp/member/",
  "https://jta.or.jp/member.html",
  // 採用サイト系
  "https://www.driver-ab.com/company/transport/",
  "https://www.toradriver.com/company/",
  "https://www.hacobell.com/shippers",
  "https://driver-work.com/company/",
  // 全国トラック協会・各都道府県
  "https://www.nta.or.jp/member/",
  "https://www.hokkaido-ta.or.jp/",
  "https://www.hokkaido-ta.or.jp/member/",
  "https://www.aomori-ta.or.jp/",
  "https://www.aomori-ta.or.jp/member/",
  "https://www.iwate-ta.or.jp/",
  "https://www.iwate-ta.or.jp/member/",
  "https://www.miyagi-ta.or.jp/",
  "https://www.miyagi-ta.or.jp/member/",
  "https://www.akita-ta.or.jp/",
  "https://www.akita-ta.or.jp/member/",
  "https://www.yamagata-ta.or.jp/",
  "https://www.fukushima-ta.or.jp/",
  "https://www.ibaraki-ta.or.jp/",
  "https://www.tochigi-ta.or.jp/",
  "https://www.gunma-ta.or.jp/",
  "https://www.saitama-ta.or.jp/",
  "https://www.chiba-ta.or.jp/",
  "https://www.niigata-ta.or.jp/",
  "https://www.toyama-ta.or.jp/",
  "https://www.ishikawa-ta.or.jp/",
  "https://www.fukui-ta.or.jp/",
  "https://www.yamanashi-ta.or.jp/",
  "https://www.nagano-ta.or.jp/",
  "https://www.gifu-ta.or.jp/",
  "https://www.shizuoka-ta.or.jp/",
  "https://www.aichi-ta.or.jp/",
  "https://www.mie-ta.or.jp/",
  "https://www.shiga-ta.or.jp/",
  "https://www.kyoto-ta.or.jp/",
  "https://www.osaka-ta.or.jp/",
  "https://www.hyogo-ta.or.jp/",
  "https://www.nara-ta.or.jp/",
  "https://www.wakayama-ta.or.jp/",
  "https://www.tottori-ta.or.jp/",
  "https://www.shimane-ta.or.jp/",
  "https://www.okayama-ta.or.jp/",
  "https://www.hiroshima-ta.or.jp/",
  "https://www.yamaguchi-ta.or.jp/",
  "https://www.tokushima-ta.or.jp/",
  "https://www.kagawa-ta.or.jp/",
  "https://www.ehime-ta.or.jp/",
  "https://www.kochi-ta.or.jp/",
  "https://www.fukuoka-ta.or.jp/",
  "https://www.saga-ta.or.jp/",
  "https://www.nagasaki-ta.or.jp/",
  "https://www.kumamoto-ta.or.jp/",
  "https://www.oita-ta.or.jp/member/",
  "https://www.miyazaki-ta.or.jp/",
  "https://www.kagoshima-ta.or.jp/",
  "https://www.kta.or.jp/member/",
  // 関東近隣運輸業協会
  "https://www.kansai-yusoukyou.or.jp/member/",
  "https://www.kansai-yusoukyou.or.jp/union-member/",
  "https://www.tokyo-ta.or.jp/member/",
  "https://www.kanagawa-ta.or.jp/member/",
  // 軽貨物協会・軽運送
  "https://www.zenkeikyo.or.jp/member/",
  "https://keiunso.com/company/",
  "https://m-net.ne.jp/~cargo/",
  // 全国通運連盟・鉄道貨物
  "https://www.zentu.or.jp/member/",
  "https://www.jrfreight.co.jp/partner/",
  // 港湾・海運関連
  "https://www.jhta.or.jp/member/",
  "https://www.kaiun.or.jp/member/",
  "https://www.inland-container.co.jp/partner/",
  // 引越し業界
  "https://www.hikkoshi-estimate.com/company/",
  "https://www.hikkoshi.net/company/",
  "https://www.hikkoshi-samurai.jp/company/",
  // 地域別業界団体
  "https://www.kantou-unyu.or.jp/member/",
  "https://www.chubu-unyu.or.jp/member/",
  "https://www.kinki-unyu.or.jp/member/",
  "https://www.chugoku-unyu.or.jp/member/",
  "https://www.shikoku-unyu.or.jp/member/",
  "https://www.kyushu-unyu.or.jp/member/",
  "https://www.tohoku-unyu.or.jp/member/",
  // 物流情報サービス系
  "https://www.e-logi.co.jp/company/",
  "https://www.butsuryu-times.co.jp/company/",
  "https://lnews.jp/company/",
  "https://www.logistics-today.com/company/",
  "https://www.logi-biz.com/company/",
  // 中小企業・商工会議所系
  "https://www.jcci.or.jp/member/",
  "https://www.tokyo-cci.or.jp/member/transport/",
  "https://www.osaka.cci.or.jp/member/transport/",
  "https://www.nagoya-cci.or.jp/member/transport/",
  "https://www.fukuoka-cci.or.jp/member/transport/",
  "https://www.sapporo-cci.or.jp/member/transport/",
  // 冷凍冷蔵輸送系
  "https://www.jrc.or.jp/member/",
  "https://www.cold-chain.or.jp/member/",
  "https://www.reizo-unso.or.jp/member/",
  // 危険物輸送系
  "https://www.khk.or.jp/member/",
  "https://www.tanker-union.or.jp/member/",
  // 特殊車両・重量物
  "https://www.tokushu-unso.or.jp/member/",
  "https://www.jsia.or.jp/member/",
  // 産廃・廃棄物輸送系
  "https://www.jwef.or.jp/member/",
  "https://www.jwma.or.jp/member/",
  // 国際物流系
  "https://www.jiffa.or.jp/member/",
  "https://www.jafa.or.jp/member/",
  "https://www.jetro.go.jp/logistics/",
  // 中継輸送・混載系
  "https://www.nittsu.co.jp/partner/",
  "https://www.yamato-hd.co.jp/partner/",
  "https://www.sagawa-exp.co.jp/partner/",
  // 求車求荷プラットフォーム関連
  "https://www.WebKIT.net/search/",
  "https://www.tr-net.ne.jp/company/",
  "https://www.hacobell.com/carriers",
  "https://fleetbase.jp/carrier/",
  // 地域別企業ディレクトリ（都道府県運送会社一覧）
  "https://www.hokkaido-unyu.or.jp/member/",
  "https://www.tohoku-unyu.ne.jp/member/",
  "https://www.kanto-unyu.or.jp/member/",
  "https://www.chubu-lorry.or.jp/member/",
  "https://www.kinki-lorry.or.jp/member/",
  "https://www.nishi-unyu.or.jp/member/",
  "https://www.kyushu-lorry.or.jp/member/",
  // 地域商工会系
  "https://www.shokokai.or.jp/transport/",
  "https://www.tokyo-shokokai.or.jp/member/transport/",
  // 求人・採用サイトから抽出
  "https://www.green-job.jp/company/transport/",
  "https://career.co.jp/company/logistics/",
  "https://en-gage.net/company/logistics/",
  // 業種別情報サイト
  "https://www.logistics.jp/member/",
  "https://butsuryu.jp/company/",
  "https://www.butsuryu-news.co.jp/company/",
];

const PREFECTURES = [
  "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島",
  "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
  "新潟", "富山", "石川", "福井", "山梨", "長野",
  "岐阜", "静岡", "愛知", "三重",
  "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
  "鳥取", "島根", "岡山", "広島", "山口",
  "徳島", "香川", "愛媛", "高知",
  "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄",
];

function extractExternalUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const linkPattern = /href=["'](https?:\/\/[^"']+)["']/gi;
  let match;
  const baseDomain = new URL(baseUrl).hostname;

  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    try {
      const domain = new URL(url).hostname;
      if (domain === baseDomain) continue;
      if (isExcludedDomain(domain)) continue;
      if (domain.endsWith(".co.jp") || domain.endsWith(".jp") || domain.endsWith(".com")) {
        if (!urls.some(u => { try { return new URL(u).hostname === domain; } catch { return false; } })) {
          urls.push(url);
        }
      }
    } catch {}
  }
  return urls;
}

const EXCLUDED_DOMAINS = [
  "duckduckgo", "google", "youtube", "wikipedia", "yahoo", "bing",
  "indeed", "recruit", "mynavi", "doda", "tramatch", "amazon", "facebook", "twitter",
  "instagram", "linkedin", "tiktok", "reddit", "naver", "rakuten", "goo.ne.jp",
  "baseconnect.in", "clearworks.co.jp", "wantedly", "en-gage", "hellowork",
  "mlit.go.jp", "freee.co.jp", "crowdworks", "lancers", "coconala",
  "imitsu.jp", "houjin.jp", "biz.ne.jp", "townwork.net", "ekiten.jp",
  "itp.ne.jp", "mapion.co.jp", "navit-j.com", "minkabu.jp",
  "gyouseisyosi", "job-gear.jp", "ashita-office.com",
];

function isExcludedDomain(domain: string): boolean {
  return EXCLUDED_DOMAINS.some(d => domain.includes(d));
}

function isJapaneseDomain(domain: string): boolean {
  if (domain.endsWith(".jp") || domain.endsWith(".co.jp") || domain.endsWith(".ne.jp") || domain.endsWith(".or.jp")) return true;
  return false;
}

function addUniqueUrl(urls: string[], newUrl: string, japanOnly = false): boolean {
  try {
    const domain = new URL(newUrl).hostname;
    if (isExcludedDomain(domain)) return false;
    if (japanOnly && !isJapaneseDomain(domain)) return false;
    if (urls.some(u => { try { return new URL(u).hostname === domain; } catch { return false; } })) return false;
    urls.push(newUrl);
    return true;
  } catch { return false; }
}

async function searchDuckDuckGoForUrls(query: string): Promise<string[]> {
  const urls: string[] = [];

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
  ];
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];

  // Try Yahoo Japan first
  try {
    const yahooUrl = `https://search.yahoo.co.jp/search?p=${encodeURIComponent(query)}&n=20&ei=UTF-8`;
    const yc = new AbortController();
    const yt = setTimeout(() => yc.abort(), 15000);
    const yahooRes = await fetch(yahooUrl, {
      signal: yc.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.5",
        "Cookie": "over18=1; y=; B=; F=d=", // minimal cookies to avoid consent redirect
      },
    });
    clearTimeout(yt);
    if (yahooRes.ok) {
      const yahooHtml = await yahooRes.text();
      if (yahooHtml.includes("search.yahoo.co.jp") || yahooHtml.includes("ysearch")) {
        let match;
        const yahooRealUrlPattern = /\bRU=(https?:\/\/[^&"]+)/gi;
        while ((match = yahooRealUrlPattern.exec(yahooHtml)) !== null) {
          try { addUniqueUrl(urls, decodeURIComponent(match[1]), true); } catch {}
        }
        const yahooLinkPattern = /href="(https?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.(?:co\.jp|ne\.jp|or\.jp|jp)[^"]*?)"/gi;
        while ((match = yahooLinkPattern.exec(yahooHtml)) !== null) {
          try { addUniqueUrl(urls, match[1], true); } catch {}
        }
        if (urls.length > 0) console.log(`[Lead Crawler] Yahoo found ${urls.length} URLs for "${query}"`);
      }
    }
  } catch (err: any) {
    console.log(`[Lead Crawler] Yahoo search failed: ${err?.message || err}`);
  }

  // Try Startpage as secondary
  if (urls.length < 3) try {
    const startUrl = `https://www.startpage.com/sp/search?q=${encodeURIComponent(query + " site:.jp")}&language=japanese`;
    const sc = new AbortController();
    const st = setTimeout(() => sc.abort(), 15000);
    const startRes = await fetch(startUrl, {
      signal: sc.signal,
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.5",
      },
    });
    clearTimeout(st);
    if (startRes.ok) {
      const startHtml = await startRes.text();
      let match;
      const startPattern = /<a[^>]*href="(https?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.(?:co\.jp|ne\.jp|or\.jp|jp)[^"]*?)"[^>]*class="[^"]*result[^"]*"/gi;
      while ((match = startPattern.exec(startHtml)) !== null) {
        try { addUniqueUrl(urls, match[1], true); } catch {}
      }
      if (urls.length > 0) console.log(`[Lead Crawler] Startpage found ${urls.length} URLs for "${query}"`);
    }
  } catch {}

  // Try Bing as backup (more reliable when running multiple batches)
  if (urls.length < 5) try {
    const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=jp&setlang=ja&count=20`;
    const bc = new AbortController();
    const bt = setTimeout(() => bc.abort(), 20000);
    const bingRes = await fetch(bingUrl, {
      signal: bc.signal,
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.5",
      },
    });
    clearTimeout(bt);
    if (bingRes.ok) {
      const bingHtml = await bingRes.text();
      let match;
      const bingLinkPattern = /<a[^>]*href="(https?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.(?:co\.jp|ne\.jp|or\.jp|jp|com)[^"]*?)"[^>]*>/gi;
      while ((match = bingLinkPattern.exec(bingHtml)) !== null) {
        try { addUniqueUrl(urls, match[1], true); } catch {}
      }
      const citeLinkPattern = /<cite[^>]*>(https?:\/\/[^<]+)<\/cite>/gi;
      while ((match = citeLinkPattern.exec(bingHtml)) !== null) {
        try { addUniqueUrl(urls, match[1].replace(/<[^>]+>/g, "").trim(), true); } catch {}
      }
      if (urls.length > 0) console.log(`[Lead Crawler] Bing found ${urls.length} URLs for "${query}"`);
    }
  } catch (err: any) {
    console.log(`[Lead Crawler] Bing search failed: ${err?.message || err}`);
  }

  // Try DuckDuckGo if Bing didn't get enough
  if (urls.length < 5) {
    try {
      await new Promise(r => setTimeout(r, 500));
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=jp-jp`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
          "Accept-Encoding": "gzip, deflate",
          "Referer": "https://duckduckgo.com/",
        },
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (res.ok) {
        const html = await res.text();
        let match;
        const uddgPattern = /uddg=(https?%3A%2F%2F[^&"']+)/gi;
        while ((match = uddgPattern.exec(html)) !== null) {
          try { addUniqueUrl(urls, decodeURIComponent(match[1]), true); } catch {}
        }
        const hrefPattern = /href="(https?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.(?:co\.jp|ne\.jp|or\.jp|jp)[^"]*?)"/gi;
        while ((match = hrefPattern.exec(html)) !== null) {
          try { addUniqueUrl(urls, match[1], true); } catch {}
        }
        if (urls.length > 0) console.log(`[Lead Crawler] DDG found ${urls.length} URLs`);
      }
    } catch {}
  }

  // Fallback to Google
  if (urls.length < 3) {
    try {
      await new Promise(r => setTimeout(r, 500));
      const googleUrl = `https://www.google.co.jp/search?q=${encodeURIComponent(query)}&hl=ja&gl=jp&num=20`;
      const gc = new AbortController();
      const gt = setTimeout(() => gc.abort(), 15000);
      const googleRes = await fetch(googleUrl, {
        signal: gc.signal,
        headers: {
          "User-Agent": ua,
          "Accept": "text/html",
          "Accept-Language": "ja,en;q=0.5",
        },
      });
      clearTimeout(gt);
      if (googleRes.ok) {
        const googleHtml = await googleRes.text();
        let match;
        const googleUrlPattern = /url\?q=(https?:\/\/[^&"]+)/gi;
        while ((match = googleUrlPattern.exec(googleHtml)) !== null) {
          try { addUniqueUrl(urls, decodeURIComponent(match[1]), true); } catch {}
        }
        if (urls.length > 0) console.log(`[Lead Crawler] Google added URLs, total: ${urls.length}`);
      }
    } catch {}
  }

  console.log(`[Lead Crawler] Search found ${urls.length} URLs for "${query}"`);
  return urls.slice(0, 20);
}

export async function crawlLeadsWithAI(maxCount?: number): Promise<{ searched: number; found: number }> {
  let totalFound = 0;
  let totalSearched = 0;
  const limit = maxCount || CRAWL_BATCH_SIZE;

  const shuffled = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5);
  const todaysQueries = shuffled.slice(0, 12);

  const prefStart = Math.floor(Math.random() * PREFECTURES.length);
  const todaysPrefectures: string[] = [];
  for (let i = 0; i < 10; i++) {
    todaysPrefectures.push(PREFECTURES[(prefStart + i) % PREFECTURES.length]);
  }

  for (const query of todaysQueries) {
    if (totalFound >= limit) break;
    for (const prefecture of todaysPrefectures) {
      if (totalFound >= limit) break;
      try {
        const fullQuery = `${prefecture} ${query}`;
        console.log(`[Lead Crawler] Searching: "${fullQuery}"`);
        const urls = await searchDuckDuckGoForUrls(fullQuery);

        if (urls.length === 0) {
          const simpleQuery = `"${prefecture}" 運送 株式会社 連絡先`;
          console.log(`[Lead Crawler] Trying simple: "${simpleQuery}"`);
          const altUrls = await searchDuckDuckGoForUrls(simpleQuery);
          urls.push(...altUrls);
        }

        for (const url of urls) {
          if (totalFound >= limit) break;
          totalSearched++;
          const found = await crawlLeadsFromUrl(url);
          totalFound += found;
          if (found > 0) console.log(`[Lead Crawler] +${found} lead(s) from ${url}`);
          await new Promise(r => setTimeout(r, 1500));
        }

        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`[Lead Crawler] Search failed for "${query}":`, err);
      }
    }
  }

  if (totalFound < limit) {
    const shuffledDirs = [...DIRECTORY_SOURCES].sort(() => Math.random() - 0.5);
    for (const dirUrl of shuffledDirs) {
      if (totalFound >= limit) break;
      try {
        console.log(`[Lead Crawler] Checking directory: ${dirUrl}`);
        const dirHtml = await fetchPageContent(dirUrl);
        if (!dirHtml) continue;
        const companyUrls = extractExternalUrls(dirHtml, dirUrl);
        console.log(`[Lead Crawler] Found ${companyUrls.length} company links from directory`);
        const shuffledCompanies = companyUrls.sort(() => Math.random() - 0.5).slice(0, 15);
        for (const compUrl of shuffledCompanies) {
          if (totalFound >= limit) break;
          totalSearched++;
          const found = await crawlLeadsFromUrl(compUrl);
          totalFound += found;
          if (found > 0) console.log(`[Lead Crawler] +${found} lead(s) from ${compUrl}`);
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err) {
        console.error(`[Lead Crawler] Directory crawl failed:`, err);
      }
    }
  }

  console.log(`[Lead Crawler] Crawl complete: searched=${totalSearched}, found=${totalFound}`);
  return { searched: totalSearched, found: totalFound };
}

export async function crawlFromDirectoriesOnly(maxCount?: number): Promise<{ searched: number; found: number }> {
  let totalFound = 0;
  let totalSearched = 0;
  const limit = maxCount || CRAWL_BATCH_SIZE;

  const shuffledDirs = [...DIRECTORY_SOURCES].sort(() => Math.random() - 0.5);
  for (const dirUrl of shuffledDirs) {
    if (totalFound >= limit) break;
    try {
      console.log(`[Lead Crawler] Checking directory: ${dirUrl}`);
      const dirHtml = await fetchPageContent(dirUrl);
      if (!dirHtml) continue;
      const companyUrls = extractExternalUrls(dirHtml, dirUrl);
      console.log(`[Lead Crawler] Found ${companyUrls.length} company links from directory: ${dirUrl}`);
      const shuffledCompanies = companyUrls.sort(() => Math.random() - 0.5).slice(0, 20);
      for (const compUrl of shuffledCompanies) {
        if (totalFound >= limit) break;
        totalSearched++;
        const found = await crawlLeadsFromUrl(compUrl);
        totalFound += found;
        if (found > 0) console.log(`[Lead Crawler] +${found} lead(s) from ${compUrl}`);
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (err) {
      console.error(`[Lead Crawler] Directory crawl failed for ${dirUrl}:`, err);
    }
  }

  console.log(`[Lead Crawler] Directory crawl complete: searched=${totalSearched}, found=${totalFound}`);
  return { searched: totalSearched, found: totalFound };
}

// インポート済みリード（ウェブサイトあり・メールなし）のサイトをクロールしてメール取得
export async function crawlEmailsForExistingLeads(batchSize = 50): Promise<{ updated: number; skipped: number }> {
  const leads = await storage.getLeadsWithWebsiteNoEmail(batchSize);
  if (leads.length === 0) {
    console.log("[Lead Crawler] No leads with website but no email found.");
    return { updated: 0, skipped: 0 };
  }

  let updated = 0;
  let skipped = 0;

  console.log(`[Lead Crawler] Crawling emails for ${leads.length} leads with websites...`);

  for (const lead of leads) {
    if (!lead.website) { skipped++; continue; }
    try {
      const domain = new URL(lead.website).hostname.replace(/^www\./, "");
      if (crawledDomainsCache.has(domain)) { skipped++; continue; }
      crawledDomainsCache.add(domain);

      const html = await fetchPageContent(lead.website);
      if (!html) { skipped++; continue; }

      let { emails, phones, faxes } = extractContactInfo(html);

      if (emails.length === 0) {
        const relatedInfo = await findEmailOnRelatedPages(lead.website, html);
        if (relatedInfo && relatedInfo.emails.length > 0) {
          emails = relatedInfo.emails;
          if (relatedInfo.phones.length > 0 && !lead.phone) phones = relatedInfo.phones;
          if (relatedInfo.faxes.length > 0 && !lead.fax) faxes = relatedInfo.faxes;
        }
      }

      if (emails.length === 0) {
        // MXレコードから推測
        const guessed = await guessCompanyEmail(domain);
        if (guessed) emails = [guessed];
      }

      if (emails.length === 0) { skipped++; continue; }

      const email = emails[0];
      // 他のリードに同じメールがないか確認
      const existing = await storage.getEmailLeadByEmail(email);
      if (existing && existing.id !== lead.id) {
        skipped++;
        continue;
      }

      // メール・電話・FAXを更新
      await storage.updateEmailLead(lead.id, {
        email,
        phone: lead.phone || phones[0] || undefined,
        fax: lead.fax || faxes[0] || undefined,
      });
      updated++;
      console.log(`[Lead Crawler] ✓ Email found for ${lead.companyName}: ${email}`);

      await new Promise(r => setTimeout(r, 1500));
    } catch {
      skipped++;
    }
  }

  console.log(`[Lead Crawler] Website email crawl complete: updated=${updated}, skipped=${skipped}`);
  return { updated, skipped };
}

// 全リードを高並列で一括処理（parallelism=同時リクエスト数）
export async function crawlAllExistingLeadsParallel(parallelism = 20): Promise<{ updated: number; skipped: number; total: number }> {
  const PAGE_SIZE = 500;
  let offset = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalProcessed = 0;
  const localCrawled = new Set<string>();

  console.log(`[Lead Crawler] 🚀 全リード一括クロール開始（並列数=${parallelism}）`);

  while (true) {
    const leads = await storage.getLeadsWithWebsiteNoEmail(PAGE_SIZE, offset);
    if (leads.length === 0) break;
    offset += leads.length;

    // parallelism件ずつ並列処理
    for (let i = 0; i < leads.length; i += parallelism) {
      const chunk = leads.slice(i, i + parallelism);
      const results = await Promise.allSettled(chunk.map(async (lead) => {
        if (!lead.website) return "skip";
        try {
          const domain = new URL(lead.website).hostname.replace(/^www\./, "");
          if (crawledDomainsCache.has(domain) || localCrawled.has(domain)) return "skip";
          localCrawled.add(domain);
          crawledDomainsCache.add(domain);

          const html = await fetchPageContent(lead.website);
          if (!html) return "skip";

          let { emails, phones, faxes } = extractContactInfo(html);

          if (emails.length === 0) {
            const related = await findEmailOnRelatedPages(lead.website, html);
            if (related?.emails.length) {
              emails = related.emails;
              if (related.phones.length && !lead.phone) phones = related.phones;
              if (related.faxes.length && !lead.fax) faxes = related.faxes;
            }
          }

          if (emails.length === 0) {
            const guessed = await guessCompanyEmail(domain);
            if (guessed) emails = [guessed];
          }

          if (emails.length === 0) return "skip";

          const email = emails[0];
          const existing = await storage.getEmailLeadByEmail(email);
          if (existing && existing.id !== lead.id) return "skip";

          await storage.updateEmailLead(lead.id, {
            email,
            phone: lead.phone || phones[0] || undefined,
            fax: lead.fax || faxes[0] || undefined,
          });
          console.log(`[Lead Crawler] ✓ ${lead.companyName}: ${email}`);
          return "updated";
        } catch {
          return "skip";
        }
      }));

      for (const r of results) {
        if (r.status === "fulfilled" && r.value === "updated") totalUpdated++;
        else totalSkipped++;
      }
      totalProcessed += chunk.length;

      if (totalProcessed % 100 === 0) {
        console.log(`[Lead Crawler] 進捗: ${totalProcessed}件処理 / 取得=${totalUpdated}`);
      }
    }
  }

  console.log(`[Lead Crawler] ✅ 一括クロール完了: 取得=${totalUpdated}, スキップ=${totalSkipped}, 合計=${totalProcessed}`);
  return { updated: totalUpdated, skipped: totalSkipped, total: totalProcessed };
}

export async function sendDailyLeadEmails(): Promise<{ sent: number; failed: number }> {
  const todaySent = await storage.getTodaySentLeadCount();
  const remaining = DAILY_SEND_LIMIT - todaySent;
  if (remaining <= 0) {
    console.log(`[Lead Email] Daily limit reached (${todaySent}/${DAILY_SEND_LIMIT})`);
    return { sent: 0, failed: 0 };
  }

  const template = await storage.getAdminSetting("lead_email_subject");
  const bodyTemplate = await storage.getAdminSetting("lead_email_body");

  const subject = template || "【トラマッチ】物流コスト削減と空車率改善のご提案";
  const body = bodyTemplate || `突然のご連絡失礼いたします。

私どもトラマッチは、AIを活用した求荷求車マッチングプラットフォームを運営しております。

貴社の運送事業において、以下のような課題はございませんでしょうか？

・空車の有効活用ができていない
・帰り便の荷物が見つからない
・新規取引先の開拓に時間がかかる
・運送コストの最適化が進まない

トラマッチでは、AIが自動で最適なマッチングを行い、
空車率の削減と運送コストの最適化を実現いたします。

▼ サービス詳細はこちら
https://tramatch-sinjapan.com

▼ 主な特徴
・AI自動マッチング機能
・リアルタイム空車情報共有
・無料で始められる
・全国対応

まずは無料登録でサービスをお試しください。
ご不明な点がございましたら、お気軽にお問い合わせください。

─────────────────────
トラマッチ運営事務局
SIN JAPAN株式会社
https://tramatch-sinjapan.com
─────────────────────`;

  const leads = await storage.getNewEmailLeadsForSending(remaining);
  if (leads.length === 0) {
    console.log("[Lead Email] No new leads to send");
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  let sendCount = 0;

  for (const lead of leads) {
    if (!lead.email) continue;

    try {
      const personalizedBody = body.replace(/\{company\}/g, lead.companyName);
      // 20件ごとに接続をリフレッシュしてHostinger切断を防ぐ
      const fresh = sendCount > 0 && sendCount % 20 === 0;
      const result = await sendEmail(lead.email, subject, personalizedBody, { fresh });
      sendCount++;

      if (result.success) {
        await storage.updateEmailLead(lead.id, {
          status: "sent",
          sentAt: new Date(),
          sentSubject: subject,
        });
        sent++;
      } else {
        await storage.updateEmailLead(lead.id, { status: "failed" });
        failed++;
        console.error(`[Lead Email] Failed: ${lead.email} - ${result.error}`);
      }
    } catch (err) {
      await storage.updateEmailLead(lead.id, { status: "failed" });
      failed++;
      console.error(`[Lead Email] Error: ${lead.email}`, err);
    }

    await new Promise(r => setTimeout(r, SEND_INTERVAL_MS));
  }

  console.log(`[Lead Email] Daily send complete: sent=${sent}, failed=${failed}`);
  return { sent, failed };
}

// クロールとメール送信の実行ロックフラグ（多重起動防止）
let isCrawling = false;
let isSending = false;
let isDirCrawling = false;
let isExistingCrawling = false;

// 並列バッチでクロール実行（count件×3バッチ）
async function runParallelCrawl(batchCount = 3, perBatch = 80) {
  if (isCrawling) {
    console.log("[Lead Crawler] Crawl already running, skipping.");
    return;
  }
  isCrawling = true;
  try {
    const jobs = [];
    for (let i = 0; i < batchCount; i++) {
      jobs.push(crawlLeadsWithAI(perBatch).catch(err =>
        console.error(`[Lead Crawler] Batch ${i + 1} failed:`, err)
      ));
    }
    await Promise.all(jobs);
    console.log(`[Lead Crawler] ${batchCount} parallel search batches complete`);
  } finally {
    isCrawling = false;
  }
}

// 並列ディレクトリクロール実行（5バッチ）
async function runParallelDirCrawl(batchCount = 5, perBatch = 100) {
  if (isDirCrawling) {
    console.log("[Lead Crawler] Dir crawl already running, skipping.");
    return;
  }
  isDirCrawling = true;
  try {
    const jobs = [];
    for (let i = 0; i < batchCount; i++) {
      jobs.push(crawlFromDirectoriesOnly(perBatch).catch(err =>
        console.error(`[Lead Crawler] Dir batch ${i + 1} failed:`, err)
      ));
    }
    await Promise.all(jobs);
    console.log(`[Lead Crawler] ${batchCount} parallel directory batches complete`);
  } finally {
    isDirCrawling = false;
  }
}

export function scheduleLeadCrawler() {
  // 1分ごとにJST時刻をチェック
  setInterval(async () => {
    const now = new Date();
    const jstHour = (now.getUTCHours() + 9) % 24;
    const min = now.getMinutes();

    // ============================================================
    // クロールスケジュール（1日8回 = 3時間ごと）
    // 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 → 検索クロール
    // 07:30, 13:30, 19:30 → ディレクトリ専用クロール
    // ============================================================
    const searchCrawlHours = [6, 9, 12, 15, 18, 21];
    const dirCrawlHours    = [7, 13, 19];

    if (min === 0 && searchCrawlHours.includes(jstHour)) {
      console.log(`[Lead Crawler] ⏰ ${jstHour}:00 JST — 検索クロール開始（3並列）`);
      runParallelCrawl(3, 100).catch(console.error);
    }

    if (min === 30 && dirCrawlHours.includes(jstHour)) {
      console.log(`[Lead Crawler] ⏰ ${jstHour}:30 JST — ディレクトリクロール開始（5並列）`);
      runParallelDirCrawl(5, 120).catch(console.error);
    }

    // ============================================================
    // 既存リード（ウェブサイトあり・メールなし）のメール取得
    // 2時間ごとに300件（1日12回 = 3,600件/日）
    // ============================================================
    const existingCrawlHours = [6,8,10,12,14,16,18,20,22,0,2,4];
    if (min === 45 && existingCrawlHours.includes(jstHour) && !isExistingCrawling) {
      isExistingCrawling = true;
      console.log(`[Lead Crawler] ⏰ ${jstHour}:45 JST — 既存リードのメール取得開始（300件）`);
      crawlEmailsForExistingLeads(300).catch(console.error).finally(() => { isExistingCrawling = false; });
    }

    // ============================================================
    // メール送信スケジュール（1日1回）
    // 10:00 JST のみ（スパム対策で減量）
    // ============================================================
    const sendHours = [10];

    if (min === 0 && sendHours.includes(jstHour)) {
      if (isSending) {
        console.log("[Lead Email] Already sending, skipping.");
        return;
      }
      isSending = true;
      console.log(`[Lead Email] ⏰ ${jstHour}:00 JST — メール送信開始`);
      try {
        await sendDailyLeadEmails();
      } catch (err) {
        console.error("[Lead Email] Send failed:", err);
      } finally {
        isSending = false;
      }
    }
  }, 60000);

  // 起動時ログ
  console.log("[Lead Crawler] ✅ スケジュール設定完了:");
  console.log("  クロール: 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 JST（検索）");
  console.log("  クロール: 07:30, 13:30, 19:30 JST（ディレクトリ）");
  console.log("  メール送信: 10:00 JST（1日1回・20通上限）");

  // 起動時：ウェブサイトありメールなしが残っていれば自動で一括クロール再開
  setTimeout(async () => {
    try {
      const pending = await storage.getLeadsWithWebsiteNoEmail(1);
      if (pending.length > 0) {
        console.log("[Lead Crawler] 🔄 起動時自動クロール開始（未取得リードあり）");
        crawlAllExistingLeadsParallel(20).catch(console.error);
        // ※ クロール中の自動送信は停止（スパム対策）
      }
    } catch (err) {
      console.error("[Lead Crawler] 起動時クロール確認エラー:", err);
    }
  }, 10000); // 起動10秒後に実行
}
