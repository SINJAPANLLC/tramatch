import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Send, Clock, CheckCircle2, Loader2, Wand2, ExternalLink, CalendarDays, BarChart3, TrendingUp, Eye, Heart } from "lucide-react";
import { SiX, SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiLinkedin, SiPinterest, SiThreads, SiLine } from "react-icons/si";
import DashboardLayout from "@/components/dashboard-layout";

type SnsPost = {
  id: string;
  platform: string;
  content: string;
  mediaUrl: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  impressions: number;
  engagements: number;
};

const snsServices = [
  { id: "x", name: "X (Twitter)", icon: SiX, color: "#000000", darkColor: "#ffffff", loginUrl: "https://x.com/login", dashboardUrl: "https://x.com/home" },
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "#E4405F", darkColor: "#E4405F", loginUrl: "https://www.instagram.com/accounts/login/", dashboardUrl: "https://www.instagram.com/" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "#1877F2", darkColor: "#1877F2", loginUrl: "https://www.facebook.com/login/", dashboardUrl: "https://www.facebook.com/" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "#FF0000", darkColor: "#FF0000", loginUrl: "https://accounts.google.com/ServiceLogin?service=youtube", dashboardUrl: "https://studio.youtube.com/" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "#000000", darkColor: "#ffffff", loginUrl: "https://www.tiktok.com/login", dashboardUrl: "https://www.tiktok.com/" },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "#0A66C2", darkColor: "#0A66C2", loginUrl: "https://www.linkedin.com/login", dashboardUrl: "https://www.linkedin.com/feed/" },
  { id: "pinterest", name: "Pinterest", icon: SiPinterest, color: "#BD081C", darkColor: "#BD081C", loginUrl: "https://www.pinterest.com/login/", dashboardUrl: "https://www.pinterest.com/" },
  { id: "threads", name: "Threads", icon: SiThreads, color: "#000000", darkColor: "#ffffff", loginUrl: "https://www.threads.net/login", dashboardUrl: "https://www.threads.net/" },
  { id: "line", name: "LINE公式アカウント", icon: SiLine, color: "#06C755", darkColor: "#06C755", loginUrl: "https://manager.line.biz/", dashboardUrl: "https://manager.line.biz/" },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "下書き", variant: "secondary" },
  scheduled: { label: "予約済み", variant: "outline" },
  published: { label: "投稿済み", variant: "default" },
  failed: { label: "失敗", variant: "destructive" },
};

export default function AdminSns() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("accounts");
  const [platform, setPlatform] = useState("x");
  const [content, setContent] = useState("");

  const { data: posts } = useQuery<SnsPost[]>({
    queryKey: ["/api/admin/sns-posts"],
    enabled: activeTab === "posts",
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { platform: string; topic: string }) => {
      const res = await apiRequest("POST", "/api/admin/sns/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setContent(data.content || "");
      toast({ title: "投稿文を生成しました" });
    },
    onError: () => toast({ title: "生成に失敗しました", variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async (data: { platform: string; content: string; scheduledAt?: string }) => {
      const res = await apiRequest("POST", "/api/admin/sns-posts", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "投稿を保存しました" });
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sns-posts"] });
    },
    onError: () => toast({ title: "保存に失敗しました", variant: "destructive" }),
  });

  const samplePosts: SnsPost[] = [
    { id: "1", platform: "x", content: "🚚 本日の新着荷物情報！東京→大阪の冷凍案件が登録されました。#物流 #トラマッチ", mediaUrl: null, status: "published", scheduledAt: null, publishedAt: "2026-02-25T10:00:00Z", createdAt: "2026-02-25T09:00:00Z", impressions: 1250, engagements: 48 },
    { id: "2", platform: "instagram", content: "トラマッチで効率的な配車を実現！AIが最適なマッチングをサポートします。", mediaUrl: null, status: "scheduled", scheduledAt: "2026-02-27T12:00:00Z", publishedAt: null, createdAt: "2026-02-26T08:00:00Z", impressions: 0, engagements: 0 },
    { id: "3", platform: "facebook", content: "【お知らせ】トラマッチに新機能が追加されました。空車検索がさらに便利に！", mediaUrl: null, status: "draft", scheduledAt: null, publishedAt: null, createdAt: "2026-02-26T14:00:00Z", impressions: 0, engagements: 0 },
  ];

  const displayPosts = posts || samplePosts;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-sns-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Share2 className="w-6 h-6 text-primary" />
              SNS管理
            </h1>
            <p className="text-sm text-muted-foreground mt-1">各SNSへのアクセス・投稿の作成・分析を管理します</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-sns">
            <TabsTrigger value="accounts" data-testid="tab-accounts">SNSアカウント</TabsTrigger>
            <TabsTrigger value="create" data-testid="tab-create">投稿作成</TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-posts">投稿履歴</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">分析</TabsTrigger>
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

          <TabsContent value="create" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-bold text-foreground">プラットフォーム</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="mt-1" data-testid="select-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {snsServices.map((sns) => (
                        <SelectItem key={sns.id} value={sns.id}>{sns.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm font-bold text-foreground">投稿内容</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateMutation.mutate({ platform, topic: "物流・運送業界の最新トレンド" })}
                      disabled={generateMutation.isPending}
                      data-testid="button-ai-generate"
                    >
                      {generateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                      AI生成
                    </Button>
                  </div>
                  <Textarea
                    className="min-h-[150px] text-sm"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="投稿内容を入力してください..."
                    data-testid="input-sns-content"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{content.length} 文字</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => postMutation.mutate({ platform, content })}
                    disabled={!content.trim() || postMutation.isPending}
                    data-testid="button-save-draft"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    下書き保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {displayPosts.map((post) => {
                const sns = snsServices.find(s => s.id === post.platform);
                const Icon = sns?.icon || Share2;
                const status = statusLabels[post.status] || statusLabels.draft;
                return (
                  <Card key={post.id} data-testid={`card-sns-post-${post.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${sns?.color || '#666'}15` }}>
                          <Icon className="w-5 h-5" style={{ color: sns?.color || '#666' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-foreground">{sns?.name || post.platform}</span>
                            <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            {post.publishedAt && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {new Date(post.publishedAt).toLocaleString("ja-JP")}
                              </span>
                            )}
                            {post.scheduledAt && post.status === "scheduled" && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                予約: {new Date(post.scheduledAt).toLocaleString("ja-JP")}
                              </span>
                            )}
                            {post.status === "published" && (
                              <>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.impressions.toLocaleString()}</span>
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.engagements.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "総投稿数", value: "24", icon: Share2, change: "+3" },
                { label: "総インプレッション", value: "15,420", icon: Eye, change: "+12%" },
                { label: "エンゲージメント", value: "892", icon: Heart, change: "+8%" },
                { label: "エンゲージメント率", value: "5.8%", icon: TrendingUp, change: "+0.3%" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <stat.icon className="w-5 h-5 text-primary" />
                      <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  プラットフォーム別パフォーマンス
                </h3>
                <div className="space-y-4">
                  {[
                    { platform: "X (Twitter)", posts: 12, impressions: "8,200", engagement: "6.2%" },
                    { platform: "Instagram", posts: 8, impressions: "5,100", engagement: "5.8%" },
                    { platform: "Facebook", posts: 4, impressions: "2,120", engagement: "4.1%" },
                  ].map((p) => (
                    <div key={p.platform} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <span className="text-sm font-bold text-foreground">{p.platform}</span>
                      <div className="flex gap-6 text-xs text-muted-foreground">
                        <span>{p.posts}件</span>
                        <span>{p.impressions} imp</span>
                        <span>{p.engagement} eng</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
