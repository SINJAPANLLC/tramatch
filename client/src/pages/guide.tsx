import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Search, UserPlus, FileText, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Guide() {
  const steps = [
    {
      icon: UserPlus,
      title: "1. 新規登録",
      description: "会社情報を入力し、許可証をアップロードして新規登録を行います。管理者の承認後、ログインが可能になります。",
    },
    {
      icon: Search,
      title: "2. 荷物・空車を検索",
      description: "AI荷物検索やAI空車検索を使って、条件に合った荷物や車両を探すことができます。",
    },
    {
      icon: Package,
      title: "3. 荷物を登録",
      description: "運んでほしい荷物の情報（出発地、到着地、日時、荷物の種類など）を登録します。",
    },
    {
      icon: Truck,
      title: "4. 空車を登録",
      description: "空いている車両の情報（出発地、到着地、日時、車両タイプなど）を登録します。",
    },
    {
      icon: FileText,
      title: "5. マッチング・交渉",
      description: "条件に合う荷物や車両が見つかったら、相手の企業に連絡して条件を交渉します。",
    },
    {
      icon: CheckCircle,
      title: "6. 成約・運送",
      description: "条件が合意されたら成約となり、実際の運送が行われます。成約した荷物は「成約した荷物」ページで管理できます。",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3" data-testid="text-page-title">ご利用ガイド</h1>
        <p className="text-muted-foreground text-lg">トラマッチの使い方をステップごとにご説明します</p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <Card key={index} data-testid={`card-step-${index}`}>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center space-y-4">
        <p className="text-muted-foreground">さっそく始めてみましょう</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/register">
            <Button data-testid="button-register">
              新規登録 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="outline" data-testid="button-faq">
              <HelpCircle className="w-4 h-4 mr-1" /> よくある質問
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
