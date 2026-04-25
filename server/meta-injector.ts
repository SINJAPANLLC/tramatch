import { storage } from "./storage";

const CATEGORY_SLUGS = new Set(["kyukakyusha", "truck-order", "carrier-sales"]);
const BASE_URL = "https://tramatch-sinjapan.com";

interface MetaTags {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  ogImage: string;
  jsonLd?: string;
}

function injectMetaTags(html: string, meta: MetaTags): string {
  const titleTag = `<title>${meta.title}</title>`;
  const metaTags = [
    `<meta name="description" content="${escape(meta.description)}" />`,
    `<meta property="og:title" content="${escape(meta.title)}" />`,
    `<meta property="og:description" content="${escape(meta.description)}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${meta.ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="トラマッチ" />`,
    `<meta property="og:locale" content="ja_JP" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(meta.title)}" />`,
    `<meta name="twitter:description" content="${escape(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.ogImage}" />`,
    `<link rel="canonical" href="${meta.canonical}" />`,
  ].join("\n    ");

  let result = html;

  result = result.replace(/<title>[^<]*<\/title>/, titleTag);
  result = result.replace(/<meta name="description"[^>]*\/?>/, "");
  result = result.replace(/<meta property="og:title"[^>]*\/?>/, "");
  result = result.replace(/<meta property="og:description"[^>]*\/?>/, "");
  result = result.replace(/<meta property="og:type"[^>]*\/?>/, "");
  result = result.replace(/<meta property="og:url"[^>]*\/?>/, "");
  result = result.replace(/<meta property="og:image"[^>]*\/?>(\s*<meta property="og:image:width"[^>]*\/?>)?(\s*<meta property="og:image:height"[^>]*\/?>)?/, "");
  result = result.replace(/<meta property="og:site_name"[^>]*\/?>/, "");
  result = result.replace(/<meta property="og:locale"[^>]*\/?>/, "");
  result = result.replace(/<meta name="twitter:card"[^>]*\/?>/, "");
  result = result.replace(/<meta name="twitter:title"[^>]*\/?>/, "");
  result = result.replace(/<meta name="twitter:description"[^>]*\/?>/, "");
  result = result.replace(/<meta name="twitter:image"[^>]*\/?>/, "");
  result = result.replace(/<link rel="canonical"[^>]*\/?>/, "");

  result = result.replace("</head>", `    ${metaTags}\n  </head>`);

  if (meta.jsonLd) {
    result = result.replace("</head>", `    <script type="application/ld+json">${meta.jsonLd}</script>\n  </head>`);
  }

  return result;
}

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function injectSeoMeta(html: string, urlPath: string): Promise<string> {
  try {
    const columnMatch = urlPath.match(/^\/column\/([^/?#]+)/);
    if (!columnMatch) return html;

    const slug = decodeURIComponent(columnMatch[1]);
    if (CATEGORY_SLUGS.has(slug)) return html;

    const article = await storage.getSeoArticleBySlug(slug);
    if (!article || article.status !== "published") return html;

    const title = `${article.title} | コラム | トラマッチ`;
    const description = article.metaDescription || article.title;
    const canonical = `${BASE_URL}/column/${article.slug}`;

    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description,
      datePublished: new Date(article.createdAt).toISOString(),
      url: canonical,
      image: `${BASE_URL}/og-image.png`,
      author: { "@type": "Organization", name: "トラマッチ", url: BASE_URL },
      publisher: { "@type": "Organization", name: "トラマッチ", url: BASE_URL, logo: { "@type": "ImageObject", url: `${BASE_URL}/og-image.png` } },
    });

    return injectMetaTags(html, {
      title,
      description,
      canonical,
      ogType: "article",
      ogImage: `${BASE_URL}/og-image.png`,
      jsonLd,
    });
  } catch (err) {
    console.error("[SEO] injectSeoMeta error:", err);
    return html;
  }
}
