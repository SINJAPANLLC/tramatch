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
import { insertCargoListingSchema, type InsertCargoListing } from "@shared/schema";
import { Package, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const VEHICLE_TYPES = ["4t車", "10t車", "大型車", "トレーラー", "軽車両", "2t車", "その他"];
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

export default function CargoForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertCargoListing>({
    resolver: zodResolver(insertCargoListingSchema),
    defaultValues: {
      title: "",
      departureArea: "",
      arrivalArea: "",
      cargoType: "",
      weight: "",
      desiredDate: "",
      vehicleType: "",
      price: "",
      description: "",
      companyName: "",
      contactPhone: "",
      contactEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertCargoListing) => {
      const res = await apiRequest("POST", "/api/cargo", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "荷物情報を掲載しました" });
      setLocation("/cargo");
    },
    onError: (error: Error) => {
      toast({ title: "エラーが発生しました", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/cargo">
        <Button variant="ghost" className="mb-4" data-testid="button-back-cargo-form">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          荷物一覧に戻る
        </Button>
      </Link>

      <div className="bg-primary rounded-md p-5 mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-cargo-form-title">荷物情報の掲載</h1>
            <p className="text-base text-primary-foreground text-shadow">運びたい荷物の情報を入力してください</p>
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
                      <Input placeholder="例: 東京→大阪 食品 10t" {...field} data-testid="input-cargo-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departureArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>出発地</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-departure">
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
                  name="arrivalArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>到着地</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-arrival">
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
                  name="cargoType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>荷物種類</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 食品、機械部品" {...field} data-testid="input-cargo-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>重量</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 5t" {...field} data-testid="input-weight" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="desiredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>希望日</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 2026/03/01" {...field} data-testid="input-desired-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>希望車種</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle-type">
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
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>希望運賃（任意）</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 50,000円" {...field} value={field.value || ""} data-testid="input-price" />
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
                        placeholder="荷物の詳細や注意事項など"
                        className="resize-none min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-description"
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
                          <Input placeholder="例: 株式会社トラマッチ" {...field} data-testid="input-company" />
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
                            <Input placeholder="例: 03-1234-5678" {...field} data-testid="input-phone" />
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
                            <Input placeholder="例: info@example.com" {...field} value={field.value || ""} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-cargo">
                {mutation.isPending ? "掲載中..." : "荷物情報を掲載する"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
