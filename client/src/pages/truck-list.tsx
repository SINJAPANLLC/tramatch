import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Truck, MapPin, Clock, ArrowRight, Search, Plus, Sparkles } from "lucide-react";
import type { TruckListing } from "@shared/schema";
import { insertTruckListingSchema, type InsertTruckListing } from "@shared/schema";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";

const AREAS_FILTER = [
  "全て", "北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州", "沖縄",
  "東京", "大阪", "名古屋", "福岡", "札幌", "仙台", "広島", "神戸"
];

const AREAS = [
  "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島",
  "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
  "新潟", "富山", "石川", "福井", "山梨", "長野",
  "岐阜", "静岡", "愛知", "三重",
  "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
  "鳥取", "島根", "岡山", "広島", "山口",
  "徳島", "香川", "愛媛", "高知",
  "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"
];

const VEHICLE_TYPES = ["4t車", "10t車", "大型車", "トレーラー", "軽車両", "2t車", "その他"];

function TruckSearchTab() {
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
    <div>
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
                {AREAS_FILTER.map((area) => (
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
          <Card key={listing.id} className="h-full" data-testid={`card-truck-${listing.id}`}>
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
                <h3 className="font-bold text-foreground text-base line-clamp-1">{listing.title}</h3>
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
            </CardContent>
          </Card>
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

function TruckRegisterTab() {
  const { toast } = useToast();

  const form = useForm<InsertTruckListing>({
    resolver: zodResolver(insertTruckListingSchema),
    defaultValues: {
      title: "",
      currentArea: "",
      destinationArea: "",
      vehicleType: "",
      maxWeight: "",
      availableDate: "",
      price: "",
      description: "",
      companyName: "",
      contactPhone: "",
      contactEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTruckListing) => {
      const res = await apiRequest("POST", "/api/trucks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: "車両情報を掲載しました" });
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "エラーが発生しました", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 10t車 関東→関西 空車あり" {...field} data-testid="input-truck-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>現在地</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-current-area">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREAS.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destinationArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>行き先エリア</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-destination">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREAS.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>車種</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-truck-vehicle-type">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEHICLE_TYPES.map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最大積載量</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 10t" {...field} data-testid="input-max-weight" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="availableDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>空車日</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 2026/03/01" {...field} data-testid="input-available-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>希望運賃（任意）</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 80,000円" {...field} value={field.value || ""} data-testid="input-truck-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>詳細説明（任意）</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="車両の詳細やその他条件など"
                        className="resize-none min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-truck-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">連絡先情報</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>会社名</FormLabel>
                        <FormControl>
                          <Input placeholder="例: 株式会社トラマッチ運送" {...field} data-testid="input-truck-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>電話番号</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 03-1234-5678" {...field} data-testid="input-truck-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>メールアドレス（任意）</FormLabel>
                          <FormControl>
                            <Input placeholder="例: info@example.com" {...field} value={field.value || ""} data-testid="input-truck-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-truck">
                {mutation.isPending ? "掲載中..." : "車両情報を掲載する"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TruckList() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"search" | "register">("search");

  const content = (
    <div className={isAuthenticated ? "px-4 sm:px-6 py-6" : "max-w-7xl mx-auto px-4 sm:px-6 py-8"}>
      <div className="bg-primary rounded-md p-6 mb-6">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-truck-title">
              {activeTab === "search" ? "AI空車検索" : "AI空車登録"}
            </h1>
            <p className="text-base text-primary-foreground mt-1 text-shadow">
              {activeTab === "search" ? "空車情報を検索できます" : "空車の情報を入力してください"}
            </p>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex gap-2 mb-6">
          <Badge
            variant={activeTab === "search" ? "default" : "outline"}
            className="cursor-pointer text-sm px-4 py-1.5"
            onClick={() => setActiveTab("search")}
            data-testid="tab-truck-search"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" />
            空車検索
          </Badge>
          <Badge
            variant={activeTab === "register" ? "default" : "outline"}
            className="cursor-pointer text-sm px-4 py-1.5"
            onClick={() => setActiveTab("register")}
            data-testid="tab-truck-register"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            空車登録
          </Badge>
        </div>
      )}

      {activeTab === "search" ? <TruckSearchTab /> : <TruckRegisterTab />}
    </div>
  );

  if (isAuthenticated) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
}
