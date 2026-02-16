import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/IMG_0046_1771226022407.jpg";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      setLocation(isAdmin ? "/admin" : "/home");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ログイン失敗",
        description: error.message || "メールアドレスまたはパスワードが正しくありません",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="TRA MATCH" className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <p className="text-sm text-muted-foreground">TRA MATCHにログインしてください</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                required
                data-testid="input-login-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                data-testid="input-login-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
              data-testid="button-login-submit"
            >
              {login.isPending ? "ログイン中..." : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  ログイン
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            <div>
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-primary font-medium" data-testid="link-to-register">
                新規登録
              </Link>
            </div>
            <div>
              <span className="text-primary font-medium cursor-pointer" data-testid="link-forgot-password">
                パスワードを忘れた場合
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
