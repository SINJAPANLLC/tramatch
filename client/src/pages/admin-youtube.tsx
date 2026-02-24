import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, Video, Eye, EyeOff, ExternalLink } from "lucide-react";
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

export default function AdminYoutube() {
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
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6" data-testid="admin-youtube-page">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-youtube-title">YouTube動画管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              LPに表示するYouTube動画を管理します
            </p>
          </div>
          <Button
            onClick={() => fetchMutation.mutate()}
            disabled={fetchMutation.isPending}
            data-testid="button-fetch-youtube"
          >
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
                「YouTubeから取得」ボタンで動画を取り込んでください。
                <br />
                YOUTUBE_API_KEY と YOUTUBE_CHANNEL_ID の環境変数が必要です。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => (
              <Card key={video.id} className={!video.isVisible ? "opacity-60" : ""} data-testid={`card-admin-video-${video.id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-40 h-[90px] object-cover rounded"
                      />
                    </a>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm line-clamp-1" data-testid={`text-video-title-${video.id}`}>
                            {video.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {video.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {video.publishedAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(video.publishedAt).toLocaleDateString("ja-JP")}
                              </span>
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
                              onCheckedChange={(checked) =>
                                toggleMutation.mutate({ id: video.id, isVisible: checked })
                              }
                              data-testid={`switch-visibility-${video.id}`}
                            />
                          </div>
                          <a
                            href={`https://www.youtube.com/watch?v=${video.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" data-testid={`button-open-youtube-${video.id}`}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("この動画を削除しますか？")) {
                                deleteMutation.mutate(video.id);
                              }
                            }}
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
    </DashboardLayout>
  );
}
