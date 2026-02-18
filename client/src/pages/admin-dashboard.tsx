import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, Users, Activity, TrendingUp, MapPin, CheckCircle, Clock, Wifi, ArrowRight, UserCheck, UserX, BarChart3, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { CargoListing, TruckListing } from "@shared/schema";
import DashboardLayout from "@/components/dashboard-layout";

type SafeUser = {
  id: string;
  companyName: string;
  email: string;
  approved: boolean;
  role: string;
  registrationDate?: string | null;
  createdAt?: string | null;
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();

  const { data: cargo, isLoading: cargoLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: trucks, isLoading: trucksLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const pendingUsers = users?.filter((u) => !u.approved && u.role !== "admin") ?? [];
  const approvedUsers = users?.filter((u) => u.approved && u.role !== "admin") ?? [];
  const isLoading = cargoLoading || trucksLoading || usersLoading;

  const stats = [
    { label: "荷物掲載数", value: cargo?.length ?? 0, icon: Package, bgClass: "bg-blue-50 dark:bg-blue-950/30", iconClass: "text-blue-600 dark:text-blue-400", link: "/cargo" },
    { label: "空車掲載数", value: trucks?.length ?? 0, icon: Truck, bgClass: "bg-emerald-50 dark:bg-emerald-950/30", iconClass: "text-emerald-600 dark:text-emerald-400", link: "/trucks" },
    { label: "総ユーザー数", value: users?.filter(u => u.role !== "admin")?.length ?? 0, icon: Users, bgClass: "bg-violet-50 dark:bg-violet-950/30", iconClass: "text-violet-600 dark:text-violet-400", link: "/admin/users" },
    { label: "承認待ち", value: pendingUsers.length, icon: Activity, bgClass: "bg-amber-50 dark:bg-amber-950/30", iconClass: "text-amber-600 dark:text-amber-400", link: "/admin/applications", highlight: pendingUsers.length > 0 },
  ];

  const recentUsers = users
    ?.filter((u) => u.role !== "admin")
    .slice(-5)
    .reverse() ?? [];

  const recentCargo = cargo
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) ?? [];

  const recentTrucks = trucks
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) ?? [];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
        <div className="bg-primary rounded-md p-5 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">管理画面</h1>
              <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">システム全体の概要とクイックアクセス</p>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-sm text-primary-foreground/70">{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={`hover-elevate cursor-pointer transition-all ${stat.highlight ? "ring-2 ring-amber-400 dark:ring-amber-500" : ""}`}
              onClick={() => navigate(stat.link)}
              data-testid={`card-stat-${stat.label}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-md ${stat.bgClass} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconClass}`} />
                  </div>
                  {stat.highlight && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">
                      要対応
                    </Badge>
                  )}
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value.toLocaleString()}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {pendingUsers.length > 0 && (
          <Card className="mb-6 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                    <UserX className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{pendingUsers.length}件の承認待ちユーザーがあります</p>
                    <p className="text-xs text-muted-foreground mt-0.5">早めの承認をお願いします</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate("/admin/applications")} data-testid="button-go-applications">
                  申請管理へ
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  ユーザー内訳
                </h2>
              </div>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-foreground">承認済みユーザー</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{approvedUsers.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <UserX className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-foreground">承認待ちユーザー</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{pendingUsers.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-foreground">荷物掲載中</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{cargo?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-foreground">空車掲載中</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{trucks?.length ?? 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  最近の登録ユーザー
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} data-testid="button-view-all-users">
                  すべて見る
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">登録ユーザーはまだいません</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-recent-users">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium text-muted-foreground text-xs">会社名</th>
                        <th className="pb-2 font-medium text-muted-foreground text-xs">メール</th>
                        <th className="pb-2 font-medium text-muted-foreground text-xs text-center">ステータス</th>
                        <th className="pb-2 font-medium text-muted-foreground text-xs text-right">登録日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b last:border-0" data-testid={`row-recent-user-${user.id}`}>
                          <td className="py-2.5 pr-3">
                            <p className="font-medium text-foreground truncate max-w-[180px]">{user.companyName}</p>
                          </td>
                          <td className="py-2.5 pr-3">
                            <p className="text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge variant={user.approved ? "default" : "secondary"} className="text-xs">
                              {user.approved ? "承認済" : "未承認"}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-right">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {user.registrationDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString("ja-JP") : "-")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  最新の荷物掲載
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/cargo")} data-testid="button-view-all-cargo">
                  すべて見る
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              {cargoLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentCargo.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">荷物掲載はまだありません</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentCargo.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-md hover-elevate cursor-pointer"
                      onClick={() => navigate(`/cargo/${item.id}`)}
                      data-testid={`row-recent-cargo-${item.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                          <span className="truncate">{item.departureArea} → {item.arrivalArea}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {item.vehicleType || "指定なし"}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.desiredDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  最新の空車掲載
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/trucks")} data-testid="button-view-all-trucks">
                  すべて見る
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              {trucksLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentTrucks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Truck className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">空車掲載はまだありません</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentTrucks.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-md hover-elevate cursor-pointer"
                      onClick={() => navigate(`/trucks/${item.id}`)}
                      data-testid={`row-recent-truck-${item.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{item.vehicleType} / {item.loadCapacity}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                          <span className="truncate">{item.departureArea} → {item.arrivalArea}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.availableDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              システムステータス
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">サーバー</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">正常稼働</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">データベース</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">正常接続</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
                <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">API応答</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">正常</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
                <Wifi className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">稼働時間</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">稼働中</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
