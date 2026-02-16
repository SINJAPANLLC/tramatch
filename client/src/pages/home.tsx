import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Search, ArrowRight, Shield, Handshake, Clock, MapPin, Users, FileText, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import logoImage from "@assets/tra_match_logo_white.jpg";

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  useEffect(() => {
    if (hasAnimated.current) {
      setCount(target);
    }
  }, [target]);

  return { count, ref };
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
            <span className="text-muted-foreground">{listing.maxWeight}</span>
            <span className="font-medium text-foreground">{listing.availableDate}</span>
          </div>
          <div className="text-xs text-muted-foreground">{listing.companyName}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatsCounters({ cargoCount, truckCount }: { cargoCount: number; truckCount: number }) {
  const cargo = useCountUp(cargoCount);
  const truck = useCountUp(truckCount);
  const support = useCountUp(24);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8" ref={cargo.ref}>
      <div className="bg-primary-foreground/15 rounded-md p-6 sm:p-8 text-center text-shadow">
        <p className="text-base text-primary-foreground mb-2">荷物情報数</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-primary-foreground text-shadow-lg">{cargo.count}</span>
          <span className="text-lg font-medium text-primary-foreground">件</span>
        </div>
      </div>
      <div className="bg-primary-foreground/15 rounded-md p-6 sm:p-8 text-center text-shadow" ref={truck.ref}>
        <p className="text-base text-primary-foreground mb-2">空きトラック情報数</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-primary-foreground text-shadow-lg">{truck.count}</span>
          <span className="text-lg font-medium text-primary-foreground">件</span>
        </div>
      </div>
      <div className="bg-primary-foreground/15 rounded-md p-6 sm:p-8 text-center text-shadow" ref={support.ref}>
        <p className="text-base text-primary-foreground mb-2">サポート対応</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-primary-foreground text-shadow-lg">{support.count}</span>
          <span className="text-lg font-medium text-primary-foreground">時間</span>
        </div>
      </div>
    </div>
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

  const cargoCount = cargoListings?.length || 0;
  const truckCount = truckListings?.length || 0;

  return (
    <div className="min-h-screen">
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-6 sm:gap-12 py-3 text-primary-foreground text-shadow">
            <span className="text-sm sm:text-base font-medium tracking-wide">リアルタイム情報</span>
            <Link href="/cargo" className="flex items-center gap-2 group">
              <Package className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{cargoCount}件</span>
              <span className="text-sm hidden sm:inline">の荷物情報</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/trucks" className="flex items-center gap-2 group">
              <Truck className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{truckCount}件</span>
              <span className="text-sm hidden sm:inline">の空きトラック</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground leading-tight text-shadow-lg" data-testid="text-hero-title">
              AI求荷求車サービス
            </h1>
            <div className="mt-6 flex justify-center">
              <img src={logoImage} alt="TRA MATCH" className="h-12 sm:h-16 w-auto" />
            </div>
            <p className="mt-6 text-xl sm:text-2xl text-primary-foreground font-bold leading-relaxed text-shadow" data-testid="text-hero-subtitle">
              AIで荷物や空きトラックを簡単登録　簡単検索
            </p>
            <p className="mt-3 text-base sm:text-lg text-primary-foreground leading-relaxed max-w-xl mx-auto text-shadow">
              空車情報・荷物情報をリアルタイムでAI登録・AI検索できます。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/cargo">
                <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm min-w-[220px] text-base" data-testid="button-hero-cargo">
                  荷物を見てみる
                </Button>
              </Link>
              <Link href="/trucks">
                <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm min-w-[220px] text-base" data-testid="button-hero-trucks">
                  空きトラックを見てみる
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-12 text-shadow-lg" data-testid="text-reason-title">
            TRA MATCHが選ばれる理由
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="text-center text-shadow">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-5">
                <Search className="w-9 h-9 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary-foreground mb-2">案件がAIで簡単に見つかる</h3>
              <p className="text-base text-primary-foreground leading-relaxed">
                豊富な荷物・車両情報の中から<br />ほしい案件を簡単に見つけ出せます
              </p>
            </div>
            <div className="text-center text-shadow">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-5">
                <Handshake className="w-9 h-9 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary-foreground mb-2">成約が早い</h3>
              <p className="text-base text-primary-foreground leading-relaxed">
                会員同士の直接交渉やAI掲載で<br />スピーディーな成約を実現します
              </p>
            </div>
            <div className="text-center text-shadow">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-5">
                <Shield className="w-9 h-9 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary-foreground mb-2">安心な取引</h3>
              <p className="text-base text-primary-foreground leading-relaxed">
                充実したサポートで<br />安心して取引できます
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-4 text-shadow-lg" data-testid="text-stats-title">
            圧倒的な情報量
          </h2>
          <p className="text-base text-primary-foreground text-center mb-12 text-shadow">リアルタイムで更新される情報をご活用ください</p>
          <StatsCounters cargoCount={cargoCount} truckCount={truckCount} />
        </div>
      </section>

      <section className="py-4 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-4">
            <p className="text-primary-foreground font-bold text-lg sm:text-xl text-shadow">TRA MATCHを使って業務をラクにしませんか？</p>
            <div className="flex items-center gap-3">
              <Link href="/register">
                <Button variant="outline" className="bg-primary-foreground text-primary font-bold border-primary-foreground" data-testid="button-mid-cta-register">
                  無料会員登録
                </Button>
              </Link>
              <Link href="/cargo">
                <Button variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm" data-testid="button-mid-cta-search">
                  荷物を見てみる
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-4 text-shadow-lg">サービス内容</h2>
          <p className="text-base text-primary-foreground text-center mb-12 text-shadow">運送会社同士のマッチングサービス</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary-foreground/15 rounded-md p-6 flex items-start gap-4 text-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground mb-1">荷物情報の掲載・検索</h3>
                <p className="text-base text-primary-foreground leading-relaxed">
                  運びたい荷物の情報を掲載し、空きトラックを持つ運送会社とマッチング。エリア・日付・車種で簡単検索。
                </p>
                <Link href="/cargo" className="inline-flex items-center gap-1 mt-3 text-sm text-primary-foreground font-medium">
                  荷物一覧を見る <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="bg-primary-foreground/15 rounded-md p-6 flex items-start gap-4 text-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground mb-1">空車情報の掲載・検索</h3>
                <p className="text-base text-primary-foreground leading-relaxed">
                  空きトラックの情報を掲載し、荷物を探している荷主とマッチング。効率的に帰り荷を見つけられます。
                </p>
                <Link href="/trucks" className="inline-flex items-center gap-1 mt-3 text-sm text-primary-foreground font-medium">
                  車両一覧を見る <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="bg-primary-foreground/15 rounded-md p-6 flex items-start gap-4 text-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground mb-1">会員同士の直接マッチング</h3>
                <p className="text-base text-primary-foreground leading-relaxed">
                  中間マージンなし。運送会社同士で直接やり取りができるため、コストを抑えた取引が可能です。
                </p>
              </div>
            </div>
            <div className="bg-primary-foreground/15 rounded-md p-6 flex items-start gap-4 text-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground mb-1">リアルタイム更新</h3>
                <p className="text-base text-primary-foreground leading-relaxed">
                  最新の荷物・車両情報がリアルタイムで更新。タイムリーなマッチングを実現します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground text-shadow-lg">最新の荷物情報</h2>
              <p className="text-base text-primary-foreground mt-1 text-shadow">新着の荷物案件をご覧ください</p>
            </div>
            <Link href="/cargo">
              <Button variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10" data-testid="link-all-cargo">
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
              <div className="col-span-full text-center py-12 text-primary-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>荷物情報はまだありません</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground text-shadow-lg">最新の車両情報</h2>
              <p className="text-base text-primary-foreground mt-1 text-shadow">新着の空車情報をご覧ください</p>
            </div>
            <Link href="/trucks">
              <Button variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10" data-testid="link-all-trucks">
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
              <div className="col-span-full text-center py-12 text-primary-foreground">
                <Truck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>車両情報はまだありません</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg">TRA MATCHを使って<br className="sm:hidden" />業務をラクにしませんか？</h2>
          <p className="mt-4 text-primary-foreground text-lg text-shadow">
            無料で会員登録して、荷物や空車の情報を掲載・検索できます。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-primary-foreground text-primary font-bold border-primary-foreground min-w-[220px]" data-testid="button-cta-register">
                無料会員登録
              </Button>
            </Link>
            <Link href="/cargo">
              <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm min-w-[220px]" data-testid="button-cta-search">
                <Search className="w-4 h-4 mr-2" />
                荷物を見てみる（無料）
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
