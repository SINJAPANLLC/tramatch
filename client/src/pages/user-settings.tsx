import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown } from "lucide-react";
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

type SettingsTab = "basic" | "detail" | "credit" | "contract" | "bank" | "contact" | "password" | "email";

const TABS: { key: SettingsTab; label: string; group: string }[] = [
  { key: "basic", label: "基本情報", group: "企業情報管理" },
  { key: "detail", label: "詳細情報", group: "企業情報管理" },
  { key: "credit", label: "信用情報", group: "企業情報管理" },
  { key: "contract", label: "契約内容", group: "企業情報管理" },
  { key: "bank", label: "口座情報", group: "企業情報管理" },
  { key: "contact", label: "担当者情報", group: "企業情報管理" },
  { key: "password", label: "パスワード変更", group: "ユーザー管理" },
  { key: "email", label: "メール受信設定", group: "メール受信設定" },
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
  const [officeLocations, setOfficeLocations] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [majorClients, setMajorClients] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [closingMonth, setClosingMonth] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [paymentMonth, setPaymentMonth] = useState("");
  const [paymentDay, setPaymentDay] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  const [memberOrganization, setMemberOrganization] = useState("");
  const [transportLicenseNumber, setTransportLicenseNumber] = useState("");
  const [digitalTachographCount, setDigitalTachographCount] = useState("");
  const [gpsCount, setGpsCount] = useState("");
  const [safetyExcellenceCert, setSafetyExcellenceCert] = useState("");
  const [greenManagementCert, setGreenManagementCert] = useState("");
  const [iso9000, setIso9000] = useState("");
  const [iso14000, setIso14000] = useState("");
  const [iso39001, setIso39001] = useState("");
  const [cargoInsurance, setCargoInsurance] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderKana, setAccountHolderKana] = useState("");

  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");

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
      setOfficeLocations(user.officeLocations || "");
      setAnnualRevenue(user.annualRevenue || "");
      setBankInfo(user.bankInfo || "");
      setMajorClients(user.majorClients || "");
      setBusinessArea(user.businessArea || "");
      setClosingMonth(user.closingMonth || "");
      setClosingDay(user.closingDay || "");
      setPaymentMonth(user.paymentMonth || "");
      setPaymentDay(user.paymentDay || "");
      setBusinessDescription(user.businessDescription || "");
      setMemberOrganization(user.memberOrganization || "");
      setTransportLicenseNumber(user.transportLicenseNumber || "");
      setDigitalTachographCount(user.digitalTachographCount || "");
      setGpsCount(user.gpsCount || "");
      setSafetyExcellenceCert(user.safetyExcellenceCert || "");
      setGreenManagementCert(user.greenManagementCert || "");
      setIso9000(user.iso9000 || "");
      setIso14000(user.iso14000 || "");
      setIso39001(user.iso39001 || "");
      setCargoInsurance(user.cargoInsurance || "");
      setBankName(user.bankName || "");
      setBankBranch(user.bankBranch || "");
      setAccountType(user.accountType || "");
      setAccountNumber(user.accountNumber || "");
      setAccountHolderKana(user.accountHolderKana || "");
      setContactName(user.contactName || "");
      setEmail(user.email || "");
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

  const buildAddress = () => [prefecture, city, addressDetail].filter(Boolean).join("");

  const handleSaveBasic = () => {
    updateProfile.mutate({
      companyName, postalCode, address: buildAddress(), phone, fax, truckCount, websiteUrl,
    });
  };

  const handleSaveDetail = () => {
    updateProfile.mutate({
      businessDescription, representative, establishedDate, capital, employeeCount,
      officeLocations, annualRevenue, bankInfo, majorClients, businessArea,
      closingMonth, closingDay, paymentMonth, paymentDay,
    });
  };

  const handleSaveCredit = () => {
    updateProfile.mutate({
      memberOrganization, transportLicenseNumber, digitalTachographCount, gpsCount,
      safetyExcellenceCert, greenManagementCert, iso9000, iso14000, iso39001, cargoInsurance,
    });
  };

  const handleSaveBank = () => {
    updateProfile.mutate({ bankName, bankBranch, accountType, accountNumber, accountHolderKana });
  };

  const handleSaveContact = () => {
    updateProfile.mutate({ contactName, email });
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

  const currentPlan = user?.plan || "free";

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
                  <div className="mb-4">
                    <span className="text-sm font-medium text-foreground">{user?.companyName}</span>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm">
                        <span className="text-destructive mr-1">必須</span>住所
                      </Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground shrink-0">〒</span>
                        <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-32" placeholder="0000000" data-testid="input-postal-code" />
                        <Select value={prefecture} onValueChange={setPrefecture}>
                          <SelectTrigger className="w-32" data-testid="select-prefecture"><SelectValue placeholder="都道府県" /></SelectTrigger>
                          <SelectContent>{PREFECTURES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
                        </Select>
                        <Input value={city} onChange={(e) => setCity(e.target.value)} className="w-48" placeholder="市区町村" data-testid="input-city" />
                        <Input value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} className="flex-1 min-w-[120px]" placeholder="番地・建物名" data-testid="input-address-detail" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm"><span className="text-destructive mr-1">必須</span>電話番号</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="max-w-xs" data-testid="input-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm"><span className="text-destructive mr-1">必須</span>FAX</Label>
                      <Input value={fax} onChange={(e) => setFax(e.target.value)} className="max-w-xs" data-testid="input-fax" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm"><span className="text-destructive mr-1">必須</span>車両台数</Label>
                      <div className="flex items-center gap-2">
                        <Input value={truckCount} onChange={(e) => setTruckCount(e.target.value)} className="w-24" placeholder="0" data-testid="input-truck-count" />
                        <span className="text-sm text-muted-foreground">台</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">HPアドレス</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select defaultValue="https://">
                          <SelectTrigger className="w-28" data-testid="select-protocol"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="https://">https://</SelectItem>
                            <SelectItem value="http://">http://</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="flex-1 min-w-[200px]" placeholder="example.com/" data-testid="input-website-url" />
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
                  <h2 className="text-base font-bold text-foreground mb-2">企業詳細情報</h2>
                  <p className="text-sm text-muted-foreground mb-6">{user?.companyName}</p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm">業務内容</Label>
                      <Textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={8} placeholder="事業内容・業務内容をご記入ください" data-testid="input-business-description" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">代表者</Label>
                        <Input value={representative} onChange={(e) => setRepresentative(e.target.value)} data-testid="input-representative" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">設立</Label>
                        <Input value={establishedDate} onChange={(e) => setEstablishedDate(e.target.value)} placeholder="例: 2024年1月" data-testid="input-established-date" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">資本金</Label>
                        <div className="flex items-center gap-2">
                          <Input value={capital} onChange={(e) => setCapital(e.target.value)} className="w-32" placeholder="0" data-testid="input-capital" />
                          <span className="text-sm text-muted-foreground">万円</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">従業員数</Label>
                        <Input value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="例: 50名" data-testid="input-employee-count" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">事業所所在地</Label>
                      <Input value={officeLocations} onChange={(e) => setOfficeLocations(e.target.value)} placeholder="例: 神奈川県愛甲郡愛川町中津7287" data-testid="input-office-locations" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">売上</Label>
                        <div className="flex items-center gap-2">
                          <Input value={annualRevenue} onChange={(e) => setAnnualRevenue(e.target.value)} className="w-32" placeholder="0" data-testid="input-annual-revenue" />
                          <span className="text-sm text-muted-foreground">万円</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">取引銀行</Label>
                        <Input value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} placeholder="例: 相愛信用組合" data-testid="input-bank-info" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">主要取引先</Label>
                      <Textarea value={majorClients} onChange={(e) => setMajorClients(e.target.value)} rows={3} placeholder="主要取引先をご記入ください" data-testid="input-major-clients" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">営業地域</Label>
                      <Input value={businessArea} onChange={(e) => setBusinessArea(e.target.value)} placeholder="例: 関東一円" data-testid="input-business-area" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">締め月</Label>
                        <Select value={closingMonth} onValueChange={setClosingMonth}>
                          <SelectTrigger data-testid="select-closing-month"><SelectValue placeholder="選択" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="当月">当月</SelectItem>
                            <SelectItem value="翌月">翌月</SelectItem>
                            <SelectItem value="翌々月">翌々月</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">締め日</Label>
                        <Select value={closingDay} onValueChange={setClosingDay}>
                          <SelectTrigger data-testid="select-closing-day"><SelectValue placeholder="選択" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="末日">末日</SelectItem>
                            <SelectItem value="5日">5日</SelectItem>
                            <SelectItem value="10日">10日</SelectItem>
                            <SelectItem value="15日">15日</SelectItem>
                            <SelectItem value="20日">20日</SelectItem>
                            <SelectItem value="25日">25日</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">支払月</Label>
                        <Select value={paymentMonth} onValueChange={setPaymentMonth}>
                          <SelectTrigger data-testid="select-payment-month"><SelectValue placeholder="選択" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="当月">当月</SelectItem>
                            <SelectItem value="翌月">翌月</SelectItem>
                            <SelectItem value="翌々月">翌々月</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">支払日</Label>
                        <Select value={paymentDay} onValueChange={setPaymentDay}>
                          <SelectTrigger data-testid="select-payment-day"><SelectValue placeholder="選択" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="末日">末日</SelectItem>
                            <SelectItem value="5日">5日</SelectItem>
                            <SelectItem value="10日">10日</SelectItem>
                            <SelectItem value="15日">15日</SelectItem>
                            <SelectItem value="20日">20日</SelectItem>
                            <SelectItem value="25日">25日</SelectItem>
                          </SelectContent>
                        </Select>
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

            {activeTab === "credit" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-6">企業信用情報</h2>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">加入組織</Label>
                        <Input value={memberOrganization} onChange={(e) => setMemberOrganization(e.target.value)} placeholder="例: 愛甲商工会" data-testid="input-member-organization" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">国交省認可番号</Label>
                        <Input value={transportLicenseNumber} onChange={(e) => setTransportLicenseNumber(e.target.value)} placeholder="例: 関自貨第560号" data-testid="input-transport-license" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">デジタコ搭載数</Label>
                        <div className="flex items-center gap-2">
                          <Input value={digitalTachographCount} onChange={(e) => setDigitalTachographCount(e.target.value)} className="w-24" placeholder="0" data-testid="input-digital-tacho" />
                          <span className="text-sm text-muted-foreground">台</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">GPS搭載数</Label>
                        <div className="flex items-center gap-2">
                          <Input value={gpsCount} onChange={(e) => setGpsCount(e.target.value)} className="w-24" placeholder="0" data-testid="input-gps-count" />
                          <span className="text-sm text-muted-foreground">台</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">安全性優良事業所認定</Label>
                        <Input value={safetyExcellenceCert} onChange={(e) => setSafetyExcellenceCert(e.target.value)} placeholder="認定番号" data-testid="input-safety-cert" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">グリーン経営認証</Label>
                        <Input value={greenManagementCert} onChange={(e) => setGreenManagementCert(e.target.value)} placeholder="認証番号" data-testid="input-green-cert" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">ISO9000</Label>
                        <Input value={iso9000} onChange={(e) => setIso9000(e.target.value)} data-testid="input-iso9000" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">ISO14000</Label>
                        <Input value={iso14000} onChange={(e) => setIso14000(e.target.value)} data-testid="input-iso14000" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">ISO39001</Label>
                        <Input value={iso39001} onChange={(e) => setIso39001(e.target.value)} data-testid="input-iso39001" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">保険会社名</Label>
                      <Input value={cargoInsurance} onChange={(e) => setCargoInsurance(e.target.value)} placeholder="貨物保険の保険会社名" data-testid="input-cargo-insurance" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleSaveCredit} disabled={updateProfile.isPending} data-testid="button-save-credit">
                      {updateProfile.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "contract" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-4">ご契約内容</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    特記がない限り税込金額で表示しております。また、サービス利用状況に応じて従量料金が別途発生します。
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">基本契約</h3>
                      <div className="p-4 rounded-md bg-muted/50 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Crown className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {currentPlan === "premium" ? "プレミアムプラン" : "フリープラン"}
                          </span>
                          {currentPlan === "premium" && (
                            <span className="text-sm text-muted-foreground">1ヶ月：9,900円</span>
                          )}
                        </div>
                        {currentPlan === "premium" && (
                          <>
                            <p className="text-sm text-muted-foreground">
                              契約期間：{(() => {
                                const now = new Date();
                                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                const fmt = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
                                return `${fmt(start)} 〜 ${fmt(end)}`;
                              })()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ベータ期間中は無料でご利用いただけます。
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">プランに含まれる機能</h3>
                      <div className="space-y-2">
                        {currentPlan === "premium" ? (
                          <>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              AI荷物登録 無制限
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              荷物成約 無制限
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              荷物・空車検索
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              企業検索・取引先管理
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              配車依頼書作成
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              優先サポート
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              荷物・空車検索
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              企業検索
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              取引先管理
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "bank" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-2">口座情報</h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    トラマッチからの入金先として利用されます。
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    請求書を発行する際に、入金先として利用されます。
                  </p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm">銀行</Label>
                      <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="例: 相愛信用組合（2318）" data-testid="input-bank-name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">支店名</Label>
                      <Input value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} placeholder="例: 本店営業部（003）" data-testid="input-bank-branch" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">口座種別</Label>
                      <Select value={accountType} onValueChange={setAccountType}>
                        <SelectTrigger className="max-w-xs" data-testid="select-account-type"><SelectValue placeholder="選択してください" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="普通">普通</SelectItem>
                          <SelectItem value="当座">当座</SelectItem>
                          <SelectItem value="貯蓄">貯蓄</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">口座番号</Label>
                      <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="max-w-xs" placeholder="例: 0170074" data-testid="input-account-number" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">口座名義（カナ）</Label>
                      <Input value={accountHolderKana} onChange={(e) => setAccountHolderKana(e.target.value)} placeholder="例: ド）シン　ジャパン" data-testid="input-account-holder" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleSaveBank} disabled={updateProfile.isPending} data-testid="button-save-bank">
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
                      <Label className="text-sm"><span className="text-destructive mr-1">必須</span>担当者名</Label>
                      <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="max-w-sm" data-testid="input-contact-name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm"><span className="text-destructive mr-1">必須</span>メールアドレス</Label>
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
                      <input type="checkbox" checked={emailCargo} onChange={(e) => setEmailCargo(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
                      <span className="text-sm text-foreground">荷物情報の通知メール</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer" data-testid="toggle-email-truck">
                      <input type="checkbox" checked={emailTruck} onChange={(e) => setEmailTruck(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
                      <span className="text-sm text-foreground">空車情報の通知メール</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer" data-testid="toggle-email-announcement">
                      <input type="checkbox" checked={emailAnnouncement} onChange={(e) => setEmailAnnouncement(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
                      <span className="text-sm text-foreground">お知らせ・メンテナンス情報</span>
                    </label>
                  </div>
                  <div className="mt-6">
                    <Button onClick={() => toast({ title: "メール受信設定を保存しました" })} data-testid="button-save-email">保存</Button>
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
