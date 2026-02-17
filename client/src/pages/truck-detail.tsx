import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, Weight, Building2, Phone, Mail, Truck } from "lucide-react";
import type { TruckListing } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

export default function TruckDetail() {
  const [, params] = useRoute("/trucks/:id");
  const id = params?.id;

  const { data: listing, isLoading, error } = useQuery<TruckListing>({
    queryKey: ["/api/trucks", id],
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
        <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">車両情報が見つかりません</h2>
        <p className="text-sm text-muted-foreground mb-6">指定された車両情報は存在しないか、削除されました。</p>
        <Link href="/trucks">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            車両一覧に戻る
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/trucks">
        <Button variant="ghost" className="mb-4" data-testid="button-back-trucks">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          車両一覧に戻る
        </Button>
      </Link>

      <Card data-testid="card-truck-detail">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-truck-detail-title">{listing.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                掲載日: {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("ja-JP") : "---"}
              </p>
            </div>
            <Badge variant="default" className="shrink-0">{listing.status === "active" ? "空車あり" : "終了"}</Badge>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">現在地</div>
                  <div className="font-medium text-foreground">{listing.currentArea}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <MapPin className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">行き先エリア</div>
                  <div className="font-medium text-foreground">{listing.destinationArea}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">車種</div>
                <div className="text-sm font-medium text-foreground">{listing.vehicleType}</div>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">最大積載量</div>
                <div className="text-sm font-medium text-foreground">{listing.maxWeight}</div>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">空車日</div>
                <div className="text-sm font-medium text-foreground">{listing.availableDate}</div>
              </div>
            </div>

            {listing.price && (
              <div className="p-3 rounded-md bg-primary/5 border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">希望運賃</div>
                <div className="text-lg font-bold text-primary">{formatPrice(listing.price)}円</div>
              </div>
            )}

            {listing.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">詳細情報</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
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
