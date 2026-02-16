import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Globe, Mail, Shield, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

export default function AdminSettings() {
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">管理設定</h1>
          <p className="text-sm text-muted-foreground mt-1">システム全体の設定</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                サイト設定
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="site-name">サイト名</Label>
                  <Input id="site-name" defaultValue="トラマッチ" className="mt-1" data-testid="input-site-name" />
                </div>
                <div>
                  <Label htmlFor="site-description">サイト説明</Label>
                  <Input id="site-description" defaultValue="AI求荷求車マッチングサービス" className="mt-1" data-testid="input-site-description" />
                </div>
              </div>
              <Button className="mt-4" data-testid="button-save-site"
                onClick={() => toast({ title: "サイト設定を保存しました" })}
              >
                保存
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                セキュリティ設定
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">新規登録の承認制</p>
                    <p className="text-xs text-muted-foreground">新規ユーザーの登録時に管理者の承認を必須にする</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-approval-required" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">同時ログイン防止</p>
                    <p className="text-xs text-muted-foreground">同じアカウントの同時ログインを制限する</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-prevent-concurrent" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">許可証アップロード必須</p>
                    <p className="text-xs text-muted-foreground">登録時の許可証アップロードを必須にする</p>
                  </div>
                  <Switch data-testid="switch-permit-required" />
                </div>
              </div>
              <Button className="mt-4" data-testid="button-save-security"
                onClick={() => toast({ title: "セキュリティ設定を保存しました" })}
              >
                保存
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                メール設定
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">管理者メールアドレス</Label>
                  <Input id="admin-email" defaultValue="info@sinjapan.jp" className="mt-1" data-testid="input-admin-email" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">新規登録通知</p>
                    <p className="text-xs text-muted-foreground">新規ユーザー登録時にメール通知を受け取る</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-registration-notification" />
                </div>
              </div>
              <Button className="mt-4" data-testid="button-save-email"
                onClick={() => toast({ title: "メール設定を保存しました" })}
              >
                保存
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                データ管理
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" data-testid="button-export-data"
                  onClick={() => toast({ title: "データをエクスポート中..." })}
                >
                  データエクスポート
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-clear-cache"
                  onClick={() => toast({ title: "キャッシュをクリアしました" })}
                >
                  キャッシュクリア
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
