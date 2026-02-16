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
import DashboardLayout from "@/components/dashboard-layout";

const VEHICLE_TYPES = ["軽車両", "2t車", "4t車", "10t車", "大型車", "トレーラー", "その他"];
const BODY_TYPES = ["平ボディ", "バン", "ウイング", "冷蔵車", "冷凍車", "ダンプ", "タンクローリー", "車載車", "その他"];
const TEMP_CONTROLS = ["指定なし", "常温", "冷蔵（0〜10℃）", "冷凍（-18℃以下）", "定温"];
const HIGHWAY_FEE_OPTIONS = ["込み", "別途", "高速代なし"];
const CONSOLIDATION_OPTIONS = ["可", "不可"];
const DRIVER_WORK_OPTIONS = ["手積み手降ろし", "フォークリフト", "クレーン", "ゲート車", "パレット", "作業なし（車上渡し）", "その他"];
const LOADING_METHODS = ["バラ積み", "パレット積み", "段ボール", "フレコン", "その他"];
const TIME_OPTIONS = ["指定なし", "午前中", "午後", "夕方以降", "終日可", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

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
      departureAddress: "",
      departureTime: "",
      arrivalArea: "",
      arrivalAddress: "",
      arrivalTime: "",
      cargoType: "",
      weight: "",
      desiredDate: "",
      arrivalDate: "",
      vehicleType: "",
      bodyType: "",
      temperatureControl: "",
      price: "",
      highwayFee: "",
      consolidation: "",
      driverWork: "",
      packageCount: "",
      loadingMethod: "",
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
    <DashboardLayout>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
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
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

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

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">発地情報</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departureArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>発地（都道府県）</FormLabel>
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
                      name="departureAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>発地（詳細住所）</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 横浜市中区xxx" {...field} value={field.value || ""} data-testid="input-departure-address" />
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
                          <FormLabel>発日</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 2026/03/01" {...field} data-testid="input-desired-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departureTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>発時間</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-departure-time">
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">着地情報</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="arrivalArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>着地（都道府県）</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="arrivalAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>着地（詳細住所）</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 大阪市北区xxx" {...field} value={field.value || ""} data-testid="input-arrival-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="arrivalDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>着日</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 2026/03/02" {...field} value={field.value || ""} data-testid="input-arrival-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="arrivalTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>着時間</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-arrival-time">
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">荷物情報</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cargoType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>荷種</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 食品、機械部品、建材" {...field} data-testid="input-cargo-type" />
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
                      name="packageCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>個数（任意）</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 20パレット、100個" {...field} value={field.value || ""} data-testid="input-package-count" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="loadingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>荷姿</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-loading-method">
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LOADING_METHODS.map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
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
                    name="temperatureControl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>温度管理</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-temp-control">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEMP_CONTROLS.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">車両・作業条件</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="bodyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>車体タイプ（任意）</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-body-type">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="driverWork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ドライバー作業</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-driver-work">
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DRIVER_WORK_OPTIONS.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="consolidation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>積合</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-consolidation">
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONSOLIDATION_OPTIONS.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="highwayFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>高速代</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-highway-fee">
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {HIGHWAY_FEE_OPTIONS.map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">運賃・備考</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>希望運賃（任意）</FormLabel>
                        <FormControl>
                          <Input placeholder="例: 50,000" {...field} value={field.value || ""} data-testid="input-price" />
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
                        <FormLabel>備考（任意）</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="荷物の詳細や注意事項など"
                            className="resize-none min-h-[80px]"
                            {...field}
                            value={field.value || ""}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5">
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
    </DashboardLayout>
  );
}
