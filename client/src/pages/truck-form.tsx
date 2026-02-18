import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTruckListingSchema, type InsertTruckListing } from "@shared/schema";
import { Truck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";

const VEHICLE_TYPES = [
  "軽車両", "1t車", "1.5t車", "2t車", "3t車", "4t車", "5t車", "6t車", "7t車", "8t車",
  "10t車", "11t車", "13t車", "15t車", "増トン車", "大型車", "トレーラー", "フルトレーラー", "その他"
];
const BODY_TYPES = [
  "平ボディ", "バン", "ウイング", "幌ウイング", "冷蔵車", "冷凍車", "冷凍冷蔵車",
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertTruckListing>({
    resolver: zodResolver(insertTruckListingSchema),
    defaultValues: {
      title: "",
      currentArea: "",
      destinationArea: "",
      vehicleType: "",
      bodyType: "",
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
      setLocation("/trucks");
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
            <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-truck-form-title">車両情報の掲載</h1>
            <p className="text-base text-primary-foreground text-shadow">空車の情報を入力してください</p>
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
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>車体タイプ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-truck-body-type">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BODY_TYPES.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
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
    </DashboardLayout>
  );
}
