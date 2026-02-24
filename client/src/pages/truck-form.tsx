import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTruckListingSchema, type InsertTruckListing } from "@shared/schema";
import type { TruckListing } from "@shared/schema";
import { Truck, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";

const VEHICLE_TYPES = [
  "軽車両", "1t車", "1.5t車", "2t車", "3t車", "4t車", "5t車", "6t車", "7t車", "8t車",
  "10t車", "11t車", "13t車", "15t車", "増トン車", "大型車", "トレーラー", "フルトレーラー", "その他"
];
const BODY_TYPES = [
  "平ボディ", "箱車", "バン", "ウイング", "幌ウイング", "冷蔵車", "冷凍車", "冷凍冷蔵車",
  "ダンプ", "タンクローリー", "車載車", "セルフローダー", "セーフティローダー",
  "ユニック", "クレーン付き", "パワーゲート付き", "エアサス", "コンテナ車", "海上コンテナ",
  "低床", "高床", "その他"
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

export default function TruckForm() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const editMatch = location.match(/^\/trucks\/edit\/(.+)$/);
  const editId = editMatch ? editMatch[1] : null;
  const isEditMode = !!editId;

  const { data: editTruck, isLoading: isLoadingEdit } = useQuery<TruckListing>({
    queryKey: ["/api/trucks", editId],
    enabled: isEditMode,
  });

  const form = useForm<InsertTruckListing>({
    resolver: zodResolver(insertTruckListingSchema),
    defaultValues: {
      title: "",
      currentArea: "",
      destinationArea: "",
      vehicleType: "",
      truckCount: "",
      bodyType: "",
      maxWeight: "",
      availableDate: "",
      price: "",
      description: "",
    },
  });

  useEffect(() => {
    if (editTruck) {
      form.reset({
        title: editTruck.title || "",
        currentArea: editTruck.currentArea || "",
        destinationArea: editTruck.destinationArea || "",
        vehicleType: editTruck.vehicleType || "",
        truckCount: editTruck.truckCount || "",
        bodyType: editTruck.bodyType || "",
        maxWeight: editTruck.maxWeight || "",
        availableDate: editTruck.availableDate || "",
        price: editTruck.price || "",
        description: editTruck.description || "",
      });
    }
  }, [editTruck]);

  const mutation = useMutation({
    mutationFn: async (data: InsertTruckListing) => {
      if (isEditMode && editId) {
        const res = await apiRequest("PATCH", `/api/trucks/${editId}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/trucks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      if (isEditMode) {
        toast({ title: "車両情報を更新しました" });
        setLocation("/trucks");
      } else {
        toast({ title: "車両情報を掲載しました" });
        setLocation("/trucks");
      }
    },
    onError: (error: Error) => {
      toast({ title: "エラーが発生しました", description: error.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/trucks">
        <Button variant="ghost" className="mb-4" data-testid="button-back-truck-form">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          車両一覧に戻る
        </Button>
      </Link>

      <div className="bg-primary rounded-md p-5 mb-6">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-truck-form-title">{isEditMode ? "車両情報の編集" : "車両情報の掲載"}</h1>
            <p className="text-base text-primary-foreground text-shadow">{isEditMode ? "車両情報を編集してください" : "空車の情報を入力してください"}</p>
          </div>
        </div>
      </div>

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
                <div className="grid grid-cols-[1fr_80px] gap-2">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>車種</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-truck-vehicle-type">
                              <SelectValue placeholder="選択" />
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
                    name="truckCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>台数</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="1" data-testid="input-truck-count" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>車体タイプ（複数選択可）</FormLabel>
                      <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border border-border rounded-md p-3" data-testid="select-truck-body-type">
                        {BODY_TYPES.map(b => {
                          const selected = (field.value || "").split(",").map((s: string) => s.trim()).filter(Boolean);
                          const isChecked = selected.includes(b);
                          return (
                            <label key={b} className="flex items-center gap-2 cursor-pointer text-sm hover-elevate rounded px-1.5 py-1">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const current = (field.value || "").split(",").map((s: string) => s.trim()).filter(Boolean);
                                  const next = checked ? [...current, b] : current.filter((v: string) => v !== b);
                                  field.onChange(next.join(", "));
                                }}
                              />
                              <span>{b}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <Input type="date" {...field} data-testid="input-available-date" />
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
                      <Input
                        placeholder="例: 80,000円"
                        {...field}
                        value={field.value === "要相談" ? "" : (field.value || "")}
                        disabled={field.value === "要相談"}
                        data-testid="input-truck-price"
                      />
                    </FormControl>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="price-negotiable-form"
                        checked={field.value === "要相談"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "要相談" : "");
                        }}
                        data-testid="checkbox-price-negotiable"
                      />
                      <label htmlFor="price-negotiable-form" className="text-sm text-muted-foreground cursor-pointer">要相談</label>
                    </div>
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

              <Button type="submit" className="w-full" disabled={mutation.isPending || (isEditMode && isLoadingEdit)} data-testid="button-submit-truck">
                {mutation.isPending ? (isEditMode ? "更新中..." : "掲載中...") : (isEditMode ? "車両情報を更新する" : "車両情報を掲載する")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
