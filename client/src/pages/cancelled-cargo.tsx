import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, Package, MapPin, ArrowRight, Calendar, Weight, Truck, Clock, Eye, CircleDot } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";

function CancelledCard({ item, onReactivate, isReactivating }: { item: CargoListing; onReactivate: () => void; isReactivating: boolean }) {
  const createdDate = new Date(item.createdAt);
  const dateStr = `${createdDate.getFullYear()}/${String(createdDate.getMonth() + 1).padStart(2, "0")}/${String(createdDate.getDate()).padStart(2, "0")}`;

  return (
    <Card data-testid={`card-cancelled-cargo-${item.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/cargo/${item.id}`}>
                <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid={`link-cancelled-title-${item.id}`}>
                  {item.title}
                </span>
              </Link>
              {item.transportType && (
                <Badge variant={item.transportType === "スポット" ? "default" : "secondary"} className="text-xs">
                  {item.transportType}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                <XCircle className="w-3 h-3 mr-1" />
                不成約
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{item.departureArea}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground mx-1" />
              <span className="font-medium text-foreground">{item.arrivalArea}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              {item.desiredDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.desiredDate}
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
                <span className="text-sm font-semibold text-primary">
                  {formatPrice(item.price)}円
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                {item.viewCount ?? 0}人が閲覧
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                登録日: {dateStr}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Link href={`/cargo/${item.id}`}>
              <Button size="sm" variant="outline" data-testid={`button-view-cancelled-${item.id}`}>
                詳細
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={onReactivate}
              disabled={isReactivating}
              className="text-green-600 border-green-300"
              data-testid={`button-reactivate-cancelled-${item.id}`}
            >
              <CircleDot className="w-3.5 h-3.5 mr-1" />
              再掲載する
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CancelledCargo() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: allCargo, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const cancelledCargo = allCargo?.filter((c) => c.userId === user?.id && c.status === "cancelled") ?? [];
  const sorted = [...cancelledCargo].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const reactivate = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/cargo/${id}/status`, { status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "掲載中に戻しました" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">成約しなかった荷物</h1>
          <p className="text-sm text-muted-foreground mt-1">
            不成約となった荷物情報の一覧
            {sorted.length > 0 && <span className="ml-2">({sorted.length}件)</span>}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">不成約の荷物はありません</p>
              <p className="text-xs text-muted-foreground mt-2">「登録した荷物」ページから荷物を不成約にできます</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map((item) => (
              <CancelledCard
                key={item.id}
                item={item}
                onReactivate={() => reactivate.mutate(item.id)}
                isReactivating={reactivate.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
