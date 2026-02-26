import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Search, ArrowRight, Shield, Handshake, Clock, MapPin, Users, FileText, ChevronRight, Building2, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing, Announcement, SeoArticle, YoutubeVideo } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import logoImage from "@assets/tra_match_logo_white.jpg";
import { formatPrice, hasNumericPrice } from "@/lib/utils";

const LOGO_WALL_IMAGES_ROW1 = [
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/47db33b0-d7f4-013e-9799-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(1).jpeg",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/517bff70-d7f4-013e-979c-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(1).png",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/5938c4f0-d7f4-013e-979f-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(2).jpeg",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/60df44a0-d7f4-013e-97a0-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(2).png",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/66db27b0-d7f4-013e-97a2-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(3).jpeg",
];

const LOGO_WALL_IMAGES_ROW2 = [
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/6d8d1910-d7f4-013e-97a3-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(3).png",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/728486c0-d7f4-013e-97a6-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(4).png",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/7cf28db0-d7f4-013e-97a8-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99%20(5).png",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/883e8b30-d7f4-013e-97a9-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99.jpeg",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/916e7710-d7f4-013e-97ab-0a58a9feac02/%E3%82%BF%E3%82%99%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%88%E3%82%99.png",
];

const LOGO_WALL_IMAGES_BOTTOM = [
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/1c9b1920-d996-013e-3faf-0a58a9feac02/70617d441cf711e88062963aecd2c947.jpg",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/095c3f70-d994-013e-82c3-0a58a9feac02/m_logo.png",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/0f974c20-d994-013e-82c4-0a58a9feac02/nikko-logo.jpg",
  "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/1412ad40-d994-013e-82c6-0a58a9feac02/tmp-75613e906c3e5ab6ea00c4f39150e44f-cff486a9ddccba3a97b5c4297fb3c057.jpg",
];


function CargoCard({ listing }: { listing: CargoListing }) {
  return (
    <Link href={`/cargo/${listing.id}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-cargo-${listing.id}`}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <h3 className="font-bold text-foreground text-base line-clamp-1">{listing.title || `${listing.departureArea}→${listing.arrivalArea} ${listing.cargoType || ''} ${listing.vehicleType || ''}`.trim()}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">{listing.vehicleType}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <MapPin className="w-4 h-4 shrink-0 text-primary" />
            <span className="font-semibold text-foreground">{listing.departureArea}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{listing.arrivalArea}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <Clock className="w-4 h-4 shrink-0 text-primary" />
            <span className="text-foreground">積込日 {listing.desiredDate}</span>
            {listing.arrivalDate && (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground">着荷日 {listing.arrivalDate}</span>
              </>
            )}
          </div>
          <div className="text-sm mb-2">
            <span className="text-muted-foreground">荷物種類：</span>
            <span className="font-semibold text-foreground">{listing.cargoType}</span>
          </div>
          <div className="mt-auto pt-2">
            <p className="text-xs text-muted-foreground">運賃</p>
            <p className="font-bold text-primary text-lg">{hasNumericPrice(listing.price) ? `${formatPrice(listing.price)}円` : "要相談"}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TruckCard({ listing }: { listing: TruckListing }) {
  return (
    <Link href={`/trucks/${listing.id}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-truck-${listing.id}`}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <h3 className="font-bold text-foreground text-base line-clamp-1">{listing.title || `${listing.currentArea}→${listing.destinationArea || ''} ${listing.vehicleType || ''}`.trim()}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">{listing.vehicleType}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <MapPin className="w-4 h-4 shrink-0 text-primary" />
            <span className="font-semibold text-foreground">{listing.currentArea}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{listing.destinationArea}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <Clock className="w-4 h-4 shrink-0 text-primary" />
            <span className="text-foreground">空車日 {listing.availableDate}</span>
          </div>
          <div className="text-sm mb-2">
            <span className="text-muted-foreground">車種：</span>
            <span className="font-semibold text-foreground">{listing.vehicleType}</span>
          </div>
          <div className="mt-auto pt-2">
            <p className="text-xs text-muted-foreground">運賃</p>
            <p className="font-bold text-primary text-lg">{hasNumericPrice(listing.price) ? `${formatPrice(listing.price)}円` : "要相談"}</p>
          </div>
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

const CATEGORY_BADGE: Record<string, { label: string; variant: "default" | "secondary" }> = {
  important: { label: "重要", variant: "default" },
  update: { label: "更新", variant: "secondary" },
  maintenance: { label: "メンテナンス", variant: "secondary" },
  campaign: { label: "キャンペーン", variant: "secondary" },
  general: { label: "お知らせ", variant: "secondary" },
};

function AnnouncementsSection() {
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const formatDate = (dateVal: string | Date) => {
    const d = new Date(dateVal);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  };

  const isNew = (dateVal: string | Date) => {
    const d = new Date(dateVal);
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  return (
    <section className="py-16 sm:py-20 bg-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-primary-foreground text-shadow-lg mb-8">お知らせ</h2>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : announcements && announcements.length > 0 ? (
              announcements.map((item) => {
                const badge = CATEGORY_BADGE[item.category] || CATEGORY_BADGE.general;
                const newItem = isNew(item.createdAt);
                return (
                  <div key={item.id} className="flex items-start gap-4 p-4" data-testid={`announcement-lp-${item.id}`}>
                    <Badge variant={newItem ? "default" : badge.variant} className="shrink-0 mt-0.5">
                      {newItem ? "新着" : badge.label}
                    </Badge>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{formatDate(item.createdAt)}</p>
                      <p className="text-base font-semibold text-foreground">{item.title}</p>
                      {item.content && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">現在お知らせはありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ColumnsPreviewSection() {
  const { data: columns, isLoading } = useQuery<SeoArticle[]>({
    queryKey: ["/api/columns"],
  });

  if (isLoading) return null;
  if (!columns || columns.length === 0) return null;

  const latestColumns = columns.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 bg-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-columns-heading">コラム記事</h2>
            <p className="text-base text-primary-foreground mt-1 text-shadow">物流・運送業界のお役立ち情報</p>
          </div>
          <Link href="/columns">
            <Button variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10" data-testid="link-all-columns">
              すべて見る
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestColumns.map((col) => (
            <Link key={col.id} href={`/columns/${col.slug}`}>
              <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-lp-column-${col.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {col.keywords?.split(",").slice(0, 2).map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2">{col.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(col.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function YouTubePreviewSection() {
  const { data: videos, isLoading } = useQuery<YoutubeVideo[]>({
    queryKey: ["/api/youtube-videos"],
  });
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  if (isLoading) return null;
  if (!videos || videos.length === 0) return null;

  const displayVideos = videos.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 bg-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-youtube-heading">動画コンテンツ</h2>
            <p className="text-base text-primary-foreground mt-1 text-shadow">物流・求荷求車に関するお役立ち動画</p>
          </div>
          <a href="https://www.youtube.com/channel/UCWXDTsh_-YDUGrT24LIjrUg" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10" data-testid="link-all-videos">
              すべて見る
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayVideos.map((video) => (
            <Card
              key={video.id}
              className="h-full hover-elevate cursor-pointer overflow-hidden"
              data-testid={`card-youtube-${video.id}`}
              onClick={() => setActiveVideoId(video.videoId)}
            >
              <div className="relative aspect-video bg-muted">
                {activeVideoId === video.videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={video.title}
                  />
                ) : (
                  <>
                    <img
                      src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2">{video.title}</h3>
                {video.publishedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(video.publishedAt).toLocaleDateString("ja-JP")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: cargoListings } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: truckListings } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  return (
    <div className="min-h-screen">
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
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm min-w-[220px] text-base" data-testid="button-hero-cargo">
                  荷物を見てみる
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm min-w-[220px] text-base" data-testid="button-hero-trucks">
                  空きトラックを見てみる
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-50 py-8 sm:py-12">
        <style dangerouslySetInnerHTML={{ __html: `
          .logo-wall{width:100%;overflow:hidden;}
          .logo-slider{height:100px;overflow:hidden;position:relative;width:100%;}
          .slide-track{display:flex;gap:0;will-change:transform;width:max-content;}
          .track-1{animation:logoScroll1 30s linear infinite;}
          .track-2{animation:logoScroll2 38s linear infinite;}
          .logo-slide{width:180px;height:100px;display:flex;align-items:center;justify-content:center;flex:0 0 180px;padding:0 10px;box-sizing:border-box;}
          .logo-slide img{max-width:140px;max-height:70px;object-fit:contain;display:block;}
          @keyframes logoScroll1{0%{transform:translateX(0);}100%{transform:translateX(calc(-180px * ${LOGO_WALL_IMAGES_ROW1.length}));}}
          @keyframes logoScroll2{0%{transform:translateX(0);}100%{transform:translateX(calc(-180px * ${LOGO_WALL_IMAGES_ROW2.length}));}}
          @media(max-width:768px){
            .logo-slide{width:150px;flex:0 0 150px;}
            .logo-slide img{max-width:120px;max-height:60px;}
            @keyframes logoScroll1{0%{transform:translateX(0);}100%{transform:translateX(calc(-150px * ${LOGO_WALL_IMAGES_ROW1.length}));}}
            @keyframes logoScroll2{0%{transform:translateX(0);}100%{transform:translateX(calc(-150px * ${LOGO_WALL_IMAGES_ROW2.length}));}}
          }
        `}} />
        <div className="logo-wall" data-testid="section-logo-wall">
          <div className="logo-slider">
            <div className="slide-track track-1">
              {[...Array(3)].map((_, loop) =>
                LOGO_WALL_IMAGES_ROW1.map((src, i) => (
                  <div className="logo-slide" key={`row1-${loop}-${i}`}><img src={src} alt="" loading="eager" /></div>
                ))
              )}
            </div>
          </div>
          <div className="logo-slider">
            <div className="slide-track track-2">
              {[...Array(3)].map((_, loop) =>
                LOGO_WALL_IMAGES_ROW2.map((src, i) => (
                  <div className="logo-slide" key={`row2-${loop}-${i}`}><img src={src} alt="" loading="eager" /></div>
                ))
              )}
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
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-center mb-4 text-shadow-lg">料金比較</h2>
          <p className="text-base text-primary-foreground text-center mb-12 text-shadow">他社と比べてください</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-foreground/15 rounded-md p-6 sm:p-8 text-center text-shadow">
              <p className="text-lg font-bold text-primary-foreground mb-1">A社</p>
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-base text-primary-foreground mb-1">初期費用</p>
                  <p className="text-2xl font-bold text-primary-foreground">20,000円</p>
                </div>
                <div>
                  <p className="text-base text-primary-foreground mb-1">成約手数料</p>
                  <p className="text-2xl font-bold text-primary-foreground">3%</p>
                </div>
                <div>
                  <p className="text-base text-primary-foreground mb-1">月額費用</p>
                  <p className="text-2xl font-bold text-primary-foreground">10,000円</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-foreground rounded-md p-6 sm:p-8 text-center shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-400 text-yellow-900 font-bold text-sm px-4 py-1 no-default-hover-elevate no-default-active-elevate">おすすめ</Badge>
              </div>
              <p className="text-lg font-bold text-primary mb-1">TRA MATCH</p>
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-base text-primary mb-1">初期費用</p>
                  <p className="text-3xl font-bold text-primary">0円</p>
                </div>
                <div>
                  <p className="text-base text-primary mb-1">成約手数料</p>
                  <p className="text-3xl font-bold text-primary">0円</p>
                </div>
                <div>
                  <p className="text-base text-primary mb-1">月額費用</p>
                  <p className="text-3xl font-bold text-primary">5,000円</p>
                  <p className="text-sm font-bold text-primary mt-1 bg-primary/10 rounded-md py-1 px-2 inline-block">β版は月額費用も0円</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-foreground/15 rounded-md p-6 sm:p-8 text-center text-shadow">
              <p className="text-lg font-bold text-primary-foreground mb-1">B社</p>
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-base text-primary-foreground mb-1">初期費用</p>
                  <p className="text-2xl font-bold text-primary-foreground">0円</p>
                </div>
                <div>
                  <p className="text-base text-primary-foreground mb-1">成約手数料</p>
                  <p className="text-2xl font-bold text-primary-foreground">0%</p>
                </div>
                <div>
                  <p className="text-base text-primary-foreground mb-1">月額費用</p>
                  <p className="text-2xl font-bold text-primary-foreground">9,000円</p>
                </div>
              </div>
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
                <h3 className="text-lg font-bold text-primary-foreground mb-1">荷物情報のAI掲載・AI検索</h3>
                <p className="text-base text-primary-foreground leading-relaxed">
                  運びたい荷物の情報を掲載し、空きトラックを持つ運送会社とマッチング。AIに投げるだけで簡単登録　簡単検索
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
                <h3 className="text-lg font-bold text-primary-foreground mb-1">空車情報のAI掲載・AI検索</h3>
                <p className="text-base text-primary-foreground leading-relaxed">
                  空きトラックの情報をAIで簡単掲載し、トラックを探している荷主とマッチング。効率的に荷物を見つけられます。
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

      <section className="py-12 sm:py-16 bg-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg">最新の荷物情報</h2>
          </div>
        </div>
        {cargoListings && cargoListings.length > 0 && (
          <div className="relative">
            <style dangerouslySetInnerHTML={{ __html: `
              .listing-slider{overflow:hidden;width:100%;-webkit-mask-image:linear-gradient(to right,transparent 0%,#000 5%,#000 95%,transparent 100%);mask-image:linear-gradient(to right,transparent 0%,#000 5%,#000 95%,transparent 100%);}
              .listing-track{display:flex;gap:16px;will-change:transform;width:max-content;}
              .listing-track-cargo{animation:listingScrollCargo ${Math.max(Math.min(cargoListings.length, 20) * 7, 30)}s linear infinite;}
              .listing-track-truck{animation:listingScrollTruck ${Math.max(Math.min((truckListings?.length || 0), 20) * 7, 30)}s linear infinite;}
              .listing-card-lp{flex:0 0 280px;width:280px;}
              @keyframes listingScrollCargo{0%{transform:translateX(0);}100%{transform:translateX(calc(-296px * ${Math.min(cargoListings.length, 20)}));}}
              @keyframes listingScrollTruck{0%{transform:translateX(0);}100%{transform:translateX(calc(-296px * ${Math.min((truckListings?.length || 0), 20)}));}}
              @media(max-width:640px){.listing-card-lp{flex:0 0 240px;width:240px;}@keyframes listingScrollCargo{0%{transform:translateX(0);}100%{transform:translateX(calc(-256px * ${Math.min(cargoListings.length, 20)}));}}@keyframes listingScrollTruck{0%{transform:translateX(0);}100%{transform:translateX(calc(-256px * ${Math.min((truckListings?.length || 0), 20)}));}}}}
            `}} />
            <div className="listing-slider">
              <div className="listing-track listing-track-cargo">
                {[...Array(2)].map((_, loop) =>
                  cargoListings.slice(0, 20).map((listing, i) => (
                    <div key={`cargo-lp-${loop}-${i}`} className="listing-card-lp">
                      <div className="bg-white rounded-md p-4 border border-gray-200 shadow-sm flex flex-col" style={{ height: '120px' }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-foreground text-sm line-clamp-1 flex-1 min-w-0">{listing.title || `${listing.departureArea}→${listing.arrivalArea} ${listing.cargoType || ''} ${listing.vehicleType || ''}`.trim()}</h3>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0 font-bold">{listing.vehicleType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                          <MapPin className="w-3 h-3 shrink-0 text-primary" />
                          <span className="truncate">{listing.departureArea} → {listing.arrivalArea}</span>
                        </div>
                        <div className="mt-auto text-sm text-foreground font-bold">
                          {hasNumericPrice(listing.price) ? `${formatPrice(listing.price)}円` : "要相談"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        <div className="text-center mt-6">
          <Link href="/login">
            <Button variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm" data-testid="link-all-cargo">
              ログインして詳細を見る <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-primary overflow-hidden border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg">最新の車両情報</h2>
          </div>
        </div>
        {truckListings && truckListings.length > 0 && (
          <div className="relative">
            <div className="listing-slider">
              <div className="listing-track listing-track-truck">
                {[...Array(2)].map((_, loop) =>
                  truckListings.slice(0, 20).map((listing, i) => (
                    <div key={`truck-lp-${loop}-${i}`} className="listing-card-lp">
                      <div className="bg-white rounded-md p-4 border border-gray-200 shadow-sm flex flex-col" style={{ height: '120px' }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-foreground text-sm line-clamp-1 flex-1 min-w-0">{listing.title || `${listing.currentArea}→${listing.destinationArea || ''} ${listing.vehicleType || ''}`.trim()}</h3>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0 font-bold">{listing.vehicleType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                          <MapPin className="w-3 h-3 shrink-0 text-primary" />
                          <span className="truncate">{listing.currentArea} → {listing.destinationArea}</span>
                        </div>
                        <div className="mt-auto text-sm text-foreground font-bold">
                          {hasNumericPrice(listing.price) ? `${formatPrice(listing.price)}円` : "要相談"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        <div className="text-center mt-6">
          <Link href="/login">
            <Button variant="outline" className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm" data-testid="link-all-trucks">
              ログインして詳細を見る <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      <AnnouncementsSection />

      <ColumnsPreviewSection />

      <YouTubePreviewSection />

      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg">TRA MATCH AIを使って<br className="sm:hidden" />業務をラクにしませんか？</h2>
          <p className="mt-4 text-primary-foreground text-lg text-shadow">
            無料で会員登録して、荷物や空車の情報をAI掲載・AI検索できます。
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-primary-foreground text-primary font-bold border-primary-foreground min-w-[220px]" data-testid="button-cta-register">
                無料会員登録
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-50 py-8 sm:py-12">
        <style dangerouslySetInnerHTML={{ __html: `
          .sin-logo-wall{--slide-w:200px;--slide-h:100px;--speed:22s;width:100%;overflow:hidden;}
          .sin-slider{height:var(--slide-h);overflow:hidden;width:100%;}
          .sin-slide-track{display:flex;width:max-content;animation:sinScroll var(--speed) linear infinite;will-change:transform;}
          .sin-slide{width:var(--slide-w);height:var(--slide-h);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0 16px;box-sizing:border-box;}
          .sin-slide img{max-width:160px;max-height:70px;object-fit:contain;display:block;}
          @keyframes sinScroll{0%{transform:translateX(0);}100%{transform:translateX(calc(-1 * var(--slide-w) * ${LOGO_WALL_IMAGES_BOTTOM.length}));}}
          @media(max-width:768px){.sin-logo-wall{--slide-w:170px;--slide-h:90px;--speed:18s;}}
        `}} />
        <div className="sin-logo-wall" data-testid="section-sin-logo-wall">
          <div className="sin-slider">
            <div className="sin-slide-track">
              {[...Array(3)].map((_, loop) =>
                LOGO_WALL_IMAGES_BOTTOM.map((src, i) => (
                  <div className="sin-slide" key={`sin-${loop}-${i}`}><img src={src} alt="" loading="eager" /></div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <PromoBanner />
    </div>
  );
}

function PromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-3 left-3 z-50 animate-in slide-in-from-bottom-4 duration-500"
      data-testid="promo-banner"
      style={{ width: "220px" }}
    >
      <div className="relative bg-white rounded-md shadow-lg border border-border overflow-visible">
        <button
          onClick={() => setVisible(false)}
          className="absolute -top-2 -right-2 bg-white rounded-full shadow-md border border-border w-6 h-6 flex items-center justify-center z-10"
          data-testid="button-close-promo"
          aria-label="閉じる"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <Link href="/register">
          <div className="cursor-pointer">
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                  β版プレミアムプラン
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-foreground">成約し放題</span>
                <span className="text-3xl font-extrabold text-primary leading-none">¥0</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">今だけ無料でプレミアム機能が使える</p>
            </div>
            <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-bold rounded-b-md">
              新規登録はこちら <ChevronRight className="w-3.5 h-3.5 inline-block" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
