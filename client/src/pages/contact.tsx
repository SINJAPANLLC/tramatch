import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: "送信完了",
        description: "お問い合わせを受け付けました。2営業日以内にご返信いたします。",
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
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
                    <Input id="company" placeholder="例: 株式会社トラマッチ" required data-testid="input-company" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前</Label>
                    <Input id="name" placeholder="例: 山田 太郎" required data-testid="input-name" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id="email" type="email" placeholder="例: info@example.com" required data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    <Input id="phone" type="tel" placeholder="例: 03-1234-5678" data-testid="input-phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">お問い合わせ種別</Label>
                  <Select required>
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
                    <p className="text-muted-foreground">平日 9:00〜18:00</p>
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
