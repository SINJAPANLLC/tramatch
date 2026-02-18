import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Package, Truck, Search, Pencil, Trash2, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import type { CargoListing, TruckListing } from "@shared/schema";

type TabType = "cargo" | "trucks";

export default function AdminListings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("cargo");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCargo, setEditingCargo] = useState<CargoListing | null>(null);
  const [editingTruck, setEditingTruck] = useState<TruckListing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: TabType; id: string; title: string } | null>(null);
  const [cargoForm, setCargoForm] = useState({
    title: "", departureArea: "", arrivalArea: "", desiredDate: "", vehicleType: "", price: "", status: "",
  });
  const [truckForm, setTruckForm] = useState({
    title: "", currentArea: "", destinationArea: "", vehicleType: "", maxWeight: "", availableDate: "", price: "", status: "",
  });

  const { data: cargo, isLoading: cargoLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: trucks, isLoading: trucksLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const updateCargo = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, string> }) => {
      await apiRequest("PATCH", `/api/admin/cargo/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "荷物掲載を更新しました" });
      setEditingCargo(null);
    },
    onError: () => {
      toast({ title: "更新に失敗しました", variant: "destructive" });
    },
  });

  const updateTruck = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, string> }) => {
      await apiRequest("PATCH", `/api/admin/trucks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: "空車掲載を更新しました" });
      setEditingTruck(null);
    },
    onError: () => {
      toast({ title: "更新に失敗しました", variant: "destructive" });
    },
  });

  const deleteCargo = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/cargo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "荷物掲載を削除しました" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "削除に失敗しました", variant: "destructive" });
    },
  });

  const deleteTruck = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/trucks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: "空車掲載を削除しました" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "削除に失敗しました", variant: "destructive" });
    },
  });

  const filteredCargo = useMemo(() => {
    if (!cargo) return [];
    if (!searchQuery) return cargo;
    const q = searchQuery.toLowerCase();
    return cargo.filter((c) => c.title.toLowerCase().includes(q));
  }, [cargo, searchQuery]);

  const filteredTrucks = useMemo(() => {
    if (!trucks) return [];
    if (!searchQuery) return trucks;
    const q = searchQuery.toLowerCase();
    return trucks.filter((t) => t.title.toLowerCase().includes(q));
  }, [trucks, searchQuery]);

  const isLoading = activeTab === "cargo" ? cargoLoading : trucksLoading;
  const currentCount = activeTab === "cargo" ? filteredCargo.length : filteredTrucks.length;

  const openCargoEdit = (item: CargoListing) => {
    setCargoForm({
      title: item.title || "",
      departureArea: item.departureArea || "",
      arrivalArea: item.arrivalArea || "",
      desiredDate: item.desiredDate || "",
      vehicleType: item.vehicleType || "",
      price: item.price || "",
      status: item.status || "active",
    });
    setEditingCargo(item);
  };

  const openTruckEdit = (item: TruckListing) => {
    setTruckForm({
      title: item.title || "",
      currentArea: item.currentArea || "",
      destinationArea: item.destinationArea || "",
      vehicleType: item.vehicleType || "",
      maxWeight: item.maxWeight || "",
      availableDate: item.availableDate || "",
      price: item.price || "",
      status: item.status || "active",
    });
    setEditingTruck(item);
  };

  const handleCargoSave = () => {
    if (!editingCargo) return;
    updateCargo.mutate({ id: editingCargo.id, data: cargoForm });
  };

  const handleTruckSave = () => {
    if (!editingTruck) return;
    updateTruck.mutate({ id: editingTruck.id, data: truckForm });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "cargo") {
      deleteCargo.mutate(deleteTarget.id);
    } else {
      deleteTruck.mutate(deleteTarget.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-4 overflow-y-auto h-full">
        <div className="bg-primary rounded-md p-5 mb-5">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">掲載管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">荷物・空車掲載の管理</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Card
            className={`cursor-pointer hover-elevate ${activeTab === "cargo" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveTab("cargo")}
            data-testid="card-tab-cargo"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-cargo-count">{cargo?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">荷物掲載</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover-elevate ${activeTab === "trucks" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveTab("trucks")}
            data-testid="card-tab-trucks"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-trucks-count">{trucks?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">空車掲載</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="タイトルで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-listing-search"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className="font-semibold text-sm" data-testid="text-result-count">
            {currentCount} 件表示
            {searchQuery && ` (「${searchQuery}」で検索中)`}
          </span>
        </div>

        {isLoading ? (
          <Card>
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3"><Skeleton className="h-12 w-full" /></div>
              ))}
            </div>
          </Card>
        ) : activeTab === "cargo" ? (
          filteredCargo.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">該当する荷物掲載がありません</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-cargo">
                  <thead>
                    <tr className="border-b bg-muted/60">
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">タイトル</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">企業名</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">エリア</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">日付</th>
                      <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">ステータス</th>
                      <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCargo.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover-elevate transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                        data-testid={`row-cargo-${item.id}`}
                      >
                        <td className="px-3 py-3 align-top">
                          <div className="font-bold text-foreground text-[12px] leading-tight truncate max-w-[180px]">{item.title}</div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span className="text-[12px] font-bold text-foreground truncate max-w-[140px] block">{item.companyName}</span>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                            <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                            <span className="truncate max-w-[160px]">{item.departureArea} → {item.arrivalArea}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span className="text-[12px] text-muted-foreground font-bold whitespace-nowrap">{item.desiredDate}</span>
                        </td>
                        <td className="px-3 py-3 text-center align-top">
                          <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-[10px]">
                            {item.status === "active" ? "公開中" : item.status === "completed" ? "完了" : item.status === "cancelled" ? "キャンセル" : item.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center align-top">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCargoEdit(item)}
                              data-testid={`button-edit-cargo-${item.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget({ type: "cargo", id: item.id, title: item.title })}
                              data-testid={`button-delete-cargo-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        ) : (
          filteredTrucks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Truck className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">該当する空車掲載がありません</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-trucks">
                  <thead>
                    <tr className="border-b bg-muted/60">
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">タイトル</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">企業名</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">エリア</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">日付</th>
                      <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">ステータス</th>
                      <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTrucks.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover-elevate transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                        data-testid={`row-truck-${item.id}`}
                      >
                        <td className="px-3 py-3 align-top">
                          <div className="font-bold text-foreground text-[12px] leading-tight truncate max-w-[180px]">{item.title}</div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span className="text-[12px] font-bold text-foreground truncate max-w-[140px] block">{item.companyName}</span>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                            <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                            <span className="truncate max-w-[160px]">{item.currentArea} → {item.destinationArea}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span className="text-[12px] text-muted-foreground font-bold whitespace-nowrap">{item.availableDate}</span>
                        </td>
                        <td className="px-3 py-3 text-center align-top">
                          <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-[10px]">
                            {item.status === "active" ? "公開中" : item.status === "completed" ? "完了" : item.status === "cancelled" ? "キャンセル" : item.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center align-top">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openTruckEdit(item)}
                              data-testid={`button-edit-truck-${item.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget({ type: "trucks", id: item.id, title: item.title })}
                              data-testid={`button-delete-truck-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        )}
      </div>

      <Dialog open={!!editingCargo} onOpenChange={(open) => { if (!open) setEditingCargo(null); }}>
        <DialogContent data-testid="dialog-edit-cargo">
          <DialogHeader>
            <DialogTitle>荷物掲載を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">タイトル</label>
              <Input value={cargoForm.title} onChange={(e) => setCargoForm({ ...cargoForm, title: e.target.value })} data-testid="input-edit-cargo-title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">出発地</label>
                <Input value={cargoForm.departureArea} onChange={(e) => setCargoForm({ ...cargoForm, departureArea: e.target.value })} data-testid="input-edit-cargo-departure" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">到着地</label>
                <Input value={cargoForm.arrivalArea} onChange={(e) => setCargoForm({ ...cargoForm, arrivalArea: e.target.value })} data-testid="input-edit-cargo-arrival" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">希望日</label>
                <Input value={cargoForm.desiredDate} onChange={(e) => setCargoForm({ ...cargoForm, desiredDate: e.target.value })} data-testid="input-edit-cargo-date" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">車両タイプ</label>
                <Input value={cargoForm.vehicleType} onChange={(e) => setCargoForm({ ...cargoForm, vehicleType: e.target.value })} data-testid="input-edit-cargo-vehicle" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">運賃</label>
                <Input value={cargoForm.price} onChange={(e) => setCargoForm({ ...cargoForm, price: e.target.value })} data-testid="input-edit-cargo-price" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">ステータス</label>
                <Input value={cargoForm.status} onChange={(e) => setCargoForm({ ...cargoForm, status: e.target.value })} data-testid="input-edit-cargo-status" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCargo(null)} data-testid="button-cancel-edit-cargo">キャンセル</Button>
            <Button onClick={handleCargoSave} disabled={updateCargo.isPending} data-testid="button-save-cargo">
              {updateCargo.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTruck} onOpenChange={(open) => { if (!open) setEditingTruck(null); }}>
        <DialogContent data-testid="dialog-edit-truck">
          <DialogHeader>
            <DialogTitle>空車掲載を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">タイトル</label>
              <Input value={truckForm.title} onChange={(e) => setTruckForm({ ...truckForm, title: e.target.value })} data-testid="input-edit-truck-title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">現在地</label>
                <Input value={truckForm.currentArea} onChange={(e) => setTruckForm({ ...truckForm, currentArea: e.target.value })} data-testid="input-edit-truck-current" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">行先</label>
                <Input value={truckForm.destinationArea} onChange={(e) => setTruckForm({ ...truckForm, destinationArea: e.target.value })} data-testid="input-edit-truck-destination" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">車両タイプ</label>
                <Input value={truckForm.vehicleType} onChange={(e) => setTruckForm({ ...truckForm, vehicleType: e.target.value })} data-testid="input-edit-truck-vehicle" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">最大積載量</label>
                <Input value={truckForm.maxWeight} onChange={(e) => setTruckForm({ ...truckForm, maxWeight: e.target.value })} data-testid="input-edit-truck-weight" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">空車日</label>
                <Input value={truckForm.availableDate} onChange={(e) => setTruckForm({ ...truckForm, availableDate: e.target.value })} data-testid="input-edit-truck-date" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">運賃</label>
                <Input value={truckForm.price} onChange={(e) => setTruckForm({ ...truckForm, price: e.target.value })} data-testid="input-edit-truck-price" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">ステータス</label>
              <Input value={truckForm.status} onChange={(e) => setTruckForm({ ...truckForm, status: e.target.value })} data-testid="input-edit-truck-status" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTruck(null)} data-testid="button-cancel-edit-truck">キャンセル</Button>
            <Button onClick={handleTruckSave} disabled={updateTruck.isPending} data-testid="button-save-truck">
              {updateTruck.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent data-testid="dialog-confirm-delete">
          <DialogHeader>
            <DialogTitle>削除の確認</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            「{deleteTarget?.title}」を削除しますか？この操作は元に戻せません。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} data-testid="button-cancel-delete">キャンセル</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCargo.isPending || deleteTruck.isPending}
              data-testid="button-confirm-delete"
            >
              {(deleteCargo.isPending || deleteTruck.isPending) ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
