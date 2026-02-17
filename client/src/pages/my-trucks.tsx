import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Trash2, Plus, Calendar, Weight, ArrowRight, Clock, CircleDot, Eye, CheckCircle2, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";

function TruckCard({ item, onDelete, isDeleting, onComplete, isCompleting, onCancel, isCancelling }: { item: TruckListing; onDelete: () => void; isDeleting: boolean; onComplete: () => void; isCompleting: boolean; onCancel: () => void; isCancelling: boolean }) {
  const daysAgo = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const timeLabel = daysAgo === 0 ? "今日" : daysAgo === 1 ? "昨日" : `${daysAgo}日前`;

  return (
    <Card className="hover-elevate" data-testid={`card-my-truck-${item.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/trucks/${item.id}`}>
                <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid={`link-truck-title-${item.id}`}>
                  {item.title}
                </span>
              </Link>
              <Badge variant="secondary" className="text-xs" data-testid={`badge-vehicle-${item.id}`}>
                {item.vehicleType}
              </Badge>
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
              <span className="font-medium text-foreground">{item.currentArea}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground mx-1" />
              <span className="font-medium text-foreground">{item.destinationArea}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              {item.availableDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  空車日: {item.availableDate}
                </span>
              )}
              {item.maxWeight && (
                <span className="flex items-center gap-1">
                  <Weight className="w-3 h-3" />
                  {item.maxWeight}
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
            <Link href={`/trucks/${item.id}`}>
              <Button size="sm" variant="outline" data-testid={`button-view-truck-${item.id}`}>
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
                  data-testid={`button-complete-truck-${item.id}`}
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
                  data-testid={`button-cancel-truck-${item.id}`}
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
                data-testid={`button-reactivate-truck-${item.id}`}
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
              data-testid={`button-delete-truck-${item.id}`}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyTrucks() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: allTrucks, isLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const myTrucks = allTrucks?.filter((t) => t.userId === user?.id) ?? [];
  const sortedTrucks = [...myTrucks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const deleteTruck = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trucks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: "車両情報を削除しました" });
    },
  });

  const toggleTruckStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/trucks/${id}/status`, { status });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: variables.status === "completed" ? "成約済みにしました" : variables.status === "cancelled" ? "不成約にしました" : "掲載中に戻しました" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">登録した車両</h1>
            <p className="text-sm text-muted-foreground mt-1">
              自分が登録した車両情報の一覧
              {sortedTrucks.length > 0 && <span className="ml-2">({sortedTrucks.length}件)</span>}
            </p>
          </div>
          <Link href="/trucks/new">
            <Button data-testid="button-add-truck">
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
        ) : sortedTrucks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">登録した車両はありません</p>
              <Link href="/trucks/new">
                <Button className="mt-4" data-testid="button-empty-add-truck">
                  <Plus className="w-4 h-4 mr-1.5" />
                  車両を登録する
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedTrucks.map((item) => (
              <TruckCard
                key={item.id}
                item={item}
                onDelete={() => deleteTruck.mutate(item.id)}
                isDeleting={deleteTruck.isPending}
                onComplete={() => toggleTruckStatus.mutate({ id: item.id, status: item.status === "active" ? "completed" : "active" })}
                isCompleting={toggleTruckStatus.isPending}
                onCancel={() => toggleTruckStatus.mutate({ id: item.id, status: item.status === "active" ? "cancelled" : "active" })}
                isCancelling={toggleTruckStatus.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
