import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SeoArticle } from "@shared/schema";
import { useEffect } from "react";
import SeoHead from "@/components/seo/seo-head";
import Breadcrumb from "@/components/seo/breadcrumb";
import TableOfContents, { extractHeadings } from "@/components/seo/table-of-contents";
import CtaBlock, { MobileFixedCta } from "@/components/seo/cta-block";
import FaqBlock from "@/components/seo/faq-block";
import RelatedArticles from "@/components/seo/related-articles";
import StructuredData from "@/components/seo/structured-data";

const CATEGORY_MAP: Record<string, { label: string; href: string }> = {
  kyukakyusha: { label: "求荷求車・マッチング", href: "/column/kyukakyusha" },
  "truck-order": { label: "トラック手配・荷主向け", href: "/column/truck-order" },
  "carrier-sales": { label: "運送会社の案件獲得", href: "/column/carrier-sales" },
};

function formatDate(dateVal: string | Date) {
  const d = new Date(dateVal);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function renderMarkdown(md: string): string {
  let text = md
    .replace(/^### H3:\s*/gm, "### ")
    .replace(/^## H2:\s*/gm, "## ")
    .replace(/^# H1:\s*/gm, "# ")
    .replace(/^### h3:\s*/gm, "### ")
    .replace(/^## h2:\s*/gm, "## ")
    .replace(/^# h1:\s*/gm, "# ");

  text = text
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, (_, content) => `## ${content}`)
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1")
    .replace(/<ul[^>]*>|<\/ul>/gi, "")
    .replace(/<ol[^>]*>|<\/ol>/gi, "")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<[^>]+>/g, "");

  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const headings = extractHeadings(text);
  let headingIndex = 0;

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, () => {
      const h = headings[headingIndex++];
      const id = h ? h.id : "";
      return `<h3 id="${id}" class="text-lg font-bold mt-6 mb-3 text-foreground scroll-mt-20">${h?.text || ""}</h3>`;
    })
    .replace(/^## (.+)$/gm, () => {
      const h = headings[headingIndex++];
      const id = h ? h.id : "";
      return `<h2 id="${id}" class="text-xl font-bold mt-8 mb-4 text-foreground scroll-mt-20">${h?.text || ""}</h2>`;
    })
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-4 text-foreground">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mt-3 text-foreground leading-relaxed">')
    .replace(/\n/g, "<br/>")
    .replace(/^/, '<p class="text-foreground leading-relaxed">')
    .replace(/$/, "</p>");
}

export default function ColumnDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery<SeoArticle>({
    queryKey: ["/api/columns", slug],
    queryFn: async () => {
      const res = await fetch(`/api/columns/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (article && slug) {
      fetch(`/api/columns/${slug}/view`, { method: "POST" }).catch(() => {});
    }
  }, [article, slug]);

  const cat = article?.category ? CATEGORY_MAP[article.category] : null;
  const isNoindex = article ? (article.wordCount || 0) < 800 && (article.content?.replace(/[#*\-\n\s]/g, "").length || 0) < 800 : false;

  let faqItems: { question: string; answer: string }[] = [];
  if (article?.faq) {
    try { faqItems = JSON.parse(article.faq); } catch {}
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Skeleton className="h-8 w-3/4 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Card><CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent></Card>
        </div>
      </div>
    );
  }

  if (!article || error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground mb-4">記事が見つかりません</h1>
          <p className="text-muted-foreground mb-6">お探しの記事は存在しないか、非公開になっています。</p>
          <Link href="/column">
            <Button variant="outline" data-testid="button-back-to-columns">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              コラム一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "コラム", href: "/column" },
    ...(cat ? [{ label: cat.label, href: cat.href }] : []),
    { label: article.title },
  ];

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <SeoHead
        title={`${article.title} | コラム | トラマッチ`}
        description={article.metaDescription || ""}
        ogType="article"
        noindex={isNoindex}
      />
      <StructuredData
        type="Article"
        data={{
          headline: article.title,
          description: article.metaDescription,
          datePublished: article.createdAt,
          url: `https://tramatch-sinjapan.com/column/${article.slug}`,
          author: { "@type": "Organization", name: "トラマッチ" },
        }}
      />

      <div className="bg-primary py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/column">
            <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground mb-4 -ml-2" data-testid="button-back-to-columns">
              <ArrowLeft className="w-4 h-4 mr-1" />
              コラム一覧
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-article-title">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-primary-foreground/70">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.createdAt)}
            </div>
            {cat && (
              <Link href={cat.href}>
                <Badge variant="secondary" className="text-xs cursor-pointer">{cat.label}</Badge>
              </Link>
            )}
            {article.keywords?.split(",").map((kw, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {kw.trim()}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Breadcrumb items={breadcrumbItems} />

        <CtaBlock variant="both" location="article-top" articleSlug={article.slug} />

        <TableOfContents content={article.content} />

        <Card>
          <CardContent className="p-5 sm:p-8">
            <article
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
              data-testid="text-article-content"
            />
          </CardContent>
        </Card>

        {faqItems.length > 0 && <FaqBlock items={faqItems} />}

        <CtaBlock variant="both" location="article-bottom" articleSlug={article.slug} />

        <RelatedArticles slug={article.slug} category={article.category || undefined} />

        <div className="mt-8 text-center">
          <Link href="/column">
            <Button variant="outline" data-testid="button-back-bottom">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              コラム一覧に戻る
            </Button>
          </Link>
        </div>
      </div>

      <MobileFixedCta articleSlug={article.slug} />
    </div>
  );
}
