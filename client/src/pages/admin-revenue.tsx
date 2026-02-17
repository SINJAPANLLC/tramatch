import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Package, CheckCircle, Truck, DollarSign, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";

type RevenueStats = {
  totalUsers: number;
  approvedUsers: number;
  totalCargo: number;
  completedCargo: number;
  totalTrucks: number;
};

export default function AdminRevenue() {
  const { data: stats, isLoading } = useQuery<RevenueStats>({
    queryKey: ["/api/admin/revenue-stats"],
  });

  const statCards = [
    { label: "総ユーザー数", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "承認済ユーザー", value: stats?.approvedUsers ?? 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "荷物掲載数", value: stats?.totalCargo ?? 0, icon: Package, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "成約数", value: stats?.completedCargo ?? 0, icon: CheckCircle, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { label: "空車掲載数", value: stats?.totalTrucks ?? 0, icon: Truck, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30" },
  ];

  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const currentMonth = new Date().getMonth();

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">収益管理</h1>
          <p className="text-sm text-muted-foreground mt-1">プラットフォーム利用状況・統計</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.label} data-testid={`card-stat-${stat.label}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-md ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground" data-testid={`text-stat-${stat.label}`}>{stat.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                収益概要
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">総収益</span>
                  <span className="text-foreground font-bold text-lg" data-testid="text-total-revenue">¥0</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">今月の収益</span>
                  <span className="text-foreground font-medium" data-testid="text-monthly-revenue">¥0</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">有料プランの利用が開始されると、収益データが表示されます</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                利用率
              </h2>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-sm mb-1">
                      <span className="text-muted-foreground">ユーザー承認率</span>
                      <span className="text-foreground font-medium">
                        {stats && stats.totalUsers > 0
                          ? `${Math.round((stats.approvedUsers / stats.totalUsers) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full transition-all"
                        style={{ width: stats && stats.totalUsers > 0 ? `${(stats.approvedUsers / stats.totalUsers) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 text-sm mb-1">
                      <span className="text-muted-foreground">荷物成約率</span>
                      <span className="text-foreground font-medium">
                        {stats && stats.totalCargo > 0
                          ? `${Math.round((stats.completedCargo / stats.totalCargo) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all"
                        style={{ width: stats && stats.totalCargo > 0 ? `${(stats.completedCargo / stats.totalCargo) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              月別利用状況
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-monthly-usage">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-muted-foreground font-medium">月</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">荷物掲載</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">空車掲載</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">新規登録</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">収益</th>
                  </tr>
                </thead>
                <tbody>
                  {months.slice(0, currentMonth + 1).reverse().map((month, idx) => (
                    <tr key={month} className="border-b last:border-0">
                      <td className="py-2 text-foreground">{month}</td>
                      <td className="py-2 text-right text-foreground">{idx === 0 ? (stats?.totalCargo ?? "-") : "-"}</td>
                      <td className="py-2 text-right text-foreground">{idx === 0 ? (stats?.totalTrucks ?? "-") : "-"}</td>
                      <td className="py-2 text-right text-foreground">{idx === 0 ? (stats?.totalUsers ?? "-") : "-"}</td>
                      <td className="py-2 text-right text-foreground">¥0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
