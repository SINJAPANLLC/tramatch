import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Building2, Lock } from "lucide-react";
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
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
      setFax(user.fax || "");
      setContactName(user.contactName || "");
      setEmail(user.email || "");
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
    updateProfile.mutate({ companyName, address, phone, fax });
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

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">設定</h1>
          <p className="text-sm text-muted-foreground mt-1">アカウント・プロフィール設定</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                会社情報
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">会社名</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" data-testid="input-company-name" />
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
