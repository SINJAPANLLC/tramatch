import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/IMG_0046_1771226022407.jpg";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    try {
      await apiRequest("POST", "/api/forgot-password", { email });
      setSent(true);
      toast({
        title: "送信完了",
        description: "パスワードリセットのメールを送信しました。メールをご確認ください。",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "送信に失敗しました",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="TRA MATCH" className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl">パスワードをお忘れの方</CardTitle>
          <p className="text-sm text-muted-foreground">
            ご登録のメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-reset-sent">
                <strong>{email}</strong> にパスワードリセットのメールを送信しました。
                メールに記載のリンクからパスワードを再設定してください。
              </p>
              <p className="text-xs text-muted-foreground">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
              <Link href="/login">
                <Button variant="outline" className="mt-4" data-testid="button-back-to-login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ログインに戻る
                </Button>
              </Link>
            </div>
          ) : (
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
                  data-testid="input-forgot-email"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                data-testid="button-forgot-submit"
              >
                {isPending ? "送信中..." : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    リセットメールを送信
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
