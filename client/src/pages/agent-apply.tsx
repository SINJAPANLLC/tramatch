import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, TrendingUp, Users, DollarSign } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const benefits = [
  { icon: DollarSign, title: "成果報酬型", desc: "初期費用0円。紹介成約ごとに報酬をお支払い" },
  { icon: Users, title: "既存ネットワーク活用", desc: "物流業界の人脈をそのまま収益化できる" },
  { icon: TrendingUp, title: "サポート充実", desc: "専任担当が営業資料・研修を完全バックアップ" },
  { icon: CheckCircle, title: "実績で差別化", desc: "AI求荷求車という先進サービスで荷主・運送会社へ提案" },
];

export default function AgentApply() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [area, setArea] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!area) {
      toast({ title: "エラー", description: "活動エリアを選択してください", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact", {
        companyName: formData.get("company") as string,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string) || undefined,
        category: "代理店申請",
        message: `【代理店申請】\n活動エリア: ${area}\n現職/業種: ${formData.get("occupation") || "未記入"}\n\n${formData.get("message") || ""}`,
      });
      toast({
        title: "申請を受け付けました",
        description: "担当者より2営業日以内にご連絡いたします。",
      });
      form.reset();
      setArea("");
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6" data-testid="text-page-title">
          代理店
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b) => (
            <Card key={b.title} className="text-center p-4">
              <b.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm mb-1">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>申請フォーム</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company">会社名・屋号</Label>
                <Input id="company" name="company" placeholder="合同会社〇〇" data-testid="input-company" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">お名前 *</Label>
                <Input id="name" name="name" placeholder="山田 太郎" data-testid="input-name" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input id="email" name="email" type="email" placeholder="example@email.com" data-testid="input-email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" name="phone" type="tel" placeholder="090-0000-0000" data-testid="input-phone" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="area">活動エリア *</Label>
                <Select onValueChange={setArea} value={area}>
                  <SelectTrigger data-testid="select-area">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="北海道・東北">北海道・東北</SelectItem>
                    <SelectItem value="関東">関東</SelectItem>
                    <SelectItem value="中部・北陸">中部・北陸</SelectItem>
                    <SelectItem value="近畿">近畿</SelectItem>
                    <SelectItem value="中国・四国">中国・四国</SelectItem>
                    <SelectItem value="九州・沖縄">九州・沖縄</SelectItem>
                    <SelectItem value="全国">全国</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occupation">現職・業種</Label>
                <Input id="occupation" name="occupation" placeholder="運送会社勤務、保険代理店など" data-testid="input-occupation" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">ご質問・自己PR（任意）</Label>
              <Textarea id="message" name="message" rows={4} placeholder="現在のネットワークや、代理店として活動したい背景などをお書きください。" data-testid="textarea-message" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit">
              {isSubmitting ? "送信中..." : "代理店申請を送信する"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
