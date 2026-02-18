import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Building2, CheckCircle, ExternalLink, User, ChevronUp, ChevronDown } from "lucide-react";
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

type SettingsTab = "basic" | "detail" | "credit" | "contract" | "bank" | "payment-method" | "invoice-receive" | "invoice-issue" | "accounting-contact" | "user-mgmt" | "email-cargo" | "usage";

const TABS: { key: SettingsTab; label: string; group: string }[] = [
  { key: "basic", label: "基本情報", group: "企業情報管理" },
  { key: "detail", label: "詳細情報", group: "企業情報管理" },
  { key: "credit", label: "信用情報", group: "企業情報管理" },
  { key: "contract", label: "契約内容", group: "企業情報管理" },
  { key: "bank", label: "口座情報", group: "企業情報管理" },
  { key: "payment-method", label: "お支払い方法", group: "企業情報管理" },
  { key: "invoice-receive", label: "請求書受領設定", group: "企業情報管理" },
  { key: "invoice-issue", label: "請求書発行設定", group: "企業情報管理" },
  { key: "accounting-contact", label: "経理連絡先", group: "企業情報管理" },
  { key: "user-mgmt", label: "ユーザー管理", group: "ユーザー管理" },
  { key: "email-cargo", label: "荷物情報", group: "メール受信設定" },
  { key: "usage", label: "ご利用金額", group: "ご利用金額" },
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

  const [acctContactName, setAcctContactName] = useState("");
  const [acctContactEmail, setAcctContactEmail] = useState("");
  const [acctContactPhone, setAcctContactPhone] = useState("");
  const [acctContactFax, setAcctContactFax] = useState("");

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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
      setAcctContactName(user.accountingContactName || "");
      setAcctContactEmail(user.accountingContactEmail || "");
      setAcctContactPhone(user.accountingContactPhone || "");
      setAcctContactFax(user.accountingContactFax || "");
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
            <nav className="space-y-1" data-testid="settings-nav">
              {Object.entries(groups).map(([group, tabs]) => {
                const isCollapsible = tabs.length > 1;
                const isCollapsed = collapsedGroups[group];
                const hasActiveTab = tabs.some(t => t.key === activeTab);
                return (
                  <div key={group}>
                    {isCollapsible ? (
                      <button
                        onClick={() => setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }))}
                        className="w-full flex items-center justify-between text-xs font-bold text-primary px-2 py-1.5"
                        data-testid={`button-group-${group}`}
                      >
                        <span>{group}</span>
                        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <div className="px-2 py-1">
                        {tabs.map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                              activeTab === tab.key
                                ? "border-l-2 border-primary font-medium text-foreground"
                                : "text-foreground hover-elevate"
                            }`}
                            data-testid={`button-tab-${tab.key}`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {isCollapsible && !isCollapsed && (
                      <ul className="space-y-0.5 ml-1">
                        {tabs.map((tab) => (
                          <li key={tab.key}>
                            <button
                              onClick={() => setActiveTab(tab.key)}
                              className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                                activeTab === tab.key
                                  ? "border-l-2 border-primary font-medium text-foreground"
                                  : "text-foreground hover-elevate"
                              }`}
                              data-testid={`button-tab-${tab.key}`}
                            >
                              {tab.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
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

            {activeTab === "payment-method" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-4">お支払い方法</h2>
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">お支払い</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">銀行振込設定中</Badge>
                  </div>
                  <div className="rounded-md bg-muted/50 p-4 space-y-3">
                    <div className="flex items-start gap-4">
                      <span className="text-sm text-muted-foreground shrink-0 w-24">銀行・支店</span>
                      <span className="text-sm text-foreground">三井住友銀行 ドットコム支店(店番号 953)</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-sm text-muted-foreground shrink-0 w-24">口座種別</span>
                      <span className="text-sm text-foreground">当座預金</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-sm text-muted-foreground shrink-0 w-24">口座番号</span>
                      <span className="text-sm text-foreground">5534446</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-sm text-muted-foreground shrink-0 w-24">口座名義</span>
                      <span className="text-sm text-foreground">トラマッチ株式会社</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "invoice-receive" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-4">請求書受領設定</h2>
                  <div className="space-y-1 mb-6">
                    <p className="text-sm text-muted-foreground">過去の請求書には反映されません。必要な場合はお問い合わせください。</p>
                    <p className="text-sm text-muted-foreground">法人名の変更が必要な場合は、お問い合わせください。</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">法人名</span>
                      <p className="text-sm text-foreground">{user?.companyName || "未登録"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">宛名</span>
                      <p className="text-sm text-foreground">{user?.contactName || "ご担当者"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">住所</span>
                      <p className="text-sm text-foreground">
                        {user?.postalCode ? `〒${user.postalCode}` : "未登録"}
                        {user?.address ? ` ${user.address}` : ""}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">電話番号</span>
                      <p className="text-sm text-foreground">{user?.phone || "未登録"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">FAX番号</span>
                      <p className="text-sm text-foreground">{user?.fax || "未登録"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "invoice-issue" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-4">請求書発行設定</h2>
                  <p className="text-sm text-muted-foreground mb-6">支払通知書にも反映されます。</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">会社名</span>
                      <p className="text-sm text-foreground">{user?.companyName || "未登録"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">担当者名</span>
                      <p className="text-sm text-foreground">{user?.contactName || "ご担当者"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">住所</span>
                      <p className="text-sm text-foreground">
                        {user?.postalCode ? `〒${user.postalCode}` : "未登録"}
                        {user?.address ? ` ${user.address}` : ""}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">電話番号</span>
                      <p className="text-sm text-foreground">{user?.phone || "未登録"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">FAX番号</span>
                      <p className="text-sm text-foreground">{user?.fax || "未登録"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "accounting-contact" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-4">経理連絡先</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    トラマッチから請求・お支払いに関する確認時、実務担当者様へスムーズにご連絡するために使用します。
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm">経理連絡先名</Label>
                      <Input value={acctContactName} onChange={(e) => setAcctContactName(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">経理連絡先メールアドレス</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Input type="email" value={acctContactEmail} onChange={(e) => setAcctContactEmail(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-email" />
                        {acctContactEmail && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <CheckCircle className="w-3.5 h-3.5" />
                            認証済み
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">電話番号</Label>
                      <Input value={acctContactPhone} onChange={(e) => setAcctContactPhone(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-phone" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">FAX番号</Label>
                      <Input value={acctContactFax} onChange={(e) => setAcctContactFax(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-fax" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={() => {
                      updateProfile.mutate({
                        accountingContactName: acctContactName,
                        accountingContactEmail: acctContactEmail,
                        accountingContactPhone: acctContactPhone,
                        accountingContactFax: acctContactFax,
                      });
                    }} disabled={updateProfile.isPending} data-testid="button-save-acct-contact">
                      {updateProfile.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "user-mgmt" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-4">ユーザー管理</h2>
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                    <p className="text-sm text-muted-foreground">
                      ユーザー追加には月額4,500円が発生する場合があります。詳しくはヘルプをご覧ください。
                    </p>
                    <Button variant="outline" size="sm" data-testid="button-help-user-mgmt">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      ヘルプを見る
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-user-management">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">担当者</th>
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">役職</th>
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">メールアドレス</th>
                          <th className="py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b" data-testid="row-user-self">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <div>
                                <span className="text-foreground">{user?.contactName || user?.companyName || "未設定"}</span>
                                <span className="text-xs text-muted-foreground ml-1">（本人）</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-xs">管理者</Badge>
                              <span className="text-muted-foreground text-xs">{user?.representative ? "代表者" : ""}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-foreground">{user?.email || "未設定"}</td>
                          <td className="py-3"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "email-cargo" && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-base font-bold text-foreground mb-4">荷物情報のメール受信設定</h2>
                    <p className="text-sm text-muted-foreground mb-1">
                      保存している「よく使う検索条件」の中から、該当する荷物情報を定期的にメールでお知らせします。メールでお知らせできる「よく使う検索条件」は1件のみです。
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      なお、「よく使う検索条件」は<a href="/cargo" className="text-primary hover:underline">荷物検索</a>ページから追加できます。
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="table-email-cargo-conditions">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">よく使う検索条件</th>
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">メール通知</th>
                            <th className="py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                              データがありません
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-base font-bold text-foreground mb-6">その他のメール受信設定</h2>
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
              </div>
            )}

            {activeTab === "usage" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-foreground mb-4">ご利用金額</h2>
                  <div className="space-y-1 mb-6">
                    <p className="text-sm text-muted-foreground">※ご利用金額は月末締めで翌月1日に更新されます。</p>
                    <p className="text-sm text-muted-foreground">※特記がない限り税込金額で表示しております。</p>
                    <p className="text-sm text-muted-foreground">※おまかせ請求書は <a href="/payment" className="text-primary hover:underline">支払通知書・請求書ページ</a>からダウンロードしてください。</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-usage-amount">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">ご利用年月</th>
                          <th className="text-right py-2 font-medium text-muted-foreground">ご利用金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const now = new Date();
                          const months = [];
                          const isPremium = currentPlan === "premium";
                          for (let i = 0; i < 12; i++) {
                            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            months.push(
                              <tr key={`${year}-${month}`} className="border-b last:border-b-0" data-testid={`row-usage-${year}${month}`}>
                                <td className="py-3 pr-4 text-foreground">{year}年{month}月</td>
                                <td className="py-3 text-right text-foreground">{isPremium ? "9,900円" : "0円"}</td>
                              </tr>
                            );
                          }
                          return months;
                        })()}
                      </tbody>
                    </table>
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
