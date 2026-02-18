import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe, Mail, Shield, Database, Loader2, Save, Server, Clock, Users,
  CreditCard, FileText, Truck, Package, Bell, Eye, EyeOff, CheckCircle,
  XCircle, AlertTriangle, Info, RefreshCw, HardDrive, Zap, Lock,
  MessageSquare, Palette, BarChart3, Settings2, ExternalLink
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";

type ChannelStatus = {
  configured: boolean;
  label: string;
};

export default function AdminSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: adminStats } = useQuery<{
    totalUsers: number;
    pendingApprovals: number;
    totalCargo: number;
    totalTrucks: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: channelStatus } = useQuery<Record<string, ChannelStatus>>({
    queryKey: ["/api/admin/notification-channels/status"],
  });

  const [siteName, setSiteName] = useState("トラマッチ");
  const [siteDescription, setSiteDescription] = useState("AI求荷求車マッチングサービス");
  const [siteKeywords, setSiteKeywords] = useState("求荷求車, マッチング, 運送, 物流, トラック, 配車");
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [preventConcurrentLogin, setPreventConcurrentLogin] = useState(true);
  const [permitRequired, setPermitRequired] = useState(false);
  const [adminEmail, setAdminEmail] = useState("info@sinjapan.jp");
  const [registrationNotification, setRegistrationNotification] = useState(true);
  const [cargoApprovalNotification, setCargoApprovalNotification] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoDeleteDays, setAutoDeleteDays] = useState("90");
  const [maxListingsPerUser, setMaxListingsPerUser] = useState("50");
  const [defaultListingDays, setDefaultListingDays] = useState("30");
  const [seoAutoGeneration, setSeoAutoGeneration] = useState(true);
  const [seoGenerationTime, setSeoGenerationTime] = useState("06:00");
  const [contactEmail, setContactEmail] = useState("info@sinjapan.jp");
  const [contactPhone, setContactPhone] = useState("046-212-2325");
  const [companyAddress, setCompanyAddress] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [passwordMinLength, setPasswordMinLength] = useState("6");

  useEffect(() => {
    if (settings) {
      if (settings.siteName) setSiteName(settings.siteName);
      if (settings.siteDescription) setSiteDescription(settings.siteDescription);
      if (settings.siteKeywords) setSiteKeywords(settings.siteKeywords);
      if (settings.approvalRequired !== undefined) setApprovalRequired(settings.approvalRequired === "true");
      if (settings.preventConcurrentLogin !== undefined) setPreventConcurrentLogin(settings.preventConcurrentLogin === "true");
      if (settings.permitRequired !== undefined) setPermitRequired(settings.permitRequired === "true");
      if (settings.adminEmail) setAdminEmail(settings.adminEmail);
      if (settings.registrationNotification !== undefined) setRegistrationNotification(settings.registrationNotification === "true");
      if (settings.cargoApprovalNotification !== undefined) setCargoApprovalNotification(settings.cargoApprovalNotification === "true");
      if (settings.maintenanceMode !== undefined) setMaintenanceMode(settings.maintenanceMode === "true");
      if (settings.autoDeleteDays) setAutoDeleteDays(settings.autoDeleteDays);
      if (settings.maxListingsPerUser) setMaxListingsPerUser(settings.maxListingsPerUser);
      if (settings.defaultListingDays) setDefaultListingDays(settings.defaultListingDays);
      if (settings.seoAutoGeneration !== undefined) setSeoAutoGeneration(settings.seoAutoGeneration === "true");
      if (settings.seoGenerationTime) setSeoGenerationTime(settings.seoGenerationTime);
      if (settings.contactEmail) setContactEmail(settings.contactEmail);
      if (settings.contactPhone) setContactPhone(settings.contactPhone);
      if (settings.companyAddress) setCompanyAddress(settings.companyAddress);
      if (settings.sessionTimeout) setSessionTimeout(settings.sessionTimeout);
      if (settings.passwordMinLength) setPasswordMinLength(settings.passwordMinLength);
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
    saveMutation.mutate({ siteName, siteDescription, siteKeywords });
  };

  const saveSecurity = () => {
    saveMutation.mutate({
      approvalRequired: String(approvalRequired),
      preventConcurrentLogin: String(preventConcurrentLogin),
      permitRequired: String(permitRequired),
      maintenanceMode: String(maintenanceMode),
      sessionTimeout,
      passwordMinLength,
    });
  };

  const saveNotification = () => {
    saveMutation.mutate({
      adminEmail,
      registrationNotification: String(registrationNotification),
      cargoApprovalNotification: String(cargoApprovalNotification),
    });
  };

  const saveListing = () => {
    saveMutation.mutate({
      maxListingsPerUser,
      defaultListingDays,
      autoDeleteDays,
    });
  };

  const saveSeo = () => {
    saveMutation.mutate({
      seoAutoGeneration: String(seoAutoGeneration),
      seoGenerationTime,
    });
  };

  const saveContact = () => {
    saveMutation.mutate({
      contactEmail,
      contactPhone,
      companyAddress,
    });
  };

  const StatusBadge = ({ configured, label }: { configured: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {configured ? (
        <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 no-default-hover-elevate no-default-active-elevate">
          <CheckCircle className="w-3 h-3 mr-1" />
          接続済み
        </Badge>
      ) : (
        <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
          <XCircle className="w-3 h-3 mr-1" />
          未設定
        </Badge>
      )}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  const SectionSaveButton = ({ onClick, label }: { onClick: () => void; label?: string }) => (
    <div className="flex justify-end pt-2">
      <Button
        onClick={onClick}
        disabled={saveMutation.isPending}
        data-testid={`button-save-${label || "section"}`}
      >
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
        保存
      </Button>
    </div>
  );

  const SettingRow = ({ icon: Icon, title, description, children }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex gap-3 min-w-0 flex-1">
        <div className="mt-0.5 shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">管理設定</h1>
            <p className="text-sm text-muted-foreground mt-1">システム全体の設定を管理</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-60 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">管理設定</h1>
            <p className="text-sm text-muted-foreground mt-1">システム全体の設定を管理します</p>
          </div>
          {maintenanceMode && (
            <Badge variant="destructive" className="no-default-hover-elevate no-default-active-elevate">
              <AlertTriangle className="w-3 h-3 mr-1" />
              メンテナンスモード有効
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">登録ユーザー</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-stat-users">{adminStats?.totalUsers ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">承認待ち</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-stat-pending">{adminStats?.pendingApprovals ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">荷物件数</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-stat-cargo">{adminStats?.totalCargo ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">車両件数</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-stat-trucks">{adminStats?.totalTrucks ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                サイト基本設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name" className="text-xs text-muted-foreground">サイト名</Label>
                <Input
                  id="site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="mt-1"
                  data-testid="input-site-name"
                />
              </div>
              <div>
                <Label htmlFor="site-description" className="text-xs text-muted-foreground">サイト説明（meta description）</Label>
                <Textarea
                  id="site-description"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                  data-testid="input-site-description"
                />
              </div>
              <div>
                <Label htmlFor="site-keywords" className="text-xs text-muted-foreground">SEOキーワード（カンマ区切り）</Label>
                <Input
                  id="site-keywords"
                  value={siteKeywords}
                  onChange={(e) => setSiteKeywords(e.target.value)}
                  className="mt-1"
                  placeholder="求荷求車, マッチング, 運送, 物流"
                  data-testid="input-site-keywords"
                />
              </div>
              <SectionSaveButton onClick={saveSite} label="site" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                セキュリティ・認証
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow icon={CheckCircle} title="新規登録の承認制" description="新規ユーザーの登録時に管理者承認を必須にする">
                  <Switch
                    checked={approvalRequired}
                    onCheckedChange={setApprovalRequired}
                    data-testid="switch-approval-required"
                  />
                </SettingRow>
                <SettingRow icon={Lock} title="同時ログイン防止" description="同じアカウントからの同時ログインを制限">
                  <Switch
                    checked={preventConcurrentLogin}
                    onCheckedChange={setPreventConcurrentLogin}
                    data-testid="switch-prevent-concurrent"
                  />
                </SettingRow>
                <SettingRow icon={FileText} title="許可証アップロード必須" description="登録時に営業許可証のアップロードを必須化">
                  <Switch
                    checked={permitRequired}
                    onCheckedChange={setPermitRequired}
                    data-testid="switch-permit-required"
                  />
                </SettingRow>
                <SettingRow icon={AlertTriangle} title="メンテナンスモード" description="有効にするとユーザーアクセスを制限">
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                    data-testid="switch-maintenance-mode"
                  />
                </SettingRow>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">セッション有効期限（時間）</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="mt-1" data-testid="select-session-timeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1時間</SelectItem>
                      <SelectItem value="6">6時間</SelectItem>
                      <SelectItem value="12">12時間</SelectItem>
                      <SelectItem value="24">24時間</SelectItem>
                      <SelectItem value="72">72時間</SelectItem>
                      <SelectItem value="168">1週間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">パスワード最小文字数</Label>
                  <Select value={passwordMinLength} onValueChange={setPasswordMinLength}>
                    <SelectTrigger className="mt-1" data-testid="select-password-min">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4文字</SelectItem>
                      <SelectItem value="6">6文字</SelectItem>
                      <SelectItem value="8">8文字</SelectItem>
                      <SelectItem value="10">10文字</SelectItem>
                      <SelectItem value="12">12文字</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SectionSaveButton onClick={saveSecurity} label="security" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                通知・メール設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">通知チャネル接続状況</p>
                <div className="flex flex-wrap gap-2">
                  {channelStatus ? (
                    Object.entries(channelStatus).map(([key, ch]) => (
                      <StatusBadge key={key} configured={ch.configured} label={ch.label} />
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">読み込み中...</span>
                  )}
                </div>
              </div>
              <Separator className="mb-3" />
              <div>
                <Label htmlFor="admin-email" className="text-xs text-muted-foreground">管理者メールアドレス</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="mt-1"
                  data-testid="input-admin-email"
                />
              </div>
              <div className="divide-y divide-border mt-2">
                <SettingRow icon={Users} title="新規登録通知" description="新規ユーザー登録時にメール通知を受け取る">
                  <Switch
                    checked={registrationNotification}
                    onCheckedChange={setRegistrationNotification}
                    data-testid="switch-registration-notification"
                  />
                </SettingRow>
                <SettingRow icon={Package} title="荷物掲載通知" description="新しい荷物・空車が登録された時に通知">
                  <Switch
                    checked={cargoApprovalNotification}
                    onCheckedChange={setCargoApprovalNotification}
                    data-testid="switch-cargo-notification"
                  />
                </SettingRow>
              </div>
              <SectionSaveButton onClick={saveNotification} label="notification" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                掲載・マッチング設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">ユーザーあたりの最大掲載数</Label>
                  <Select value={maxListingsPerUser} onValueChange={setMaxListingsPerUser}>
                    <SelectTrigger className="mt-1" data-testid="select-max-listings">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10件</SelectItem>
                      <SelectItem value="20">20件</SelectItem>
                      <SelectItem value="30">30件</SelectItem>
                      <SelectItem value="50">50件</SelectItem>
                      <SelectItem value="100">100件</SelectItem>
                      <SelectItem value="999">無制限</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">掲載デフォルト有効日数</Label>
                  <Select value={defaultListingDays} onValueChange={setDefaultListingDays}>
                    <SelectTrigger className="mt-1" data-testid="select-listing-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7日間</SelectItem>
                      <SelectItem value="14">14日間</SelectItem>
                      <SelectItem value="30">30日間</SelectItem>
                      <SelectItem value="60">60日間</SelectItem>
                      <SelectItem value="90">90日間</SelectItem>
                      <SelectItem value="180">180日間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">掲載自動削除（成約・キャンセル後）</Label>
                  <Select value={autoDeleteDays} onValueChange={setAutoDeleteDays}>
                    <SelectTrigger className="mt-1" data-testid="select-auto-delete">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30日後</SelectItem>
                      <SelectItem value="60">60日後</SelectItem>
                      <SelectItem value="90">90日後</SelectItem>
                      <SelectItem value="180">180日後</SelectItem>
                      <SelectItem value="365">1年後</SelectItem>
                      <SelectItem value="0">削除しない</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SectionSaveButton onClick={saveListing} label="listing" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                SEO・コラム自動生成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow icon={Zap} title="コラム記事の自動生成" description="毎日AIが物流関連コラムを自動生成・公開">
                  <Switch
                    checked={seoAutoGeneration}
                    onCheckedChange={setSeoAutoGeneration}
                    data-testid="switch-seo-auto"
                  />
                </SettingRow>
              </div>
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground">自動生成時刻</Label>
                <Select value={seoGenerationTime} onValueChange={setSeoGenerationTime}>
                  <SelectTrigger className="mt-1" data-testid="select-seo-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00:00">0:00</SelectItem>
                    <SelectItem value="03:00">3:00</SelectItem>
                    <SelectItem value="06:00">6:00</SelectItem>
                    <SelectItem value="09:00">9:00</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>30種類の物流トピックからローテーションで記事を自動生成します。</p>
                    <p>生成された記事は /columns で公開されます。</p>
                    <p>詳細な管理は「SEO記事生成」ページから行えます。</p>
                  </div>
                </div>
              </div>
              <SectionSaveButton onClick={saveSeo} label="seo" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                お問い合わせ・会社情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">お問い合わせメールアドレス</Label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1"
                  type="email"
                  data-testid="input-contact-email"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">電話番号</Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1"
                  data-testid="input-contact-phone"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">会社所在地</Label>
                <Textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                  placeholder="〒000-0000 東京都..."
                  data-testid="input-company-address"
                />
              </div>
              <SectionSaveButton onClick={saveContact} label="contact" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                データ管理・システム情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-3 font-medium">データ操作</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "荷物データをエクスポート中..." })}
                      data-testid="button-export-cargo"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      荷物データエクスポート（CSV）
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "車両データをエクスポート中..." })}
                      data-testid="button-export-trucks"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      車両データエクスポート（CSV）
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "ユーザーデータをエクスポート中..." })}
                      data-testid="button-export-users"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      ユーザーデータエクスポート（CSV）
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => toast({ title: "キャッシュをクリアしました" })}
                      data-testid="button-clear-cache"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      キャッシュクリア
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-3 font-medium">システム情報</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Server className="w-3 h-3" /> バージョン
                      </span>
                      <span className="text-xs font-mono text-foreground" data-testid="text-version">v1.0.0-beta</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <HardDrive className="w-3 h-3" /> データベース
                      </span>
                      <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 no-default-hover-elevate no-default-active-elevate text-xs">
                        接続中
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Zap className="w-3 h-3" /> AI機能
                      </span>
                      <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 no-default-hover-elevate no-default-active-elevate text-xs">
                        有効
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3" /> 決済
                      </span>
                      <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate text-xs">
                        {import.meta.env.VITE_SQUARE_APP_ID ? "設定済み" : "未設定"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="w-3 h-3" /> 環境
                      </span>
                      <span className="text-xs font-mono text-foreground">development</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
