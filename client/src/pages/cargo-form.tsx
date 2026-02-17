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
import { Package, ArrowLeft, Sparkles, Search, Upload, Mic, MicOff, FileText, Loader2, CalendarIcon } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { useState, useRef, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

const VEHICLE_TYPES = [
  "軽車両", "1t車", "1.5t車", "2t車", "3t車", "4t車", "5t車", "6t車",
  "7t車", "8t車", "10t車", "11t車", "13t車", "15t車",
  "増トン車", "大型車", "トレーラー", "フルトレーラー", "その他"
];
const BODY_TYPES = [
  "平ボディ", "バン", "ウイング", "幌ウイング", "冷蔵車", "冷凍車", "冷凍冷蔵車",
  "ダンプ", "タンクローリー", "車載車", "セルフローダー", "セーフティローダー",
  "ユニック", "クレーン付き", "パワーゲート付き", "エアサス",
  "コンテナ車", "海上コンテナ", "低床", "高床", "その他"
];
const TEMP_CONTROLS = ["指定なし", "常温", "冷蔵（0〜10℃）", "冷凍（-18℃以下）", "定温"];
const HIGHWAY_FEE_OPTIONS = ["込み", "別途", "高速代なし"];
const TRANSPORT_TYPE_OPTIONS = ["スポット", "定期"];
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

type InputMode = "text" | "file" | "voice";

const SELECT_FIELD_OPTIONS: Record<string, string[]> = {
  departureArea: AREAS,
  arrivalArea: AREAS,
  departureTime: TIME_OPTIONS,
  arrivalTime: TIME_OPTIONS,
  vehicleType: VEHICLE_TYPES,
  bodyType: BODY_TYPES,
  temperatureControl: TEMP_CONTROLS,
  highwayFee: HIGHWAY_FEE_OPTIONS,
  transportType: TRANSPORT_TYPE_OPTIONS,
  consolidation: CONSOLIDATION_OPTIONS,
  driverWork: DRIVER_WORK_OPTIONS,
  loadingMethod: LOADING_METHODS,
};

function findBestMatch(value: string, options: string[]): string {
  if (!value) return "";
  const exact = options.find((o) => o === value);
  if (exact) return exact;
  const includes = options.find((o) => o.includes(value) || value.includes(o));
  if (includes) return includes;
  return "";
}

export default function CargoForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [aiText, setAiText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      transportType: "",
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

  const applyAiFields = useCallback((fields: Record<string, string>) => {
    const formFields = [
      "title", "departureArea", "departureAddress", "arrivalArea", "arrivalAddress",
      "desiredDate", "departureTime", "arrivalDate", "arrivalTime",
      "cargoType", "weight", "vehicleType", "bodyType", "temperatureControl",
      "price", "transportType", "consolidation", "driverWork", "packageCount", "loadingMethod",
      "highwayFee", "description",
    ];

    let filledCount = 0;
    for (const key of formFields) {
      const val = fields[key];
      if (val && typeof val === "string" && val.trim()) {
        const options = SELECT_FIELD_OPTIONS[key];
        if (options) {
          const matched = findBestMatch(val.trim(), options);
          if (matched) {
            form.setValue(key as keyof InsertCargoListing, matched);
            filledCount++;
          }
        } else {
          form.setValue(key as keyof InsertCargoListing, val.trim());
          filledCount++;
        }
      }
    }
    return filledCount;
  }, [form]);

  const parseAndFillRaw = useCallback(async (text: string) => {
    try {
      const formData = new FormData();
      formData.append("text", text);

      const response = await fetch("/api/ai/parse-cargo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("解析に失敗しました");

      const data = await response.json();
      if (data.fields) {
        const count = applyAiFields(data.fields);
        toast({
          title: "AI入力完了",
          description: `${count}項目を自動入力しました。内容を確認して必要に応じて修正してください。`,
        });
      }
    } catch {
      toast({ title: "エラー", description: "AIによる解析に失敗しました", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [applyAiFields, toast]);

  const handleAiSubmit = async () => {
    if (aiText.trim()) {
      setIsProcessing(true);
      await parseAndFillRaw(aiText.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit();
    }
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/ai/extract-text", { method: "POST", body: formData });
      if (!response.ok) throw new Error("抽出に失敗しました");
      const data = await response.json();
      if (data.text) {
        setAiText(data.text);
        await parseAndFillRaw(data.text);
      } else {
        setIsProcessing(false);
      }
    } catch {
      toast({ title: "エラー", description: "ファイルからの情報抽出に失敗しました", variant: "destructive" });
      setIsProcessing(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [parseAndFillRaw, toast]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(100);
      setIsRecording(true);
    } catch {
      toast({ title: "エラー", description: "マイクへのアクセスが許可されていません", variant: "destructive" });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recorder.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setIsProcessing(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const response = await fetch("/api/ai/transcribe", { method: "POST", body: formData });
          if (!response.ok) throw new Error("文字起こしに失敗しました");
          const data = await response.json();
          if (data.text) {
            setAiText(data.text);
            await parseAndFillRaw(data.text);
          } else {
            setIsProcessing(false);
          }
        } catch {
          toast({ title: "エラー", description: "音声の文字起こしに失敗しました", variant: "destructive" });
          setIsProcessing(false);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [parseAndFillRaw, toast]);

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
            <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-cargo-form-title">AI荷物登録</h1>
            <p className="text-base text-primary-foreground text-shadow">AIが入力をサポートします</p>
          </div>
        </div>
      </div>

      <Card className="mb-5">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">AI自動入力</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={inputMode === "text" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInputMode("text")}
                data-testid="button-mode-text"
              >
                <Search className="w-3.5 h-3.5 mr-1" />
                テキスト
              </Button>
              <Button
                variant={inputMode === "file" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInputMode("file")}
                data-testid="button-mode-file"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                ファイル
              </Button>
              <Button
                variant={inputMode === "voice" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInputMode("voice")}
                data-testid="button-mode-voice"
              >
                <Mic className="w-3.5 h-3.5 mr-1" />
                音声
              </Button>
            </div>
          </div>

          {inputMode === "text" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">荷物情報を自然文で入力すると、AIがフォームに自動入力します</p>
              <div className="flex gap-2">
                <Textarea
                  placeholder={"例: 3月5日に神奈川県横浜市から大阪市北区まで食品10トンを冷凍車で運びたい。パレット積みでフォークリフト作業。運賃5万円希望。"}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="resize-none text-sm flex-1"
                  data-testid="input-ai-text"
                />
                <div className="flex flex-col gap-1.5">
                  <Button
                    onClick={handleAiSubmit}
                    disabled={isProcessing || !aiText.trim()}
                    className="flex-1"
                    data-testid="button-ai-fill"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-1" />
                    )}
                    AI入力
                  </Button>
                </div>
              </div>
            </div>
          )}

          {inputMode === "file" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">画像やスクリーンショットからAIが荷物情報を読み取り、フォームに自動入力します</p>
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">AIがファイルを解析してフォームに入力中...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload-file"
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      ファイルを選択
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG, PDF対応 (最大25MB)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {inputMode === "voice" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">音声で荷物情報を話すと、AIがフォームに自動入力します</p>
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">AIが音声を解析してフォームに入力中...</p>
                  </div>
                ) : isRecording ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
                      <div className="relative w-16 h-16 rounded-full bg-destructive flex items-center justify-center">
                        <MicOff className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-destructive">録音中...</p>
                    <p className="text-xs text-muted-foreground">「3月5日に神奈川から大阪まで食品10トン冷凍車」のように話してください</p>
                    <Button
                      variant="destructive"
                      onClick={stopRecording}
                      data-testid="button-stop-recording"
                    >
                      <MicOff className="w-4 h-4 mr-1.5" />
                      録音停止してAI入力
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Mic className="w-8 h-8 text-muted-foreground" />
                    <Button
                      onClick={startRecording}
                      data-testid="button-start-recording"
                    >
                      <Mic className="w-4 h-4 mr-1.5" />
                      録音開始
                    </Button>
                    <p className="text-xs text-muted-foreground">マイクへのアクセスを許可してください</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {aiText && (inputMode === "file" || inputMode === "voice") && (
            <div className="bg-muted/30 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">認識されたテキスト:</p>
              <p className="text-sm" data-testid="text-recognized">{aiText}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
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
                <FormField
                  control={form.control}
                  name="transportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>輸送形態</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="w-[140px]" data-testid="select-transport-type">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TRANSPORT_TYPE_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                      render={({ field }) => {
                        const dateValue = field.value ? (() => {
                          try {
                            const parsed = parse(field.value, "yyyy/MM/dd", new Date());
                            return isNaN(parsed.getTime()) ? undefined : parsed;
                          } catch { return undefined; }
                        })() : undefined;
                        return (
                          <FormItem>
                            <FormLabel>発日</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="input-desired-date"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value || "日付を選択"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={dateValue}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(format(date, "yyyy/MM/dd"));
                                    }
                                  }}
                                  locale={ja}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
                      render={({ field }) => {
                        const dateValue = field.value ? (() => {
                          try {
                            const parsed = parse(field.value, "yyyy/MM/dd", new Date());
                            return isNaN(parsed.getTime()) ? undefined : parsed;
                          } catch { return undefined; }
                        })() : undefined;
                        return (
                          <FormItem>
                            <FormLabel>着日</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="input-arrival-date"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value || "日付を選択"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={dateValue}
                                  onSelect={(date) => {
                                    if (date) {
                                      field.onChange(format(date, "yyyy/MM/dd"));
                                    }
                                  }}
                                  locale={ja}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
