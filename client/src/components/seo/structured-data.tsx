interface StructuredDataProps {
  type: "Organization" | "WebSite" | "WebPage" | "Article";
  data?: Record<string, any>;
}

const BASE_URL = "https://tramatch-sinjapan.com";

const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "トラマッチ",
  alternateName: "TRAMATCH",
  url: BASE_URL,
  logo: `${BASE_URL}/og-image.png`,
  description: "トラマッチは運送会社と荷物を運んで欲しい会社をつなぐ国内最大級のAI求荷求車サービスです。",
  address: {
    "@type": "PostalAddress",
    streetAddress: "中津7287",
    addressLocality: "愛川町",
    addressRegion: "神奈川県",
    postalCode: "243-0303",
    addressCountry: "JP",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+81-46-212-2325",
    contactType: "customer service",
    availableLanguage: "Japanese",
  },
  founder: {
    "@type": "Organization",
    name: "合同会社SIN JAPAN",
  },
};

const webSiteData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "トラマッチ",
  alternateName: "TRAMATCH",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/column?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function StructuredData({ type, data }: StructuredDataProps) {
  let jsonLd: Record<string, any>;

  switch (type) {
    case "Organization":
      jsonLd = organizationData;
      break;
    case "WebSite":
      jsonLd = webSiteData;
      break;
    case "WebPage":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        ...data,
      };
      break;
    case "Article":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        publisher: { "@type": "Organization", name: "トラマッチ", url: BASE_URL },
        ...data,
      };
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
