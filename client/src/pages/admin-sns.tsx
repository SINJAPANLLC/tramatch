import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Loader2, Wand2, ExternalLink, Send, Trash2, Zap, Clock, CheckCircle2, AlertCircle, Copy, PenLine } from "lucide-react";
import { SiX, SiInstagram, SiFacebook, SiTiktok, SiLinkedin } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import type { SnsAutoPost } from "@shared/schema";

const snsServices = [
  { id: "x", name: "X (Twitter)", icon: SiX, color: "#000000", darkColor: "#ffffff", loginUrl: "https://x.com/login", dashboardUrl: "https://x.com/home" },
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "#E4405F", darkColor: "#E4405F", loginUrl: "https://www.instagram.com/accounts/login/", dashboardUrl: "https://www.instagram.com/" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "#1877F2", darkColor: "#1877F2", loginUrl: "https://www.facebook.com/login/", dashboardUrl: "https://www.facebook.com/" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "#000000", darkColor: "#ffffff", loginUrl: "https://www.tiktok.com/login", dashboardUrl: "https://www.tiktok.com/" },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "#0A66C2", darkColor: "#0A66C2", loginUrl: "https://www.linkedin.com/login", dashboardUrl: "https://www.linkedin.com/feed/" },
];

const DEFAULT_CHARACTER_PROMPT = `【トラパンのキャラクター設定】
名前: トラパン（トラックパンダの略）
種族: パンダ
カラー: ターコイズ色
所属: AI求荷求車マッチングサービス「トラマッチ」の公式キャラクター
性格: 明るく元気で親しみやすい。物流業界のことが大好き。トラック運転手や荷主さんの味方。難しいことも分かりやすく楽しく伝えるのが得意。
口調: フレンドリーで親しみやすい。「〜だよ！」「〜なんだ！」など柔らかい語尾。絵文字を適度に使う。
使命: 物流業界をもっと盛り上げること。トラマッチを通じて運送会社と荷主をつなぎ、みんなを笑顔にすること。
特徴: お腹に∞（無限大）マーク。物流の無限の可能性を象徴。`;

function getStatusBadge(status: string) {
  switch (status) {
    case "posted": return <Badge className="bg-green-500 text-white" data-testid="badge-posted"><CheckCircle2 className="w-3 h-3 mr-1" />投稿済み</Badge>;
    case "generating": return <Badge className="bg-blue-500 text-white" data-testid="badge-generating"><Loader2 className="w-3 h-3 mr-1 animate-spin" />生成中</Badge>;
    case "posting": return <Badge className="bg-yellow-500 text-white" data-testid="badge-posting"><Send className="w-3 h-3 mr-1" />投稿中</Badge>;
    case "generated": return <Badge className="bg-purple-500 text-white" data-testid="badge-generated"><CheckCircle2 className="w-3 h-3 mr-1" />生成完了</Badge>;
    case "error": return <Badge variant="destructive" data-testid="badge-error"><AlertCircle className="w-3 h-3 mr-1" />エラー</Badge>;
    default: return <Badge variant="outline" data-testid="badge-pending"><Clock className="w-3 h-3 mr-1" />{status}</Badge>;
  }
}

export default function AdminSns() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("accounts");
  const [platform, setPlatform] = useState("x");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["x"]);
  const [characterPrompt, setCharacterPrompt] = useState(DEFAULT_CHARACTER_PROMPT);

  const postsQuery = useQuery<SnsAutoPost[]>({
    queryKey: ["/api/admin/sns-posts"],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { platform: string; topic: string; characterPrompt: string }) => {
      const res = await apiRequest("POST", "/api/admin/sns/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setContent(data.content || "");
      toast({ title: "投稿文を生成しました" });
    },
    onError: () => toast({ title: "生成に失敗しました", variant: "destructive" }),
  });

  const postSingleMutation = useMutation({
    mutationFn: async (data: { platform: string; content: string }) => {
      const res = await apiRequest("POST", "/api/admin/sns/post-single", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: `投稿完了！ ID: ${data.externalId}` });
      } else {
        toast({ title: "投稿を保存しました", description: data.error });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sns-posts"] });
    },
    onError: () => toast({ title: "投稿に失敗しました", variant: "destructive" }),
  });

  const autoPostMutation = useMutation({
    mutationFn: async (data: { platforms: string[] }) => {
      const res = await apiRequest("POST", "/api/admin/sns/auto-post", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "自動投稿を開始しました" });
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["/api/admin/sns-posts"] }), 5000);
    },
    onError: () => toast({ title: "自動投稿に失敗しました", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/sns-posts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "削除しました" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sns-posts"] });
    },
  });

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-sns-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Share2 className="w-6 h-6 text-primary" />
              SNS自動投稿管理
            </h1>
            <p className="text-sm text-muted-foreground mt-1">トラパンがSNS投稿を自動生成・投稿します</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-sns">
            <TabsTrigger value="accounts" data-testid="tab-accounts">SNSアカウント</TabsTrigger>
            <TabsTrigger value="character" data-testid="tab-character">キャラ設定</TabsTrigger>
            <TabsTrigger value="create" data-testid="tab-create">投稿作成</TabsTrigger>
            <TabsTrigger value="auto" data-testid="tab-auto">自動投稿</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">投稿履歴</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {snsServices.map((sns) => {
                const Icon = sns.icon;
                return (
                  <Card key={sns.id} className="hover:border-primary/50 transition-colors" data-testid={`card-sns-${sns.id}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${sns.color}15` }}>
                          <Icon className="w-6 h-6" style={{ color: sns.color }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{sns.name}</h3>
                          <p className="text-xs text-muted-foreground">ログイン・管理画面</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={sns.loginUrl} target="_blank" rel="noopener noreferrer" className="flex-1" data-testid={`link-login-${sns.id}`}>
                          <Button variant="default" size="sm" className="w-full text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            ログイン
                          </Button>
                        </a>
                        <a href={sns.dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex-1" data-testid={`link-dashboard-${sns.id}`}>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            管理画面
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="character" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <PenLine className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">トラパン キャラクター設定</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  トラパンの人格・口調・性格などを設定します。ここで設定した内容がAI投稿生成に反映されます。
                </p>
                <Textarea
                  className="min-h-[300px] text-sm font-mono"
                  value={characterPrompt}
                  onChange={(e) => setCharacterPrompt(e.target.value)}
                  placeholder="キャラクターの設定を入力..."
                  data-testid="input-character-prompt"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCharacterPrompt(DEFAULT_CHARACTER_PROMPT);
                      toast({ title: "デフォルト設定に戻しました" });
                    }}
                    data-testid="button-reset-character"
                  >
                    デフォルトに戻す
                  </Button>
                  <Button
                    onClick={() => toast({ title: "キャラクター設定を保存しました" })}
                    data-testid="button-save-character"
                  >
                    設定を保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-sm font-bold text-foreground">1. プラットフォームを選択</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                    {snsServices.map((sns) => {
                      const Icon = sns.icon;
                      const isSelected = platform === sns.id;
                      return (
                        <button
                          key={sns.id}
                          type="button"
                          onClick={() => setPlatform(sns.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                            isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                          }`}
                          data-testid={`select-platform-${sns.id}`}
                        >
                          <Icon className="w-5 h-5" style={{ color: isSelected ? sns.color : "#999" }} />
                          <span className={`text-[11px] font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {sns.name.replace("公式アカウント", "")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground">2. 投稿の内容・テーマを入力</Label>
                  <Textarea
                    className="mt-2 min-h-[80px] text-sm"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={"例:\n・新着荷物情報の告知\n・トラマッチの使い方紹介\n・物流業界の最新ニュースについて\n・ドライバー募集のお知らせ"}
                    data-testid="input-sns-prompt"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => generateMutation.mutate({ platform, topic: prompt, characterPrompt })}
                  disabled={!prompt.trim() || generateMutation.isPending}
                  data-testid="button-ai-generate"
                >
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  トラパンとしてAIで投稿文を生成
                </Button>

                {content && (
                  <div className="space-y-3 border-t pt-4">
                    <Label className="text-sm font-bold text-foreground">3. 生成された投稿文</Label>
                    <Textarea
                      className="min-h-[150px] text-sm"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      data-testid="input-sns-content"
                    />
                    <p className="text-xs text-muted-foreground">{content.length} 文字 ・ 内容は自由に編集できます</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(content);
                          toast({ title: "投稿文をコピーしました" });
                        }}
                        data-testid="button-copy-content"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        コピー
                      </Button>
                      <Button
                        onClick={() => postSingleMutation.mutate({ platform, content })}
                        disabled={postSingleMutation.isPending}
                        data-testid="button-post-single"
                      >
                        {postSingleMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                        {snsServices.find(s => s.id === platform)?.name}に投稿
                      </Button>
                      {(() => {
                        const sns = snsServices.find(s => s.id === platform);
                        return sns ? (
                          <a href={sns.dashboardUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" data-testid="button-open-sns">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              手動で投稿
                            </Button>
                          </a>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auto" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">AI自動投稿</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    トラパンが物流業界に関するSNS投稿を自動生成し、選択したプラットフォームに投稿します。
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground mb-2 block">投稿先を選択</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {snsServices.map((sns) => {
                      const Icon = sns.icon;
                      const isSelected = selectedPlatforms.includes(sns.id);
                      return (
                        <button
                          key={sns.id}
                          type="button"
                          onClick={() => togglePlatform(sns.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                          }`}
                          data-testid={`toggle-auto-${sns.id}`}
                        >
                          <Icon className="w-5 h-5" style={{ color: isSelected ? sns.color : "#999" }} />
                          <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {sns.name.replace("公式アカウント", "")}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-foreground mb-2">API設定状況</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">X (Twitter) API</span>
                      <Badge variant="outline" className="text-xs" data-testid="status-x-api">環境変数で設定</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Facebook API</span>
                      <Badge variant="outline" className="text-xs" data-testid="status-fb-api">環境変数で設定</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">LinkedIn API</span>
                      <Badge variant="outline" className="text-xs" data-testid="status-li-api">環境変数で設定</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ※ API未設定のプラットフォームは投稿文の生成のみ行います。手動でコピー＆ペーストで投稿できます。
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => autoPostMutation.mutate({ platforms: selectedPlatforms })}
                  disabled={selectedPlatforms.length === 0 || autoPostMutation.isPending}
                  data-testid="button-auto-post"
                >
                  {autoPostMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  {selectedPlatforms.length}つのSNSに自動投稿を実行
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground">投稿履歴</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/sns-posts"] })}
                data-testid="button-refresh-history"
              >
                更新
              </Button>
            </div>

            {postsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !postsQuery.data?.length ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">まだ投稿履歴がありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {postsQuery.data.map((post) => {
                  const sns = snsServices.find(s => s.id === post.platform);
                  const Icon = sns?.icon;
                  return (
                    <Card key={post.id} data-testid={`card-post-${post.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${sns?.color || "#999"}15` }}>
                            {Icon && <Icon className="w-5 h-5" style={{ color: sns?.color }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-foreground">{sns?.name || post.platform}</span>
                              {getStatusBadge(post.status)}
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{post.content}</p>
                            {post.errorMessage && (
                              <p className="text-xs text-red-500 mt-1">{post.errorMessage}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {post.createdAt ? new Date(post.createdAt).toLocaleString("ja-JP") : ""}
                              </span>
                              {post.externalId && (
                                <span className="text-xs text-primary">ID: {post.externalId}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(post.content);
                                toast({ title: "コピーしました" });
                              }}
                              data-testid={`button-copy-${post.id}`}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(post.id)}
                              data-testid={`button-delete-${post.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
