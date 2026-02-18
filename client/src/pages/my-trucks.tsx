import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Trash2, Plus, ArrowRight, Clock, Eye, Loader2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { useState, useMemo } from "react";

const PER_PAGE = 10;

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-0.5" data-testid="pagination-trucks">
      <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} data-testid="button-prev-page-trucks">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-2 text-muted-foreground text-xs">...</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="icon"
            onClick={() => onPageChange(p as number)}
            data-testid={`button-page-trucks-${p}`}
          >
            <span className="text-xs">{p}</span>
          </Button>
        )
      )}
      <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} data-testid="button-next-page-trucks">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function MyTrucks() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);

  const { data: trucks, isLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/my-trucks"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trucks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-trucks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: "空車情報を削除しました" });
    },
    onError: () => {
      toast({ title: "削除に失敗しました", variant: "destructive" });
    },
  });

  const sorted = useMemo(() => {
    if (!trucks) return [];
    return [...trucks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [trucks]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4" data-testid="page-my-trucks">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-lg font-bold" data-testid="text-my-trucks-title">登録した空車</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="text-my-trucks-count">
              {trucks ? `${trucks.length}件` : "..."}
            </Badge>
            <Link href="/trucks/new">
              <Button size="sm" data-testid="button-new-truck">
                <Plus className="w-4 h-4 mr-1" />
                新規登録
              </Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-md" />)}
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm mb-3">登録した空車情報はありません</p>
              <Link href="/trucks/new">
                <Button size="sm" data-testid="button-new-truck-empty">
                  <Plus className="w-4 h-4 mr-1" />
                  空車を登録する
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!isLoading && paginated.length > 0 && (
          <div className="space-y-3">
            {paginated.map((truck) => {
              const isExpired = new Date(truck.availableDate) < new Date(new Date().toDateString());
              return (
                <Card key={truck.id} className={isExpired ? "opacity-60" : ""} data-testid={`card-truck-${truck.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/trucks/${truck.id}`}>
                            <span className="font-bold text-sm hover:underline cursor-pointer" data-testid={`link-truck-title-${truck.id}`}>
                              {truck.title}
                            </span>
                          </Link>
                          {isExpired ? (
                            <Badge variant="outline" className="text-[10px]">期限切れ</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">掲載中</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {truck.currentArea}
                            <ArrowRight className="w-3 h-3" />
                            {truck.destinationArea}
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {truck.vehicleType}
                          </span>
                          {truck.bodyType && (
                            <span>{truck.bodyType}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            空車日: {truck.availableDate}
                          </span>
                        </div>

                        <div className="text-[10px] text-muted-foreground">
                          登録日: {formatDate(truck.createdAt.toString())}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/trucks/edit/${truck.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-truck-${truck.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("この空車情報を削除しますか？")) {
                              deleteMutation.mutate(truck.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-truck-${truck.id}`}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
