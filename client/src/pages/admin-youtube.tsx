import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, RefreshCw, Video, Eye, EyeOff, ExternalLink, Wand2, Play, Clock, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type YoutubeVideo = {
  id: string;
  videoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  channelTitle: string | null;
  isVisible: boolean;
  fetchedAt: string;
};

type AutoPublishJob = {
  id: string;
  topic: string;
  script: string | null;
  youtubeVideoId: string | null;
  youtubeTitle: string | null;
  youtubeDescription: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-600 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />完了</Badge>;
    case "failed":
      return <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />失敗</Badge>;
    case "pending":
      return <Badge variant="secondary" className="text-xs"><Clock className="w-3 h-3 mr-1" />待機中</Badge>;
    default:
      return <Badge variant="outline" className="text-xs"><Loader2 className="w-3 h-3 mr-1 animate-spin" />{status === "generating_script" ? "原稿生成中" : status === "generating_audio" ? "音声生成中" : status === "generating_video" ? "動画生成中" : status === "uploading" ? "アップロード中" : status}</Badge>;
  }
}

function VideoManagementTab() {
  const { toast } = useToast();

  const { data: videos = [], isLoading } = useQuery<YoutubeVideo[]>({
    queryKey: ["/api/admin/youtube-videos"],
  });

  const fetchMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/youtube/fetch"),
    onSuccess: async (res) => {
      const data = await res.json();
      toast({ title: "取得完了", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/youtube-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/youtube-videos"] });
    },
    onError: () => {
      toast({ title: "エラー", description: "YouTube動画の取得に失敗しました", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      apiRequest("PATCH", `/api/admin/youtube-videos/${id}/visibility`, { isVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/youtube-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/youtube-videos"] });
      toast({ title: "更新しました" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/youtube-videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/youtube-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/youtube-videos"] });
      toast({ title: "削除しました" });
    },
  });

  const visibleCount = videos.filter((v) => v.isVisible).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">YouTubeチャンネルから動画を取り込み、LPに表示します</p>
        <Button onClick={() => fetchMutation.mutate()} disabled={fetchMutation.isPending} data-testid="button-fetch-youtube">
          <RefreshCw className={`w-4 h-4 mr-2 ${fetchMutation.isPending ? "animate-spin" : ""}`} />
          {fetchMutation.isPending ? "取得中..." : "YouTubeから取得"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-videos">{videos.length}</p>
                <p className="text-xs text-muted-foreground">総動画数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-visible-videos">{visibleCount}</p>
                <p className="text-xs text-muted-foreground">表示中</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-hidden-videos">{videos.length - visibleCount}</p>
                <p className="text-xs text-muted-foreground">非表示</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">動画がありません</p>
            <p className="text-sm text-muted-foreground">
              「YouTubeから取得」で既存動画を取り込むか、「自動生成」タブで新しい動画を作成してください。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <Card key={video.id} className={!video.isVisible ? "opacity-60" : ""} data-testid={`card-admin-video-${video.id}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <img src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt={video.title} className="w-40 h-[90px] object-cover rounded" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm line-clamp-1" data-testid={`text-video-title-${video.id}`}>{video.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {video.publishedAt && (
                            <span className="text-xs text-muted-foreground">{new Date(video.publishedAt).toLocaleDateString("ja-JP")}</span>
                          )}
                          <Badge variant={video.isVisible ? "default" : "secondary"} className="text-xs">
                            {video.isVisible ? "表示" : "非表示"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">表示</span>
                          <Switch
                            checked={video.isVisible}
                            onCheckedChange={(checked) => toggleMutation.mutate({ id: video.id, isVisible: checked })}
                            data-testid={`switch-visibility-${video.id}`}
                          />
                        </div>
                        <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" data-testid={`button-open-youtube-${video.id}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("この動画を削除しますか？")) deleteMutation.mutate(video.id); }}
                          data-testid={`button-delete-video-${video.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AutoPublishTab() {
  const { toast } = useToast();
  const [customTopic, setCustomTopic] = useState("");

  const { data: jobs = [], isLoading } = useQuery<AutoPublishJob[]>({
    queryKey: ["/api/admin/youtube/auto-publish-jobs"],
    refetchInterval: 5000,
  });

  const autoPublishMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/youtube/auto-publish"),
    onSuccess: async (res) => {
      const data = await res.json();
      toast({ title: "開始しました", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/youtube/auto-publish-jobs"] });
    },
    onError: (error: any) => {
      toast({ title: "エラー", description: error?.message || "自動投稿の開始に失敗しました", variant: "destructive" });
    },
  });

  const singlePublishMutation = useMutation({
    mutationFn: (topic: string) => apiRequest("POST", "/api/admin/youtube/auto-publish-single", { topic }),
    onSuccess: async (res) => {
      const data = await res.json();
      toast({ title: "開始しました", description: data.message });
      setCustomTopic("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/youtube/auto-publish-jobs"] });
    },
    onError: (error: any) => {
      toast({ title: "エラー", description: error?.message || "動画生成の開始に失敗しました", variant: "destructive" });
    },
  });

  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;
  const processingCount = jobs.filter((j) => !["completed", "failed", "pending"].includes(j.status)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-1">自動動画生成の流れ</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <Badge variant="outline" className="text-xs">1. GPTで原稿生成</Badge>
              <span>→</span>
              <Badge variant="outline" className="text-xs">2. OpenAI TTSで音声生成</Badge>
              <span>→</span>
              <Badge variant="outline" className="text-xs">3. ffmpegで動画作成</Badge>
              <span>→</span>
              <Badge variant="outline" className="text-xs">4. YouTube自動投稿</Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => autoPublishMutation.mutate()}
              disabled={autoPublishMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-auto-publish-3"
            >
              <Wand2 className={`w-4 h-4 mr-2 ${autoPublishMutation.isPending ? "animate-spin" : ""}`} />
              {autoPublishMutation.isPending ? "開始中..." : "今日の3本を自動生成"}
            </Button>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">カスタムトピックで1本生成</label>
              <Input
                placeholder="例: 求荷求車マッチングの始め方"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                data-testid="input-custom-topic"
              />
            </div>
            <Button
              onClick={() => singlePublishMutation.mutate(customTopic)}
              disabled={singlePublishMutation.isPending || !customTopic.trim()}
              variant="outline"
              data-testid="button-publish-single"
            >
              <Send className="w-4 h-4 mr-2" />
              生成
            </Button>
          </div>
          <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">必要な環境変数:</p>
            <ul className="space-y-0.5 ml-2">
              <li>• <code>OPENAI_API_KEY</code> - 原稿・音声生成用（設定済み）</li>
              <li>• <code>YOUTUBE_OAUTH_CLIENT_ID</code> - YouTube投稿用</li>
              <li>• <code>YOUTUBE_OAUTH_CLIENT_SECRET</code> - YouTube投稿用</li>
              <li>• <code>YOUTUBE_OAUTH_REFRESH_TOKEN</code> - YouTube投稿用</li>
            </ul>
            <p className="mt-2">毎日9:00（JST）に自動で3本生成・投稿されます。概要欄にはトラマッチの各ページへのリンクが自動挿入されます。</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">完了</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{processingCount}</p>
                <p className="text-xs text-muted-foreground">処理中</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{failedCount}</p>
                <p className="text-xs text-muted-foreground">失敗</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wand2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">まだ自動生成ジョブがありません</p>
            <p className="text-sm text-muted-foreground mt-1">「今日の3本を自動生成」ボタンで開始できます</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} data-testid={`card-job-${job.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge(job.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm" data-testid={`text-job-topic-${job.id}`}>{job.topic}</h3>
                    {job.youtubeTitle && (
                      <p className="text-xs text-muted-foreground mt-1">タイトル: {job.youtubeTitle}</p>
                    )}
                    {job.errorMessage && (
                      <p className="text-xs text-destructive mt-1">エラー: {job.errorMessage}</p>
                    )}
                  </div>
                  {job.youtubeVideoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${job.youtubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" data-testid={`button-view-job-video-${job.id}`}>
                        <Play className="w-3 h-3 mr-1" />
                        視聴
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminYoutube() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6" data-testid="admin-youtube-page">
        <h1 className="text-2xl font-bold" data-testid="text-admin-youtube-title">YouTube動画管理</h1>

        <Tabs defaultValue="videos">
          <TabsList data-testid="tabs-youtube-admin">
            <TabsTrigger value="videos" data-testid="tab-videos">
              <Video className="w-4 h-4 mr-2" />
              動画一覧
            </TabsTrigger>
            <TabsTrigger value="auto-publish" data-testid="tab-auto-publish">
              <Wand2 className="w-4 h-4 mr-2" />
              自動生成
            </TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            <VideoManagementTab />
          </TabsContent>
          <TabsContent value="auto-publish">
            <AutoPublishTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
