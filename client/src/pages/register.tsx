import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/IMG_0046_1771226022407.jpg";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    address: "",
    contactName: "",
    phone: "",
    fax: "",
    truckCount: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/home");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast({
        variant: "destructive",
        title: "確認",
        description: "利用規約・プライバシーポリシーに同意してください",
      });
      return;
    }
    try {
      await register.mutateAsync(form);
      toast({ title: "登録完了", description: "アカウントが作成されました" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "登録失敗",
        description: error.message || "登録に失敗しました",
      });
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="TRA MATCH" className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <p className="text-sm text-muted-foreground">TRA MATCHのアカウントを作成</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="info@example.co.jp"
                required
                data-testid="input-register-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="パスワード"
                required
                data-testid="input-register-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">会社名</Label>
              <Input
                id="companyName"
                type="text"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="例: 〇〇運送株式会社"
                required
                data-testid="input-register-company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">所在地</Label>
              <Input
                id="address"
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="例: 神奈川県横浜市中区1-2-3"
                data-testid="input-register-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">担当者名</Label>
              <Input
                id="contactName"
                type="text"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                placeholder="例: 山田 太郎"
                data-testid="input-register-contact-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="03-0000-0000"
                  required
                  data-testid="input-register-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">FAX番号</Label>
                <Input
                  id="fax"
                  type="tel"
                  value={form.fax}
                  onChange={(e) => update("fax", e.target.value)}
                  placeholder="03-0000-0001"
                  data-testid="input-register-fax"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="truckCount">トラック保有台数</Label>
              <Input
                id="truckCount"
                type="text"
                value={form.truckCount}
                onChange={(e) => update("truckCount", e.target.value)}
                placeholder="例: 10台"
                data-testid="input-register-truck-count"
              />
            </div>
            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                data-testid="checkbox-agree"
              />
              <Label htmlFor="agree" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                <span className="text-primary font-medium">利用規約</span>、<span className="text-primary font-medium">プライバシーポリシー</span>に同意する
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={register.isPending || !agreed}
              data-testid="button-register-submit"
            >
              {register.isPending ? "登録中..." : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  同意して登録する
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            既にアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-primary font-medium" data-testid="link-to-login">
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
