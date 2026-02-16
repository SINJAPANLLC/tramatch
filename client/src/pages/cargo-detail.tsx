import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, Building2, Phone, Mail, Package, Clock, Truck, Thermometer, Weight } from "lucide-react";
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
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-cargo-detail-title">{listing.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                掲載日: {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("ja-JP") : "---"}
              </p>
            </div>
            <Badge variant="default" className="shrink-0">{listing.status === "active" ? "募集中" : "終了"}</Badge>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                発着情報
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">発地</div>
                  <div className="font-medium text-foreground">{listing.departureArea}</div>
                  {listing.departureAddress && (
                    <div className="text-sm text-muted-foreground">{listing.departureAddress}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1.5">
                    {listing.desiredDate} {listing.departureTime && listing.departureTime !== "指定なし" ? listing.departureTime : ""}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">着地</div>
                  <div className="font-medium text-foreground">{listing.arrivalArea}</div>
                  {listing.arrivalAddress && (
                    <div className="text-sm text-muted-foreground">{listing.arrivalAddress}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1.5">
                    {listing.arrivalDate || "指定なし"} {listing.arrivalTime && listing.arrivalTime !== "指定なし" ? listing.arrivalTime : ""}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" />
                荷物情報
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoCell label="荷種" value={listing.cargoType} />
                <InfoCell label="重量" value={listing.weight} />
                <InfoCell label="個数" value={listing.packageCount} />
                <InfoCell label="荷姿" value={listing.loadingMethod} />
                <InfoCell label="温度管理" value={listing.temperatureControl} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                車両・作業条件
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoCell label="希望車種" value={listing.vehicleType} />
                <InfoCell label="車体タイプ" value={listing.bodyType} />
                <InfoCell label="ドライバー作業" value={listing.driverWork} />
                <InfoCell label="積合" value={listing.consolidation} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">運賃</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-primary/5 border border-primary/10">
                  <div className="text-xs text-muted-foreground mb-1">希望運賃</div>
                  <div className="text-lg font-bold text-primary">{listing.price ? `${listing.price}円` : "要相談"}</div>
                </div>
                <InfoCell label="高速代" value={listing.highwayFee} />
              </div>
            </div>

            {listing.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">備考</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap p-3 rounded-md bg-muted/50">{listing.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">連絡先情報</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{listing.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{listing.contactPhone}</span>
                </div>
                {listing.contactEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{listing.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="p-3 rounded-md bg-muted/50">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium text-foreground">{value || "-"}</div>
    </div>
  );
}
