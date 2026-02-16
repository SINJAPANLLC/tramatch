import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, MapPin, Calendar, Weight, Plus, Search } from "lucide-react";
import type { TruckListing } from "@shared/schema";
import { useState, useMemo } from "react";

const AREAS = [
  "全て", "北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州", "沖縄",
  "東京", "大阪", "名古屋", "福岡", "札幌", "仙台", "広島", "神戸"
];

export default function TruckList() {
  const [searchText, setSearchText] = useState("");
  const [areaFilter, setAreaFilter] = useState("全て");

  const { data: listings, isLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const filtered = useMemo(() => {
    if (!listings) return [];
    return listings.filter((item) => {
      const matchesSearch = !searchText ||
        item.title.includes(searchText) ||
        item.currentArea.includes(searchText) ||
        item.destinationArea.includes(searchText) ||
        item.vehicleType.includes(searchText);
      const matchesArea = areaFilter === "全て" ||
        item.currentArea.includes(areaFilter) ||
        item.destinationArea.includes(areaFilter);
      return matchesSearch && matchesArea;
    });
  }, [listings, searchText, areaFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-primary rounded-md p-6 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-truck-title">車両情報一覧</h1>
            <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">
              {filtered.length}件の車両情報が見つかりました
            </p>
          </div>
          <Link href="/trucks/new">
            <Button variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm" data-testid="button-new-truck">
              <Plus className="w-4 h-4 mr-1.5" />
              車両を掲載
            </Button>
          </Link>
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
                data-testid="input-search-truck"
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
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}

        {!isLoading && filtered.map((listing) => (
          <Link key={listing.id} href={`/trucks/${listing.id}`}>
            <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-truck-${listing.id}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2">{listing.title}</h3>
                  <Badge variant="secondary" className="shrink-0 text-xs">{listing.vehicleType}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>{listing.currentArea} → {listing.destinationArea}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Weight className="w-3.5 h-3.5 shrink-0" />
                  <span>最大 {listing.maxWeight}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{listing.availableDate}</span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">{listing.companyName}</span>
                  {listing.price && (
                    <span className="text-sm font-semibold text-primary">{listing.price}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">車両情報が見つかりませんでした</p>
            <p className="text-sm mt-1">検索条件を変更してお試しください</p>
          </div>
        )}
      </div>
    </div>
  );
}
