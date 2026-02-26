import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Send, Loader2, Wand2, ExternalLink } from "lucide-react";
import { SiX, SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiLinkedin, SiPinterest, SiThreads, SiLine } from "react-icons/si";
import DashboardLayout from "@/components/dashboard-layout";

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

export default function AdminSns() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("accounts");
  const [platform, setPlatform] = useState("x");
  const [content, setContent] = useState("");

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

        </Tabs>
      </div>
    </DashboardLayout>
  );
}
