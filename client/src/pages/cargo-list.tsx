import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Sparkles, ChevronLeft, ChevronRight, ArrowUpDown, MapPin, X, Check, ArrowRight, Circle } from "lucide-react";
import type { CargoListing } from "@shared/schema";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import { Link } from "wouter";

const QUICK_FILTERS = [
  { label: "全て", value: "all" },
  { label: "関東地場", value: "関東" },
  { label: "関西地場", value: "関西" },
  { label: "中部地場", value: "中部" },
  { label: "東北地場", value: "東北" },
  { label: "九州地場", value: "九州" },
];

const PER_PAGE_OPTIONS = [10, 20, 50];

function parseAISearch(text: string): string[] {
  const cleaned = text
    .replace(/[、。\n\r\t,./]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];
  return cleaned.split(" ").filter((w) => w.length > 0);
}

export default function CargoList() {
  const { isAuthenticated } = useAuth();
  const [aiSearchText, setAiSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: listings, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const handleSearch = () => {
    setActiveSearch(parseAISearch(aiSearchText));
    setPage(1);
  };

  const handleClear = () => {
    setAiSearchText("");
    setActiveSearch([]);
    setQuickFilter("all");
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const filtered = useMemo(() => {
    if (!listings) return [];
    let result = listings;

    if (activeSearch.length > 0) {
      result = result.filter((item) => {
        const searchable = [
          item.title, item.departureArea, item.departureAddress,
          item.arrivalArea, item.arrivalAddress,
          item.cargoType, item.weight, item.vehicleType,
          item.bodyType, item.temperatureControl,
          item.price, item.companyName, item.description,
          item.desiredDate, item.arrivalDate,
          item.driverWork, item.loadingMethod,
        ].filter(Boolean).join(" ").toLowerCase();
        return activeSearch.some((keyword) => searchable.includes(keyword.toLowerCase()));
      });
    }

    if (quickFilter !== "all") {
      result = result.filter(
        (item) =>
          item.departureArea.includes(quickFilter) ||
          item.arrivalArea.includes(quickFilter)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.desiredDate || "";
        const dateB = b.desiredDate || "";
        return sortDir === "desc" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
      }
      const priceA = parseInt(a.price?.replace(/[^0-9]/g, "") || "0");
      const priceB = parseInt(b.price?.replace(/[^0-9]/g, "") || "0");
      return sortDir === "desc" ? priceB - priceA : priceA - priceB;
    });

    return result;
  }, [listings, activeSearch, quickFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const content = (
    <div className={isAuthenticated ? "px-4 sm:px-6 py-4" : "max-w-7xl mx-auto px-4 sm:px-6 py-8"}>
      <Card className="mb-5">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">AI荷物検索</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">テキストを入力するとAIが自動で条件を解析して検索します</span>
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder={"例: 神奈川から大阪 2/20 13t 平ボディ\n例: 東京発 冷凍 10t 至急"}
              value={aiSearchText}
              onChange={(e) => setAiSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={(e) => {
                setTimeout(() => {
                  const val = (e.target as HTMLTextAreaElement).value;
                  setAiSearchText(val);
                  setActiveSearch(parseAISearch(val));
                  setPage(1);
                }, 0);
              }}
              rows={2}
              className="resize-none text-sm flex-1"
              data-testid="input-ai-search"
            />
            <div className="flex flex-col gap-1.5">
              <Button onClick={handleSearch} className="flex-1" data-testid="button-search">
                <Search className="w-4 h-4 mr-1" />
                検索
              </Button>
              <Button variant="outline" onClick={handleClear} className="flex-1 text-xs" data-testid="button-clear">
                クリア
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {QUICK_FILTERS.map((f) => (
              <Badge
                key={f.value}
                variant={quickFilter === f.value ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => { setQuickFilter(f.value); setPage(1); }}
                data-testid={`filter-${f.value}`}
              >
                {f.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" data-testid="text-result-count">
            検索結果 {filtered.length} 件
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => {
              if (sortBy === "date") {
                setSortDir(sortDir === "desc" ? "asc" : "desc");
              } else {
                setSortBy("date");
                setSortDir("desc");
              }
            }}
            data-testid="button-sort-date"
          >
            <ArrowUpDown className="w-3 h-3" />
            発日時 {sortBy === "date" ? (sortDir === "desc" ? "↓" : "↑") : ""}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={() => {
              if (sortBy === "price") {
                setSortDir(sortDir === "desc" ? "asc" : "desc");
              } else {
                setSortBy("price");
                setSortDir("desc");
              }
            }}
            data-testid="button-sort-price"
          >
            <ArrowUpDown className="w-3 h-3" />
            運賃 {sortBy === "price" ? (sortDir === "desc" ? "↓" : "↑") : ""}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-auto text-xs" data-testid="select-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}件/ページ</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-cargo">
            <thead>
              <tr className="border-b bg-muted/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">企業名</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[280px]">発着情報</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">運賃</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">積合</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">重量</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">車種</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">荷種</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">作業</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">備考</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-10 w-56" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-14" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))}

              {!isLoading && paginated.map((listing, index) => (
                <tr
                  key={listing.id}
                  className={`hover-elevate cursor-pointer transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                  data-testid={`row-cargo-${listing.id}`}
                >
                  <td className="px-4 py-3.5 align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <div className="font-medium text-foreground whitespace-nowrap text-[13px] leading-tight">{listing.companyName}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div className="flex items-center gap-1 mt-0.5 shrink-0">
                            <Circle className="w-2.5 h-2.5 fill-primary text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-[13px] text-foreground">{listing.departureArea}</span>
                              {listing.departureAddress && (
                                <span className="text-xs text-muted-foreground">{listing.departureAddress}</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {listing.desiredDate} {listing.departureTime && listing.departureTime !== "指定なし" ? listing.departureTime : ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 pl-1">
                          <div className="w-px h-3 bg-border ml-[4px]" />
                          <ArrowRight className="w-3 h-3 text-muted-foreground/50 ml-1" />
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="flex items-center gap-1 mt-0.5 shrink-0">
                            <MapPin className="w-3 h-3 text-destructive" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-[13px] text-foreground">{listing.arrivalArea}</span>
                              {listing.arrivalAddress && (
                                <span className="text-xs text-muted-foreground">{listing.arrivalAddress}</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {listing.arrivalDate || ""} {listing.arrivalTime && listing.arrivalTime !== "指定なし" ? listing.arrivalTime : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-right align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <div className="font-bold text-[14px] text-foreground whitespace-nowrap">
                        {listing.price ? `¥${listing.price}` : "要相談"}
                      </div>
                      {listing.highwayFee && (
                        <div className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">
                          高速代: {listing.highwayFee}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-center align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      {listing.consolidation === "可" ? (
                        <Badge variant="outline" className="text-[11px] border-primary/30 text-primary px-1.5">可</Badge>
                      ) : listing.consolidation === "不可" ? (
                        <span className="text-xs text-muted-foreground">不可</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-center align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <span className="whitespace-nowrap text-[13px] font-medium">{listing.weight}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-center align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <div className="text-[13px] whitespace-nowrap font-medium">{listing.vehicleType}</div>
                      {listing.bodyType && (
                        <div className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">{listing.bodyType}</div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <span className="whitespace-nowrap text-[13px]">{listing.cargoType}</span>
                      {listing.temperatureControl && listing.temperatureControl !== "指定なし" && listing.temperatureControl !== "常温" && (
                        <div className="mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5">{listing.temperatureControl}</Badge>
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <span className="text-[13px] whitespace-nowrap">{listing.driverWork || "-"}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <Link href={`/cargo/${listing.id}`} className="block">
                      <span className="text-muted-foreground text-xs leading-relaxed line-clamp-3 max-w-[200px]">
                        {listing.description || "-"}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}

              {!isLoading && paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="font-medium text-muted-foreground">荷物情報が見つかりませんでした</p>
                    <p className="text-xs text-muted-foreground mt-1">検索条件を変更してお試しください</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );

  if (isAuthenticated) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
}

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
    <div className="flex items-center gap-0.5" data-testid="pagination">
      <Button
        variant="ghost"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        data-testid="button-prev-page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1.5 text-xs text-muted-foreground">...</span>
        ) : (
          <Button
            key={p}
            variant={page === p ? "default" : "ghost"}
            size="sm"
            className="min-w-[32px] px-2 text-xs"
            onClick={() => onPageChange(p as number)}
            data-testid={`button-page-${p}`}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        data-testid="button-next-page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
