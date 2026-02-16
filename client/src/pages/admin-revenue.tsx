import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

export default function AdminRevenue() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">収益管理</h1>
          <p className="text-sm text-muted-foreground mt-1">収益・売上の分析・管理</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-revenue">¥0</p>
                  <p className="text-xs text-muted-foreground">総収益</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-monthly-revenue">¥0</p>
                  <p className="text-xs text-muted-foreground">今月の収益</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-paid-users">0</p>
                  <p className="text-xs text-muted-foreground">有料ユーザー</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-state">収益データはまだありません</p>
            <p className="text-xs text-muted-foreground mt-2">有料プランの利用が開始されると、ここに収益データが表示されます</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
