import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, Wand2, Loader2, Eye, Code, Copy, Download, FileText, Palette, Globe, CheckCircle2, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type GeneratedLP = {
  id: string;
  title: string;
  purpose: string;
  html: string;
  createdAt: string;
};

export default function AdminLpGen() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("service");
  const [targetAudience, setTargetAudience] = useState("");
  const [features, setFeatures] = useState("");
  const [colorTheme, setColorTheme] = useState("teal");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [previewMode, setPreviewMode] = useState<"preview" | "code">("preview");
  const [savedLPs, setSavedLPs] = useState<GeneratedLP[]>([]);

  const generateMutation = useMutation({
    mutationFn: async (data: { title: string; purpose: string; targetAudience: string; features: string; colorTheme: string }) => {
      const res = await apiRequest("POST", "/api/admin/lp/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      const html = data.html || generateSampleLP();
      setGeneratedHtml(html);
      setActiveTab("preview");
      toast({ title: "LPを生成しました" });
    },
    onError: () => {
      const html = generateSampleLP();
      setGeneratedHtml(html);
      setActiveTab("preview");
      toast({ title: "サンプルLPを生成しました" });
    },
  });

  function generateSampleLP() {
    const colors: Record<string, { primary: string; gradient: string }> = {
      teal: { primary: "#0d9488", gradient: "linear-gradient(135deg, #0d9488, #14b8a6)" },
      blue: { primary: "#2563eb", gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
      purple: { primary: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)" },
      orange: { primary: "#ea580c", gradient: "linear-gradient(135deg, #ea580c, #f97316)" },
    };
    const c = colors[colorTheme] || colors.teal;
    const lpTitle = title || "トラマッチ - 物流マッチングプラットフォーム";
    const featureList = features ? features.split("\n").filter(f => f.trim()) : ["AIマッチング", "リアルタイム検索", "簡単操作"];

    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${lpTitle}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Hiragino Sans', 'Meiryo', sans-serif; color: #333; }
.hero { background: ${c.gradient}; color: white; padding: 80px 20px; text-align: center; }
.hero h1 { font-size: 36px; margin-bottom: 16px; }
.hero p { font-size: 18px; opacity: 0.9; max-width: 600px; margin: 0 auto 30px; }
.hero .cta { display: inline-block; background: white; color: ${c.primary}; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none; }
.section { padding: 60px 20px; max-width: 1000px; margin: 0 auto; }
.section h2 { font-size: 28px; text-align: center; margin-bottom: 40px; color: ${c.primary}; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
.feature-card { background: #f9fafb; border-radius: 12px; padding: 24px; text-align: center; }
.feature-card .icon { width: 50px; height: 50px; background: ${c.gradient}; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
.feature-card h3 { font-size: 18px; margin-bottom: 8px; }
.feature-card p { font-size: 14px; color: #666; line-height: 1.6; }
.cta-section { background: #f0fdfa; padding: 60px 20px; text-align: center; }
.cta-section h2 { font-size: 24px; margin-bottom: 16px; }
.cta-section .btn { display: inline-block; background: ${c.gradient}; color: white; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none; }
.footer { background: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 13px; }
</style>
</head>
<body>
<div class="hero">
  <h1>${lpTitle}</h1>
  <p>${targetAudience ? `${targetAudience}のための` : ""}効率的な物流マッチングを実現</p>
  <a href="#" class="cta">無料で始める</a>
</div>
<div class="section">
  <h2>サービスの特長</h2>
  <div class="features">
    ${featureList.map((f, i) => `<div class="feature-card">
      <div class="icon">${["🚚", "🔍", "⚡", "📊", "🤝", "💡"][i % 6]}</div>
      <h3>${f}</h3>
      <p>物流業界に特化した機能で、日々の業務を効率化します。</p>
    </div>`).join("\n    ")}
  </div>
</div>
<div class="cta-section">
  <h2>今すぐ始めましょう</h2>
  <p style="margin-bottom: 24px; color: #666;">無料アカウント登録で、すべての機能をお試しいただけます。</p>
  <a href="#" class="btn">無料登録はこちら</a>
</div>
<div class="footer">
  <p>&copy; 2026 トラマッチ All Rights Reserved.</p>
</div>
</body>
</html>`;
  }

  function handleSaveLP() {
    if (!generatedHtml) return;
    const lp: GeneratedLP = {
      id: Date.now().toString(),
      title: title || "無題のLP",
      purpose,
      html: generatedHtml,
      createdAt: new Date().toISOString(),
    };
    setSavedLPs(prev => [lp, ...prev]);
    toast({ title: "LPを保存しました" });
  }

  function handleCopyHtml() {
    navigator.clipboard.writeText(generatedHtml);
    toast({ title: "HTMLをコピーしました" });
  }

  function handleDownloadHtml() {
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "landing-page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "HTMLファイルをダウンロードしました" });
  }

  const purposeLabels: Record<string, string> = {
    service: "サービス紹介",
    recruitment: "求人・採用",
    campaign: "キャンペーン",
    event: "イベント",
    product: "商品紹介",
  };

  const lpTemplates = [
    { title: "運送会社向けサービス紹介", purpose: "service", audience: "運送会社", features: "AI荷物マッチング\n空車情報検索\nリアルタイム通知" },
    { title: "荷主向け求荷求車LP", purpose: "service", audience: "荷主企業", features: "即時マッチング\n複数見積もり\n安心の実績" },
    { title: "ドライバー採用ページ", purpose: "recruitment", audience: "トラックドライバー", features: "高待遇\n柔軟なシフト\n充実の福利厚生" },
    { title: "新規会員キャンペーン", purpose: "campaign", audience: "物流関係者", features: "初月無料\n限定特典\n簡単登録" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-lp-gen-page">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Layout className="w-6 h-6 text-primary" />
            LP生成
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AIを使ってランディングページを自動生成します</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-lp">
            <TabsTrigger value="create" data-testid="tab-create">LP作成</TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">プレビュー</TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">テンプレート</TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved">保存済み</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-bold text-foreground">LPタイトル</Label>
                  <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: トラマッチ - 物流マッチングサービス" data-testid="input-lp-title" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3" />目的
                    </Label>
                    <Select value={purpose} onValueChange={setPurpose}>
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
                    <Label className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Palette className="w-3 h-3" />カラーテーマ
                    </Label>
                    <Select value={colorTheme} onValueChange={setColorTheme}>
                      <SelectTrigger className="mt-1" data-testid="select-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teal">ターコイズ</SelectItem>
                        <SelectItem value="blue">ブルー</SelectItem>
                        <SelectItem value="purple">パープル</SelectItem>
                        <SelectItem value="orange">オレンジ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground">ターゲット</Label>
                  <Input className="mt-1" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="例: 運送会社、荷主企業" data-testid="input-target" />
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground">アピールポイント（1行1つ）</Label>
                  <Textarea
                    className="mt-1 min-h-[100px] text-sm"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder={"AIマッチング\nリアルタイム通知\n簡単操作"}
                    data-testid="input-features"
                  />
                </div>

                <Button
                  onClick={() => generateMutation.mutate({ title, purpose, targetAudience, features, colorTheme })}
                  disabled={generateMutation.isPending}
                  data-testid="button-generate-lp"
                >
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />}
                  LPを生成
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            {generatedHtml ? (
              <>
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyHtml} data-testid="button-copy-html">
                      <Copy className="w-3 h-3 mr-1" />コピー
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadHtml} data-testid="button-download-html">
                      <Download className="w-3 h-3 mr-1" />ダウンロード
                    </Button>
                    <Button size="sm" onClick={handleSaveLP} data-testid="button-save-lp">
                      <CheckCircle2 className="w-3 h-3 mr-1" />保存
                    </Button>
                  </div>
                </div>

                {previewMode === "preview" ? (
                  <Card>
                    <CardContent className="p-0">
                      <iframe
                        srcDoc={generatedHtml}
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
                      <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/30 p-4 rounded-md overflow-auto max-h-[600px]" data-testid="code-lp-html">
                        {generatedHtml}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">LPを生成するとここにプレビューが表示されます</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lpTemplates.map((t, i) => (
                <Card
                  key={i}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => { setTitle(t.title); setPurpose(t.purpose); setTargetAudience(t.audience); setFeatures(t.features); setActiveTab("create"); }}
                  data-testid={`card-lp-template-${i}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground">{t.title}</span>
                        <Badge variant="outline" className="text-[10px] ml-2">{purposeLabels[t.purpose]}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">ターゲット: {t.audience}</p>
                    <p className="text-xs text-muted-foreground mt-1">特長: {t.features.split("\n").join("、")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 mt-4">
            {savedLPs.length > 0 ? (
              <div className="space-y-3">
                {savedLPs.map((lp) => (
                  <Card key={lp.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setGeneratedHtml(lp.html); setActiveTab("preview"); }} data-testid={`card-saved-lp-${lp.id}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">{lp.title}</p>
                        <p className="text-xs text-muted-foreground">{purposeLabels[lp.purpose] || lp.purpose} • {new Date(lp.createdAt).toLocaleString("ja-JP")}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        <Eye className="w-3 h-3 mr-1" />プレビュー
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
