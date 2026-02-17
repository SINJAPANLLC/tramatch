import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Trash2, Plus, Calendar, Weight, Truck, ArrowRight, Clock, CircleDot, Eye, CheckCircle2, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";

function CargoCard({ item, onDelete, isDeleting, onComplete, isCompleting, onCancel, isCancelling }: { item: CargoListing; onDelete: () => void; isDeleting: boolean; onComplete: () => void; isCompleting: boolean; onCancel: () => void; isCancelling: boolean }) {
  const daysAgo = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const timeLabel = daysAgo === 0 ? "今日" : daysAgo === 1 ? "昨日" : `${daysAgo}日前`;

  return (
    <Card className="hover-elevate" data-testid={`card-my-cargo-${item.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/cargo/${item.id}`}>
                <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid={`link-cargo-title-${item.id}`}>
                  {item.title}
                </span>
              </Link>
              {item.transportType && (
                <Badge variant={item.transportType === "スポット" ? "default" : "secondary"} className="text-xs" data-testid={`badge-transport-${item.id}`}>
                  {item.transportType}
                </Badge>
              )}
              <Badge variant="outline" className={`text-xs ${item.status === "completed" ? "border-orange-300 text-orange-600" : item.status === "cancelled" ? "border-red-300 text-red-600" : ""}`} data-testid={`badge-status-${item.id}`}>
                {item.status === "completed" ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1 text-orange-500" />成約済み</>
                ) : item.status === "cancelled" ? (
                  <><XCircle className="w-3 h-3 mr-1 text-red-500" />不成約</>
                ) : (
                  <><CircleDot className="w-3 h-3 mr-1 text-green-500" />掲載中</>
                )}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{item.departureArea}</span>
              {item.departureAddress && <span className="text-muted-foreground text-xs">({item.departureAddress})</span>}
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground mx-1" />
              <span className="font-medium text-foreground">{item.arrivalArea}</span>
              {item.arrivalAddress && <span className="text-muted-foreground text-xs">({item.arrivalAddress})</span>}
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              {item.desiredDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.desiredDate}
                  {item.departureTime && <span>({item.departureTime})</span>}
                </span>
              )}
              {item.arrivalDate && (
                <span className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  {item.arrivalDate}
                  {item.arrivalTime && <span>({item.arrivalTime})</span>}
                </span>
              )}
              {item.cargoType && (
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {item.cargoType}
                </span>
              )}
              {item.weight && (
                <span className="flex items-center gap-1">
                  <Weight className="w-3 h-3" />
                  {item.weight}
                </span>
              )}
              {item.vehicleType && (
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {item.vehicleType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {item.price && (
                <span className="text-sm font-semibold text-primary" data-testid={`text-price-${item.id}`}>
                  {formatPrice(item.price)}円
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                {item.viewCount ?? 0}人が閲覧
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeLabel}に登録
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Link href={`/cargo/${item.id}`}>
              <Button size="sm" variant="outline" data-testid={`button-view-cargo-${item.id}`}>
                詳細
              </Button>
            </Link>
            {item.status === "active" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onComplete}
                  disabled={isCompleting}
                  className="text-orange-600 border-orange-300"
                  data-testid={`button-complete-cargo-${item.id}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  成約にする
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="text-red-600 border-red-300"
                  data-testid={`button-cancel-cargo-${item.id}`}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  不成約にする
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { if (item.status === "completed") onComplete(); else onCancel(); }}
                disabled={isCompleting || isCancelling}
                className="text-green-600 border-green-300"
                data-testid={`button-reactivate-cargo-${item.id}`}
              >
                <CircleDot className="w-3.5 h-3.5 mr-1" />
                掲載に戻す
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              disabled={isDeleting}
              data-testid={`button-delete-cargo-${item.id}`}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyCargo() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: allCargo, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const myCargo = allCargo?.filter((c) => c.userId === user?.id) ?? [];
  const sortedCargo = [...myCargo].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const deleteCargo = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cargo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "荷物情報を削除しました" });
    },
  });

  const toggleCargoStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/cargo/${id}/status`, { status });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: variables.status === "completed" ? "成約済みにしました" : variables.status === "cancelled" ? "不成約にしました" : "掲載中に戻しました" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">登録した荷物</h1>
            <p className="text-sm text-muted-foreground mt-1">
              自分が登録した荷物情報の一覧
              {sortedCargo.length > 0 && <span className="ml-2">({sortedCargo.length}件)</span>}
            </p>
          </div>
          <Link href="/cargo/new">
            <Button data-testid="button-add-cargo">
              <Plus className="w-4 h-4 mr-1.5" />
              新規登録
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : sortedCargo.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">登録した荷物はありません</p>
              <Link href="/cargo/new">
                <Button className="mt-4" data-testid="button-empty-add-cargo">
                  <Plus className="w-4 h-4 mr-1.5" />
                  荷物を登録する
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedCargo.map((item) => (
              <CargoCard
                key={item.id}
                item={item}
                onDelete={() => deleteCargo.mutate(item.id)}
                isDeleting={deleteCargo.isPending}
                onComplete={() => toggleCargoStatus.mutate({ id: item.id, status: item.status === "active" ? "completed" : "active" })}
                isCompleting={toggleCargoStatus.isPending}
                onCancel={() => toggleCargoStatus.mutate({ id: item.id, status: item.status === "active" ? "cancelled" : "active" })}
                isCancelling={toggleCargoStatus.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
