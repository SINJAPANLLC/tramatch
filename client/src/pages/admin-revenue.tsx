import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Users, UserCheck, UserPlus, Package, CheckCircle, Truck, Crown,
  BarChart3, TrendingUp, ArrowUpDown, Banknote, CircleDollarSign,
  MapPin, Pencil
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

type CompletedCargoDetail = {
  id: string;
  cargoNumber: number | null;
  title: string;
  departureArea: string;
  arrivalArea: string;
  cargoType: string;
  price: string | null;
  priceValue: number;
  companyName: string;
  acceptedByCompanyName: string | null;
  desiredDate: string;
  createdAt: string;
};

type RecentPayment = {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
};

type MonthlyEntry = {
  cargo: number;
  trucks: number;
  users: number;
  revenue: number;
  tradeVolume: number;
};

type RevenueStats = {
  totalUsers: number;
  approvedUsers: number;
  totalCargo: number;
  completedCargoCount: number;
  totalTrucks: number;
  freePlanUsers: number;
  betaPremiumUsers: number;
  premiumUsers: number;
  addedUsers: number;
  expectedMonthlyRevenue: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTradeVolume: number;
  completedCargoDetails: CompletedCargoDetail[];
  monthlyData: Record<string, MonthlyEntry>;
  recentPayments: RecentPayment[];
};

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

function StatCard({
  label, value, icon: Icon, color, bg, suffix, loading
}: {
  label: string; value: string | number; icon: typeof Users; color: string; bg: string; suffix?: string; loading?: boolean;
}) {
  return (
    <Card data-testid={`card-stat-${label}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold text-foreground truncate" data-testid={`text-stat-${label}`}>
                {value}{suffix}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminRevenue() {
  const { toast } = useToast();
  const { data: stats, isLoading } = useQuery<RevenueStats>({
    queryKey: ["/api/admin/revenue-stats"],
  });

  const [editingCargo, setEditingCargo] = useState<CompletedCargoDetail | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", departureArea: "", arrivalArea: "", cargoType: "" });

  const editMutation = useMutation({
    mutationFn: (data: { id: string; body: Record<string, string> }) =>
      apiRequest("PATCH", `/api/admin/cargo/${data.id}`, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-stats"] });
      toast({ title: "更新しました" });
      setEditingCargo(null);
    },
    onError: () => toast({ title: "更新に失敗しました", variant: "destructive" }),
  });

  const openEdit = (cargo: CompletedCargoDetail) => {
    setEditingCargo(cargo);
    setEditForm({
      title: cargo.title || "",
      price: cargo.price || "",
      departureArea: cargo.departureArea || "",
      arrivalArea: cargo.arrivalArea || "",
      cargoType: cargo.cargoType || "",
    });
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthlyEntries = [];
  if (stats?.monthlyData) {
    for (let m = currentMonth; m >= 0; m--) {
      const key = `${currentYear}-${String(m + 1).padStart(2, "0")}`;
      const data = stats.monthlyData[key];
      if (data) {
        monthlyEntries.push({ month: `${m + 1}月`, ...data });
      }
    }
  }

  const completedList = stats?.completedCargoDetails ?? [];
  const completedSorted = [...completedList].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-4 space-y-5">
        <div className="bg-primary rounded-md p-5">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">収益管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">プラットフォーム利用状況・商流・収益の概要</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="総ユーザー" value={stats?.totalUsers ?? 0} icon={Users} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/30" loading={isLoading} />
          <StatCard label="承認済み" value={stats?.approvedUsers ?? 0} icon={UserCheck} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" loading={isLoading} />
          <StatCard label="荷物掲載" value={stats?.totalCargo ?? 0} icon={Package} color="text-violet-600 dark:text-violet-400" bg="bg-violet-50 dark:bg-violet-950/30" suffix="件" loading={isLoading} />
          <StatCard label="成約数" value={stats?.completedCargoCount ?? 0} icon={CheckCircle} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/30" suffix="件" loading={isLoading} />
          <StatCard label="空車掲載" value={stats?.totalTrucks ?? 0} icon={Truck} color="text-teal-600 dark:text-teal-400" bg="bg-teal-50 dark:bg-teal-950/30" suffix="件" loading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card data-testid="card-revenue-summary">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-primary" />
                プラットフォーム収益
              </h2>
              {isLoading ? (
                <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-6 w-3/4" /></div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">総収益（決済実績）</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-total-revenue">{formatYen(stats?.totalRevenue ?? 0)}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-1">今月の決済収益</p>
                    <p className="text-xl font-bold text-foreground" data-testid="text-monthly-revenue">{formatYen(stats?.monthlyRevenue ?? 0)}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-1">予想月額収益（税込）</p>
                    <p className="text-xl font-bold text-foreground" data-testid="text-expected-revenue">{formatYen(stats?.expectedMonthlyRevenue ?? 0)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      プレミアム {stats?.premiumUsers ?? 0}社 × ¥5,500 + 追加ユーザー {stats?.addedUsers ?? 0}名 × ¥2,750
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-trade-volume">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                商流（成約金額）
              </h2>
              {isLoading ? (
                <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-6 w-3/4" /></div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">成約総額</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-total-trade-volume">{formatYen(stats?.totalTradeVolume ?? 0)}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-1">成約件数</p>
                    <p className="text-xl font-bold text-foreground">{stats?.completedCargoCount ?? 0}<span className="text-sm text-muted-foreground ml-1">件</span></p>
                  </div>
                  {stats && stats.completedCargoCount > 0 && stats.totalTradeVolume > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground mb-1">平均成約単価</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatYen(Math.round(stats.totalTradeVolume / stats.completedCargoCount))}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-plan-breakdown">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                プラン内訳
              </h2>
              {isLoading ? (
                <div className="space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">フリー</Badge>
                    </div>
                    <span className="text-lg font-bold text-foreground">{stats?.freePlanUsers ?? 0}<span className="text-xs text-muted-foreground ml-1">人</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">β版プレミアム</Badge>
                    </div>
                    <span className="text-lg font-bold text-foreground">{stats?.betaPremiumUsers ?? 0}<span className="text-xs text-muted-foreground ml-1">人</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">プレミアム</Badge>
                    </div>
                    <span className="text-lg font-bold text-foreground">{stats?.premiumUsers ?? 0}<span className="text-xs text-muted-foreground ml-1">人</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        <UserPlus className="w-3 h-3 mr-1" />追加ユーザー
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-foreground">{stats?.addedUsers ?? 0}<span className="text-xs text-muted-foreground ml-1">名</span></span>
                  </div>
                  {stats && stats.totalUsers > 0 && (
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
                        <span className="text-muted-foreground">有料プラン率</span>
                        <span className="font-bold text-foreground">
                          {Math.round(((stats.betaPremiumUsers + stats.premiumUsers) / stats.totalUsers) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className="h-2 bg-primary rounded-full transition-all"
                          style={{ width: `${((stats.betaPremiumUsers + stats.premiumUsers) / stats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card data-testid="card-utilization">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                利用率
              </h2>
              {isLoading ? (
                <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
                      <span className="text-muted-foreground">ユーザー承認率</span>
                      <span className="font-bold text-foreground">
                        {stats && stats.totalUsers > 0
                          ? `${Math.round((stats.approvedUsers / stats.totalUsers) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full">
                      <div
                        className="h-2.5 bg-emerald-500 rounded-full transition-all"
                        style={{ width: stats && stats.totalUsers > 0 ? `${(stats.approvedUsers / stats.totalUsers) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
                      <span className="text-muted-foreground">荷物成約率</span>
                      <span className="font-bold text-foreground">
                        {stats && stats.totalCargo > 0
                          ? `${Math.round((stats.completedCargoCount / stats.totalCargo) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full">
                      <div
                        className="h-2.5 bg-blue-500 rounded-full transition-all"
                        style={{ width: stats && stats.totalCargo > 0 ? `${(stats.completedCargoCount / stats.totalCargo) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-recent-payments">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" />
                最近の決済
              </h2>
              {isLoading ? (
                <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
              ) : stats && stats.recentPayments.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {stats.recentPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/30" data-testid={`payment-row-${p.id}`}>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{p.description || "決済"}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("ja-JP")}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"}
                          className="text-[10px]"
                        >
                          {p.status === "completed" ? "完了" : p.status === "pending" ? "処理中" : "失敗"}
                        </Badge>
                        <span className="text-sm font-bold text-foreground whitespace-nowrap">{formatYen(p.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Banknote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">決済履歴がありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-monthly-usage">
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              月別利用状況
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-monthly-usage">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">月</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">荷物掲載</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">空車掲載</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">新規登録</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">商流額</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">収益</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5" colSpan={6}><Skeleton className="h-5 w-full" /></td>
                      </tr>
                    ))
                  ) : monthlyEntries.length > 0 ? (
                    monthlyEntries.map((entry, idx) => (
                      <tr key={entry.month} className={idx % 2 === 1 ? "bg-muted/20" : ""}>
                        <td className="px-3 py-2.5 font-bold text-foreground whitespace-nowrap">{entry.month}</td>
                        <td className="px-3 py-2.5 text-right text-foreground font-bold">{entry.cargo}</td>
                        <td className="px-3 py-2.5 text-right text-foreground font-bold">{entry.trucks}</td>
                        <td className="px-3 py-2.5 text-right text-foreground font-bold">{entry.users}</td>
                        <td className="px-3 py-2.5 text-right text-foreground font-bold whitespace-nowrap">{formatYen(entry.tradeVolume)}</td>
                        <td className="px-3 py-2.5 text-right text-foreground font-bold whitespace-nowrap">{formatYen(entry.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-6 text-center text-muted-foreground text-xs" colSpan={6}>データがありません</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-cargo">
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-primary" />
              成約案件一覧（商流）
            </h2>
            {isLoading ? (
              <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : completedSorted.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-completed-cargo">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">No.</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">荷物名</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">区間</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">荷種</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">掲載企業</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">成約企業</th>
                      <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">運賃</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">成約日</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {completedSorted.map((cargo, idx) => (
                      <tr key={cargo.id} className={`${idx % 2 === 1 ? "bg-muted/20" : ""}`} data-testid={`row-completed-cargo-${cargo.id}`}>
                        <td className="px-3 py-2.5 text-foreground font-bold text-[12px]">
                          {cargo.cargoNumber ? `#${cargo.cargoNumber}` : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-foreground font-bold text-[12px] max-w-[120px]">
                          <div className="truncate">{cargo.title}</div>
                        </td>
                        <td className="px-3 py-2.5 text-[12px]">
                          <div className="flex items-center gap-1 text-foreground font-bold">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[55px]">{cargo.departureArea}</span>
                            <span className="text-muted-foreground mx-0.5">→</span>
                            <span className="truncate max-w-[55px]">{cargo.arrivalArea}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-foreground text-[12px]">{cargo.cargoType}</td>
                        <td className="px-3 py-2.5 text-[12px] max-w-[110px]">
                          <div className="truncate font-bold text-foreground">{cargo.companyName}</div>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] max-w-[110px]">
                          {cargo.acceptedByCompanyName ? (
                            <div className="truncate font-bold text-emerald-600 dark:text-emerald-400">{cargo.acceptedByCompanyName}</div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {cargo.priceValue > 0 ? (
                            <span className="font-bold text-foreground text-[12px]">{formatYen(cargo.priceValue)}</span>
                          ) : (
                            <span className="text-[12px] text-muted-foreground">未設定</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground text-[12px] whitespace-nowrap">
                          {new Date(cargo.createdAt).toLocaleDateString("ja-JP")}
                        </td>
                        <td className="px-3 py-2.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openEdit(cargo)}
                            data-testid={`button-edit-cargo-${cargo.id}`}
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td colSpan={6} className="px-3 py-2.5 text-sm font-bold text-foreground text-right">合計</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="font-bold text-foreground text-sm">{formatYen(stats?.totalTradeVolume ?? 0)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right" colSpan={2}>
                        <span className="text-xs text-muted-foreground">{completedSorted.length}件</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">成約案件がありません</p>
                <p className="text-xs text-muted-foreground mt-1">荷物が成約されると、ここに商流データが表示されます</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCargo} onOpenChange={(open) => { if (!open) setEditingCargo(null); }}>
        <DialogContent className="max-w-md" data-testid="dialog-edit-cargo">
          <DialogHeader>
            <DialogTitle>成約案件の編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs mb-1 block">荷物名</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                data-testid="input-edit-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">出発地</Label>
                <Input
                  value={editForm.departureArea}
                  onChange={(e) => setEditForm(f => ({ ...f, departureArea: e.target.value }))}
                  data-testid="input-edit-departure"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">到着地</Label>
                <Input
                  value={editForm.arrivalArea}
                  onChange={(e) => setEditForm(f => ({ ...f, arrivalArea: e.target.value }))}
                  data-testid="input-edit-arrival"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">荷種</Label>
              <Input
                value={editForm.cargoType}
                onChange={(e) => setEditForm(f => ({ ...f, cargoType: e.target.value }))}
                data-testid="input-edit-cargo-type"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">運賃</Label>
              <Input
                value={editForm.price}
                onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))}
                placeholder="例: ¥50,000"
                data-testid="input-edit-price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCargo(null)} data-testid="button-cancel-edit">キャンセル</Button>
            <Button
              onClick={() => editingCargo && editMutation.mutate({ id: editingCargo.id, body: editForm })}
              disabled={editMutation.isPending}
              data-testid="button-save-edit"
            >
              {editMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
