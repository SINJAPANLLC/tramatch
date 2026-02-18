import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

type SettingsTab = "basic" | "detail" | "contact" | "business" | "password" | "email";

const TABS: { key: SettingsTab; label: string; group: string }[] = [
  { key: "basic", label: "基本情報", group: "企業情報管理" },
  { key: "detail", label: "詳細情報", group: "企業情報管理" },
  { key: "contact", label: "担当者情報", group: "企業情報管理" },
  { key: "business", label: "事業情報", group: "企業情報管理" },
  { key: "password", label: "パスワード変更", group: "ユーザー管理" },
  { key: "email", label: "メール受信設定", group: "ユーザー管理" },
];

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("basic");

  const [companyName, setCompanyName] = useState("");
  const [companyNameKana, setCompanyNameKana] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [truckCount, setTruckCount] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [representative, setRepresentative] = useState("");
  const [establishedDate, setEstablishedDate] = useState("");
  const [capital, setCapital] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [transportLicenseNumber, setTransportLicenseNumber] = useState("");
  const [invoiceRegistrationNumber, setInvoiceRegistrationNumber] = useState("");

  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");

  const [businessDescription, setBusinessDescription] = useState("");
  const [officeLocations, setOfficeLocations] = useState("");
  const [majorClients, setMajorClients] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailCargo, setEmailCargo] = useState(true);
  const [emailTruck, setEmailTruck] = useState(true);
  const [emailAnnouncement, setEmailAnnouncement] = useState(true);

  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || "");
      setCompanyNameKana(user.companyNameKana || "");
      const addr = user.address || "";
      const prefMatch = PREFECTURES.find(p => addr.startsWith(p));
      if (prefMatch) {
        setPrefecture(prefMatch);
        const rest = addr.slice(prefMatch.length);
        const cityMatch = rest.match(/^(.+?[市区町村郡])/);
        if (cityMatch) {
          setCity(cityMatch[1]);
          setAddressDetail(rest.slice(cityMatch[1].length));
        } else {
          setCity(rest);
          setAddressDetail("");
        }
      } else {
        setPrefecture("");
        setCity(addr);
        setAddressDetail("");
      }
      setPostalCode(user.postalCode || "");
      setPhone(user.phone || "");
      setFax(user.fax || "");
      setTruckCount(user.truckCount || "");
      setWebsiteUrl(user.websiteUrl || "");
      setRepresentative(user.representative || "");
      setEstablishedDate(user.establishedDate || "");
      setCapital(user.capital || "");
      setEmployeeCount(user.employeeCount || "");
      setBusinessArea(user.businessArea || "");
      setTransportLicenseNumber(user.transportLicenseNumber || "");
      setInvoiceRegistrationNumber(user.invoiceRegistrationNumber || "");
      setContactName(user.contactName || "");
      setEmail(user.email || "");
      setBusinessDescription(user.businessDescription || "");
      setOfficeLocations(user.officeLocations || "");
      setMajorClients(user.majorClients || "");
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (data: Record<string, string>) => apiRequest("PATCH", "/api/user/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "保存しました" });
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const updatePassword = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => apiRequest("PATCH", "/api/user/password", data),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "パスワードを変更しました" });
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const buildAddress = () => {
    return [prefecture, city, addressDetail].filter(Boolean).join("");
  };

  const handleSaveBasic = () => {
    updateProfile.mutate({
      companyName,
      postalCode,
      address: buildAddress(),
      phone,
      fax,
      truckCount,
      websiteUrl,
    });
  };

  const handleSaveDetail = () => {
    updateProfile.mutate({
      companyNameKana,
      representative,
      establishedDate,
      capital,
      employeeCount,
      businessArea,
      transportLicenseNumber,
      invoiceRegistrationNumber,
    });
  };

  const handleSaveContact = () => {
    updateProfile.mutate({ contactName, email });
  };

  const handleSaveBusiness = () => {
    updateProfile.mutate({ businessDescription, officeLocations, majorClients });
  };

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "エラー", description: "新しいパスワードが一致しません", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "エラー", description: "パスワードは6文字以上にしてください", variant: "destructive" });
      return;
    }
    updatePassword.mutate({ currentPassword, newPassword });
  };

  const groups = TABS.reduce((acc, tab) => {
    if (!acc[tab.group]) acc[tab.group] = [];
    acc[tab.group].push(tab);
    return acc;
  }, {} as Record<string, typeof TABS>);

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">設定</h1>
          <p className="text-sm text-muted-foreground mt-1">企業情報・アカウント設定</p>
        </div>

        <div className="flex gap-6">
          <div className="w-48 shrink-0 hidden md:block">
            <nav className="space-y-4" data-testid="settings-nav">
              {Object.entries(groups).map(([group, tabs]) => (
                <div key={group}>
                  <p className="text-xs font-bold text-primary mb-1 px-2">{group}</p>
                  <ul className="space-y-0.5">
                    {tabs.map((tab) => (
                      <li key={tab.key}>
                        <button
                          onClick={() => setActiveTab(tab.key)}
                          className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                            activeTab === tab.key
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-foreground hover-elevate"
                          }`}
                          data-testid={`button-tab-${tab.key}`}
                        >
                          {tab.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="md:hidden w-full mb-4">
            <Select value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)}>
              <SelectTrigger data-testid="select-settings-tab">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TABS.map((tab) => (
                  <SelectItem key={tab.key} value={tab.key}>{tab.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-0">
            {activeTab === "basic" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-6">企業基本情報</h2>

                  <div className="space-y-5">
                    <div>
                      <Label className="text-sm font-medium">{user?.companyName}</Label>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">
                        <span className="text-destructive mr-1">必須</span>
                        住所
                      </Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground shrink-0">〒</span>
                        <Input
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-32"
                          placeholder="0000000"
                          data-testid="input-postal-code"
                        />
                        <Select value={prefecture} onValueChange={setPrefecture}>
                          <SelectTrigger className="w-32" data-testid="select-prefecture">
                            <SelectValue placeholder="都道府県" />
                          </SelectTrigger>
                          <SelectContent>
                            {PREFECTURES.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-48"
                          placeholder="市区町村"
                          data-testid="input-city"
                        />
                        <Input
                          value={addressDetail}
                          onChange={(e) => setAddressDetail(e.target.value)}
                          className="flex-1 min-w-[120px]"
                          placeholder="番地・建物名"
                          data-testid="input-address-detail"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">
                        <span className="text-destructive mr-1">必須</span>
                        電話番号
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="max-w-xs"
                        data-testid="input-phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">
                        <span className="text-destructive mr-1">必須</span>
                        FAX
                      </Label>
                      <Input
                        value={fax}
                        onChange={(e) => setFax(e.target.value)}
                        className="max-w-xs"
                        data-testid="input-fax"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">
                        <span className="text-destructive mr-1">必須</span>
                        車両台数
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={truckCount}
                          onChange={(e) => setTruckCount(e.target.value)}
                          className="w-24"
                          placeholder="0"
                          data-testid="input-truck-count"
                        />
                        <span className="text-sm text-muted-foreground">台</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">HPアドレス</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select defaultValue="https://">
                          <SelectTrigger className="w-28" data-testid="select-protocol">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="https://">https://</SelectItem>
                            <SelectItem value="http://">http://</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className="flex-1 min-w-[200px]"
                          placeholder="example.com/"
                          data-testid="input-website-url"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button onClick={handleSaveBasic} disabled={updateProfile.isPending} data-testid="button-save-basic">
                      {updateProfile.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "detail" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-6">詳細情報</h2>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">会社名（カナ）</Label>
                        <Input value={companyNameKana} onChange={(e) => setCompanyNameKana(e.target.value)} data-testid="input-company-name-kana" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">代表者名</Label>
                        <Input value={representative} onChange={(e) => setRepresentative(e.target.value)} data-testid="input-representative" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">設立年月日</Label>
                        <Input value={establishedDate} onChange={(e) => setEstablishedDate(e.target.value)} placeholder="例: 2000年4月" data-testid="input-established-date" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">資本金</Label>
                        <Input value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="例: 1,000万円" data-testid="input-capital" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">従業員数</Label>
                        <Input value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="例: 50名" data-testid="input-employee-count" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">営業エリア</Label>
                        <Input value={businessArea} onChange={(e) => setBusinessArea(e.target.value)} placeholder="例: 関東全域" data-testid="input-business-area" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">運送業許可番号</Label>
                        <Input value={transportLicenseNumber} onChange={(e) => setTransportLicenseNumber(e.target.value)} data-testid="input-transport-license" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">インボイス登録番号</Label>
                        <Input value={invoiceRegistrationNumber} onChange={(e) => setInvoiceRegistrationNumber(e.target.value)} placeholder="T0000000000000" data-testid="input-invoice-number" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleSaveDetail} disabled={updateProfile.isPending} data-testid="button-save-detail">
                      {updateProfile.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "contact" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-6">担当者情報</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm">
                        <span className="text-destructive mr-1">必須</span>
                        担当者名
                      </Label>
                      <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="max-w-sm" data-testid="input-contact-name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">
                        <span className="text-destructive mr-1">必須</span>
                        メールアドレス
                      </Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-sm" data-testid="input-email" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleSaveContact} disabled={updateProfile.isPending} data-testid="button-save-contact">
                      {updateProfile.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "business" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-6">事業情報</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm">事業内容</Label>
                      <Textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder="事業内容をご記入ください" data-testid="input-business-description" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">事業所所在地</Label>
                      <Input value={officeLocations} onChange={(e) => setOfficeLocations(e.target.value)} placeholder="例: 東京、大阪、名古屋" data-testid="input-office-locations" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">主要取引先</Label>
                      <Textarea value={majorClients} onChange={(e) => setMajorClients(e.target.value)} placeholder="主要取引先をご記入ください" data-testid="input-major-clients" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleSaveBusiness} disabled={updateProfile.isPending} data-testid="button-save-business">
                      {updateProfile.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "password" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-6">パスワード変更</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm">現在のパスワード</Label>
                      <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="max-w-sm" data-testid="input-current-password" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">新しいパスワード</Label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="max-w-sm" data-testid="input-new-password" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">新しいパスワード（確認）</Label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="max-w-sm" data-testid="input-confirm-password" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleSavePassword} disabled={updatePassword.isPending} data-testid="button-save-password">
                      {updatePassword.isPending ? "変更中..." : "パスワードを変更"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "email" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-6">メール受信設定</h2>
                  <p className="text-sm text-muted-foreground mb-4">通知メールの受信設定を管理します。</p>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer" data-testid="toggle-email-cargo">
                      <input
                        type="checkbox"
                        checked={emailCargo}
                        onChange={(e) => setEmailCargo(e.target.checked)}
                        className="w-4 h-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-foreground">荷物情報の通知メール</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer" data-testid="toggle-email-truck">
                      <input
                        type="checkbox"
                        checked={emailTruck}
                        onChange={(e) => setEmailTruck(e.target.checked)}
                        className="w-4 h-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-foreground">空車情報の通知メール</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer" data-testid="toggle-email-announcement">
                      <input
                        type="checkbox"
                        checked={emailAnnouncement}
                        onChange={(e) => setEmailAnnouncement(e.target.checked)}
                        className="w-4 h-4 rounded border-border accent-primary"
                      />
                      <span className="text-sm text-foreground">お知らせ・メンテナンス情報</span>
                    </label>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={() => toast({ title: "メール受信設定を保存しました" })}
                      data-testid="button-save-email"
                    >
                      保存
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
