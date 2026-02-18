import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Crown, X, Building2, CheckCircle, ExternalLink, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function Payment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentPlan = user?.plan || "free";

  const [acctContactName, setAcctContactName] = useState("");
  const [acctContactEmail, setAcctContactEmail] = useState("");
  const [acctContactPhone, setAcctContactPhone] = useState("");
  const [acctContactFax, setAcctContactFax] = useState("");

  useEffect(() => {
    if (user) {
      setAcctContactName(user.accountingContactName || "");
      setAcctContactEmail(user.accountingContactEmail || "");
      setAcctContactPhone(user.accountingContactPhone || "");
      setAcctContactFax(user.accountingContactFax || "");
    }
  }, [user]);

  const saveAccountingContact = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/user/profile", {
        accountingContactName: acctContactName,
        accountingContactEmail: acctContactEmail,
        accountingContactPhone: acctContactPhone,
        accountingContactFax: acctContactFax,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "経理連絡先を保存しました" });
    },
    onError: () => {
      toast({ title: "保存に失敗しました", variant: "destructive" });
    },
  });

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
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">お支払い</span>
                </div>
                <Badge variant="secondary" className="text-xs">銀行振込設定中</Badge>
              </div>

              <div className="rounded-md bg-muted/50 p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <span className="text-sm text-muted-foreground shrink-0 w-24">銀行・支店</span>
                  <span className="text-sm text-foreground" data-testid="text-bank-info">三井住友銀行 ドットコム支店(店番号 953)</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-sm text-muted-foreground shrink-0 w-24">口座種別</span>
                  <span className="text-sm text-foreground" data-testid="text-account-type">当座預金</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-sm text-muted-foreground shrink-0 w-24">口座番号</span>
                  <span className="text-sm text-foreground" data-testid="text-account-number">5534446</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-sm text-muted-foreground shrink-0 w-24">口座名義</span>
                  <span className="text-sm text-foreground" data-testid="text-account-holder">トラマッチ株式会社</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-4">請求書受領設定</h2>

          <Card data-testid="card-invoice-settings">
            <CardContent className="p-6">
              <div className="space-y-1 mb-6">
                <p className="text-sm text-muted-foreground">過去の請求書には反映されません。必要な場合はお問い合わせください。</p>
                <p className="text-sm text-muted-foreground">法人名の変更が必要な場合は、お問い合わせください。</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">法人名</span>
                  <p className="text-sm text-foreground" data-testid="text-invoice-company">{user?.companyName || "未登録"}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">宛名</span>
                  <p className="text-sm text-foreground" data-testid="text-invoice-addressee">{user?.contactName || "ご担当者"}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">住所</span>
                  <p className="text-sm text-foreground" data-testid="text-invoice-address">
                    {user?.postalCode ? `〒${user.postalCode}` : "未登録"}
                    {user?.address ? ` ${user.address}` : ""}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">電話番号</span>
                  <p className="text-sm text-foreground" data-testid="text-invoice-phone">{user?.phone || "未登録"}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">FAX番号</span>
                  <p className="text-sm text-foreground" data-testid="text-invoice-fax">{user?.fax || "未登録"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-4">請求書発行設定</h2>

          <Card data-testid="card-invoice-issue-settings">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-6">支払通知書にも反映されます。</p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">会社名</span>
                  <p className="text-sm text-foreground" data-testid="text-issue-company">{user?.companyName || "未登録"}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">担当者名</span>
                  <p className="text-sm text-foreground" data-testid="text-issue-contact">{user?.contactName || "ご担当者"}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">住所</span>
                  <p className="text-sm text-foreground" data-testid="text-issue-address">
                    {user?.postalCode ? `〒${user.postalCode}` : "未登録"}
                    {user?.address ? ` ${user.address}` : ""}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">電話番号</span>
                  <p className="text-sm text-foreground" data-testid="text-issue-phone">{user?.phone || "未登録"}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm text-muted-foreground">FAX番号</span>
                  <p className="text-sm text-foreground" data-testid="text-issue-fax">{user?.fax || "未登録"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-4">経理連絡先設定</h2>

          <Card data-testid="card-accounting-contact">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-6">
                トラマッチから請求・お支払いに関する確認時、実務担当者様へスムーズにご連絡するために使用します。
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">経理連絡先名</Label>
                  <Input value={acctContactName} onChange={(e) => setAcctContactName(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-name" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">経理連絡先メールアドレス</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input type="email" value={acctContactEmail} onChange={(e) => setAcctContactEmail(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-email" />
                    {acctContactEmail && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <CheckCircle className="w-3.5 h-3.5" />
                        認証済み
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">電話番号</Label>
                  <Input value={acctContactPhone} onChange={(e) => setAcctContactPhone(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-phone" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">FAX番号</Label>
                  <Input value={acctContactFax} onChange={(e) => setAcctContactFax(e.target.value)} className="max-w-sm" data-testid="input-acct-contact-fax" />
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => saveAccountingContact.mutate()} disabled={saveAccountingContact.isPending} data-testid="button-save-acct-contact">
                  {saveAccountingContact.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-4">ユーザー管理</h2>

          <Card data-testid="card-user-management">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <p className="text-sm text-muted-foreground">
                  ユーザー追加には月額4,500円が発生する場合があります。詳しくはヘルプをご覧ください。
                </p>
                <Button variant="outline" size="sm" data-testid="button-help-user-mgmt">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  ヘルプを見る
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-user-management">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">担当者</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">役職</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">メールアドレス</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" data-testid="row-user-self">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div>
                            <span className="text-foreground">{user?.contactName || user?.companyName || "未設定"}</span>
                            <span className="text-xs text-muted-foreground ml-1">（本人）</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-xs">管理者</Badge>
                          <span className="text-muted-foreground text-xs">{user?.representative ? "代表者" : ""}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-foreground">{user?.email || "未設定"}</td>
                      <td className="py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-4">ご利用金額</h2>

          <Card data-testid="card-usage-amount">
            <CardContent className="p-6">
              <div className="space-y-1 mb-6">
                <p className="text-sm text-muted-foreground">※ご利用金額は月末締めで翌月1日に更新されます。</p>
                <p className="text-sm text-muted-foreground">※特記がない限り税込金額で表示しております。</p>
                <p className="text-sm text-muted-foreground">※おまかせ請求書は <a href="/payment" className="text-primary hover:underline">支払通知書・請求書ページ</a>からダウンロードしてください。</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-usage-amount">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">ご利用年月</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">ご利用金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const now = new Date();
                      const months = [];
                      for (let i = 0; i < 12; i++) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const isPremium = currentPlan === "premium";
                        months.push(
                          <tr key={`${year}-${month}`} className="border-b last:border-b-0" data-testid={`row-usage-${year}${month}`}>
                            <td className="py-3 pr-4 text-foreground">{year}年{month}月</td>
                            <td className="py-3 text-right text-foreground">{isPremium ? "9,900円" : "0円"}</td>
                          </tr>
                        );
                      }
                      return months;
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
