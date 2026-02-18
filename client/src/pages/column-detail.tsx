import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SeoArticle } from "@shared/schema";
import { useEffect } from "react";

function formatDate(dateVal: string | Date) {
  const d = new Date(dateVal);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
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
    queryKey: [`/api/columns/${slug}`],
    enabled: !!slug,
  });

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | コラム | トラマッチ`;
      const desc = article.metaDescription || "";
      const setMeta = (name: string, content: string, attr = "name") => {
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };
      if (desc) setMeta("description", desc);
      setMeta("og:title", article.title, "property");
      setMeta("og:description", desc, "property");
      setMeta("og:type", "article", "property");
      setMeta("og:url", window.location.href, "property");
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Skeleton className="h-8 w-3/4 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
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
          <Link href="/columns">
            <Button variant="outline" data-testid="button-back-to-columns">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              コラム一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/columns">
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
        <Card>
          <CardContent className="p-5 sm:p-8">
            <article
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
              data-testid="text-article-content"
            />
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/columns">
            <Button variant="outline" data-testid="button-back-bottom">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              コラム一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
