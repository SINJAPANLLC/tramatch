import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, Package, MapPin, ArrowRight, Calendar, Weight, Truck, Clock, Eye, CircleDot, Building2, Phone, Mail, DollarSign, FileText, Loader2, Circle, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";

function CancelledCard({ item, onReactivate, isReactivating, isSelected, onSelect }: { item: CargoListing; onReactivate: () => void; isReactivating: boolean; isSelected: boolean; onSelect: () => void }) {
  const createdDate = new Date(item.createdAt);
  const dateStr = `${createdDate.getFullYear()}/${String(createdDate.getMonth() + 1).padStart(2, "0")}/${String(createdDate.getDate()).padStart(2, "0")}`;

  return (
    <Card className={`hover-elevate cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`} data-testid={`card-cancelled-cargo-${item.id}`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid={`link-cancelled-title-${item.id}`}>
                {item.title}
              </span>
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
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onReactivate(); }}
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

function PanelSectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="text-primary">{icon}</span>
      {title}
    </h3>
  );
}

function PanelInfoItem({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-sm font-medium ${highlight ? "text-primary" : "text-foreground"}`}>{value || "-"}</div>
    </div>
  );
}

function CargoDetailPanel({ listing, onClose }: { listing: CargoListing | null; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!listing) {
    return (
      <div className="w-[420px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[420px] shrink-0 border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-cargo-detail">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between gap-2 z-10">
        <h2 className="text-sm font-bold text-foreground truncate">{listing.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">
            掲載日: {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("ja-JP") : "---"}
          </p>
          <div className="flex items-center gap-1.5">
            {listing.transportType && (
              <Badge variant="outline" className="text-xs">{listing.transportType}</Badge>
            )}
            <Badge variant="default">不成約</Badge>
          </div>
        </div>

        <div className="border-t border-border" />

        <PanelSectionHeader icon={<MapPin className="w-4 h-4" />} title="発着情報" />
        <div className="ml-1">
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />
            <div className="relative mb-5">
              <Circle className="absolute -left-[17px] top-1 w-3 h-3 fill-primary text-primary" />
              <div className="text-xs text-muted-foreground font-medium mb-0.5">発地</div>
              <div className="text-base font-semibold text-foreground">{listing.departureArea}</div>
              {listing.departureAddress && (
                <div className="text-sm text-muted-foreground">{listing.departureAddress}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {listing.desiredDate} {listing.departureTime && listing.departureTime !== "指定なし" ? listing.departureTime : ""}
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute -left-[19px] top-1 w-3.5 h-3.5 text-destructive" />
              <div className="text-xs text-muted-foreground font-medium mb-0.5">着地</div>
              <div className="text-base font-semibold text-foreground">{listing.arrivalArea}</div>
              {listing.arrivalAddress && (
                <div className="text-sm text-muted-foreground">{listing.arrivalAddress}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {listing.arrivalDate || "指定なし"} {listing.arrivalTime && listing.arrivalTime !== "指定なし" ? listing.arrivalTime : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        <PanelSectionHeader icon={<Package className="w-4 h-4" />} title="荷物情報" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <PanelInfoItem label="荷種" value={listing.cargoType} />
          <PanelInfoItem label="重量" value={listing.weight} />
          <PanelInfoItem label="個数" value={listing.packageCount} />
          <PanelInfoItem label="荷姿" value={listing.loadingMethod} />
          <PanelInfoItem label="温度管理" value={listing.temperatureControl} highlight={listing.temperatureControl !== "指定なし" && listing.temperatureControl !== "常温"} />
        </div>

        <div className="border-t border-border" />

        <PanelSectionHeader icon={<Truck className="w-4 h-4" />} title="車両・作業条件" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <PanelInfoItem label="希望車種" value={listing.vehicleType} />
          <PanelInfoItem label="車体タイプ" value={listing.bodyType} />
          <PanelInfoItem label="ドライバー作業" value={listing.driverWork} />
          <PanelInfoItem label="積合" value={listing.consolidation} />
        </div>

        <div className="border-t border-border" />

        <PanelSectionHeader icon={<DollarSign className="w-4 h-4" />} title="運賃" />
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-primary/5 border border-primary/10">
            <div className="text-xs text-muted-foreground mb-1">希望運賃</div>
            <div className="text-lg font-bold text-primary">{listing.price ? `¥${formatPrice(listing.price)}` : "要相談"}</div>
          </div>
          <div className="p-3 rounded-md bg-muted/40">
            <div className="text-xs text-muted-foreground mb-1">高速代</div>
            <div className="text-sm font-medium text-foreground">{listing.highwayFee || "-"}</div>
          </div>
        </div>

        {listing.description && (
          <>
            <div className="border-t border-border" />
            <PanelSectionHeader icon={<FileText className="w-4 h-4" />} title="備考" />
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap p-3 rounded-md bg-muted/30">{listing.description}</p>
          </>
        )}

        <div className="border-t border-border" />

        <PanelSectionHeader icon={<Building2 className="w-4 h-4" />} title="連絡先情報" />
        <div className="space-y-2.5 pl-1">
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground">{listing.companyName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">{listing.contactPhone}</span>
          </div>
          {listing.contactEmail && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground">{listing.contactEmail}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CancelledCargo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);

  const { data: allCargo, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const cancelledCargo = allCargo?.filter((c) => c.userId === user?.id && c.status === "cancelled") ?? [];
  const sorted = [...cancelledCargo].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedCargo = useMemo(() => {
    if (!selectedCargoId || !allCargo) return null;
    return allCargo.find((l) => l.id === selectedCargoId) || null;
  }, [selectedCargoId, allCargo]);

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
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto">
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
                    isSelected={selectedCargoId === item.id}
                    onSelect={() => setSelectedCargoId(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {selectedCargoId && selectedCargo && (
          <CargoDetailPanel listing={selectedCargo} onClose={() => setSelectedCargoId(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
