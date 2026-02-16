import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin, Clock, ArrowRight, Search } from "lucide-react";
import type { CargoListing } from "@shared/schema";
import { useState, useMemo } from "react";

const AREAS = [
  "全て", "北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州", "沖縄",
  "東京", "大阪", "名古屋", "福岡", "札幌", "仙台", "広島", "神戸"
];

export default function CargoList() {
  const [searchText, setSearchText] = useState("");
  const [areaFilter, setAreaFilter] = useState("全て");

  const { data: listings, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const filtered = useMemo(() => {
    if (!listings) return [];
    return listings.filter((item) => {
      const matchesSearch = !searchText ||
        item.title.includes(searchText) ||
        item.departureArea.includes(searchText) ||
        item.arrivalArea.includes(searchText) ||
        item.cargoType.includes(searchText);
      const matchesArea = areaFilter === "全て" ||
        item.departureArea.includes(areaFilter) ||
        item.arrivalArea.includes(areaFilter);
      return matchesSearch && matchesArea;
    });
  }, [listings, searchText, areaFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-primary rounded-md p-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-cargo-title">荷物情報一覧</h1>
          <p className="text-base text-primary-foreground mt-1 text-shadow">
            {filtered.length}件の荷物情報が見つかりました
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="キーワードで検索..."
                className="pl-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                data-testid="input-search-cargo"
              />
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-area-filter">
                <SelectValue placeholder="エリアで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}

        {!isLoading && filtered.map((listing) => (
          <Card key={listing.id} className="h-full" data-testid={`card-cargo-${listing.id}`}>
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
                <h3 className="font-bold text-foreground text-base line-clamp-1">{listing.title}</h3>
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
                <p className="font-bold text-primary text-lg">{listing.price || "要相談"}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">荷物情報が見つかりませんでした</p>
            <p className="text-sm mt-1">検索条件を変更してお試しください</p>
          </div>
        )}
      </div>
    </div>
  );
}
