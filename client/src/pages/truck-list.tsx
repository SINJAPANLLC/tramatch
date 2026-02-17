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
import { Truck, MapPin, Clock, ArrowRight, Search, Plus, Sparkles, ChevronLeft, ChevronRight, ArrowUpDown, X, Mic, MicOff, Upload, FileText, Loader2, Building2, Phone, Mail, Navigation, CalendarDays, Package } from "lucide-react";
import type { TruckListing } from "@shared/schema";
import { insertTruckListingSchema, type InsertTruckListing } from "@shared/schema";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";

const PREFECTURES = [
  "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島",
  "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
  "新潟", "富山", "石川", "福井", "山梨", "長野",
  "岐阜", "静岡", "愛知", "三重",
  "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
  "鳥取", "島根", "岡山", "広島", "山口",
  "徳島", "香川", "愛媛", "高知",
  "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"
];

const QUICK_FILTERS = [
  { label: "全て", value: "all" },
  { label: "関東地場", value: "関東" },
  { label: "関西地場", value: "関西" },
  { label: "中部地場", value: "中部" },
  { label: "東北地場", value: "東北" },
  { label: "九州地場", value: "九州" },
];

const VEHICLE_TYPES = ["軽車両", "2t車", "4t車", "10t車", "大型車", "トレーラー", "その他"];

const PER_PAGE_OPTIONS = [10, 20, 50];

type InputMode = "text" | "file" | "voice";

function parseAISearch(text: string): string[] {
  const cleaned = text.replace(/[、。\n\r\t,./]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  return cleaned.split(" ").filter((w) => w.length > 0);
}

function formatPrice(price: string | null | undefined): string {
  if (!price) return "";
  const num = parseInt(price.replace(/[^0-9]/g, ""));
  if (isNaN(num)) return price;
  return num.toLocaleString();
}

function DetailRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: React.ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div className="w-[110px] shrink-0 bg-muted/30 px-3 py-2.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex-1 px-3 py-2.5 text-sm font-bold text-foreground whitespace-pre-wrap">{children || value || "-"}</div>
    </div>
  );
}

function TruckDetailPanel({ listing, onClose }: { listing: TruckListing | null; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  return (
    <div className="w-[420px] shrink-0 border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-truck-detail">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
          <span className="text-sm font-bold text-foreground">空車情報</span>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-truck-panel">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="border border-border rounded-md p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">{listing.currentArea}</div>
              <div className="text-xs text-muted-foreground font-bold mt-0.5">現在地</div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex-1 text-right">
              <div className="text-sm font-bold text-foreground">{listing.destinationArea}</div>
              <div className="text-xs text-muted-foreground font-bold mt-0.5">行き先</div>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-foreground">{listing.price ? `¥${formatPrice(listing.price)}` : "要相談"}</span>
        </div>

        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="タイトル" value={listing.title} />
          <DetailRow label="企業名">
            <div>
              <div className="font-bold">{listing.companyName}</div>
            </div>
          </DetailRow>
          <DetailRow label="車種" value={listing.vehicleType} />
          <DetailRow label="最大積載量" value={listing.maxWeight} />
          <DetailRow label="空車日" value={listing.availableDate} />
          <DetailRow label="連絡先">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{listing.contactPhone}</span>
              </div>
              {listing.contactEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{listing.contactEmail}</span>
                </div>
              )}
            </div>
          </DetailRow>
          <DetailRow label="備考" value={listing.description} />
          <DetailRow label="登録日時" value={listing.createdAt ? new Date(listing.createdAt).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit" }) : "-"} />
        </div>
      </div>
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
    <div className="flex items-center gap-0.5" data-testid="truck-pagination">
      <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} data-testid="button-truck-prev-page">
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
            data-testid={`button-truck-page-${p}`}
          >
            {p}
          </Button>
        )
      )}
      <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} data-testid="button-truck-next-page">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function TruckList() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"search" | "register">("search");
  const [aiSearchText, setAiSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"newest" | "date" | "price" | "currentArea" | "destArea">("newest");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [prefectureFilter, setPrefectureFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: listings, isLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const selectedTruck = useMemo(() => {
    if (!selectedTruckId || !listings) return null;
    return listings.find((l) => l.id === selectedTruckId) || null;
  }, [selectedTruckId, listings]);

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
      const response = await fetch("/api/ai/extract-text", { method: "POST", body: formData });
      if (!response.ok) throw new Error("抽出に失敗しました");
      const data = await response.json();
      if (data.text) {
        setAiSearchText(data.text);
        setActiveSearch(parseAISearch(data.text));
        setPage(1);
        toast({ title: "テキスト抽出完了", description: "ファイルから検索条件を読み取りました" });
      }
    } catch {
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
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
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

  const filtered = useMemo(() => {
    if (!listings) return [];
    let result = [...listings];

    if (activeSearch.length > 0) {
      result = result.filter((item) => {
        const searchable = [
          item.title, item.currentArea, item.destinationArea,
          item.vehicleType, item.maxWeight, item.companyName,
          item.description, item.availableDate, item.price,
        ].filter(Boolean).join(" ").toLowerCase();
        return activeSearch.some((keyword) => searchable.includes(keyword.toLowerCase()));
      });
    }

    if (quickFilter !== "all") {
      result = result.filter(
        (item) => item.currentArea.includes(quickFilter) || item.destinationArea.includes(quickFilter)
      );
    }

    if (prefectureFilter !== "all") {
      result = result.filter(
        (item) => item.currentArea.includes(prefectureFilter) || item.destinationArea.includes(prefectureFilter)
      );
    }

    if (vehicleFilter !== "all") {
      result = result.filter((item) => item.vehicleType?.includes(vehicleFilter));
    }

    if (dateFilter) {
      const formatted = dateFilter.replace(/-/g, "/");
      result = result.filter((item) => item.availableDate === formatted);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date": {
          const dA = a.availableDate || "";
          const dB = b.availableDate || "";
          return dA.localeCompare(dB) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case "price": {
          const pA = parseInt(a.price?.replace(/[^0-9]/g, "") || "0");
          const pB = parseInt(b.price?.replace(/[^0-9]/g, "") || "0");
          return pA - pB;
        }
        case "currentArea":
          return (a.currentArea || "").localeCompare(b.currentArea || "");
        case "destArea":
          return (a.destinationArea || "").localeCompare(b.destinationArea || "");
        default:
          return 0;
      }
    });

    return result;
  }, [listings, activeSearch, quickFilter, sortBy, prefectureFilter, vehicleFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const form = useForm<InsertTruckListing>({
    resolver: zodResolver(insertTruckListingSchema),
    defaultValues: {
      title: "", currentArea: "", destinationArea: "", vehicleType: "",
      maxWeight: "", availableDate: "", price: "", description: "",
      companyName: "", contactPhone: "", contactEmail: "",
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
      setActiveTab("search");
    },
    onError: (error: Error) => {
      toast({ title: "エラーが発生しました", description: error.message, variant: "destructive" });
    },
  });

  const searchContent = (
    <>
      <Card className="mb-5">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">AI空車検索</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant={inputMode === "text" ? "default" : "ghost"} size="sm" onClick={() => setInputMode("text")} data-testid="button-truck-mode-text">
                <Search className="w-3.5 h-3.5 mr-1" />テキスト
              </Button>
              <Button variant={inputMode === "file" ? "default" : "ghost"} size="sm" onClick={() => setInputMode("file")} data-testid="button-truck-mode-file">
                <Upload className="w-3.5 h-3.5 mr-1" />ファイル
              </Button>
              <Button variant={inputMode === "voice" ? "default" : "ghost"} size="sm" onClick={() => setInputMode("voice")} data-testid="button-truck-mode-voice">
                <Mic className="w-3.5 h-3.5 mr-1" />音声
              </Button>
            </div>
          </div>

          {inputMode === "text" && (
            <div className="flex gap-2">
              <Textarea
                placeholder={"例: 関東から関西 4t車 空車\n例: 東京 10t 大型車"}
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
                data-testid="input-truck-ai-search"
              />
              <div className="flex flex-col gap-1.5">
                <Button onClick={handleSearch} className="flex-1" data-testid="button-truck-search">
                  <Search className="w-4 h-4 mr-1" />検索
                </Button>
                <Button variant="outline" onClick={handleClear} className="flex-1 text-xs" data-testid="button-truck-clear">
                  クリア
                </Button>
              </div>
            </div>
          )}

          {inputMode === "file" && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" data-testid="input-truck-file-upload" />
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">AIがファイルを解析中...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">画像やスクリーンショットからAIが空車情報を読み取ります</p>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} data-testid="button-truck-upload-file">
                      <Upload className="w-4 h-4 mr-1.5" />ファイルを選択
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG, PDF対応 (最大25MB)</p>
                  </div>
                )}
              </div>
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
                    <Button variant="destructive" onClick={stopRecording} data-testid="button-truck-stop-recording">
                      <MicOff className="w-4 h-4 mr-1.5" />録音停止して検索
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Mic className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">音声で空車を検索できます</p>
                    <Button onClick={startRecording} data-testid="button-truck-start-recording">
                      <Mic className="w-4 h-4 mr-1.5" />録音開始
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {QUICK_FILTERS.map((f) => (
              <Badge
                key={f.value}
                variant={quickFilter === f.value ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => { setQuickFilter(f.value); setPage(1); }}
                data-testid={`truck-filter-${f.value}`}
              >
                {f.label}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={prefectureFilter} onValueChange={(v) => { setPrefectureFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] text-xs h-8" data-testid="select-truck-prefecture">
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
              <SelectTrigger className="w-[130px] text-xs h-8" data-testid="select-truck-vehicle">
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
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="w-[150px] text-xs h-8"
                data-testid="input-truck-date-filter"
              />
              {dateFilter && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setDateFilter(""); setPage(1); }} data-testid="button-truck-clear-date">
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {(prefectureFilter !== "all" || vehicleFilter !== "all" || dateFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => { setPrefectureFilter("all"); setVehicleFilter("all"); setDateFilter(""); setQuickFilter("all"); setPage(1); }}
                data-testid="button-truck-clear-all-filters"
              >
                <X className="w-3 h-3 mr-1" />フィルター解除
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" data-testid="text-truck-result-count">
            検索結果 {filtered.length} 件
          </span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px] text-xs h-8" data-testid="select-truck-sort">
              <ArrowUpDown className="w-3 h-3 mr-1 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">新着順</SelectItem>
              <SelectItem value="date">空車日時</SelectItem>
              <SelectItem value="price">運賃</SelectItem>
              <SelectItem value="currentArea">空車地</SelectItem>
              <SelectItem value="destArea">行先地</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-auto text-xs" data-testid="select-truck-per-page">
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
          <table className="w-full" data-testid="table-truck">
            <thead>
              <tr className="border-b bg-muted/60">
                <th className="text-left px-2 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">企業名</th>
                <th className="text-left px-2 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap min-w-[200px]">空車日時・空車地 / 行先日時・行先地</th>
                <th className="text-right px-2 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">運賃</th>
                <th className="text-center px-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">重量</th>
                <th className="text-center px-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">車種</th>
                <th className="text-left px-2 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">備考</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-2 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-10 w-48" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-1.5 py-3"><Skeleton className="h-4 w-10" /></td>
                  <td className="px-1.5 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-4 w-20" /></td>
                </tr>
              ))}

              {!isLoading && paginated.map((listing, index) => (
                <tr
                  key={listing.id}
                  className={`hover-elevate cursor-pointer transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""} ${selectedTruckId === listing.id ? "bg-primary/10" : ""}`}
                  onClick={() => setSelectedTruckId(listing.id)}
                  data-testid={`row-truck-${listing.id}`}
                >
                  <td className="px-2 py-3 align-top max-w-[120px]">
                    <div className="font-bold text-foreground text-[12px] leading-tight truncate">{listing.companyName}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-bold truncate">{listing.title}</div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5">
                        <Navigation className="w-3 h-3 fill-primary text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-bold text-[12px] text-foreground">{listing.availableDate}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-bold">
                            {listing.currentArea}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pl-0.5">
                        <div className="w-px h-2 bg-border ml-[4px]" />
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[11px] text-muted-foreground font-bold">
                            {listing.destinationArea}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right align-top">
                    <div className="font-bold text-[13px] text-foreground whitespace-nowrap">
                      {listing.price ? `¥${formatPrice(listing.price)}` : "要相談"}
                    </div>
                  </td>
                  <td className="px-1.5 py-3 text-center align-top">
                    <span className="whitespace-nowrap text-[12px] font-bold">{listing.maxWeight || "-"}</span>
                  </td>
                  <td className="px-1.5 py-3 text-center align-top">
                    <div className="text-[12px] whitespace-nowrap font-bold">{listing.vehicleType}</div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <span className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2 max-w-[140px] font-bold">
                      {listing.description || "-"}
                    </span>
                  </td>
                </tr>
              ))}

              {!isLoading && paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Truck className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="font-medium text-muted-foreground">車両情報が見つかりませんでした</p>
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
          <SelectTrigger className="w-auto text-xs" data-testid="select-truck-per-page-bottom">
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
    </>
  );

  const registerContent = (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl><Input placeholder="例: 10t車 関東→関西 空車あり" {...field} data-testid="input-truck-title" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="currentArea" render={({ field }) => (
                  <FormItem>
                    <FormLabel>空車地</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-current-area"><SelectValue placeholder="選択してください" /></SelectTrigger></FormControl>
                      <SelectContent>{PREFECTURES.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="destinationArea" render={({ field }) => (
                  <FormItem>
                    <FormLabel>行先地</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-destination"><SelectValue placeholder="選択してください" /></SelectTrigger></FormControl>
                      <SelectContent>{PREFECTURES.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="vehicleType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>車種</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-truck-vehicle-type"><SelectValue placeholder="選択してください" /></SelectTrigger></FormControl>
                      <SelectContent>{VEHICLE_TYPES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxWeight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大積載量</FormLabel>
                    <FormControl><Input placeholder="例: 10t" {...field} data-testid="input-max-weight" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="availableDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>空車日</FormLabel>
                  <FormControl><Input placeholder="例: 2026/03/01" {...field} data-testid="input-available-date" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>最低運賃（税別）</FormLabel>
                  <FormControl><Input placeholder="例: 80,000" {...field} value={field.value || ""} data-testid="input-truck-price" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>備考</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="※注意 連絡先として「検索営業所の電話番号」を入力することはご遠慮ください。"
                      className="resize-none min-h-[80px]"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-truck-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">連絡先情報</h3>
                <div className="space-y-4">
                  <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>会社名</FormLabel>
                      <FormControl><Input placeholder="例: 株式会社トラマッチ運送" {...field} data-testid="input-truck-company" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>電話番号</FormLabel>
                        <FormControl><Input placeholder="例: 03-1234-5678" {...field} data-testid="input-truck-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>メールアドレス（任意）</FormLabel>
                        <FormControl><Input placeholder="例: info@example.com" {...field} value={field.value || ""} data-testid="input-truck-email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={mutation.isPending} data-testid="button-submit-truck">
                  {mutation.isPending ? "掲載中..." : "登録"}
                </Button>
                <Button type="button" variant="outline" onClick={() => form.reset()} data-testid="button-clear-truck-form">
                  クリア
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );

  const content = (
    <div className={isAuthenticated ? "px-4 sm:px-6 py-4" : "max-w-7xl mx-auto px-4 sm:px-6 py-8"}>
      {isAuthenticated && (
        <div className="flex items-center gap-0 border-b border-border mb-5">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === "search" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
            data-testid="tab-truck-search"
          >
            <Search className="w-3.5 h-3.5 inline mr-1.5" />
            空車検索
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === "register" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
            data-testid="tab-truck-register"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1.5" />
            空車登録
          </button>
        </div>
      )}

      {activeTab === "search" ? searchContent : registerContent}
    </div>
  );

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex h-full">
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedTruckId ? "mr-0" : ""}`}>
            {content}
          </div>
          {selectedTruckId && activeTab === "search" && (
            <TruckDetailPanel
              listing={selectedTruck}
              onClose={() => setSelectedTruckId(null)}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  return content;
}
