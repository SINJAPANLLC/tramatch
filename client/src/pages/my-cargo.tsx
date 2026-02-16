import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";

export default function MyCargo() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: allCargo, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const myCargo = allCargo?.filter((c) => c.userId === user?.id) ?? [];

  const deleteCargo = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cargo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "荷物情報を削除しました" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">登録した荷物</h1>
            <p className="text-sm text-muted-foreground mt-1">自分が登録した荷物情報の一覧</p>
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
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : myCargo.length === 0 ? (
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
            {myCargo.map((item) => (
              <Card key={item.id} data-testid={`card-my-cargo-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                        <Badge variant="secondary" className="text-xs shrink-0">{item.vehicleType}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                        <span>{item.departureArea} → {item.arrivalArea}</span>
                        <span className="ml-2 text-xs">{item.desiredDate}</span>
                      </div>
                      {item.price && <p className="text-xs font-medium text-foreground mt-1">{item.price}</p>}
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
      </div>
    </DashboardLayout>
  );
}
