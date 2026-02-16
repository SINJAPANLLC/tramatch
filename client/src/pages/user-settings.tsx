import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Building2, Phone, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

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
                <div>
                  <Label htmlFor="companyName">会社名</Label>
                  <Input id="companyName" defaultValue={user?.companyName || ""} className="mt-1" data-testid="input-company-name" />
                </div>
                <div>
                  <Label htmlFor="address">住所</Label>
                  <Input id="address" defaultValue={user?.address || ""} className="mt-1" data-testid="input-address" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">電話番号</Label>
                    <Input id="phone" defaultValue={user?.phone || ""} className="mt-1" data-testid="input-phone" />
                  </div>
                  <div>
                    <Label htmlFor="fax">FAX番号</Label>
                    <Input id="fax" defaultValue={user?.fax || ""} className="mt-1" data-testid="input-fax" />
                  </div>
                </div>
              </div>
              <Button className="mt-4" data-testid="button-save-company"
                onClick={() => toast({ title: "会社情報を更新しました" })}
              >
                保存
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
                  <Input id="contactName" defaultValue={user?.contactName || ""} className="mt-1" data-testid="input-contact-name" />
                </div>
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} className="mt-1" data-testid="input-email" />
                </div>
              </div>
              <Button className="mt-4" data-testid="button-save-contact"
                onClick={() => toast({ title: "担当者情報を更新しました" })}
              >
                保存
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
                  <Input id="currentPassword" type="password" className="mt-1" data-testid="input-current-password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">新しいパスワード</Label>
                  <Input id="newPassword" type="password" className="mt-1" data-testid="input-new-password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                  <Input id="confirmPassword" type="password" className="mt-1" data-testid="input-confirm-password" />
                </div>
              </div>
              <Button className="mt-4" data-testid="button-save-password"
                onClick={() => toast({ title: "パスワードを変更しました" })}
              >
                パスワードを変更
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
