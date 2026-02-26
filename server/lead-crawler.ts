import { storage } from "./storage";
import { sendEmail } from "./notification-service";

const DAILY_SEND_LIMIT = 300;
const SEND_INTERVAL_MS = 3000;
const CRAWL_BATCH_SIZE = 50;

const SEARCH_QUERIES = [
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
];

const PORTAL_DOMAINS = [
  "imitsu.jp", "baseconnect.in", "biz.ne.jp", "houjin.jp",
  "clearworks.co.jp", "job-gear.jp", "townwork.net",
  "navit-j.com", "mapion.co.jp", "ekiten.jp", "itp.ne.jp",
  "ashita-office.com", "freee.co.jp", "minkabu.jp",
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
    const timeout = setTimeout(() => controller.abort(), 10000);
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
  const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const emails = [...new Set((textContent.match(EMAIL_REGEX) || []).filter(isValidCompanyEmail))];

  const phones = [...new Set(textContent.match(PHONE_REGEX) || [])];

  const faxes: string[] = [];
  let faxMatch;
  const faxRegex = new RegExp(FAX_REGEX.source, "g");
  while ((faxMatch = faxRegex.exec(textContent)) !== null) {
    faxes.push(faxMatch[1].trim());
  }

  return { emails: emails.slice(0, 5), phones: phones.slice(0, 3), faxes: [...new Set(faxes)].slice(0, 3) };
}

function extractCompanyName(html: string, url: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    let title = titleMatch[1].replace(/\s*[|\-–—].*$/, "").trim();
    if (title && title.length > 2 && title.length < 50) return title;
  }
  const ogMatch = html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i);
  if (ogMatch) return ogMatch[1].trim();
  try { return new URL(url).hostname; } catch { return url; }
}

async function findEmailOnRelatedPages(baseUrl: string): Promise<{ emails: string[]; phones: string[]; faxes: string[] } | null> {
  try {
    const urlObj = new URL(baseUrl);
    const origin = urlObj.origin;
    const relatedPaths = ["/contact", "/contact/", "/company/", "/about/", "/access/", "/inquiry/"];
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

export async function crawlLeadsFromUrl(url: string): Promise<number> {
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
    const relatedInfo = await findEmailOnRelatedPages(url);
    if (relatedInfo) {
      emails = relatedInfo.emails;
      if (relatedInfo.phones.length > 0) phones = relatedInfo.phones;
      if (relatedInfo.faxes.length > 0) faxes = relatedInfo.faxes;
    }
    if (emails.length === 0) return 0;
  }

  let added = 0;

  for (const email of emails) {
    const existing = await storage.getEmailLeadByEmail(email);
    if (existing) continue;

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
    } catch (err) {
      console.error(`[Lead Crawler] Failed to save lead ${email}:`, err);
    }
  }

  return added;
}

const DIRECTORY_SOURCES = [
  "https://www.jta.or.jp/member/",
  "https://www.logi-today.com/company-list",
  "https://transport-guide.jp/company/",
  "https://www.trabox.ne.jp/company/",
  "https://www.butsuryu.or.jp/member/",
  "https://www.nittsu.co.jp/",
  "https://lnews.jp/logistics-company/",
  "https://www.e-logit.com/companylist/",
  "https://www.logistics.jp/company/",
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

  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=jp-jp`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate",
        "Referer": "https://duckduckgo.com/",
        "DNT": "1",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`[Lead Crawler] DuckDuckGo returned ${res.status} for "${query}"`);
    } else {
      const html = await res.text();

      let match;
      const uddgPattern = /uddg=(https?%3A%2F%2F[^&"']+)/gi;
      while ((match = uddgPattern.exec(html)) !== null) {
        try { addUniqueUrl(urls, decodeURIComponent(match[1]), true); } catch {}
      }

      const resultLinkPattern = /class="result__a"[^>]*href="([^"]+)"/gi;
      while ((match = resultLinkPattern.exec(html)) !== null) {
        try {
          let href = match[1];
          if (href.includes("uddg=")) {
            const u = new URL(href, "https://duckduckgo.com").searchParams.get("uddg");
            if (u) href = u;
          }
          addUniqueUrl(urls, href, true);
        } catch {}
      }

      const snippetUrlPattern = /class="result__url"[^>]*>([^<]+)</gi;
      while ((match = snippetUrlPattern.exec(html)) !== null) {
        try {
          let domain = match[1].trim().replace(/\s/g, "");
          if (!domain.startsWith("http")) domain = "https://" + domain;
          const cleanUrl = new URL(domain).origin;
          addUniqueUrl(urls, cleanUrl, true);
        } catch {}
      }

      const hrefPattern = /href="(https?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.(?:co\.jp|ne\.jp|or\.jp|jp)[^"]*?)"/gi;
      while ((match = hrefPattern.exec(html)) !== null) {
        try { addUniqueUrl(urls, match[1], true); } catch {}
      }
    }
  } catch (err) {
    console.error(`[Lead Crawler] DuckDuckGo search failed:`, err);
  }

  if (urls.length < 5) {
    try {
      await new Promise(r => setTimeout(r, 1000));
      const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=jp&setlang=ja`;
      const bingRes = await fetch(bingUrl, {
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "ja,en;q=0.5",
        },
      });
      if (bingRes.ok) {
        const bingHtml = await bingRes.text();
        let match;
        const bingLinkPattern = /<a[^>]*href="(https?:\/\/(?:www\.)?[a-zA-Z0-9\-]+\.(?:co\.jp|ne\.jp|or\.jp|jp)[^"]*?)"[^>]*>/gi;
        while ((match = bingLinkPattern.exec(bingHtml)) !== null) {
          try { addUniqueUrl(urls, match[1], true); } catch {}
        }
        const citeLinkPattern = /<cite[^>]*>(https?:\/\/[^<]+)<\/cite>/gi;
        while ((match = citeLinkPattern.exec(bingHtml)) !== null) {
          try { addUniqueUrl(urls, match[1].replace(/<[^>]+>/g, "").trim(), true); } catch {}
        }
        if (urls.length > 0) console.log(`[Lead Crawler] Bing added URLs, total now: ${urls.length}`);
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
  const todaysQueries = shuffled.slice(0, 5);

  const prefStart = Math.floor(Math.random() * PREFECTURES.length);
  const todaysPrefectures = [
    PREFECTURES[prefStart % PREFECTURES.length],
    PREFECTURES[(prefStart + 1) % PREFECTURES.length],
    PREFECTURES[(prefStart + 2) % PREFECTURES.length],
  ];

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

  for (const lead of leads) {
    if (!lead.email) continue;

    try {
      const personalizedBody = body.replace(/\{company\}/g, lead.companyName);
      const result = await sendEmail(lead.email, subject, personalizedBody);

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

export function scheduleLeadCrawler() {
  setInterval(async () => {
    const now = new Date();
    const jstHour = (now.getUTCHours() + 9) % 24;

    if (jstHour === 7 && now.getMinutes() === 0) {
      console.log("[Lead Crawler] Starting daily crawl...");
      try {
        await crawlLeadsWithAI();
      } catch (err) {
        console.error("[Lead Crawler] Crawl failed:", err);
      }
    }

    if (jstHour === 10 && now.getMinutes() === 0) {
      console.log("[Lead Email] Starting daily send...");
      try {
        await sendDailyLeadEmails();
      } catch (err) {
        console.error("[Lead Email] Send failed:", err);
      }
    }
  }, 60000);

  const now = new Date();
  const jstHour = (now.getUTCHours() + 9) % 24;
  const nextCrawl = jstHour < 7 ? 7 - jstHour : 24 - jstHour + 7;
  const nextSend = jstHour < 10 ? 10 - jstHour : 24 - jstHour + 10;
  console.log(`[Lead Crawler] Scheduled: crawl in ~${nextCrawl}h (07:00 JST), send in ~${nextSend}h (10:00 JST)`);
}
