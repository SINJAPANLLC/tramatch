import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Search, ArrowRight, Shield, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function StatCard({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function CargoCard({ listing }: { listing: CargoListing }) {
  return (
    <Link href={`/cargo/${listing.id}`}>
      <Card className="hover-elevate cursor-pointer" data-testid={`card-cargo-${listing.id}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{listing.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">{listing.vehicleType}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="truncate">{listing.departureArea} → {listing.arrivalArea}</span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap text-sm">
            <span className="text-muted-foreground">{listing.weight}</span>
            <span className="font-medium text-foreground">{listing.desiredDate}</span>
          </div>
          <div className="text-xs text-muted-foreground">{listing.companyName}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TruckCard({ listing }: { listing: TruckListing }) {
  return (
    <Link href={`/trucks/${listing.id}`}>
      <Card className="hover-elevate cursor-pointer" data-testid={`card-truck-${listing.id}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{listing.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">{listing.vehicleType}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="truncate">{listing.currentArea} → {listing.destinationArea}</span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap text-sm">
            <span className="text-muted-foreground">最大 {listing.maxWeight}</span>
            <span className="font-medium text-foreground">{listing.availableDate}</span>
          </div>
          <div className="text-xs text-muted-foreground">{listing.companyName}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ListingSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-48" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { data: cargoListings, isLoading: cargoLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: truckListings, isLoading: truckLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-teal-600 dark:from-primary dark:via-teal-700 dark:to-teal-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight" data-testid="text-hero-title">
              荷主と運送会社を
              <br />
              最適にマッチング
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
              トラマッチは求荷求車のマッチングプラットフォームです。
              <br className="hidden sm:block" />
              空車情報・荷物情報を簡単に検索・掲載できます。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/cargo">
                <Button size="lg" className="bg-white text-primary font-semibold border-white/20 min-w-[200px]" data-testid="button-hero-cargo">
                  <Search className="w-4 h-4 mr-2" />
                  荷物を探す
                </Button>
              </Link>
              <Link href="/trucks">
                <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm min-w-[200px]" data-testid="button-hero-trucks">
                  <Truck className="w-4 h-4 mr-2" />
                  車両を探す
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <StatCard icon={Package} value={String(cargoListings?.length || 0)} label="荷物情報" />
            <StatCard icon={Truck} value={String(truckListings?.length || 0)} label="車両情報" />
            <StatCard icon={Shield} value="24h" label="サポート" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">簡単検索</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  エリアや日付で荷物・車両情報を素早く検索。最適な案件を見つけられます。
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">リアルタイム</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  最新の荷物・車両情報がリアルタイムで更新。タイムリーなマッチングを実現します。
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">安心・安全</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  掲載企業の情報を明確に表示。安心して取引を進められます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <div>
              <h2 className="text-xl font-bold text-foreground">最新の荷物情報</h2>
              <p className="text-sm text-muted-foreground mt-1">新着の荷物案件をご覧ください</p>
            </div>
            <Link href="/cargo">
              <Button variant="outline" data-testid="link-all-cargo">
                すべて見る
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cargoLoading
              ? Array.from({ length: 3 }).map((_, i) => <ListingSkeleton key={i} />)
              : cargoListings?.slice(0, 6).map((listing) => (
                  <CargoCard key={listing.id} listing={listing} />
                ))}
            {!cargoLoading && (!cargoListings || cargoListings.length === 0) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>荷物情報はまだありません</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <div>
              <h2 className="text-xl font-bold text-foreground">最新の車両情報</h2>
              <p className="text-sm text-muted-foreground mt-1">新着の空車情報をご覧ください</p>
            </div>
            <Link href="/trucks">
              <Button variant="outline" data-testid="link-all-trucks">
                すべて見る
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {truckLoading
              ? Array.from({ length: 3 }).map((_, i) => <ListingSkeleton key={i} />)
              : truckListings?.slice(0, 6).map((listing) => (
                  <TruckCard key={listing.id} listing={listing} />
                ))}
            {!truckLoading && (!truckListings || truckListings.length === 0) && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Truck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>車両情報はまだありません</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">今すぐ荷物・車両情報を掲載しませんか？</h2>
          <p className="mt-4 text-white/80 text-base">
            無料で荷物や空車の情報を掲載して、最適なパートナーを見つけましょう。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/cargo/new">
              <Button size="lg" className="bg-white text-primary font-semibold border-white/20 min-w-[200px]" data-testid="button-cta-cargo">
                <Package className="w-4 h-4 mr-2" />
                荷物を掲載する
              </Button>
            </Link>
            <Link href="/trucks/new">
              <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm min-w-[200px]" data-testid="button-cta-truck">
                <Truck className="w-4 h-4 mr-2" />
                車両を掲載する
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
