import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, Mail, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

export default function AdminNotifications() {
  const { toast } = useToast();
  const [target, setTarget] = useState("all");

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
                  <Input id="notification-title" placeholder="通知タイトル" className="mt-1" data-testid="input-notification-title" />
                </div>
                <div>
                  <Label htmlFor="notification-body">本文</Label>
                  <Textarea id="notification-body" placeholder="通知の内容を入力..." className="mt-1 min-h-[120px]" data-testid="input-notification-body" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => toast({ title: "通知を送信しました" })}
                  data-testid="button-send-notification"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  通知を送信
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
              <div className="text-center py-6">
                <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground" data-testid="text-empty-state">送信した通知はありません</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
