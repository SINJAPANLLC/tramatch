import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeoArticle } from "@shared/schema";
import { trackCategoryArticleClick } from "@/lib/analytics";

interface RelatedArticlesProps {
  slug: string;
  category?: string;
}

function formatDate(dateVal: string | Date) {
  const d = new Date(dateVal);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function RelatedArticles({ slug, category }: RelatedArticlesProps) {
  const { data: articles, isLoading } = useQuery<SeoArticle[]>({
    queryKey: ["/api/columns", slug, "related"],
    queryFn: async () => {
      const res = await fetch(`/api/columns/${slug}/related`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-4">次に読むべき記事</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <div className="mt-8" data-testid="related-articles">
      <h2 className="text-lg font-bold text-foreground mb-4">次に読むべき記事</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {articles.slice(0, 5).map((article) => (
          <Link
            key={article.id}
            href={`/column/${article.slug}`}
            onClick={() => trackCategoryArticleClick(category || "related", article.slug)}
          >
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-related-${article.id}`}>
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {article.metaDescription || ""}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.createdAt)}
                  </div>
                  <span className="text-xs text-primary font-medium flex items-center gap-0.5">
                    読む <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
