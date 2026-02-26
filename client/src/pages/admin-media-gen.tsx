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
import { ImageIcon, Video, Wand2, Loader2, Download, Sparkles, Settings2, Palette, Type, Ratio } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type GeneratedMedia = {
  id: string;
  type: "image" | "video";
  prompt: string;
  url: string;
  createdAt: string;
};

export default function AdminMediaGen() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("image");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("professional");
  const [imageSize, setImageSize] = useState("1024x1024");
  const [videoTopic, setVideoTopic] = useState("");
  const [videoStyle, setVideoStyle] = useState("explanation");
  const [generatedImages, setGeneratedImages] = useState<GeneratedMedia[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedMedia[]>([]);

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
      toast({ title: "動画生成を開始しました" });
    },
    onError: () => toast({ title: "動画生成に失敗しました", variant: "destructive" }),
  });

  const templatePrompts = [
    { label: "バナー広告", prompt: "物流マッチングサービスのバナー広告、トラックとデジタル技術をイメージ、プロフェッショナル" },
    { label: "SNS投稿用", prompt: "物流業界向けSNS投稿画像、明るくモダンなデザイン、ターコイズカラー基調" },
    { label: "ブログアイキャッチ", prompt: "運送業界ブログのアイキャッチ画像、高速道路を走るトラック、夕焼け" },
    { label: "サービス紹介", prompt: "AIを活用した物流マッチングの概念図、テクノロジーと物流の融合" },
    { label: "求人広告", prompt: "運送会社の求人広告用画像、働くドライバーのイメージ、活気のある職場" },
    { label: "LP用ヒーロー", prompt: "物流プラットフォームのランディングページ用ヒーロー画像、信頼性と効率性" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-media-gen-page">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Sparkles className="w-6 h-6 text-primary" />
            画像・動画生成
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AIを使って画像や動画コンテンツを自動生成します</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-media">
            <TabsTrigger value="image" data-testid="tab-image">
              <ImageIcon className="w-4 h-4 mr-1" />画像生成
            </TabsTrigger>
            <TabsTrigger value="video" data-testid="tab-video">
              <Video className="w-4 h-4 mr-1" />動画生成
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Palette className="w-4 h-4 mr-1" />テンプレート
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-bold text-foreground">画像プロンプト</Label>
                  <Textarea
                    className="mt-1 min-h-[100px] text-sm"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="生成したい画像の説明を入力してください..."
                    data-testid="input-image-prompt"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Palette className="w-3 h-3" />スタイル
                    </Label>
                    <Select value={imageStyle} onValueChange={setImageStyle}>
                      <SelectTrigger className="mt-1" data-testid="select-image-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">プロフェッショナル</SelectItem>
                        <SelectItem value="modern">モダン</SelectItem>
                        <SelectItem value="minimal">ミニマル</SelectItem>
                        <SelectItem value="illustration">イラスト</SelectItem>
                        <SelectItem value="photo">写真風</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Ratio className="w-3 h-3" />サイズ
                    </Label>
                    <Select value={imageSize} onValueChange={setImageSize}>
                      <SelectTrigger className="mt-1" data-testid="select-image-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">1024×1024（正方形）</SelectItem>
                        <SelectItem value="1792x1024">1792×1024（横長）</SelectItem>
                        <SelectItem value="1024x1792">1024×1792（縦長）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => imageGenMutation.mutate({ prompt: imagePrompt, style: imageStyle, size: imageSize })}
                  disabled={!imagePrompt.trim() || imageGenMutation.isPending}
                  data-testid="button-generate-image"
                >
                  {imageGenMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />}
                  画像を生成
                </Button>
              </CardContent>
            </Card>

            {generatedImages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">生成履歴</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedImages.map((img) => (
                    <Card key={img.id} data-testid={`card-generated-image-${img.id}`}>
                      <CardContent className="p-3">
                        <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                          <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="text-xs" data-testid={`button-download-${img.id}`}>
                            <Download className="w-3 h-3 mr-1" />ダウンロード
                          </Button>
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
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-bold text-foreground">動画トピック</Label>
                  <Input
                    className="mt-1"
                    value={videoTopic}
                    onChange={(e) => setVideoTopic(e.target.value)}
                    placeholder="例: 物流業界のDX推進について"
                    data-testid="input-video-topic"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-foreground flex items-center gap-1">
                    <Settings2 className="w-3 h-3" />動画スタイル
                  </Label>
                  <Select value={videoStyle} onValueChange={setVideoStyle}>
                    <SelectTrigger className="mt-1" data-testid="select-video-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="explanation">解説動画</SelectItem>
                      <SelectItem value="promotion">プロモーション</SelectItem>
                      <SelectItem value="tutorial">チュートリアル</SelectItem>
                      <SelectItem value="news">ニュース</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => videoGenMutation.mutate({ topic: videoTopic, style: videoStyle })}
                  disabled={!videoTopic.trim() || videoGenMutation.isPending}
                  data-testid="button-generate-video"
                >
                  {videoGenMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Video className="w-4 h-4 mr-1" />}
                  動画を生成
                </Button>
                <p className="text-xs text-muted-foreground">※動画生成には数分かかる場合があります。YouTube管理ページから生成状況を確認できます。</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatePrompts.map((t, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setImagePrompt(t.prompt); setActiveTab("image"); }} data-testid={`card-template-${i}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-foreground">{t.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.prompt}</p>
                    <Badge variant="outline" className="text-[10px] mt-2">クリックで使用</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
