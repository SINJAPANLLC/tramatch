import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Sparkles, ChevronLeft, ChevronRight, ArrowUpDown, MapPin, X, Check, ArrowRight, Circle, Mic, MicOff, Upload, FileText, Loader2, Building2, Phone, Mail, DollarSign, Truck, CalendarDays, Sun, Navigation } from "lucide-react";
import type { CargoListing } from "@shared/schema";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

const QUICK_FILTERS = [
  { label: "全て", value: "all" },
  { label: "関東地場", value: "関東" },
  { label: "関西地場", value: "関西" },
  { label: "中部地場", value: "中部" },
  { label: "東北地場", value: "東北" },
  { label: "九州地場", value: "九州" },
];

const PREFECTURES = [
  "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島",
  "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
  "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知",
  "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
  "鳥取", "島根", "岡山", "広島", "山口",
  "徳島", "香川", "愛媛", "高知",
  "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄",
];

const VEHICLE_TYPES = [
  "軽車両", "1t車", "1.5t車", "2t車", "3t車", "4t車", "5t車", "6t車",
  "7t車", "8t車", "10t車", "11t車", "13t車", "15t車",
  "増トン車", "大型車", "トレーラー", "フルトレーラー", "その他",
];

const PER_PAGE_OPTIONS = [10, 20, 50];

type InputMode = "text" | "file" | "voice";

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
  const { toast } = useToast();
  const [aiSearchText, setAiSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"newest" | "departDate" | "arriveDate" | "price" | "departPref" | "arrivePref">("newest");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [todayOnly, setTodayOnly] = useState(false);
  const [prefectureFilter, setPrefectureFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: listings, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const selectedCargo = useMemo(() => {
    if (!selectedCargoId || !listings) return null;
    return listings.find((l) => l.id === selectedCargoId) || null;
  }, [selectedCargoId, listings]);

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

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("抽出に失敗しました");

      const data = await response.json();
      if (data.text) {
        setAiSearchText(data.text);
        setActiveSearch(parseAISearch(data.text));
        setPage(1);
        toast({ title: "テキスト抽出完了", description: "ファイルから検索条件を読み取りました" });
      }
    } catch (error) {
      toast({ title: "エラー", description: "ファイルからの情報抽出に失敗しました", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [toast]);

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

          const response = await fetch("/api/ai/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("文字起こしに失敗しました");

          const data = await response.json();
          if (data.text) {
            setAiSearchText(data.text);
            setActiveSearch(parseAISearch(data.text));
            setPage(1);
            toast({ title: "音声認識完了", description: "音声から検索条件を読み取りました" });
          }
        } catch {
          toast({ title: "エラー", description: "音声の文字起こしに失敗しました", variant: "destructive" });
        } finally {
          setIsProcessing(false);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [toast]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const filtered = useMemo(() => {
    if (!listings) return [];
    let result = listings.filter((item) => item.status === "active");

    if (activeSearch.length > 0) {
      result = result.filter((item) => {
        const searchable = [
          item.title, item.departureArea, item.departureAddress,
          item.arrivalArea, item.arrivalAddress,
          item.cargoType, item.weight, item.vehicleType,
          item.bodyType, item.temperatureControl,
          item.price, item.companyName, item.description,
          item.desiredDate, item.arrivalDate,
          item.driverWork, item.loadingMethod, item.transportType,
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

    if (todayOnly) {
      result = result.filter((item) => item.desiredDate === todayStr);
    }

    if (prefectureFilter !== "all") {
      result = result.filter(
        (item) =>
          item.departureArea.includes(prefectureFilter) ||
          item.arrivalArea.includes(prefectureFilter)
      );
    }

    if (vehicleFilter !== "all") {
      result = result.filter((item) =>
        item.vehicleType?.includes(vehicleFilter)
      );
    }

    if (dateFilter) {
      const formatted = dateFilter.replace(/-/g, "/");
      result = result.filter((item) => item.desiredDate === formatted);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "departDate": {
          const dA = a.desiredDate || "";
          const dB = b.desiredDate || "";
          return dA.localeCompare(dB) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case "arriveDate": {
          const aA = a.arrivalDate || "";
          const aB = b.arrivalDate || "";
          return aA.localeCompare(aB) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case "price": {
          const pA = parseInt(a.price?.replace(/[^0-9]/g, "") || "0");
          const pB = parseInt(b.price?.replace(/[^0-9]/g, "") || "0");
          return pA - pB;
        }
        case "departPref":
          return (a.departureArea || "").localeCompare(b.departureArea || "");
        case "arrivePref":
          return (a.arrivalArea || "").localeCompare(b.arrivalArea || "");
        default:
          return 0;
      }
    });

    return result;
  }, [listings, activeSearch, quickFilter, sortBy, todayOnly, todayStr, prefectureFilter, vehicleFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const content = (
    <div className={isAuthenticated ? "px-4 sm:px-6 py-4" : "max-w-7xl mx-auto px-4 sm:px-6 py-8"}>
      <Card className="mb-5">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">AI荷物検索</span>
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
          )}

          {inputMode === "file" && (
            <div className="space-y-3">
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
                    <p className="text-sm text-muted-foreground">AIがファイルを解析中...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">画像やスクリーンショットからAIが荷物情報を読み取ります</p>
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
              {aiSearchText && (
                <div className="flex gap-2">
                  <Textarea
                    value={aiSearchText}
                    onChange={(e) => setAiSearchText(e.target.value)}
                    rows={2}
                    className="resize-none text-sm flex-1"
                    placeholder="抽出されたテキスト"
                    data-testid="input-extracted-text"
                  />
                  <div className="flex flex-col gap-1.5">
                    <Button onClick={handleSearch} className="flex-1" data-testid="button-search-extracted">
                      <Search className="w-4 h-4 mr-1" />
                      検索
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="flex-1 text-xs">
                      クリア
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {inputMode === "voice" && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">AIが音声を解析中...</p>
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
                    <p className="text-xs text-muted-foreground">「神奈川から大阪、3月5日、10トン」のように話してください</p>
                    <Button
                      variant="destructive"
                      onClick={stopRecording}
                      data-testid="button-stop-recording"
                    >
                      <MicOff className="w-4 h-4 mr-1.5" />
                      録音停止して検索
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Mic className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">音声で荷物を検索できます</p>
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
              {aiSearchText && (
                <div className="flex gap-2">
                  <Textarea
                    value={aiSearchText}
                    onChange={(e) => setAiSearchText(e.target.value)}
                    rows={2}
                    className="resize-none text-sm flex-1"
                    placeholder="認識されたテキスト"
                    data-testid="input-voice-text"
                  />
                  <div className="flex flex-col gap-1.5">
                    <Button onClick={handleSearch} className="flex-1" data-testid="button-search-voice">
                      <Search className="w-4 h-4 mr-1" />
                      検索
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="flex-1 text-xs">
                      クリア
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

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
            <Badge
              variant={todayOnly ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => { setTodayOnly(!todayOnly); setDateFilter(""); setPage(1); }}
              data-testid="filter-today"
            >
              当日荷物
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={prefectureFilter} onValueChange={(v) => { setPrefectureFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] text-xs h-8" data-testid="select-prefecture">
                <MapPin className="w-3 h-3 mr-1 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="都道府県" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全都道府県</SelectItem>
                {PREFECTURES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vehicleFilter} onValueChange={(v) => { setVehicleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] text-xs h-8" data-testid="select-vehicle">
                <Truck className="w-3 h-3 mr-1 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="車種" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全車種</SelectItem>
                {VEHICLE_TYPES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setTodayOnly(false); setPage(1); }}
                className="w-[150px] text-xs h-8"
                data-testid="input-date-filter"
              />
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => { setDateFilter(""); setPage(1); }}
                  data-testid="button-clear-date"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {(todayOnly || prefectureFilter !== "all" || vehicleFilter !== "all" || dateFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setTodayOnly(false);
                  setPrefectureFilter("all");
                  setVehicleFilter("all");
                  setDateFilter("");
                  setQuickFilter("all");
                  setPage(1);
                }}
                data-testid="button-clear-all-filters"
              >
                <X className="w-3 h-3 mr-1" />
                フィルター解除
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" data-testid="text-result-count">
            検索結果 {filtered.length} 件
          </span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px] text-xs h-8" data-testid="select-sort">
              <ArrowUpDown className="w-3 h-3 mr-1 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">新着順</SelectItem>
              <SelectItem value="departDate">発日時</SelectItem>
              <SelectItem value="arriveDate">着日時</SelectItem>
              <SelectItem value="price">運賃</SelectItem>
              <SelectItem value="departPref">発都道府県</SelectItem>
              <SelectItem value="arrivePref">着都道府県</SelectItem>
            </SelectContent>
          </Select>
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
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">形態</th>
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
                  <td className="px-4 py-4"><Skeleton className="h-4 w-14" /></td>
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
                  className={`hover-elevate cursor-pointer transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""} ${selectedCargoId === listing.id ? "bg-primary/10" : ""}`}
                  onClick={() => setSelectedCargoId(listing.id)}
                  data-testid={`row-cargo-${listing.id}`}
                >
                  <td className="px-4 py-3.5 text-center align-top">
                    {listing.transportType ? (
                      <Badge variant="outline" className={`text-[11px] px-1.5 ${
                        listing.transportType === "スポット" ? "border-blue-300 text-blue-600" :
                        listing.transportType === "定期" ? "border-primary/30 text-primary" : ""
                      }`}>{listing.transportType}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground font-bold">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="font-bold text-foreground whitespace-nowrap text-[13px] leading-tight">{listing.companyName}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-bold">{listing.title}</div>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <div className="flex items-center gap-1 mt-0.5 shrink-0">
                          <Navigation className="w-3 h-3 fill-primary text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[13px] text-foreground">{listing.departureArea}</span>
                            {listing.departureAddress && (
                              <span className="text-xs text-muted-foreground font-bold">{listing.departureAddress}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 font-bold">
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
                          <MapPin className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[13px] text-foreground">{listing.arrivalArea}</span>
                            {listing.arrivalAddress && (
                              <span className="text-xs text-muted-foreground font-bold">{listing.arrivalAddress}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 font-bold">
                            {listing.arrivalDate || ""} {listing.arrivalTime && listing.arrivalTime !== "指定なし" ? listing.arrivalTime : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right align-top">
                    <div className="font-bold text-[14px] text-foreground whitespace-nowrap">
                      {listing.price ? `¥${formatPrice(listing.price)}` : "要相談"}
                    </div>
                    <div className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5 font-bold">
                      高速代: {listing.highwayFee ? "有" : "無"}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center align-top">
                    {listing.consolidation === "可" ? (
                      <Badge variant="outline" className="text-[11px] border-primary/30 text-primary px-1.5">可</Badge>
                    ) : listing.consolidation === "不可" ? (
                      <span className="text-xs text-muted-foreground font-bold">不可</span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-bold">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center align-top">
                    <span className="whitespace-nowrap text-[13px] font-bold">{listing.weight}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center align-top">
                    <div className="text-[13px] whitespace-nowrap font-bold">{listing.vehicleType}</div>
                    {listing.bodyType && (
                      <div className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5 font-bold">{listing.bodyType}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <span className="whitespace-nowrap text-[13px] font-bold">{listing.cargoType}</span>
                    {listing.temperatureControl && listing.temperatureControl !== "指定なし" && listing.temperatureControl !== "常温" && (
                      <div className="mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5">{listing.temperatureControl}</Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <span className="text-[13px] whitespace-nowrap font-bold">{listing.driverWork || "-"}</span>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <span className="text-muted-foreground text-xs leading-relaxed line-clamp-3 max-w-[200px] font-bold">
                      {listing.description || "-"}
                    </span>
                  </td>
                </tr>
              ))}

              {!isLoading && paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-16">
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

      <div className="flex items-center justify-end gap-2 flex-wrap mt-4">
        <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-auto text-xs" data-testid="select-per-page-bottom">
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
  );

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex h-full">
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedCargoId ? "mr-0" : ""}`}>
            {content}
          </div>
          {selectedCargoId && (
            <CargoDetailPanel
              listing={selectedCargo}
              onClose={() => setSelectedCargoId(null)}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  return content;
}

function DetailRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: React.ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div className="w-[110px] shrink-0 bg-muted/30 px-3 py-2.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex-1 px-3 py-2.5 text-sm font-bold text-foreground whitespace-pre-wrap">{children || value || "-"}</div>
    </div>
  );
}

type CompanyInfo = {
  companyName: string;
  address: string | null;
  phone: string;
  fax: string | null;
  email: string;
  contactName: string | null;
  userType: string;
  truckCount: string | null;
  paymentTerms: string | null;
  businessDescription: string | null;
  companyNameKana: string | null;
  postalCode: string | null;
  websiteUrl: string | null;
  invoiceRegistrationNumber: string | null;
  registrationDate: string | null;
  representative: string | null;
  establishedDate: string | null;
  capital: string | null;
  employeeCount: string | null;
  officeLocations: string | null;
  annualRevenue: string | null;
  bankInfo: string | null;
  majorClients: string | null;
  closingDay: string | null;
  paymentMonth: string | null;
  businessArea: string | null;
  autoInvoiceAcceptance: string | null;
  memberOrganization: string | null;
  transportLicenseNumber: string | null;
  digitalTachographCount: string | null;
  gpsCount: string | null;
  safetyExcellenceCert: string | null;
  greenManagementCert: string | null;
  iso9000: string | null;
  iso14000: string | null;
  iso39001: string | null;
  cargoInsurance: string | null;
  cargoCount1m: number;
  cargoCount3m: number;
  truckCount1m: number;
  truckCount3m: number;
};

function CargoDetailPanel({ listing, onClose }: { listing: CargoListing | null; onClose: () => void }) {
  const [panelTab, setPanelTab] = useState<"cargo" | "company">("cargo");

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/companies", listing?.userId],
    enabled: !!listing?.userId,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setPanelTab("cargo");
  }, [listing?.id]);

  if (!listing) {
    return (
      <div className="w-[420px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  const formatDateWithDay = (dateStr: string | null | undefined) => {
    if (!dateStr) return "指定なし";
    const cleaned = dateStr.replace(/\//g, "-");
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) return dateStr;
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}(${days[d.getDay()]})`;
  };

  return (
    <div className="w-[420px] shrink-0 border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-cargo-detail">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setPanelTab("cargo")}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${panelTab === "cargo" ? "text-primary border border-primary bg-primary/5" : "text-muted-foreground"}`}
              data-testid="tab-cargo-info"
            >
              荷物情報
            </button>
            <button
              onClick={() => setPanelTab("company")}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${panelTab === "company" ? "text-primary border border-primary bg-primary/5" : "text-muted-foreground"}`}
              data-testid="tab-company-info"
            >
              企業情報
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => window.print()} data-testid="button-print">
              印刷
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {panelTab === "cargo" ? (
        <div className="p-4 space-y-4">
          <div className="border border-border rounded-md p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <span>{formatDateWithDay(listing.desiredDate)}</span>
                  <span>{listing.departureTime && listing.departureTime !== "指定なし" ? listing.departureTime : ""}</span>
                </div>
                <div className="text-sm font-bold text-foreground mt-0.5">
                  {listing.departureArea} {listing.departureAddress || ""}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1 text-right">
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground justify-end">
                  <span>{formatDateWithDay(listing.arrivalDate)}</span>
                  <span>{listing.arrivalTime && listing.arrivalTime !== "指定なし" ? listing.arrivalTime : ""}</span>
                </div>
                <div className="text-sm font-bold text-foreground mt-0.5">
                  {listing.arrivalArea} {listing.arrivalAddress || ""}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-foreground">{listing.price ? `¥${formatPrice(listing.price)}` : "要相談"}</span>
            {listing.taxType && <span className="text-xs text-muted-foreground font-bold">({listing.taxType})</span>}
            <span className="text-xs text-muted-foreground font-bold">{listing.highwayFee ? "高速代：有" : "高速代：無"}</span>
          </div>

          {listing.status === "active" && (
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base py-5 rounded-full no-default-hover-elevate" data-testid="button-proceed-contract">
              成約へ進む
            </Button>
          )}

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="企業名">
              <div>
                <div className="font-bold">{listing.companyName}</div>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setPanelTab("company")} className="text-xs text-primary font-bold">他の荷物をみる &gt;</button>
                  <button onClick={() => setPanelTab("company")} className="text-xs text-primary font-bold">実績をみる &gt;</button>
                </div>
              </div>
            </DetailRow>
            <DetailRow label="過去成約">
              <Badge variant="outline" className="text-[10px]">なし</Badge>
            </DetailRow>
            <DetailRow label="担当者" value={listing.contactPerson} />
            <DetailRow label="連絡方法">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{listing.contactPhone}</span>
              </div>
            </DetailRow>
            <DetailRow label="荷種">
              <div>
                <div>{listing.cargoType}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  至急：{listing.urgency || "×"} / 引越し案件：{listing.movingJob || "×"}
                </div>
              </div>
            </DetailRow>
            <DetailRow label="積合" value={listing.consolidation || "不可"} />
            <DetailRow label="希望車種" value={`重量：${listing.weight || "-"} 車種：${listing.vehicleType}${listing.bodyType ? `-${listing.bodyType}` : ""}`} />
            <DetailRow label="車両指定" value={listing.vehicleSpec || "指定なし"} />
            <DetailRow label="必要装備" value={listing.equipment || "標準備品"} />
            <DetailRow label="備考" value={listing.description} />
            <DetailRow label="発着日時">
              <div>
                <div>{formatDateWithDay(listing.desiredDate)} {listing.departureTime || ""}{listing.loadingTime ? ` (積み時間：${listing.loadingTime})` : ""}</div>
                <div>{formatDateWithDay(listing.arrivalDate)} {listing.arrivalTime || ""}{listing.unloadingTime ? ` (卸し時間：${listing.unloadingTime})` : ""}</div>
              </div>
            </DetailRow>
            <DetailRow label="入金予定日" value={listing.paymentDate || "登録された支払いサイトに準拠します。"} />
            <DetailRow label="登録日時" value={listing.createdAt ? new Date(listing.createdAt).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit" }) : "-"} />
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {listing.transportType && (
                <Badge variant="outline" className={`text-xs ${listing.transportType === "スポット" ? "border-blue-300 text-blue-600" : listing.transportType === "定期" ? "border-primary/30 text-primary" : ""}`}>{listing.transportType}</Badge>
              )}
              <Badge variant="default">{listing.status === "active" ? "募集中" : listing.status === "completed" ? "成約済" : "終了"}</Badge>
            </div>
            <div className="text-xs text-muted-foreground font-bold">
              閲覧数: {listing.viewCount}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <h3 className="text-base font-bold text-foreground">{companyInfo?.companyName || listing.companyName}</h3>

          <Card className="p-3">
            <div className="text-xs font-bold text-muted-foreground mb-3">トラマッチでの実績</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-bold">委託</span>
                </div>
                <div className="text-xs text-muted-foreground font-bold">成約 <span className="text-lg text-foreground">{companyInfo?.cargoCount1m ?? 0}</span></div>
                <div className="text-xs text-muted-foreground font-bold">登録 <span className="text-lg text-foreground">{companyInfo?.cargoCount3m ?? 0}</span></div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-bold">受託</span>
                </div>
                <div className="text-xs text-muted-foreground font-bold">成約 <span className="text-lg text-foreground">{companyInfo?.truckCount1m ?? 0}</span></div>
                <div className="text-xs text-muted-foreground font-bold">登録 <span className="text-lg text-foreground">{companyInfo?.truckCount3m ?? 0}</span></div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground font-bold text-right mt-2">
              トラマッチ登録年月 {companyInfo?.registrationDate || "-"}
            </div>
          </Card>

          <h4 className="text-sm font-bold text-foreground">基本情報</h4>
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="法人名・事業者名">
              <div>
                {companyInfo?.companyNameKana && (
                  <div className="text-[10px] text-muted-foreground mb-0.5">{companyInfo.companyNameKana}</div>
                )}
                <div className="text-primary font-bold">{companyInfo?.companyName || listing.companyName}</div>
              </div>
            </DetailRow>
            <DetailRow label="住所" value={companyInfo?.postalCode ? `〒${companyInfo.postalCode}\n${companyInfo.address || "-"}` : companyInfo?.address} />
            <DetailRow label="電話番号" value={listing.contactPhone} />
            <DetailRow label="FAX番号" value={companyInfo?.fax} />
            <DetailRow label="請求事業者登録番号" value={companyInfo?.invoiceRegistrationNumber} />
            <DetailRow label="業務内容・会社PR" value={companyInfo?.businessDescription} />
            <DetailRow label="保有車両台数" value={companyInfo?.truckCount ? `${companyInfo.truckCount} 台` : "-"} />
            <DetailRow label="ウェブサイトURL" value={companyInfo?.websiteUrl} />
            <DetailRow label="登録年月" value={companyInfo?.registrationDate} />
          </div>

          <h4 className="text-sm font-bold text-foreground">詳細情報</h4>
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="代表者" value={companyInfo?.representative} />
            <DetailRow label="設立" value={companyInfo?.establishedDate} />
            <DetailRow label="資本金" value={companyInfo?.capital ? `${companyInfo.capital} 万円` : null} />
            <DetailRow label="従業員数" value={companyInfo?.employeeCount} />
            <DetailRow label="事業所所在地" value={companyInfo?.officeLocations} />
            <DetailRow label="年間売上" value={companyInfo?.annualRevenue ? `${companyInfo.annualRevenue} 万円` : null} />
            <DetailRow label="取引先銀行" value={companyInfo?.bankInfo} />
            <DetailRow label="主要取引先" value={companyInfo?.majorClients} />
            <DetailRow label="締め日" value={companyInfo?.closingDay} />
            <DetailRow label="支払月・支払日" value={companyInfo?.paymentMonth} />
            <DetailRow label="営業地域" value={companyInfo?.businessArea} />
            <DetailRow label="おまかせ請求受入" value={companyInfo?.autoInvoiceAcceptance || "未設定"} />
          </div>

          <h4 className="text-sm font-bold text-foreground">信用情報</h4>
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="加入組織" value={companyInfo?.memberOrganization} />
            <DetailRow label="国交省認可番号" value={companyInfo?.transportLicenseNumber} />
            <DetailRow label="デジタコ搭載数" value={companyInfo?.digitalTachographCount} />
            <DetailRow label="GPS搭載数" value={companyInfo?.gpsCount} />
            <DetailRow label="安全性優良事業所" value={companyInfo?.safetyExcellenceCert || "無"} />
            <DetailRow label="グリーン経営認証" value={companyInfo?.greenManagementCert || "無"} />
            <DetailRow label="ISO9000" value={companyInfo?.iso9000 || "無"} />
            <DetailRow label="ISO14000" value={companyInfo?.iso14000 || "無"} />
            <DetailRow label="ISO39001" value={companyInfo?.iso39001 || "無"} />
            <DetailRow label="荷物保険" value={companyInfo?.cargoInsurance} />
          </div>
        </div>
      )}
    </div>
  );
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
