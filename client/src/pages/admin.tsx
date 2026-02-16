import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Users, Trash2, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing, TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type SafeUser = {
  id: string;
  username: string;
  companyName: string;
  phone: string;
  email: string;
  userType: string;
  role: string;
};

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"cargo" | "trucks" | "users">("cargo");

  const { data: cargo, isLoading: cargoLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: trucks, isLoading: trucksLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const { data: adminUsers, isLoading: usersLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const deleteCargo = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cargo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "荷物情報を削除しました" });
    },
  });

  const deleteTruck = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trucks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: "車両情報を削除しました" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザーを削除しました" });
    },
  });

  const tabs = [
    { key: "cargo" as const, label: "荷物情報", icon: Package, count: cargo?.length ?? 0 },
    { key: "trucks" as const, label: "車両情報", icon: Truck, count: trucks?.length ?? 0 },
    { key: "users" as const, label: "ユーザー", icon: Users, count: adminUsers?.length ?? 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-primary rounded-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-admin-title">管理画面</h1>
        <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">荷物・車両・ユーザーの管理</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {tabs.map((tab) => (
          <Card
            key={tab.key}
            className={`cursor-pointer hover-elevate ${activeTab === tab.key ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            data-testid={`button-admin-tab-${tab.key}`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <tab.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{tab.count}</div>
                <div className="text-xs text-muted-foreground">{tab.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeTab === "cargo" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground mb-4">荷物情報一覧</h2>
          {cargoLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          ) : cargo?.map((item) => (
            <Card key={item.id} data-testid={`card-admin-cargo-${item.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                      <Badge variant="secondary" className="text-xs shrink-0">{item.vehicleType}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span>{item.departureArea} → {item.arrivalArea}</span>
                      <span className="ml-2">{item.companyName}</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteCargo.mutate(item.id)}
                    disabled={deleteCargo.isPending}
                    data-testid={`button-delete-cargo-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "trucks" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground mb-4">車両情報一覧</h2>
          {trucksLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          ) : trucks?.map((item) => (
            <Card key={item.id} data-testid={`card-admin-truck-${item.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                      <Badge variant="secondary" className="text-xs shrink-0">{item.vehicleType}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span>{item.currentArea} → {item.destinationArea}</span>
                      <span className="ml-2">{item.companyName}</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteTruck.mutate(item.id)}
                    disabled={deleteTruck.isPending}
                    data-testid={`button-delete-truck-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground mb-4">ユーザー一覧</h2>
          {usersLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          ) : adminUsers?.map((u) => (
            <Card key={u.id} data-testid={`card-admin-user-${u.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground text-sm">{u.username}</h3>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs shrink-0">
                        {u.role === "admin" ? "管理者" : "一般"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {u.companyName} / {u.email}
                    </div>
                  </div>
                  {u.role !== "admin" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteUser.mutate(u.id)}
                      disabled={deleteUser.isPending}
                      data-testid={`button-delete-user-${u.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
