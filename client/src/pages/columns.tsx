import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SeoArticle } from "@shared/schema";
import { useEffect } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  important: "重要",
  update: "更新",
  maintenance: "メンテナンス",
  campaign: "キャンペーン",
  general: "お知らせ",
};

function formatDate(dateVal: string | Date) {
  const d = new Date(dateVal);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function extractExcerpt(content: string, maxLen = 120): string {
  return content
    .replace(/^#{1,3}\s+.+$/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^- /gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .substring(0, maxLen) + "...";
}

export default function Columns() {
  const { data: articles, isLoading } = useQuery<SeoArticle[]>({
    queryKey: ["/api/columns"],
  });

  useEffect(() => {
    document.title = "コラム記事 | トラマッチ - 求荷求車マッチングプラットフォーム";
    const desc = "トラマッチの物流・運送業界コラム。求荷求車、配車効率化、物流DXなど業界の最新情報をお届けします。";
    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", desc);
    setMeta("og:title", "コラム記事 | トラマッチ", "property");
    setMeta("og:description", desc, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", window.location.href, "property");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">
            コラム記事
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-shadow">
            物流・運送業界の最新情報やノウハウをお届けします
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articles.map((article) => (
              <Link key={article.id} href={`/columns/${article.slug}`}>
                <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-column-${article.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {article.keywords?.split(",").slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {kw.trim()}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-base font-bold text-foreground mb-2 line-clamp-2" data-testid={`text-column-title-${article.id}`}>
                      {article.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {article.metaDescription || extractExcerpt(article.content)}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.createdAt)}
                      </div>
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        続きを読む
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">コラム記事はまだありません</p>
              <p className="text-sm text-muted-foreground mt-1">記事は毎日自動的に追加されます</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
