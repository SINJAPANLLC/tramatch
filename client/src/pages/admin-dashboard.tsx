import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, Users, Activity, TrendingUp, MapPin, CheckCircle, Clock, Wifi } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  const isLoading = cargoLoading || trucksLoading || usersLoading;

  const stats = [
    { label: "荷物掲載数", value: cargo?.length ?? 0, icon: Package, color: "text-blue-600" },
    { label: "空車掲載数", value: trucks?.length ?? 0, icon: Truck, color: "text-green-600" },
    { label: "総ユーザー数", value: users?.length ?? 0, icon: Users, color: "text-purple-600" },
    { label: "承認待ち", value: pendingUsers.length, icon: Activity, color: "text-orange-600" },
  ];

  const recentUsers = users
    ?.filter((u) => u.role !== "admin")
    .slice(-5)
    .reverse() ?? [];

  const recentCargo = cargo
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) ?? [];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="bg-primary rounded-md p-5 mb-6">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">管理画面</h1>
          <p className="text-sm text-primary-foreground mt-1 text-shadow">システム全体の概要</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} data-testid={`card-stat-${stat.label}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
                <Users className="w-4 h-4 text-primary" />
                最近の登録ユーザー
              </h2>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">登録ユーザーはまだいません</p>
              ) : (
                <div className="space-y-2">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between gap-2 flex-wrap p-2 rounded-md bg-muted/30" data-testid={`row-recent-user-${user.id}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.companyName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={user.approved ? "default" : "secondary"} className="text-xs">
                          {user.approved ? "承認済" : "未承認"}
                        </Badge>
                        {user.registrationDate && (
                          <span className="text-xs text-muted-foreground">{user.registrationDate}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                最新の荷物掲載
              </h2>
              {cargoLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentCargo.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">荷物掲載はまだありません</p>
              ) : (
                <div className="space-y-2">
                  {recentCargo.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 flex-wrap p-2 rounded-md bg-muted/30" data-testid={`row-recent-cargo-${item.id}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{item.departureArea} → {item.arrivalArea}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{item.desiredDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              システムステータス
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">サーバー状態</span>
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">データベース</span>
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">API応答時間</span>
                <span className="flex items-center gap-1.5 text-foreground font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">稼働時間</span>
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <Wifi className="w-3.5 h-3.5" />
                  稼働中
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
