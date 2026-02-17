import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Mail, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";

type SentNotification = {
  title: string;
  target: string;
  count: number;
  sentAt: string;
};

const targetLabels: Record<string, string> = {
  all: "全ユーザー",
  shippers: "荷主のみ",
  carriers: "運送会社のみ",
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [target, setTarget] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sentHistory, setSentHistory] = useState<SentNotification[]>([]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/notifications/send", { title, message, target });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.count}人に通知を送信しました` });
      setSentHistory((prev) => [
        {
          title,
          target,
          count: data.count,
          sentAt: new Date().toLocaleString("ja-JP"),
        },
        ...prev,
      ]);
      setTitle("");
      setMessage("");
      setTarget("all");
    },
    onError: () => {
      toast({ title: "通知の送信に失敗しました", variant: "destructive" });
    },
  });

  const canSend = title.trim() && message.trim();

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">通知管理</h1>
          <p className="text-sm text-muted-foreground mt-1">ユーザーへの通知・お知らせの送信</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                新しい通知を作成
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notification-target">送信先</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger className="mt-1" data-testid="select-notification-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全ユーザー</SelectItem>
                      <SelectItem value="shippers">荷主のみ</SelectItem>
                      <SelectItem value="carriers">運送会社のみ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notification-title">タイトル</Label>
                  <Input
                    id="notification-title"
                    placeholder="通知タイトル"
                    className="mt-1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-notification-title"
                  />
                </div>
                <div>
                  <Label htmlFor="notification-body">本文</Label>
                  <Textarea
                    id="notification-body"
                    placeholder="通知の内容を入力..."
                    className="mt-1 min-h-[120px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    data-testid="input-notification-body"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => sendMutation.mutate()}
                  disabled={!canSend || sendMutation.isPending}
                  data-testid="button-send-notification"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1.5" />
                  )}
                  {sendMutation.isPending ? "送信中..." : "通知を送信"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                送信履歴
              </h2>
              {sentHistory.length === 0 ? (
                <div className="text-center py-6">
                  <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground" data-testid="text-empty-state">送信した通知はありません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sentHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 flex-wrap p-2 rounded-md bg-muted/30" data-testid={`row-sent-notification-${idx}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.sentAt}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-xs">{targetLabels[item.target]}</Badge>
                        <span className="text-xs text-muted-foreground">{item.count}人</span>
                      </div>
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
