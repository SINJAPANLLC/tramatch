import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!category) {
      toast({ title: "エラー", description: "お問い合わせ種別を選択してください", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact", {
        companyName: formData.get("company") as string,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string) || undefined,
        category,
        message: formData.get("message") as string,
      });
      toast({
        title: "送信完了",
        description: "お問い合わせを受け付けました。2営業日以内にご返信いたします。",
      });
      form.reset();
      setCategory("");
    } catch (error: any) {
      toast({
        title: "送信エラー",
        description: error?.message || "送信に失敗しました。時間をおいて再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3" data-testid="text-page-title">お問い合わせ</h1>
        <p className="text-muted-foreground text-lg">ご不明な点がございましたらお気軽にお問い合わせください</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">お問い合わせフォーム</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">会社名</Label>
                    <Input id="company" name="company" placeholder="例: 株式会社トラマッチ" required data-testid="input-company" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前</Label>
                    <Input id="name" name="name" placeholder="例: 山田 太郎" required data-testid="input-name" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id="email" name="email" type="email" placeholder="例: info@example.com" required data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="例: 03-1234-5678" data-testid="input-phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">お問い合わせ種別</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">一般的なお問い合わせ</SelectItem>
                      <SelectItem value="account">アカウントについて</SelectItem>
                      <SelectItem value="billing">お支払いについて</SelectItem>
                      <SelectItem value="technical">技術的なお問い合わせ</SelectItem>
                      <SelectItem value="partnership">提携・パートナーシップ</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">お問い合わせ内容</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="お問い合わせ内容をご記入ください"
                    rows={6}
                    required
                    data-testid="input-message"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="button-submit">
                  {isSubmitting ? "送信中..." : "送信する"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">連絡先情報</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">所在地</p>
                    <p className="text-muted-foreground">〒243-0303<br />神奈川県愛甲郡愛川町中津7287</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">電話</p>
                    <p className="text-muted-foreground">046-212-2325</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">メール</p>
                    <p className="text-muted-foreground">info@sinjapan.jp</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">営業時間</p>
                    <p className="text-muted-foreground">24時間受付</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-2">運営会社</h3>
              <p className="text-sm text-muted-foreground">合同会社SIN JAPAN</p>
              <p className="text-sm text-muted-foreground">FAX: 046-212-2326</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
