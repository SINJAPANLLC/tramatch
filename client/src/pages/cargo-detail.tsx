import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Building2, Phone, Mail, Package, Truck, Circle, ArrowDown, DollarSign, FileText } from "lucide-react";
import type { CargoListing } from "@shared/schema";

export default function CargoDetail() {
  const [, params] = useRoute("/cargo/:id");
  const id = params?.id;

  const { data: listing, isLoading, error } = useQuery<CargoListing>({
    queryKey: ["/api/cargo", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">荷物情報が見つかりません</h2>
        <p className="text-sm text-muted-foreground mb-6">指定された荷物情報は存在しないか、削除されました。</p>
        <Link href="/cargo">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            荷物一覧に戻る
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/cargo">
        <Button variant="ghost" className="mb-4" data-testid="button-back-cargo">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          荷物一覧に戻る
        </Button>
      </Link>

      <Card data-testid="card-cargo-detail">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground" data-testid="text-cargo-detail-title">{listing.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                掲載日: {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("ja-JP") : "---"}
              </p>
            </div>
            <Badge variant="default" className="shrink-0">{listing.status === "active" ? "募集中" : "終了"}</Badge>
          </div>

          <div className="space-y-6">
            <SectionHeader icon={<MapPin className="w-4 h-4" />} title="発着情報" />

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

            <SectionHeader icon={<Package className="w-4 h-4" />} title="荷物情報" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <InfoItem label="荷種" value={listing.cargoType} />
              <InfoItem label="重量" value={listing.weight} />
              <InfoItem label="個数" value={listing.packageCount} />
              <InfoItem label="荷姿" value={listing.loadingMethod} />
              <InfoItem label="温度管理" value={listing.temperatureControl} highlight={listing.temperatureControl !== "指定なし" && listing.temperatureControl !== "常温"} />
            </div>

            <div className="border-t border-border" />

            <SectionHeader icon={<Truck className="w-4 h-4" />} title="車両・作業条件" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <InfoItem label="希望車種" value={listing.vehicleType} />
              <InfoItem label="車体タイプ" value={listing.bodyType} />
              <InfoItem label="ドライバー作業" value={listing.driverWork} />
              <InfoItem label="積合" value={listing.consolidation} />
            </div>

            <div className="border-t border-border" />

            <SectionHeader icon={<DollarSign className="w-4 h-4" />} title="運賃" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md bg-primary/5 border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">希望運賃</div>
                <div className="text-xl font-bold text-primary">{listing.price ? `¥${listing.price}` : "要相談"}</div>
              </div>
              <div className="p-4 rounded-md bg-muted/40">
                <div className="text-xs text-muted-foreground mb-1">高速代</div>
                <div className="text-sm font-medium text-foreground">{listing.highwayFee || "-"}</div>
              </div>
            </div>

            {listing.description && (
              <>
                <div className="border-t border-border" />
                <SectionHeader icon={<FileText className="w-4 h-4" />} title="備考" />
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap p-4 rounded-md bg-muted/30">{listing.description}</p>
              </>
            )}

            <div className="border-t border-border" />

            <SectionHeader icon={<Building2 className="w-4 h-4" />} title="連絡先情報" />
            <div className="space-y-3 pl-1">
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
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="text-primary">{icon}</span>
      {title}
    </h3>
  );
}

function InfoItem({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-sm font-medium ${highlight ? "text-primary" : "text-foreground"}`}>{value || "-"}</div>
    </div>
  );
}
