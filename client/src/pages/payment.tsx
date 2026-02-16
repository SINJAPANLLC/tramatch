import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Receipt, Download, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";

export default function Payment() {
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
              <Button variant="outline" className="w-full" data-testid="button-upgrade-plan">
                プランをアップグレード
              </Button>
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
              <Button variant="outline" className="w-full" data-testid="button-add-payment">
                お支払い方法を登録
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <h2 className="text-base font-bold text-foreground">お支払い履歴</h2>
            <Button variant="outline" size="sm" data-testid="button-download-receipts">
              <Download className="w-4 h-4 mr-1.5" />
              領収書ダウンロード
            </Button>
          </div>
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
