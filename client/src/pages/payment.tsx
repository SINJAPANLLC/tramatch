import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Receipt, Wallet, Check, Crown, Star, Package, Truck, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing } from "@shared/schema";

const plans = [
  {
    name: "フリー",
    price: "¥0",
    period: "/月",
    isCurrent: true,
    features: [
      "荷物掲載 月5件まで",
      "空車掲載 月5件まで",
      "企業検索 基本機能",
      "メール通知",
    ],
    action: "現在のプラン",
    variant: "outline" as const,
  },
  {
    name: "スタンダード",
    price: "¥5,000",
    period: "/月",
    isCurrent: false,
    features: [
      "荷物掲載 無制限",
      "空車掲載 無制限",
      "AI運賃見積もり",
      "配車依頼書作成",
      "優先サポート",
    ],
    action: "アップグレード",
    variant: "default" as const,
  },
  {
    name: "プレミアム",
    price: "¥10,000",
    period: "/月",
    isCurrent: false,
    features: [
      "スタンダードの全機能",
      "運行分析レポート",
      "契約書テンプレート",
      "専任担当者サポート",
      "API連携",
    ],
    action: "お問い合わせ",
    variant: "outline" as const,
  },
];

export default function Payment() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: cargoListings } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: truckListings } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const myCargoCount = cargoListings?.filter((c) => c.userId === user?.id).length ?? 0;
  const myTruckCount = truckListings?.filter((t) => t.userId === user?.id).length ?? 0;

  const handleUpgrade = (planName: string) => {
    toast({
      title: "プランアップグレード",
      description: `${planName}プランへのアップグレードは現在準備中です。`,
    });
  };

  const handleRegisterPayment = () => {
    toast({
      title: "お支払い方法登録",
      description: "お支払い方法の登録機能は現在準備中です。",
    });
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">お支払い</h1>
          <p className="text-sm text-muted-foreground mt-1">料金プラン・お支払い情報の管理</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">現在のプラン</p>
                  <Badge variant="secondary" className="mt-0.5" data-testid="badge-current-plan">フリープラン</Badge>
                </div>
              </div>
              <ul className="space-y-1.5 mb-3">
                <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary shrink-0" />荷物掲載 月5件まで
                </li>
                <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary shrink-0" />空車掲載 月5件まで
                </li>
                <li className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary shrink-0" />企業検索 基本機能
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">お支払い方法</p>
                  <p className="text-xs text-muted-foreground mt-0.5">未登録</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleRegisterPayment} data-testid="button-add-payment">
                お支払い方法を登録
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            ご利用状況
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">荷物掲載数</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-cargo-count">{myCargoCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">空車掲載数</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-truck-count">{myTruckCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">プラン上限</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-plan-limit">5件/月</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            料金プラン
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.name} data-testid={`card-plan-${plan.name}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-foreground text-base">{plan.name}</h3>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    {plan.isCurrent && (
                      <Badge variant="secondary" className="mt-2">現在のプラン</Badge>
                    )}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.variant}
                    className="w-full"
                    disabled={plan.isCurrent}
                    onClick={() => handleUpgrade(plan.name)}
                    data-testid={`button-plan-${plan.name}`}
                  >
                    {plan.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            お支払い履歴
          </h2>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-state">お支払い履歴はありません</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
