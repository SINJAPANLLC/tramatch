import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, FileText, PenTool, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SeoArticle } from "@shared/schema";
import DashboardLayout from "@/components/dashboard-layout";

export default function AdminSeo() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [notes, setNotes] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: articles, isLoading } = useQuery<SeoArticle[]>({
    queryKey: ["/api/admin/seo-articles"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/seo-articles/generate", { topic, keywords, notes });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "記事を生成しました" });
      setTopic("");
      setKeywords("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-articles"] });
    },
    onError: () => {
      toast({ title: "記事の生成に失敗しました", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/seo-articles/${id}`);
    },
    onSuccess: () => {
      toast({ title: "記事を削除しました" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-articles"] });
    },
    onError: () => {
      toast({ title: "記事の削除に失敗しました", variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">SEO記事生成</h1>
          <p className="text-sm text-muted-foreground mt-1">AIによるSEO対策記事の自動生成</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI記事生成
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="seo-topic">記事テーマ</Label>
                  <Input
                    id="seo-topic"
                    placeholder="例: 求荷求車サービスのメリット"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1"
                    data-testid="input-seo-topic"
                  />
                </div>
                <div>
                  <Label htmlFor="seo-keywords">キーワード（カンマ区切り）</Label>
                  <Input
                    id="seo-keywords"
                    placeholder="例: 求荷求車, マッチング, 運送"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="mt-1"
                    data-testid="input-seo-keywords"
                  />
                </div>
                <div>
                  <Label htmlFor="seo-notes">備考・指示</Label>
                  <Textarea
                    id="seo-notes"
                    placeholder="記事の方向性や含めたい情報など..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 min-h-[80px]"
                    data-testid="input-seo-notes"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => generateMutation.mutate()}
                  disabled={!topic.trim() || generateMutation.isPending}
                  data-testid="button-generate-article"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1.5" />
                  )}
                  {generateMutation.isPending ? "生成中..." : "AIで記事を生成"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                生成された記事
              </h2>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !articles || articles.length === 0 ? (
                <div className="text-center py-6">
                  <PenTool className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground" data-testid="text-empty-state">生成された記事はありません</p>
                  <p className="text-xs text-muted-foreground mt-1">テーマとキーワードを入力してAIで記事を生成できます</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {articles.map((article) => (
                    <div key={article.id} className="border rounded-md" data-testid={`card-article-${article.id}`}>
                      <div
                        className="flex items-center justify-between gap-2 flex-wrap p-3 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                        data-testid={`button-expand-article-${article.id}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="text-xs text-muted-foreground">{article.topic}</span>
                            {article.keywords && article.keywords.split(",").map((kw, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
                            ))}
                            <Badge variant={article.status === "published" ? "default" : "secondary"} className="text-xs">
                              {article.status === "published" ? "公開" : "下書き"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.createdAt).toLocaleDateString("ja-JP")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(article.id);
                            }}
                            data-testid={`button-delete-article-${article.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          {expandedId === article.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {expandedId === article.id && (
                        <div className="border-t p-3">
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                            data-testid={`text-article-content-${article.id}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br/>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
