import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, Wand2, Loader2, Eye, Code, Copy, Download, Globe, CheckCircle2, Trash2, ExternalLink, FileCode2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import type { LandingPage } from "@shared/schema";

export default function AdminLpGen() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("html");
  const [lpTitle, setLpTitle] = useState("");
  const [lpSlug, setLpSlug] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [previewMode, setPreviewMode] = useState<"preview" | "code">("preview");

  const [aiTitle, setAiTitle] = useState("");
  const [aiPurpose, setAiPurpose] = useState("service");
  const [aiTarget, setAiTarget] = useState("");
  const [aiFeatures, setAiFeatures] = useState("");
  const [aiColor, setAiColor] = useState("teal");

  const savedLPsQuery = useQuery<LandingPage[]>({
    queryKey: ["/api/admin/lp/list"],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { title: string; purpose: string; targetAudience: string; features: string; colorTheme: string }) => {
      const res = await apiRequest("POST", "/api/admin/lp/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      const html = data.html || "";
      setHtmlCode(html);
      setLpTitle(aiTitle);
      setLpSlug(aiTitle.replace(/[^a-zA-Z0-9\u3000-\u9FFF]/g, "-").toLowerCase().replace(/-+/g, "-"));
      setActiveTab("preview");
      toast({ title: "AIがLPを生成しました" });
    },
    onError: () => {
      toast({ title: "LP生成に失敗しました", variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; slug: string; html: string; published: boolean }) => {
      const res = await apiRequest("POST", "/api/admin/lp/save", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "LPを保存しました" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lp/list"] });
    },
    onError: () => toast({ title: "保存に失敗しました", variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/lp/${id}/publish`, { published });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: data.published ? "LPを公開しました" : "LPを非公開にしました" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lp/list"] });
    },
    onError: () => toast({ title: "更新に失敗しました", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/lp/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "LPを削除しました" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lp/list"] });
    },
    onError: () => toast({ title: "削除に失敗しました", variant: "destructive" }),
  });

  function handleCopyHtml() {
    navigator.clipboard.writeText(htmlCode);
    toast({ title: "HTMLをコピーしました" });
  }

  function handleDownloadHtml() {
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lpTitle || "landing-page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "HTMLファイルをダウンロードしました" });
  }

  function handleSaveAndPublish(published: boolean) {
    if (!lpTitle.trim()) {
      toast({ title: "タイトルを入力してください", variant: "destructive" });
      return;
    }
    if (!lpSlug.trim()) {
      toast({ title: "スラッグ（URL）を入力してください", variant: "destructive" });
      return;
    }
    if (!htmlCode.trim()) {
      toast({ title: "HTMLコードを入力してください", variant: "destructive" });
      return;
    }
    saveMutation.mutate({ title: lpTitle, slug: lpSlug, html: htmlCode, published });
  }

  function loadLPForEdit(lp: LandingPage) {
    setLpTitle(lp.title);
    setLpSlug(lp.slug);
    setHtmlCode(lp.html);
    setActiveTab("preview");
  }

  const savedLPs = savedLPsQuery.data || [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-lp-gen-page">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Layout className="w-6 h-6 text-primary" />
            LP生成
          </h1>
          <p className="text-sm text-muted-foreground mt-1">HTMLを入力またはAIで生成し、プレビュー確認後に公開できます</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-lp">
            <TabsTrigger value="html" data-testid="tab-html">
              <FileCode2 className="w-4 h-4 mr-1" />HTML入力
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Wand2 className="w-4 h-4 mr-1" />AI生成
            </TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">
              <Eye className="w-4 h-4 mr-1" />プレビュー
            </TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved">
              <Globe className="w-4 h-4 mr-1" />保存済み ({savedLPs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">HTMLコードを直接入力してランディングページを作成できます。</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-foreground">LPタイトル</Label>
                    <Input
                      className="mt-1"
                      value={lpTitle}
                      onChange={(e) => setLpTitle(e.target.value)}
                      placeholder="例: トラマッチ サービス紹介"
                      data-testid="input-lp-title"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground">スラッグ（URL）</Label>
                    <div className="flex items-center mt-1 gap-1">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">/lp/</span>
                      <Input
                        value={lpSlug}
                        onChange={(e) => setLpSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase())}
                        placeholder="service-intro"
                        data-testid="input-lp-slug"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground">HTMLコード</Label>
                  <Textarea
                    className="mt-1 min-h-[400px] text-xs font-mono"
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    placeholder={"<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>ランディングページ</title>\n</head>\n<body>\n  <h1>ここにコンテンツを入力</h1>\n</body>\n</html>"}
                    data-testid="input-html-code"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => { if (htmlCode.trim()) setActiveTab("preview"); }}
                    disabled={!htmlCode.trim()}
                    data-testid="button-preview-html"
                  >
                    <Eye className="w-4 h-4 mr-1" />プレビュー
                  </Button>
                  <Button
                    onClick={() => handleSaveAndPublish(false)}
                    disabled={saveMutation.isPending}
                    variant="outline"
                    data-testid="button-save-draft"
                  >
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    下書き保存
                  </Button>
                  <Button
                    onClick={() => handleSaveAndPublish(true)}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-publish"
                  >
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Globe className="w-4 h-4 mr-1" />}
                    保存して公開
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">条件を入力するとAIがLPのHTMLを自動生成します。</p>

                <div>
                  <Label className="text-sm font-bold text-foreground">LPタイトル</Label>
                  <Input className="mt-1" value={aiTitle} onChange={(e) => setAiTitle(e.target.value)} placeholder="例: トラマッチ - 物流マッチングサービス" data-testid="input-ai-title" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-foreground">目的</Label>
                    <Select value={aiPurpose} onValueChange={setAiPurpose}>
                      <SelectTrigger className="mt-1" data-testid="select-purpose">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">サービス紹介</SelectItem>
                        <SelectItem value="recruitment">求人・採用</SelectItem>
                        <SelectItem value="campaign">キャンペーン</SelectItem>
                        <SelectItem value="event">イベント</SelectItem>
                        <SelectItem value="product">商品紹介</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground">カラーテーマ</Label>
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {[
                        { id: "teal", label: "ターコイズ", color: "#0d9488" },
                        { id: "blue", label: "ブルー", color: "#2563eb" },
                        { id: "purple", label: "パープル", color: "#7c3aed" },
                        { id: "orange", label: "オレンジ", color: "#ea580c" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setAiColor(c.id)}
                          className={`text-[11px] py-2 rounded-md border transition-colors flex items-center justify-center gap-1 ${
                            aiColor === c.id ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/40"
                          }`}
                          data-testid={`color-${c.id}`}
                        >
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.color }} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground">ターゲット</Label>
                  <Input className="mt-1" value={aiTarget} onChange={(e) => setAiTarget(e.target.value)} placeholder="例: 運送会社、荷主企業" data-testid="input-ai-target" />
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground">アピールポイント（1行1つ）</Label>
                  <Textarea
                    className="mt-1 min-h-[100px] text-sm"
                    value={aiFeatures}
                    onChange={(e) => setAiFeatures(e.target.value)}
                    placeholder={"AIマッチング\nリアルタイム通知\n簡単操作"}
                    data-testid="input-ai-features"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => generateMutation.mutate({ title: aiTitle, purpose: aiPurpose, targetAudience: aiTarget, features: aiFeatures, colorTheme: aiColor })}
                  disabled={!aiTitle.trim() || generateMutation.isPending}
                  data-testid="button-generate-ai"
                >
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  {generateMutation.isPending ? "AIが生成中..." : "AIでLPを生成"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            {htmlCode ? (
              <>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-foreground">タイトル</Label>
                        <Input className="mt-1 text-sm" value={lpTitle} onChange={(e) => setLpTitle(e.target.value)} placeholder="LPタイトル" data-testid="input-preview-title" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold text-foreground">スラッグ（URL）</Label>
                        <div className="flex items-center mt-1 gap-1">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">/lp/</span>
                          <Input
                            className="text-sm"
                            value={lpSlug}
                            onChange={(e) => setLpSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase())}
                            placeholder="my-page"
                            data-testid="input-preview-slug"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === "preview" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("preview")}
                      data-testid="button-preview-mode"
                    >
                      <Eye className="w-3 h-3 mr-1" />プレビュー
                    </Button>
                    <Button
                      variant={previewMode === "code" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("code")}
                      data-testid="button-code-mode"
                    >
                      <Code className="w-3 h-3 mr-1" />HTMLコード
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleCopyHtml} data-testid="button-copy-html">
                      <Copy className="w-3 h-3 mr-1" />コピー
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadHtml} data-testid="button-download-html">
                      <Download className="w-3 h-3 mr-1" />ダウンロード
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveAndPublish(false)}
                      disabled={saveMutation.isPending}
                      data-testid="button-save-draft-preview"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />下書き保存
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveAndPublish(true)}
                      disabled={saveMutation.isPending}
                      data-testid="button-publish-preview"
                    >
                      {saveMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Globe className="w-3 h-3 mr-1" />}
                      公開
                    </Button>
                  </div>
                </div>

                {previewMode === "preview" ? (
                  <Card>
                    <CardContent className="p-0">
                      <iframe
                        srcDoc={htmlCode}
                        className="w-full min-h-[600px] border-0 rounded-md"
                        sandbox="allow-same-origin"
                        title="LP Preview"
                        data-testid="iframe-lp-preview"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <Textarea
                        className="text-xs font-mono min-h-[500px]"
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                        data-testid="textarea-edit-html"
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">「HTML入力」タブでHTMLを入力するか、「AI生成」タブでLPを生成してください</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 mt-4">
            {savedLPsQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : savedLPs.length > 0 ? (
              <div className="space-y-3">
                {savedLPs.map((lp) => (
                  <Card key={lp.id} data-testid={`card-saved-lp-${lp.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-foreground truncate">{lp.title}</p>
                            <Badge variant={lp.published ? "default" : "outline"} className="text-[10px] shrink-0">
                              {lp.published ? "公開中" : "下書き"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">/lp/{lp.slug} • {new Date(lp.createdAt).toLocaleString("ja-JP")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 ml-4 shrink-0">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => loadLPForEdit(lp)} data-testid={`button-edit-lp-${lp.id}`}>
                            <Eye className="w-3 h-3 mr-1" />編集
                          </Button>
                          {lp.published && (
                            <a href={`/lp/${lp.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="text-xs" data-testid={`button-open-lp-${lp.id}`}>
                                <ExternalLink className="w-3 h-3 mr-1" />開く
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => publishMutation.mutate({ id: lp.id, published: !lp.published })}
                            disabled={publishMutation.isPending}
                            data-testid={`button-toggle-publish-${lp.id}`}
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            {lp.published ? "非公開" : "公開"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-destructive hover:text-destructive"
                            onClick={() => { if (confirm("このLPを削除しますか？")) deleteMutation.mutate(lp.id); }}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-lp-${lp.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">保存されたLPはありません</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
