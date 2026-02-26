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
import { ImageIcon, Video, Wand2, Loader2, Download, Sparkles, Palette, Ratio } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type GeneratedMedia = {
  id: string;
  type: "image" | "video";
  prompt: string;
  url: string;
  createdAt: string;
};

const imageStyles = [
  { id: "professional", label: "プロフェッショナル" },
  { id: "modern", label: "モダン" },
  { id: "minimal", label: "ミニマル" },
  { id: "illustration", label: "イラスト" },
  { id: "photo", label: "写真風" },
];

const imageSizes = [
  { id: "1024x1024", label: "1024×1024（正方形）" },
  { id: "1792x1024", label: "1792×1024（横長）" },
  { id: "1024x1792", label: "1024×1792（縦長）" },
];

const videoStyles = [
  { id: "explanation", label: "解説動画" },
  { id: "promotion", label: "プロモーション" },
  { id: "tutorial", label: "チュートリアル" },
  { id: "news", label: "ニュース" },
];

const templatePrompts = [
  { label: "バナー広告", prompt: "物流マッチングサービスのバナー広告、トラックとデジタル技術をイメージ、プロフェッショナル" },
  { label: "SNS投稿用", prompt: "物流業界向けSNS投稿画像、明るくモダンなデザイン、ターコイズカラー基調" },
  { label: "ブログアイキャッチ", prompt: "運送業界ブログのアイキャッチ画像、高速道路を走るトラック、夕焼け" },
  { label: "サービス紹介", prompt: "AIを活用した物流マッチングの概念図、テクノロジーと物流の融合" },
  { label: "求人広告", prompt: "運送会社の求人広告用画像、働くドライバーのイメージ、活気のある職場" },
  { label: "LP用ヒーロー", prompt: "物流プラットフォームのランディングページ用ヒーロー画像、信頼性と効率性" },
];

export default function AdminMediaGen() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("image");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("professional");
  const [imageSize, setImageSize] = useState("1024x1024");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("explanation");
  const [generatedImages, setGeneratedImages] = useState<GeneratedMedia[]>([]);

  const imageGenMutation = useMutation({
    mutationFn: async (data: { prompt: string; style: string; size: string }) => {
      const res = await apiRequest("POST", "/api/admin/media/generate-image", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        setGeneratedImages(prev => [{ id: Date.now().toString(), type: "image", prompt: imagePrompt, url: data.url, createdAt: new Date().toISOString() }, ...prev]);
      }
      toast({ title: "画像を生成しました" });
    },
    onError: () => toast({ title: "画像生成に失敗しました", variant: "destructive" }),
  });

  const videoGenMutation = useMutation({
    mutationFn: async (data: { topic: string; style: string }) => {
      const res = await apiRequest("POST", "/api/admin/media/generate-video", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "動画生成を開始しました。YouTube管理ページから進捗を確認できます。" });
    },
    onError: () => toast({ title: "動画生成に失敗しました", variant: "destructive" }),
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-media-gen-page">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Sparkles className="w-6 h-6 text-primary" />
            画像・動画生成
          </h1>
          <p className="text-sm text-muted-foreground mt-1">プロンプトを入力するとAIがコンテンツを自動生成します</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-media">
            <TabsTrigger value="image" data-testid="tab-image">
              <ImageIcon className="w-4 h-4 mr-1" />画像生成
            </TabsTrigger>
            <TabsTrigger value="video" data-testid="tab-video">
              <Video className="w-4 h-4 mr-1" />動画生成
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-sm font-bold text-foreground">1. プロンプトを入力</Label>
                  <Textarea
                    className="mt-2 min-h-[100px] text-sm"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder={"生成したい画像の説明を入力してください\n\n例:\n・物流マッチングサービスのバナー広告\n・トラックが高速道路を走るイメージ写真\n・AIと物流を組み合わせたモダンなイラスト"}
                    data-testid="input-image-prompt"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {templatePrompts.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImagePrompt(t.prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`template-prompt-${i}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Palette className="w-3 h-3" />2. スタイル
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      {imageStyles.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setImageStyle(s.id)}
                          className={`text-xs py-2 px-2 rounded-md border transition-colors ${
                            imageStyle === s.id ? "border-primary bg-primary/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                          data-testid={`style-${s.id}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Ratio className="w-3 h-3" />3. サイズ
                    </Label>
                    <div className="grid grid-cols-1 gap-1.5 mt-2">
                      {imageSizes.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setImageSize(s.id)}
                          className={`text-xs py-2 px-3 rounded-md border transition-colors text-left ${
                            imageSize === s.id ? "border-primary bg-primary/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                          data-testid={`size-${s.id}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => imageGenMutation.mutate({ prompt: imagePrompt, style: imageStyle, size: imageSize })}
                  disabled={!imagePrompt.trim() || imageGenMutation.isPending}
                  data-testid="button-generate-image"
                >
                  {imageGenMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  {imageGenMutation.isPending ? "生成中..." : "AIで画像を生成"}
                </Button>
              </CardContent>
            </Card>

            {generatedImages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">生成された画像</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedImages.map((img) => (
                    <Card key={img.id} data-testid={`card-generated-image-${img.id}`}>
                      <CardContent className="p-3">
                        <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(img.createdAt).toLocaleString("ja-JP")}</p>
                        <div className="flex gap-2 mt-2">
                          <a href={img.url} download target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs" data-testid={`button-download-${img.id}`}>
                              <Download className="w-3 h-3 mr-1" />ダウンロード
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-sm font-bold text-foreground">1. 動画のテーマ・内容を入力</Label>
                  <Textarea
                    className="mt-2 min-h-[100px] text-sm"
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder={"動画のテーマを入力してください\n\n例:\n・物流業界のDX推進について\n・トラマッチの使い方ガイド\n・燃料費高騰時代のコスト管理術\n・食品輸送における温度管理の重要性"}
                    data-testid="input-video-prompt"
                  />
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground">2. 動画スタイル</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {videoStyles.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setVideoStyle(s.id)}
                        className={`text-xs py-2.5 px-3 rounded-md border transition-colors ${
                          videoStyle === s.id ? "border-primary bg-primary/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                        data-testid={`video-style-${s.id}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => videoGenMutation.mutate({ topic: videoPrompt, style: videoStyle })}
                  disabled={!videoPrompt.trim() || videoGenMutation.isPending}
                  data-testid="button-generate-video"
                >
                  {videoGenMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Video className="w-4 h-4 mr-2" />}
                  {videoGenMutation.isPending ? "生成を開始中..." : "AIで動画を生成"}
                </Button>
                <p className="text-xs text-muted-foreground">※動画はAIがスクリプト作成→音声生成→動画合成の順で処理します。完了までに数分かかります。進捗はYouTube管理ページから確認できます。</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
