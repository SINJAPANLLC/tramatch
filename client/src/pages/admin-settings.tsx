import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Mail, Shield, Database, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";

export default function AdminSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const [siteName, setSiteName] = useState("トラマッチ");
  const [siteDescription, setSiteDescription] = useState("AI求荷求車マッチングサービス");
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [preventConcurrentLogin, setPreventConcurrentLogin] = useState(true);
  const [permitRequired, setPermitRequired] = useState(false);
  const [adminEmail, setAdminEmail] = useState("info@sinjapan.jp");
  const [registrationNotification, setRegistrationNotification] = useState(true);

  useEffect(() => {
    if (settings) {
      if (settings.siteName) setSiteName(settings.siteName);
      if (settings.siteDescription) setSiteDescription(settings.siteDescription);
      if (settings.approvalRequired !== undefined) setApprovalRequired(settings.approvalRequired === "true");
      if (settings.preventConcurrentLogin !== undefined) setPreventConcurrentLogin(settings.preventConcurrentLogin === "true");
      if (settings.permitRequired !== undefined) setPermitRequired(settings.permitRequired === "true");
      if (settings.adminEmail) setAdminEmail(settings.adminEmail);
      if (settings.registrationNotification !== undefined) setRegistrationNotification(settings.registrationNotification === "true");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      await apiRequest("POST", "/api/admin/settings", data);
    },
    onSuccess: () => {
      toast({ title: "設定を保存しました" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: () => {
      toast({ title: "設定の保存に失敗しました", variant: "destructive" });
    },
  });

  const saveSite = () => {
    saveMutation.mutate({ siteName, siteDescription });
  };

  const saveSecurity = () => {
    saveMutation.mutate({
      approvalRequired: String(approvalRequired),
      preventConcurrentLogin: String(preventConcurrentLogin),
      permitRequired: String(permitRequired),
    });
  };

  const saveEmail = () => {
    saveMutation.mutate({
      adminEmail,
      registrationNotification: String(registrationNotification),
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">管理設定</h1>
            <p className="text-sm text-muted-foreground mt-1">システム全体の設定</p>
          </div>
          <div className="max-w-2xl space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="mt-1"
                    data-testid="input-site-name"
                  />
                </div>
                <div>
                  <Label htmlFor="site-description">サイト説明</Label>
                  <Input
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className="mt-1"
                    data-testid="input-site-description"
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={saveSite}
                disabled={saveMutation.isPending}
                data-testid="button-save-site"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
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
                  <Switch
                    checked={approvalRequired}
                    onCheckedChange={setApprovalRequired}
                    data-testid="switch-approval-required"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">同時ログイン防止</p>
                    <p className="text-xs text-muted-foreground">同じアカウントの同時ログインを制限する</p>
                  </div>
                  <Switch
                    checked={preventConcurrentLogin}
                    onCheckedChange={setPreventConcurrentLogin}
                    data-testid="switch-prevent-concurrent"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">許可証アップロード必須</p>
                    <p className="text-xs text-muted-foreground">登録時の許可証アップロードを必須にする</p>
                  </div>
                  <Switch
                    checked={permitRequired}
                    onCheckedChange={setPermitRequired}
                    data-testid="switch-permit-required"
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={saveSecurity}
                disabled={saveMutation.isPending}
                data-testid="button-save-security"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
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
                  <Input
                    id="admin-email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="mt-1"
                    data-testid="input-admin-email"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">新規登録通知</p>
                    <p className="text-xs text-muted-foreground">新規ユーザー登録時にメール通知を受け取る</p>
                  </div>
                  <Switch
                    checked={registrationNotification}
                    onCheckedChange={setRegistrationNotification}
                    data-testid="switch-registration-notification"
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={saveEmail}
                disabled={saveMutation.isPending}
                data-testid="button-save-email"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast({ title: "データをエクスポート中..." })}
                  data-testid="button-export-data"
                >
                  データエクスポート
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast({ title: "キャッシュをクリアしました" })}
                  data-testid="button-clear-cache"
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
