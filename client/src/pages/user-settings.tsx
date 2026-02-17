import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, User, Lock, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [companyNameKana, setCompanyNameKana] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [representative, setRepresentative] = useState("");
  const [establishedDate, setEstablishedDate] = useState("");
  const [capital, setCapital] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [businessArea, setBusinessArea] = useState("");
  const [transportLicenseNumber, setTransportLicenseNumber] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [invoiceRegistrationNumber, setInvoiceRegistrationNumber] = useState("");

  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");

  const [businessDescription, setBusinessDescription] = useState("");
  const [truckCount, setTruckCount] = useState("");
  const [officeLocations, setOfficeLocations] = useState("");
  const [majorClients, setMajorClients] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || "");
      setCompanyNameKana(user.companyNameKana || "");
      setPostalCode(user.postalCode || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
      setFax(user.fax || "");
      setRepresentative(user.representative || "");
      setEstablishedDate(user.establishedDate || "");
      setCapital(user.capital || "");
      setEmployeeCount(user.employeeCount || "");
      setBusinessArea(user.businessArea || "");
      setTransportLicenseNumber(user.transportLicenseNumber || "");
      setWebsiteUrl(user.websiteUrl || "");
      setInvoiceRegistrationNumber(user.invoiceRegistrationNumber || "");
      setContactName(user.contactName || "");
      setEmail(user.email || "");
      setBusinessDescription(user.businessDescription || "");
      setTruckCount(user.truckCount || "");
      setOfficeLocations(user.officeLocations || "");
      setMajorClients(user.majorClients || "");
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (data: Record<string, string>) => apiRequest("PATCH", "/api/user/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "プロフィールを更新しました" });
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

  const handleSaveCompany = () => {
    updateProfile.mutate({
      companyName,
      companyNameKana,
      postalCode,
      address,
      phone,
      fax,
      representative,
      establishedDate,
      capital,
      employeeCount,
      businessArea,
      transportLicenseNumber,
      websiteUrl,
      invoiceRegistrationNumber,
    });
  };

  const handleSaveContact = () => {
    updateProfile.mutate({ contactName, email });
  };

  const handleSaveBusiness = () => {
    updateProfile.mutate({ businessDescription, truckCount, officeLocations, majorClients });
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

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">設定</h1>
          <p className="text-sm text-muted-foreground mt-1">アカウント・プロフィール設定</p>
        </div>

        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                会社情報
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">会社名</Label>
                    <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" data-testid="input-company-name" />
                  </div>
                  <div>
                    <Label htmlFor="companyNameKana">会社名（カナ）</Label>
                    <Input id="companyNameKana" value={companyNameKana} onChange={(e) => setCompanyNameKana(e.target.value)} className="mt-1" data-testid="input-company-name-kana" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">郵便番号</Label>
                    <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1" placeholder="000-0000" data-testid="input-postal-code" />
                  </div>
                  <div>
                    <Label htmlFor="representative">代表者名</Label>
                    <Input id="representative" value={representative} onChange={(e) => setRepresentative(e.target.value)} className="mt-1" data-testid="input-representative" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">住所</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" data-testid="input-address" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">電話番号</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" data-testid="input-phone" />
                  </div>
                  <div>
                    <Label htmlFor="fax">FAX番号</Label>
                    <Input id="fax" value={fax} onChange={(e) => setFax(e.target.value)} className="mt-1" data-testid="input-fax" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="establishedDate">設立年月日</Label>
                    <Input id="establishedDate" value={establishedDate} onChange={(e) => setEstablishedDate(e.target.value)} className="mt-1" placeholder="例: 2000年4月" data-testid="input-established-date" />
                  </div>
                  <div>
                    <Label htmlFor="capital">資本金</Label>
                    <Input id="capital" value={capital} onChange={(e) => setCapital(e.target.value)} className="mt-1" placeholder="例: 1,000万円" data-testid="input-capital" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeCount">従業員数</Label>
                    <Input id="employeeCount" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} className="mt-1" placeholder="例: 50名" data-testid="input-employee-count" />
                  </div>
                  <div>
                    <Label htmlFor="businessArea">営業エリア</Label>
                    <Input id="businessArea" value={businessArea} onChange={(e) => setBusinessArea(e.target.value)} className="mt-1" placeholder="例: 関東全域" data-testid="input-business-area" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transportLicenseNumber">運送業許可番号</Label>
                    <Input id="transportLicenseNumber" value={transportLicenseNumber} onChange={(e) => setTransportLicenseNumber(e.target.value)} className="mt-1" data-testid="input-transport-license" />
                  </div>
                  <div>
                    <Label htmlFor="invoiceRegistrationNumber">インボイス登録番号</Label>
                    <Input id="invoiceRegistrationNumber" value={invoiceRegistrationNumber} onChange={(e) => setInvoiceRegistrationNumber(e.target.value)} className="mt-1" placeholder="T0000000000000" data-testid="input-invoice-number" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="websiteUrl">ウェブサイトURL</Label>
                  <Input id="websiteUrl" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="mt-1" placeholder="https://" data-testid="input-website-url" />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSaveCompany} disabled={updateProfile.isPending} data-testid="button-save-company">
                {updateProfile.isPending ? "保存中..." : "保存"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                担当者情報
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contactName">担当者名</Label>
                  <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1" data-testid="input-contact-name" />
                </div>
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" data-testid="input-email" />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSaveContact} disabled={updateProfile.isPending} data-testid="button-save-contact">
                {updateProfile.isPending ? "保存中..." : "保存"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                事業情報
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessDescription">事業内容</Label>
                  <Textarea id="businessDescription" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} className="mt-1" placeholder="事業内容をご記入ください" data-testid="input-business-description" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="truckCount">保有車両数</Label>
                    <Input id="truckCount" value={truckCount} onChange={(e) => setTruckCount(e.target.value)} className="mt-1" placeholder="例: 20台" data-testid="input-truck-count" />
                  </div>
                  <div>
                    <Label htmlFor="officeLocations">事業所所在地</Label>
                    <Input id="officeLocations" value={officeLocations} onChange={(e) => setOfficeLocations(e.target.value)} className="mt-1" placeholder="例: 東京、大阪、名古屋" data-testid="input-office-locations" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="majorClients">主要取引先</Label>
                  <Textarea id="majorClients" value={majorClients} onChange={(e) => setMajorClients(e.target.value)} className="mt-1" placeholder="主要取引先をご記入ください" data-testid="input-major-clients" />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSaveBusiness} disabled={updateProfile.isPending} data-testid="button-save-business">
                {updateProfile.isPending ? "保存中..." : "保存"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                パスワード変更
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">現在のパスワード</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" data-testid="input-current-password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">新しいパスワード</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" data-testid="input-new-password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" data-testid="input-confirm-password" />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSavePassword} disabled={updatePassword.isPending} data-testid="button-save-password">
                {updatePassword.isPending ? "変更中..." : "パスワードを変更"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
