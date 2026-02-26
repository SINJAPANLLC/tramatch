import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, ArrowRight, TrendingUp, Truck, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { SeoArticle } from "@shared/schema";
import SeoHead from "@/components/seo/seo-head";
import Breadcrumb from "@/components/seo/breadcrumb";
import StructuredData from "@/components/seo/structured-data";
import CtaBlock from "@/components/seo/cta-block";
import { trackCategoryArticleClick } from "@/lib/analytics";
import { useState } from "react";

const CATEGORIES = [
  { key: "all", label: "すべて" },
  { key: "kyukakyusha", label: "求荷求車・マッチング" },
  { key: "truck-order", label: "トラック手配・荷主向け" },
  { key: "carrier-sales", label: "運送会社の案件獲得" },
];

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
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: articles, isLoading } = useQuery<SeoArticle[]>({
    queryKey: ["/api/columns"],
  });

  const { data: popularArticles } = useQuery<SeoArticle[]>({
    queryKey: ["/api/columns/popular"],
    queryFn: async () => {
      const res = await fetch("/api/columns/popular?limit=5");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filteredArticles = articles?.filter(a =>
    activeCategory === "all" || a.category === activeCategory
  ) || [];

  const newArticles = articles?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="コラム記事 | トラマッチ - 求荷求車マッチングプラットフォーム"
        description="トラマッチの物流・運送業界コラム。求荷求車、配車効率化、物流DXなど業界の最新情報とノウハウをお届けします。"
      />
      <StructuredData type="Organization" />
      <StructuredData type="WebSite" />

      <div className="bg-primary py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">
            物流・運送業界コラム
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-shadow">
            求荷求車・トラック手配・運送営業の最新ノウハウをお届けします
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumb items={[{ label: "コラム" }]} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/guide/kyukakyusha-complete">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/30 h-full" data-testid="card-pillar-page">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-primary" />
                  <Badge variant="default" className="text-xs">完全ガイド</Badge>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">求荷求車 完全ガイド 2026</h3>
                <p className="text-xs text-muted-foreground">仕組み・使い方・料金・比較を網羅した決定版ガイド</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/compare/kyukakyusha-sites">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" data-testid="card-compare-page">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">比較</Badge>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">求荷求車サイト比較 2026</h3>
                <p className="text-xs text-muted-foreground">主要サイトの特徴・料金・向き不向きを徹底比較</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/alternative/trabox">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" data-testid="card-alternative-page">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  <Badge variant="secondary" className="text-xs">代替</Badge>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">トラボックスの代わり 2026</h3>
                <p className="text-xs text-muted-foreground">乗り換え検討者向けのサービス選び方ガイド</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link href="/column/kyukakyusha">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" data-testid="card-hub-kyukakyusha">
              <CardContent className="p-4 flex items-center gap-3">
                <Search className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">求荷求車・マッチング</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">荷物と車両のマッチングに関する記事</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/column/truck-order">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" data-testid="card-hub-truck-order">
              <CardContent className="p-4 flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">トラック手配・荷主向け</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">荷主の方向けの手配ノウハウ</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/column/carrier-sales">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" data-testid="card-hub-carrier-sales">
              <CardContent className="p-4 flex items-center gap-3">
                <Truck className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">運送会社の案件獲得</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">運送会社の営業・売上向上</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {popularArticles && popularArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              人気記事
            </h2>
            <div className="space-y-2">
              {popularArticles.slice(0, 5).map((article, i) => (
                <Link key={article.id} href={`/column/${article.slug}`} onClick={() => trackCategoryArticleClick("popular", article.slug)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer" data-testid={`card-popular-${article.id}`}>
                    <span className="text-lg font-bold text-primary w-6 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{formatDate(article.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">{article.viewCount || 0}回閲覧</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.key}
              variant={activeCategory === cat.key ? "default" : "secondary"}
              className="cursor-pointer px-3 py-1"
              onClick={() => setActiveCategory(cat.key)}
              data-testid={`badge-category-${cat.key}`}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent></Card>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredArticles.map((article) => (
              <Link key={article.id} href={`/column/${article.slug}`} onClick={() => trackCategoryArticleClick(activeCategory, article.slug)}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-column-${article.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {article.category && (
                        <Badge variant="outline" className="text-xs">
                          {CATEGORIES.find(c => c.key === article.category)?.label || article.category}
                        </Badge>
                      )}
                      {article.keywords?.split(",").slice(0, 2).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
                      ))}
                    </div>
                    <h2 className="text-base font-bold text-foreground mb-2 line-clamp-2" data-testid={`text-column-title-${article.id}`}>
                      {article.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {article.metaDescription || (article.content ? extractExcerpt(article.content) : '')}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.createdAt)}
                      </div>
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        続きを読む <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-state">
              {activeCategory === "all" ? "コラム記事はまだありません" : "このカテゴリの記事はまだありません"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">記事は毎日自動的に追加されます</p>
          </CardContent></Card>
        )}

        <CtaBlock variant="both" location="column-list-bottom" />
      </div>
    </div>
  );
}
