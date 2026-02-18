import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/IMG_0046_1771226022407.jpg";

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "パスワードは6文字以上で入力してください",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "パスワードが一致しません",
      });
      return;
    }

    setIsPending(true);
    try {
      await apiRequest("POST", "/api/reset-password", { token, password });
      setSuccess(true);
      toast({
        title: "完了",
        description: "パスワードが正常にリセットされました",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "パスワードリセットに失敗しました",
      });
    } finally {
      setIsPending(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-muted-foreground" data-testid="text-invalid-token">無効なリセットリンクです。</p>
            <Link href="/forgot-password">
              <Button variant="outline" data-testid="button-request-again">
                パスワードリセットを再リクエスト
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="TRA MATCH" className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl">パスワード再設定</CardTitle>
          <p className="text-sm text-muted-foreground">
            新しいパスワードを入力してください
          </p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-reset-success">
                パスワードが正常にリセットされました。新しいパスワードでログインしてください。
              </p>
              <Link href="/login">
                <Button className="mt-4" data-testid="button-go-to-login">
                  ログインページへ
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">新しいパスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上で入力"
                  required
                  minLength={6}
                  data-testid="input-reset-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード確認</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力"
                  required
                  minLength={6}
                  data-testid="input-reset-confirm-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                data-testid="button-reset-submit"
              >
                {isPending ? "処理中..." : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    パスワードを再設定
                  </>
                )}
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-primary font-medium" data-testid="link-back-to-login">
                  <ArrowLeft className="w-3 h-3 inline mr-1" />
                  ログインに戻る
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
