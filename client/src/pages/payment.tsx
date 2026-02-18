import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Payment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentPlan = user?.plan || "free";

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
                  β版プレミアムプラン
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">¥5,500</span>
                  <span className="text-sm text-muted-foreground">/月（税込）</span>
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
                {currentPlan === "premium" ? "現在のプラン" : planMutation.isPending ? "変更中..." : "β版プレミアムプランに変更"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
