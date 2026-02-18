import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, X, CreditCard, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function Payment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentPlan = user?.plan || "free";
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const planMutation = useMutation({
    mutationFn: async (plan: string) => {
      const res = await apiRequest("PATCH", "/api/user/plan", { plan });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "プランを変更しました" });
    },
    onError: () => {
      toast({ title: "プランの変更に失敗しました", variant: "destructive" });
    },
  });

  const handleChangePlan = (plan: string) => {
    if (plan === currentPlan) return;
    planMutation.mutate(plan);
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">お支払い</h1>
          <p className="text-sm text-muted-foreground mt-1">料金プランの管理</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <Card className={`relative ${currentPlan === "free" ? "ring-2 ring-primary" : ""}`} data-testid="card-plan-free">
            {currentPlan === "free" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="text-xs">現在のプラン</Badge>
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="font-bold text-foreground text-lg">フリープラン</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">¥0</span>
                  <span className="text-sm text-muted-foreground">/月</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">荷物成約 不可</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">AI荷物登録 不可</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">荷物・空車検索</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">企業検索</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">取引先管理</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                disabled={currentPlan === "free" || planMutation.isPending}
                onClick={() => handleChangePlan("free")}
                data-testid="button-select-free"
              >
                {currentPlan === "free" ? "現在のプラン" : "フリープランに変更"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`relative ${currentPlan === "premium" ? "ring-2 ring-primary" : ""}`} data-testid="card-plan-premium">
            {currentPlan === "premium" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="text-xs">現在のプラン</Badge>
              </div>
            )}
            {currentPlan !== "premium" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="secondary" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  おすすめ
                </Badge>
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="font-bold text-foreground text-lg flex items-center justify-center gap-1.5">
                  <Crown className="w-5 h-5 text-primary" />
                  プレミアムプラン
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">¥5,000</span>
                  <span className="text-sm text-muted-foreground">/月（税別）</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground font-bold">荷物成約 無制限</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground font-bold">AI荷物登録 無制限</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">荷物・空車検索</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">企業検索</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">取引先管理</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">配車依頼書作成</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">優先サポート</span>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={currentPlan === "premium" || planMutation.isPending}
                onClick={() => handleChangePlan("premium")}
                data-testid="button-select-premium"
              >
                {currentPlan === "premium" ? "現在のプラン" : planMutation.isPending ? "変更中..." : "プレミアムプランに変更"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-4">お支払い方法</h2>

          <Card data-testid="card-payment-methods">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">登録済みカード</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {currentPlan === "premium" ? "ベータ期間中は無料" : "未登録"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                現在ベータ期間中のため、プレミアムプランを無料でご利用いただけます。正式リリース後に課金が開始されますので、事前にお支払い方法をご登録ください。
              </p>

              {!showCardForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCardForm(true)}
                  data-testid="button-add-card"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  カードを登録する
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-name" className="text-sm">カード名義</Label>
                    <Input
                      id="card-name"
                      placeholder="TARO YAMADA"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      data-testid="input-card-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="text-sm">カード番号</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setCardNumber(v.replace(/(\d{4})(?=\d)/g, "$1 "));
                      }}
                      data-testid="input-card-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry" className="text-sm">有効期限</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCardExpiry(v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v);
                        }}
                        data-testid="input-card-expiry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvc" className="text-sm">セキュリティコード</Label>
                      <Input
                        id="card-cvc"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        data-testid="input-card-cvc"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        toast({ title: "ベータ期間中のため、カード登録は正式リリース時に有効になります", description: "登録情報は保存されませんでした。正式リリース後に再度ご登録ください。" });
                        setShowCardForm(false);
                        setCardNumber("");
                        setCardExpiry("");
                        setCardCvc("");
                        setCardName("");
                      }}
                      data-testid="button-save-card"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      登録する
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCardForm(false);
                        setCardNumber("");
                        setCardExpiry("");
                        setCardCvc("");
                        setCardName("");
                      }}
                      data-testid="button-cancel-card"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 max-w-3xl">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-foreground mb-3">お支払い履歴</h3>
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">お支払い履歴はありません</p>
                <p className="text-xs text-muted-foreground mt-1">ベータ期間中は課金されません</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
