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
import { Truck, MapPin, ArrowRight, Search, Plus, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ArrowUpDown, X, Mic, MicOff, Upload, FileText, Loader2, Phone, Mail, Navigation, CalendarDays, Send, Bot, User, Banknote, CheckCircle2, Check, Trash2, Pencil, Clock, Eye, Building2, Package, Printer, MessageSquare, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { TruckListing } from "@shared/schema";
import { insertTruckListingSchema, type InsertTruckListing } from "@shared/schema";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
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

const VEHICLE_TYPES = [
  "軽車両", "1t車", "1.5t車", "2t車", "3t車", "4t車", "5t車", "6t車", "7t車", "8t車",
  "10t車", "11t車", "13t車", "15t車", "増トン車", "大型車", "トレーラー", "フルトレーラー", "その他"
];
const BODY_TYPES = [
  "平ボディ", "箱車", "バン", "ウイング", "幌ウイング", "冷蔵車", "冷凍車", "冷凍冷蔵車",
  "ダンプ", "タンクローリー", "車載車", "セルフローダー", "セーフティローダー",
  "ユニック", "クレーン付き", "パワーゲート付き", "エアサス", "コンテナ車", "海上コンテナ",
  "低床", "高床", "ロング", "ワイド", "ショート", "ワイドロング", "その他"
];

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

type InputMode = "text" | "file" | "voice";

const TRUCK_FIELDS = [
  "title", "currentArea", "currentAddress", "destinationArea", "destinationAddress", "vehicleType", "truckCount", "bodyType",
  "maxWeight", "availableDate", "price", "description",
];

const SELECT_FIELD_OPTIONS: Record<string, string[]> = {
  currentArea: PREFECTURES,
  destinationArea: PREFECTURES,
  vehicleType: VEHICLE_TYPES,
  bodyType: BODY_TYPES,
};

const FIELD_LABELS: Record<string, string> = {
  title: "タイトル", currentArea: "空車地", currentAddress: "空車地詳細住所", destinationArea: "行先地", destinationAddress: "行先地詳細住所",
  vehicleType: "車種", bodyType: "車体タイプ", maxWeight: "最大積載量", availableDate: "空車日",
  price: "最低運賃", description: "備考",
};

function findBestMatch(value: string, options: string[]): string {
  if (!value) return "";
  const exact = options.find((o) => o === value);
  if (exact) return exact;
  const includes = options.find((o) => o.includes(value) || value.includes(o));
  if (includes) return includes;
  return "";
}

function normalizeAiItem(raw: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of TRUCK_FIELDS) {
    const val = raw[key];
    if (val == null) { result[key] = ""; continue; }
    const str = String(val).trim();
    if (!str) { result[key] = ""; continue; }
    const options = SELECT_FIELD_OPTIONS[key];
    if (options) {
      result[key] = findBestMatch(str, options);
    } else {
      result[key] = str;
    }
  }
  return result;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  extractedFields?: Record<string, string>;
  priceSuggestion?: { min: number; max: number; reason: string } | null;
  items?: Record<string, unknown>[];
  status?: string;
};

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
  closingMonth: string | null;
  closingDay: string | null;
  paymentMonth: string | null;
  paymentDay: string | null;
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

function TruckDetailPanel({ listing, onClose }: { listing: TruckListing | null; onClose: () => void }) {
  const [panelTab, setPanelTab] = useState<"truck" | "company">("truck");

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
    setPanelTab("truck");
  }, [listing?.id]);

  const handlePrint = () => {
    if (!listing) return;
    const row = (label: string, value: string | null | undefined) =>
      `<tr><td style="padding:6px 10px;font-weight:bold;white-space:nowrap;border:1px solid #ddd;background:#f9f9f9;font-size:13px;width:140px">${label}</td><td style="padding:6px 10px;border:1px solid #ddd;font-size:13px">${value || "-"}</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>空車情報 - ${listing.companyName}</title>
<style>body{font-family:'Hiragino Sans','Meiryo',sans-serif;margin:20px;color:#333}
h2{font-size:18px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px}
table{border-collapse:collapse;width:100%;margin-bottom:16px}
.header{text-align:center;margin-bottom:24px}
.header h1{font-size:22px;color:#40E0D0;margin:0}
.route{display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #ddd;border-radius:6px;margin-bottom:12px}
.route-side{flex:1}.route-arrow{padding:0 16px;font-size:20px;color:#999}
.price{font-size:22px;font-weight:bold;margin-bottom:16px}
@media print{body{margin:10px}}</style></head><body>
<div class="header"><h1>トラマッチ 空車情報</h1><p style="font-size:12px;color:#888">印刷日: ${new Date().toLocaleString("ja-JP")}</p></div>
<h2>空車情報</h2>
<div class="route">
<div class="route-side"><div style="font-weight:bold;font-size:14px">${listing.currentArea}</div><div style="font-size:12px;color:#888;margin-top:4px">現在地</div></div>
<div class="route-arrow">→</div>
<div class="route-side" style="text-align:right"><div style="font-weight:bold;font-size:14px">${listing.destinationArea}</div><div style="font-size:12px;color:#888;margin-top:4px">行き先</div></div>
</div>
<div class="price">${listing.price ? `¥${Number(listing.price).toLocaleString()}` : "要相談"}</div>
<table>
${row("タイトル", listing.title)}
${row("企業名", listing.companyName)}
${row("車種", listing.vehicleType)}
${row("車体タイプ", listing.bodyType)}
${row("台数", listing.truckCount ? `${listing.truckCount}台` : "-")}
${row("最大積載量", listing.maxWeight)}
${row("空車日", listing.availableDate)}
${row("連絡先", listing.contactPhone)}
${row("メール", listing.contactEmail)}
${row("備考", listing.description)}
</table>
<h2>企業情報</h2>
<table>
${row("法人名・事業者名", companyInfo?.companyName || listing.companyName)}
${row("住所", companyInfo?.postalCode ? `〒${companyInfo.postalCode} ${companyInfo.address || "-"}` : companyInfo?.address || "-")}
${row("電話番号", listing.contactPhone)}
${row("FAX番号", companyInfo?.fax)}
${row("請求事業者登録番号", companyInfo?.invoiceRegistrationNumber)}
${row("業務内容・会社PR", companyInfo?.businessDescription)}
${row("保有車両台数", companyInfo?.truckCount ? `${companyInfo.truckCount} 台` : "-")}
</table>
</body></html>`;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => { printWindow.print(); };
    }
  };

  if (!listing) {
    return (
      <div className="w-full lg:w-[420px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-truck-detail">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setPanelTab("truck")}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${panelTab === "truck" ? "text-primary border border-primary bg-primary/5" : "text-muted-foreground"}`}
              data-testid="tab-truck-info"
            >
              空車情報
            </button>
            <button
              onClick={() => setPanelTab("company")}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${panelTab === "company" ? "text-primary border border-primary bg-primary/5" : "text-muted-foreground"}`}
              data-testid="tab-truck-company-info"
            >
              企業情報
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={handlePrint} data-testid="button-truck-print">
              印刷
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-truck-panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {panelTab === "truck" ? (
        <div className="p-4 space-y-4">
          <div className="border border-border rounded-md p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground">{listing.currentArea}</div>
                {listing.currentAddress && <div className="text-xs text-foreground mt-0.5">{listing.currentAddress}</div>}
                <div className="text-xs text-muted-foreground font-bold mt-0.5">現在地</div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1 text-right">
                <div className="text-sm font-bold text-foreground">{listing.destinationArea}</div>
                {listing.destinationAddress && <div className="text-xs text-foreground mt-0.5">{listing.destinationAddress}</div>}
                <div className="text-xs text-muted-foreground font-bold mt-0.5">行き先</div>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-foreground">{listing.price ? `¥${formatPrice(listing.price)}` : "要相談"}</span>
            <span className="text-xs text-muted-foreground font-bold">最低運賃</span>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="タイトル" value={listing.title} />
            <DetailRow label="企業名">
              <div>
                <div className="font-bold">{listing.companyName}</div>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setPanelTab("company")} className="text-xs text-primary font-bold">企業情報をみる &gt;</button>
                </div>
              </div>
            </DetailRow>
            <DetailRow label="車種" value={listing.vehicleType} />
            <DetailRow label="台数" value={listing.truckCount ? `${listing.truckCount}台` : "-"} />
            <DetailRow label="車体タイプ" value={listing.bodyType || "-"} />
            <DetailRow label="最大積載量" value={listing.maxWeight} />
            <DetailRow label="空車日" value={listing.availableDate} />
            <DetailRow label="連絡方法">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{listing.contactPhone}</span>
              </div>
            </DetailRow>
            <DetailRow label="備考" value={listing.description} />
            <DetailRow label="登録日時" value={listing.createdAt ? new Date(listing.createdAt).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit" }) : "-"} />
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

          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground">基本情報</h4>
            {companyInfo?.companyName && companyInfo?.phone && companyInfo?.address && companyInfo?.representative && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300" data-testid="badge-company-profile-complete">企業情報登録済</span>
            )}
          </div>
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
            <DetailRow label="締め日" value={[companyInfo?.closingMonth, companyInfo?.closingDay].filter(Boolean).join(" ") || null} />
            <DetailRow label="支払月・支払日" value={[companyInfo?.paymentMonth, companyInfo?.paymentDay].filter(Boolean).join(" ") || null} />
            <DetailRow label="営業地域" value={companyInfo?.businessArea} />
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

function TruckRegisterTab({ tabBar }: { tabBar: (hasMarginBottom: boolean) => React.ReactNode }) {
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "空車登録のお手伝いをします！\n\n空車の情報をテキストで入力するか、ファイルをアップロードしてください。運賃の相談もできます。\n\n例：「3月5日に東京から大阪まで10t車が空いています」",
      status: "chatting",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [pendingItems, setPendingItems] = useState<Record<string, unknown>[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [bodyTypeOpen, setBodyTypeOpen] = useState(false);

  const truckFormSchema = insertTruckListingSchema.omit({ companyName: true, contactPhone: true, contactEmail: true });
  const form = useForm<InsertTruckListing>({
    resolver: zodResolver(truckFormSchema),
    defaultValues: {
      title: "", currentArea: "", currentAddress: "", destinationArea: "", destinationAddress: "", vehicleType: "", truckCount: "", bodyType: "",
      maxWeight: "", availableDate: "", price: "", description: "",
    },
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const applyFieldsToForm = useCallback((fields: Record<string, string>) => {
    let count = 0;
    for (const key of TRUCK_FIELDS) {
      const val = fields[key];
      if (val) {
        form.setValue(key as keyof InsertTruckListing, val);
        count++;
      }
    }
    return count;
  }, [form]);

  const mergeExtractedFields = useCallback((newFields: Record<string, unknown>) => {
    const normalized = normalizeAiItem(newFields);
    setExtractedFields(prev => {
      const merged = { ...prev };
      for (const key of TRUCK_FIELDS) {
        if (normalized[key]) merged[key] = normalized[key];
      }
      return merged;
    });
    const normalizedClean: Record<string, string> = {};
    for (const key of TRUCK_FIELDS) {
      if (normalized[key]) normalizedClean[key] = normalized[key];
    }
    return normalizedClean;
  }, []);

  const sendChatMessage = useCallback(async (userMessage: string, opts?: { skipGuard?: boolean; skipUserMsg?: boolean }) => {
    if (!userMessage.trim()) return;
    if (!opts?.skipGuard && isAiProcessing) return;

    let userMsg: ChatMessage | null = null;
    if (!opts?.skipUserMsg) {
      userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
      };
      setChatMessages(prev => [...prev, userMsg!]);
    }
    setChatInput("");
    setIsAiProcessing(true);

    try {
      const currentMessages = userMsg ? [...chatMessages, userMsg] : chatMessages;
      const allMessages = currentMessages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          content: m.role === "assistant" ? (m.content || "") : m.content,
        }));

      const response = await fetch("/api/ai/truck-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          extractedFields: extractedFields,
        }),
      });

      if (!response.ok) throw new Error("AI通信エラー");
      const data = await response.json();

      if (data.extractedFields && Object.keys(data.extractedFields).length > 0) {
        const merged = mergeExtractedFields(data.extractedFields);
        applyFieldsToForm(merged);
      }

      if (data.items && data.items.length > 0) {
        if (data.items.length === 1) {
          const singleItem = normalizeAiItem(data.items[0]);
          const hasFields = Object.values(singleItem).some(v => v);
          if (hasFields) {
            mergeExtractedFields(singleItem);
            applyFieldsToForm(singleItem);
          }
        } else {
          const firstItem = normalizeAiItem(data.items[0]);
          setExtractedFields(firstItem);
          applyFieldsToForm(firstItem);
          setPendingItems(data.items.slice(1));
          setCurrentItemIndex(0);
          setTotalItems(data.items.length);
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.message,
        extractedFields: data.extractedFields,
        priceSuggestion: data.priceSuggestion,
        items: data.items,
        status: data.status,
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch {
      setChatMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "申し訳ございません。通信エラーが発生しました。もう一度お試しください。",
      }]);
    } finally {
      setIsAiProcessing(false);
    }
  }, [chatMessages, extractedFields, isAiProcessing, mergeExtractedFields, applyFieldsToForm]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAiProcessing(true);

    const userMsg: ChatMessage = {
      id: `user-file-${Date.now()}`,
      role: "user",
      content: `[ファイルアップロード: ${file.name}]`,
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/ai/extract-text", { method: "POST", body: formData });
      if (!response.ok) throw new Error("抽出に失敗しました");
      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, {
          id: `ai-extract-${Date.now()}`,
          role: "assistant",
          content: `ファイルから以下の情報を読み取りました：\n\n${data.text}\n\nこの情報から空車を登録しますね。`,
        }]);
        await sendChatMessage(data.text, { skipGuard: true, skipUserMsg: true });
      } else {
        setIsAiProcessing(false);
      }
    } catch {
      toast({ title: "エラー", description: "ファイルからの情報抽出に失敗しました", variant: "destructive" });
      setIsAiProcessing(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [sendChatMessage, toast]);

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
        setIsAiProcessing(true);

        const userMsg: ChatMessage = {
          id: `user-voice-${Date.now()}`,
          role: "user",
          content: "[音声入力中...]",
        };
        setChatMessages(prev => [...prev, userMsg]);

        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const response = await fetch("/api/ai/transcribe", { method: "POST", body: formData });
          if (!response.ok) throw new Error("文字起こしに失敗しました");
          const data = await response.json();
          if (data.text) {
            setChatMessages(prev =>
              prev.map(m => m.id === userMsg.id ? { ...m, content: data.text } : m)
            );
            await sendChatMessage(data.text, { skipGuard: true, skipUserMsg: true });
          } else {
            setIsAiProcessing(false);
          }
        } catch {
          toast({ title: "エラー", description: "音声の文字起こしに失敗しました", variant: "destructive" });
          setIsAiProcessing(false);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [sendChatMessage, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      sendChatMessage(chatInput);
    }
  };

  const loadNextPendingItem = useCallback(() => {
    if (pendingItems.length > 0) {
      const nextItem = pendingItems[0];
      const remaining = pendingItems.slice(1);
      setPendingItems(remaining);
      setCurrentItemIndex(prev => prev + 1);
      form.reset({
        title: "", currentArea: "", currentAddress: "", destinationArea: "", destinationAddress: "", vehicleType: "", bodyType: "",
        maxWeight: "", availableDate: "", price: "", description: "",
      });
      const normalized = normalizeAiItem(nextItem);
      setExtractedFields(normalized);
      applyFieldsToForm(normalized);
      toast({
        title: `次の空車を入力しました（${currentItemIndex + 2}/${totalItems}件目）`,
        description: `残り${remaining.length}件`,
      });
    }
  }, [pendingItems, currentItemIndex, totalItems, form, applyFieldsToForm, toast]);

  const mutation = useMutation({
    mutationFn: async (data: InsertTruckListing) => {
      const res = await apiRequest("POST", "/api/trucks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-trucks"] });
      if (pendingItems.length > 0) {
        toast({ title: "空車情報を掲載しました", description: "次の空車を読み込みます..." });
        loadNextPendingItem();
      } else {
        toast({ title: "空車情報を掲載しました" });
        form.reset();
        setExtractedFields({});
        setTotalItems(0);
        setCurrentItemIndex(0);
        setChatMessages([{
          id: "welcome",
          role: "assistant",
          content: "空車登録が完了しました！\n\n続けて別の空車を登録する場合は、情報を入力してください。",
          status: "chatting",
        }]);
      }
    },
    onError: (error: Error) => {
      toast({ title: "エラーが発生しました", description: error.message, variant: "destructive" });
    },
  });

  const filledFieldCount = Object.values(extractedFields).filter(v => v).length;
  const [mobileTab, setMobileTab] = useState<"chat" | "form">("chat");

  return (
    <div className="h-full w-full flex-1 flex flex-col overflow-hidden">
      <div className="px-4 sm:px-6 pt-4 shrink-0">
        {tabBar(false)}
      </div>
      <div className="bg-primary px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 shrink-0">
        <Truck className="w-5 h-5 text-primary-foreground" />
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-primary-foreground text-shadow-lg truncate" data-testid="text-truck-register-title">AI空車登録</h1>
          <p className="text-[10px] sm:text-xs text-primary-foreground/80 text-shadow">AIアシスタントが登録をサポートします</p>
        </div>
        <div className="flex lg:hidden gap-1">
          <Button
            size="sm"
            variant={mobileTab === "chat" ? "secondary" : "ghost"}
            className="text-xs text-primary-foreground"
            onClick={() => setMobileTab("chat")}
            data-testid="button-truck-mobile-tab-chat"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            チャット
          </Button>
          <Button
            size="sm"
            variant={mobileTab === "form" ? "secondary" : "ghost"}
            className="text-xs text-primary-foreground"
            onClick={() => setMobileTab("form")}
            data-testid="button-truck-mobile-tab-form"
          >
            <FileText className="w-3 h-3 mr-1" />
            フォーム{filledFieldCount > 0 && ` (${filledFieldCount})`}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className={`flex-1 min-h-0 flex flex-col min-w-0 ${mobileTab !== "chat" ? "hidden lg:flex" : ""}`}>
          <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3" data-testid="truck-chat-messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/60 text-foreground rounded-bl-md"
                    }`}
                    data-testid={`truck-chat-message-${msg.id}`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {msg.priceSuggestion && (
                    <div className="mt-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3.5 py-2.5" data-testid="truck-price-suggestion">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Banknote className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">運賃の提案</span>
                      </div>
                      <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
                        ¥{msg.priceSuggestion.min.toLocaleString()} 〜 ¥{msg.priceSuggestion.max.toLocaleString()}
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{msg.priceSuggestion.reason}</p>
                      <div className="flex gap-1.5 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-amber-300 text-amber-700 dark:text-amber-400"
                          onClick={() => {
                            const mid = Math.round((msg.priceSuggestion!.min + msg.priceSuggestion!.max) / 2);
                            form.setValue("price", String(mid));
                            setExtractedFields(prev => ({ ...prev, price: String(mid) }));
                            toast({ title: "運賃を設定しました", description: `¥${mid.toLocaleString()}` });
                          }}
                          data-testid="button-truck-apply-price-mid"
                        >
                          中間値で設定
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-amber-300 text-amber-700 dark:text-amber-400"
                          onClick={() => {
                            sendChatMessage("もう少し安くしたいんだけど");
                          }}
                          data-testid="button-truck-negotiate-lower"
                        >
                          もう少し安く
                        </Button>
                      </div>
                    </div>
                  )}

                  {msg.extractedFields && Object.keys(msg.extractedFields).filter(k => msg.extractedFields![k]).length > 0 && (
                    <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2" data-testid="truck-extracted-fields-preview">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[11px] font-bold text-primary">抽出した情報</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(msg.extractedFields).filter(([, v]) => v).map(([k, v]) => (
                          <Badge key={k} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {FIELD_LABELS[k] || k}: {String(v).length > 15 ? String(v).substring(0, 15) + "..." : v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.items && msg.items.length > 1 && (
                    <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2" data-testid="truck-multi-detected">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">{msg.items.length}件の空車を検出</span>
                      </div>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400">1件目をフォームに反映しました。</p>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-foreground/60" />
                  </div>
                )}
              </div>
            ))}

            {isAiProcessing && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3" data-testid="truck-ai-loading">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">考え中...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-border px-3 py-2.5 bg-background shrink-0" data-testid="truck-chat-input-area">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-muted-foreground font-bold">入力方法:</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 cursor-default">テキスト</Badge>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-truck-reg-mode-file"
              >
                <Upload className="w-3 h-3 mr-0.5" /> ファイル
              </Badge>
              <Badge
                variant={isRecording ? "destructive" : "outline"}
                className="text-[10px] px-1.5 cursor-pointer"
                onClick={isRecording ? stopRecording : startRecording}
                data-testid="button-truck-reg-mode-voice"
              >
                {isRecording ? <MicOff className="w-3 h-3 mr-0.5" /> : <Mic className="w-3 h-3 mr-0.5" />}
                {isRecording ? "録音停止" : "音声"}
              </Badge>
              {isRecording && (
                <span className="text-[10px] text-destructive font-bold animate-pulse">録音中...</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" data-testid="input-truck-reg-file-upload" />
            <div className="flex gap-2">
              <Textarea
                placeholder="空車情報を入力、またはデータを貼り付け..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                className="resize-none text-sm flex-1 min-h-[80px]"
                data-testid="input-truck-chat-text"
              />
              <div className="flex flex-col gap-1">
                <Button
                  onClick={() => sendChatMessage(chatInput)}
                  disabled={isAiProcessing || !chatInput.trim()}
                  size="icon"
                  data-testid="button-truck-send-chat"
                >
                  {isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => sendChatMessage("運賃はどれくらいが妥当ですか？")}
                  disabled={isAiProcessing || filledFieldCount < 2}
                  className="text-amber-600"
                  title="運賃の相談"
                  data-testid="button-truck-ask-price"
                >
                  <Banknote className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={`border-l border-border bg-background overflow-y-auto w-full lg:w-[420px] shrink-0 ${mobileTab !== "form" ? "hidden lg:block" : ""}`}>
          <div
            className="sticky top-0 bg-background z-10 border-b border-border px-3 py-2 flex items-center justify-between gap-2"
            data-testid="truck-form-panel-header"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">登録フォーム</span>
              {filledFieldCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">{filledFieldCount}項目入力済</Badge>
              )}
              {totalItems > 1 && (
                <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600">{currentItemIndex + 1}/{totalItems}件目</Badge>
              )}
            </div>
          </div>

          <div className="p-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">タイトル</FormLabel>
                    <FormControl><Input placeholder="例: 10t車 東京→大阪 空車あり" {...field} className="h-8 text-xs" data-testid="input-truck-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="border-t border-border pt-3">
                  <h3 className="text-xs font-bold text-muted-foreground mb-2">ルート情報</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
                      <FormField control={form.control} name="currentArea" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">空車地</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-8 text-xs w-[90px]" data-testid="select-current-area"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                            <SelectContent>{PREFECTURES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="currentAddress" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">詳細住所</FormLabel>
                          <FormControl><Input className="h-8 text-xs" placeholder="例: 名古屋市中村区" {...field} value={field.value || ""} data-testid="input-current-address" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
                      <FormField control={form.control} name="destinationArea" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">行先地</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-8 text-xs w-[90px]" data-testid="select-destination"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                            <SelectContent>{PREFECTURES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="destinationAddress" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">詳細住所</FormLabel>
                          <FormControl><Input className="h-8 text-xs" placeholder="例: 大阪市北区" {...field} value={field.value || ""} data-testid="input-destination-address" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <h3 className="text-xs font-bold text-muted-foreground mb-2">車両情報</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_60px] gap-2">
                      <FormField control={form.control} name="vehicleType" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">車種</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-truck-vehicle-type"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                            <SelectContent>{VEHICLE_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="truckCount" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">台数</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} placeholder="1" className="h-8 text-xs" data-testid="input-truck-count" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="bodyType" render={({ field }) => {
                      const selected = (field.value || "").split(",").map(s => s.trim()).filter(Boolean);
                      return (
                      <FormItem className="relative">
                        <FormLabel className="text-xs">車体タイプ（複数選択可）</FormLabel>
                        <button
                          type="button"
                          className="w-full flex items-center justify-between h-8 px-3 text-xs border border-border rounded-md bg-background cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setBodyTypeOpen(prev => !prev)}
                          data-testid="button-toggle-body-type"
                        >
                          <span className={selected.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                            {selected.length > 0 ? `${selected.join(", ")}` : "選択"}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${bodyTypeOpen ? "rotate-180" : ""}`} />
                        </button>
                        {bodyTypeOpen && (
                          <div className="absolute left-0 right-0 top-full z-20 mt-1 border border-border rounded-md bg-background shadow-lg p-2 grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto" data-testid="select-truck-body-type">
                            {BODY_TYPES.map(b => {
                              const isChecked = selected.includes(b);
                              return (
                                <label key={b} className="flex items-center gap-1.5 cursor-pointer text-[11px] hover:bg-muted rounded px-1 py-0.5">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const current = (field.value || "").split(",").map(s => s.trim()).filter(Boolean);
                                      const next = checked ? [...current, b] : current.filter(v => v !== b);
                                      field.onChange(next.join(", "));
                                    }}
                                  />
                                  <span>{b}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    );}} />
                    <FormField control={form.control} name="maxWeight" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">最大積載量</FormLabel>
                        <FormControl><Input placeholder="例: 10t" {...field} className="h-8 text-xs" data-testid="input-max-weight" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="availableDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">空車日</FormLabel>
                        <FormControl><Input type="date" {...field} className="h-8 text-xs" data-testid="input-available-date" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <h3 className="text-xs font-bold text-muted-foreground mb-2">運賃</h3>
                  <div className="space-y-2">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">最低運賃 円(税別)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="金額を入力"
                            {...field}
                            value={field.value === "要相談" ? "" : (field.value || "")}
                            disabled={field.value === "要相談"}
                            className="h-8 text-xs"
                            data-testid="input-truck-price"
                          />
                        </FormControl>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Checkbox
                            id="price-negotiable"
                            checked={field.value === "要相談"}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? "要相談" : "");
                            }}
                            data-testid="checkbox-price-negotiable"
                          />
                          <label htmlFor="price-negotiable" className="text-xs text-muted-foreground cursor-pointer">要相談</label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <h3 className="text-xs font-bold text-muted-foreground mb-2">その他</h3>
                  <div className="space-y-2">
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">備考</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="補足事項があれば入力してください"
                            className="resize-none min-h-[60px] text-xs"
                            {...field}
                            value={field.value || ""}
                            data-testid="textarea-truck-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" disabled={mutation.isPending} data-testid="button-submit-truck">
                    {mutation.isPending ? "掲載中..." : "掲載する"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { form.reset(); setExtractedFields({}); }} data-testid="button-clear-truck-form">
                    クリア
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

function TruckEditPanel({ listing, onClose }: { listing: TruckListing; onClose: () => void }) {
  const { toast } = useToast();
  const [editFields, setEditFields] = useState({
    title: listing.title,
    currentArea: listing.currentArea,
    currentAddress: listing.currentAddress || "",
    destinationArea: listing.destinationArea,
    destinationAddress: listing.destinationAddress || "",
    vehicleType: listing.vehicleType,
    bodyType: listing.bodyType || "",
    maxWeight: listing.maxWeight,
    availableDate: listing.availableDate,
    price: listing.price || "",
    description: listing.description || "",
  });

  useEffect(() => {
    setEditFields({
      title: listing.title,
      currentArea: listing.currentArea,
      currentAddress: listing.currentAddress || "",
      destinationArea: listing.destinationArea,
      destinationAddress: listing.destinationAddress || "",
      vehicleType: listing.vehicleType,
      bodyType: listing.bodyType || "",
      maxWeight: listing.maxWeight,
      availableDate: listing.availableDate,
      price: listing.price || "",
      description: listing.description || "",
    });
  }, [listing.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await apiRequest("PATCH", `/api/trucks/${listing.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-trucks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({ title: "空車情報を更新しました" });
    },
    onError: () => {
      toast({ title: "更新に失敗しました", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(editFields);
  };

  const handleChange = (field: string, value: string) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-truck-edit">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
          <span className="text-sm font-bold text-foreground">空車情報を編集</span>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-truck-edit">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">タイトル</label>
          <Input value={editFields.title} onChange={e => handleChange("title", e.target.value)} data-testid="input-edit-title" />
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">空車地</label>
            <Select value={editFields.currentArea} onValueChange={v => handleChange("currentArea", v)}>
              <SelectTrigger className="w-[90px]" data-testid="select-edit-currentArea"><SelectValue /></SelectTrigger>
              <SelectContent>{PREFECTURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">詳細住所</label>
            <Input value={editFields.currentAddress} onChange={e => handleChange("currentAddress", e.target.value)} placeholder="例: 名古屋市中村区" data-testid="input-edit-currentAddress" />
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">行先地</label>
            <Select value={editFields.destinationArea} onValueChange={v => handleChange("destinationArea", v)}>
              <SelectTrigger className="w-[90px]" data-testid="select-edit-destinationArea"><SelectValue /></SelectTrigger>
              <SelectContent>{PREFECTURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">詳細住所</label>
            <Input value={editFields.destinationAddress} onChange={e => handleChange("destinationAddress", e.target.value)} placeholder="例: 大阪市北区" data-testid="input-edit-destinationAddress" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">車種</label>
            <Select value={editFields.vehicleType} onValueChange={v => handleChange("vehicleType", v)}>
              <SelectTrigger data-testid="select-edit-vehicleType"><SelectValue /></SelectTrigger>
              <SelectContent>{VEHICLE_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">車体タイプ</label>
            <Select value={editFields.bodyType} onValueChange={v => handleChange("bodyType", v)}>
              <SelectTrigger data-testid="select-edit-bodyType"><SelectValue /></SelectTrigger>
              <SelectContent>{BODY_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">最大積載量</label>
          <Input value={editFields.maxWeight} onChange={e => handleChange("maxWeight", e.target.value)} placeholder="例: 10t" data-testid="input-edit-maxWeight" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">空車日</label>
          <Input value={editFields.availableDate} onChange={e => handleChange("availableDate", e.target.value)} placeholder="YYYY/MM/DD" data-testid="input-edit-availableDate" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">最低運賃</label>
          <Input value={editFields.price} onChange={e => handleChange("price", e.target.value)} placeholder="例: 50000" data-testid="input-edit-price" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1 block">備考</label>
          <Textarea value={editFields.description} onChange={e => handleChange("description", e.target.value)} rows={3} data-testid="input-edit-description" />
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          data-testid="button-save-truck-edit"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              保存中...
            </>
          ) : (
            "保存する"
          )}
        </Button>
      </div>
    </div>
  );
}

function MyTrucksTab({ selectedTruckId, onSelectTruck }: { selectedTruckId: string | null; onSelectTruck: (id: string | null) => void }) {
  const { toast } = useToast();
  const [myPage, setMyPage] = useState(1);
  const myPerPage = 10;

  const { data: myTrucks, isLoading: myLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/my-trucks"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trucks/${id}`);
    },
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-trucks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      if (selectedTruckId === deletedId) onSelectTruck(null);
      toast({ title: "空車情報を削除しました" });
    },
    onError: () => {
      toast({ title: "削除に失敗しました", variant: "destructive" });
    },
  });

  const sorted = useMemo(() => {
    if (!myTrucks) return [];
    return [...myTrucks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [myTrucks]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / myPerPage));
  const paginated = sorted.slice((myPage - 1) * myPerPage, myPage * myPerPage);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full" data-testid="tab-my-trucks-content">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant="secondary" data-testid="text-my-trucks-count">
          {myTrucks ? `${myTrucks.length}件登録中` : "..."}
        </Badge>
      </div>

      {myLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-md" />)}
        </div>
      )}

      {!myLoading && sorted.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">登録した空車情報はありません</p>
          </CardContent>
        </Card>
      )}

      {!myLoading && paginated.length > 0 && (
        <div className="space-y-3">
          {paginated.map((truck) => {
            const isExpired = new Date(truck.availableDate) < new Date(new Date().toDateString());
            const isSelected = selectedTruckId === truck.id;
            return (
              <Card
                key={truck.id}
                className={`cursor-pointer hover-elevate ${isExpired ? "opacity-60" : ""} ${isSelected ? "border-primary" : ""}`}
                onClick={() => onSelectTruck(truck.id)}
                data-testid={`card-my-truck-${truck.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" data-testid={`link-my-truck-title-${truck.id}`}>
                          {truck.title}
                        </span>
                        {isExpired ? (
                          <Badge variant="outline" className="text-[10px]">期限切れ</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">掲載中</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {truck.currentArea}
                          <ArrowRight className="w-3 h-3" />
                          {truck.destinationArea}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {truck.vehicleType}
                        </span>
                        {truck.bodyType && <span>{truck.bodyType}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          空車日: {truck.availableDate}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        登録日: {formatDate(truck.createdAt.toString())}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onSelectTruck(truck.id); }}
                        data-testid={`button-edit-my-truck-${truck.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("この空車情報を削除しますか？")) {
                            deleteMutation.mutate(truck.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-my-truck-${truck.id}`}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" disabled={myPage <= 1} onClick={() => setMyPage(myPage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">{myPage} / {totalPages}</span>
            <Button variant="ghost" size="icon" disabled={myPage >= totalPages} onClick={() => setMyPage(myPage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TruckList() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const isRegisterPage = location === "/trucks/new";
  const [activeTab, setActiveTab] = useState<"register" | "my">("register");
  const [aiSearchText, setAiSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [sortBy, setSortBy] = useState<"newest" | "date" | "price" | "currentArea" | "destArea">("newest");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [editTruckId, setEditTruckId] = useState<string | null>(null);
  const [prefectureFilter, setPrefectureFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [filterCurrentArea, setFilterCurrentArea] = useState("");
  const [filterDestArea, setFilterDestArea] = useState("");
  const [filterAvailDateFrom, setFilterAvailDateFrom] = useState("");
  const [filterAvailDateTo, setFilterAvailDateTo] = useState("");
  const [filterArriveDateFrom, setFilterArriveDateFrom] = useState("");
  const [filterArriveDateTo, setFilterArriveDateTo] = useState("");
  const [filterMinFare, setFilterMinFare] = useState("");
  const [filterWeight, setFilterWeight] = useState("");
  const [filterVehicleType, setFilterVehicleType] = useState<string[]>([]);
  const [filterExcludeNegotiable, setFilterExcludeNegotiable] = useState(false);
  const [bodyTypeDropdownOpen, setBodyTypeDropdownOpen] = useState(false);
  const bodyTypeRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bodyTypeRef.current && !bodyTypeRef.current.contains(e.target as Node)) {
        setBodyTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: listings, isLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const selectedTruck = useMemo(() => {
    if (!selectedTruckId || !listings) return null;
    return listings.find((l) => l.id === selectedTruckId) || null;
  }, [selectedTruckId, listings]);

  const { data: myTrucksData } = useQuery<TruckListing[]>({
    queryKey: ["/api/my-trucks"],
    enabled: isAuthenticated,
  });

  const editTruck = useMemo(() => {
    if (!editTruckId || !myTrucksData) return null;
    return myTrucksData.find((l) => l.id === editTruckId) || null;
  }, [editTruckId, myTrucksData]);

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

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
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

  const handleTruckSearch = useCallback(() => {
    setPage(1);
  }, []);

  const handleTruckClear = useCallback(() => {
    setFilterCurrentArea("");
    setFilterDestArea("");
    setFilterAvailDateFrom("");
    setFilterAvailDateTo("");
    setFilterArriveDateFrom("");
    setFilterArriveDateTo("");
    setFilterMinFare("");
    setFilterWeight("");
    setFilterVehicleType([]);
    setFilterExcludeNegotiable(false);
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    if (!listings) return [];
    let result = [...listings];

    if (filterCurrentArea) {
      result = result.filter((item) =>
        (item.currentArea || "").includes(filterCurrentArea)
      );
    }
    if (filterDestArea) {
      result = result.filter((item) =>
        (item.destinationArea || "").includes(filterDestArea)
      );
    }
    if (filterAvailDateFrom) {
      const from = filterAvailDateFrom.replace(/-/g, "/");
      result = result.filter((item) => (item.availableDate || "") >= from);
    }
    if (filterAvailDateTo) {
      const to = filterAvailDateTo.replace(/-/g, "/");
      result = result.filter((item) => (item.availableDate || "") <= to);
    }
    if (filterArriveDateFrom) {
      const from = filterArriveDateFrom.replace(/-/g, "/");
      result = result.filter((item) => (item.availableDate || "") >= from);
    }
    if (filterArriveDateTo) {
      const to = filterArriveDateTo.replace(/-/g, "/");
      result = result.filter((item) => (item.availableDate || "") <= to);
    }
    if (filterMinFare) {
      const minVal = parseInt(filterMinFare);
      if (!isNaN(minVal)) {
        result = result.filter((item) => {
          const p = parseInt(item.price?.replace(/[^0-9]/g, "") || "0");
          return p <= minVal;
        });
      }
    }
    if (filterExcludeNegotiable) {
      result = result.filter((item) => {
        const p = item.price || "";
        return !p.includes("相談") && !p.includes("応相談") && p !== "";
      });
    }
    if (filterWeight) {
      result = result.filter((item) =>
        (item.vehicleType || "").includes(filterWeight)
      );
    }
    if (filterVehicleType.length > 0) {
      result = result.filter((item) =>
        filterVehicleType.some((bt) => (item.bodyType || "").includes(bt))
      );
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
  }, [listings, sortBy, filterCurrentArea, filterDestArea, filterAvailDateFrom, filterAvailDateTo, filterArriveDateFrom, filterArriveDateTo, filterMinFare, filterWeight, filterVehicleType, filterExcludeNegotiable]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const searchContent = (
    <>
      <Card className="mb-4">
        <CardContent className="px-4 py-4 space-y-3">
          <span className="font-bold text-sm" data-testid="text-truck-filter-title">検索条件</span>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 flex-shrink-0">
              <Select value={filterCurrentArea || "all"} onValueChange={(v) => { setFilterCurrentArea(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="text-xs h-8 w-[110px]" data-testid="filter-truck-current-area">
                  <MapPin className="w-3 h-3 mr-1 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="空車地" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">空車地</SelectItem>
                  {PREFECTURES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground">⇄</span>
              <Select value={filterDestArea || "all"} onValueChange={(v) => { setFilterDestArea(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="text-xs h-8 w-[110px]" data-testid="filter-truck-dest-area">
                  <SelectValue placeholder="行先地" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">行先地</SelectItem>
                  {PREFECTURES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">発日</span>
              <Input type="date" value={filterAvailDateFrom} onChange={(e) => { setFilterAvailDateFrom(e.target.value); setPage(1); }} className="text-xs h-8 w-[135px]" placeholder="（開始）" data-testid="filter-truck-avail-date-from" />
              <span className="text-[11px] text-muted-foreground">〜</span>
              <Input type="date" value={filterAvailDateTo} onChange={(e) => { setFilterAvailDateTo(e.target.value); setPage(1); }} className="text-xs h-8 w-[135px]" placeholder="（終了）" data-testid="filter-truck-avail-date-to" />
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">着日</span>
              <Input type="date" value={filterArriveDateFrom} onChange={(e) => { setFilterArriveDateFrom(e.target.value); setPage(1); }} className="text-xs h-8 w-[135px]" placeholder="（開始）" data-testid="filter-truck-arrive-date-from" />
              <span className="text-[11px] text-muted-foreground">〜</span>
              <Input type="date" value={filterArriveDateTo} onChange={(e) => { setFilterArriveDateTo(e.target.value); setPage(1); }} className="text-xs h-8 w-[135px]" placeholder="（終了）" data-testid="filter-truck-arrive-date-to" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center border rounded-md h-8 bg-background flex-shrink-0">
              <input
                placeholder="最低運賃（税別）"
                value={filterMinFare}
                onChange={(e) => { setFilterMinFare(e.target.value); setPage(1); }}
                className="text-xs h-8 px-2.5 w-[110px] bg-transparent outline-none placeholder:text-muted-foreground"
                data-testid="filter-truck-min-fare"
              />
              <span className="text-[11px] text-muted-foreground pr-2 whitespace-nowrap">円以下</span>
            </div>
            <Select value={filterWeight || "all"} onValueChange={(v) => { setFilterWeight(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="text-xs h-8 w-[120px] flex-shrink-0" data-testid="filter-truck-weight">
                <SelectValue placeholder="車種" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">車種</SelectItem>
                {VEHICLE_TYPES.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-1 flex-shrink-0 relative" ref={bodyTypeRef}>
              <button
                type="button"
                className="flex items-center justify-between gap-1 text-xs h-8 w-[160px] rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => setBodyTypeDropdownOpen((v) => !v)}
                data-testid="filter-truck-vehicle-type"
              >
                <span className="truncate text-muted-foreground">
                  {filterVehicleType.length > 0 ? `車体タイプ(${filterVehicleType.length})` : "車体タイプ"}
                </span>
                <ChevronLeft className={`w-3 h-3 text-muted-foreground transition-transform ${bodyTypeDropdownOpen ? "-rotate-90" : "rotate-0"}`} />
              </button>
              {bodyTypeDropdownOpen && (
                <div className="absolute top-9 left-0 z-50 w-[200px] max-h-[260px] overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
                  {BODY_TYPES.map((bt) => (
                    <label key={bt} className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:bg-accent rounded text-xs">
                      <Checkbox
                        checked={filterVehicleType.includes(bt)}
                        onCheckedChange={(checked) => {
                          setFilterVehicleType((prev) =>
                            checked ? [...prev, bt] : prev.filter((x) => x !== bt)
                          );
                          setPage(1);
                        }}
                        className="h-3.5 w-3.5"
                      />
                      {bt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Checkbox id="truck-exclude-negotiable" checked={filterExcludeNegotiable} onCheckedChange={(v) => { setFilterExcludeNegotiable(!!v); setPage(1); }} data-testid="filter-truck-exclude-negotiable" className="h-3.5 w-3.5" />
            <label htmlFor="truck-exclude-negotiable" className="text-[11px] cursor-pointer select-none text-muted-foreground">要相談を除く</label>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <Button onClick={handleTruckSearch} className="px-8" data-testid="button-truck-search">
              <Search className="w-4 h-4 mr-1.5" />空車検索
            </Button>
            <Button variant="outline" onClick={handleTruckClear} data-testid="button-truck-clear">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />クリア
            </Button>
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
                <th className="text-center px-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">車体</th>
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
                  <td className="px-1.5 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-2 py-3"><Skeleton className="h-4 w-20" /></td>
                </tr>
              ))}

              {!isLoading && paginated.map((listing, index) => (
                <tr
                  key={listing.id}
                  className={`cursor-pointer transition-colors hover:bg-primary/20 ${index % 2 === 1 ? "bg-muted/20" : ""} ${selectedTruckId === listing.id ? "bg-primary/25" : ""}`}
                  onClick={() => setSelectedTruckId(listing.id)}
                  data-testid={`row-truck-${listing.id}`}
                >
                  <td className="px-2 py-3 align-top max-w-[120px]">
                    <div className="font-bold text-foreground text-[13px] leading-tight truncate">{listing.companyName}</div>
                    {listing.createdAt && (Date.now() - new Date(listing.createdAt).getTime() < 24 * 60 * 60 * 1000) && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold border bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 animate-pulse mt-0.5" data-testid={`badge-new-truck-${listing.id}`}>New</span>
                    )}
                    <div className="text-[11px] text-foreground mt-0.5 font-bold truncate">{listing.title || `${listing.currentArea}→${listing.destinationArea || ''} ${listing.vehicleType || ''}`.trim()}</div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <div className="flex items-start gap-1 min-w-0 w-[120px] shrink-0">
                        <Navigation className="w-3 h-3 fill-primary text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-bold text-[14px] text-foreground">{listing.availableDate}</div>
                          <div className="text-[13px] text-foreground font-bold">{listing.currentArea}</div>
                          {listing.currentAddress && <div className="text-[11px] text-muted-foreground">{listing.currentAddress}</div>}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-foreground/50 shrink-0" />
                      <div className="flex items-start gap-1 min-w-0">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[13px] text-foreground font-bold">{listing.destinationArea}</div>
                          {listing.destinationAddress && <div className="text-[11px] text-muted-foreground">{listing.destinationAddress}</div>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right align-top">
                    <div className="font-bold text-[15px] text-foreground whitespace-nowrap">
                      {listing.price ? `¥${formatPrice(listing.price)}` : "要相談"}
                    </div>
                  </td>
                  <td className="px-1.5 py-3 text-center align-top">
                    <span className="whitespace-nowrap text-[13px] text-foreground font-bold">{listing.maxWeight || "-"}</span>
                  </td>
                  <td className="px-1.5 py-3 text-center align-top">
                    <div className="text-[13px] text-foreground whitespace-nowrap font-bold">{listing.vehicleType}</div>
                  </td>
                  <td className="px-1.5 py-3 text-center align-top">
                    <div className="text-[13px] text-foreground whitespace-nowrap font-bold">{listing.bodyType || "-"}</div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <span className="text-foreground text-[12px] leading-relaxed line-clamp-2 max-w-[140px] font-bold">
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

  const registerTabBar = (hasMarginBottom: boolean) => (
    <div className={`flex items-center gap-0 border-b border-border ${hasMarginBottom ? "mb-5" : ""}`}>
      <button
        onClick={() => setActiveTab("register")}
        className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === "register" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
        data-testid="tab-truck-register"
      >
        <Plus className="w-3.5 h-3.5 inline mr-1.5" />
        AI空車登録
      </button>
      <button
        onClick={() => setActiveTab("my")}
        className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === "my" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
        data-testid="tab-truck-my"
      >
        <FileText className="w-3.5 h-3.5 inline mr-1.5" />
        登録した空車
      </button>
    </div>
  );

  if (isAuthenticated && isRegisterPage) {
    return (
      <DashboardLayout noScroll>
        <div className="flex h-full relative overflow-hidden">
          {activeTab === "register" ? (
            <TruckRegisterTab tabBar={registerTabBar} />
          ) : (
            <>
              <div className={`flex-1 flex flex-col overflow-hidden ${editTruckId ? "hidden lg:flex" : ""}`}>
                <div className="px-4 sm:px-6 pt-4 shrink-0">
                  {registerTabBar(false)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <MyTrucksTab selectedTruckId={editTruckId} onSelectTruck={setEditTruckId} />
                </div>
              </div>
              {editTruckId && editTruck && (
                <TruckEditPanel
                  listing={editTruck}
                  onClose={() => setEditTruckId(null)}
                />
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (isAuthenticated) {
    return (
      <DashboardLayout noScroll>
        <div className="flex h-full relative overflow-hidden">
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedTruckId ? "hidden lg:block" : ""}`}>
            <div className="px-4 sm:px-6 py-4">
              {searchContent}
            </div>
          </div>
          {selectedTruckId && (
            <TruckDetailPanel
              listing={selectedTruck}
              onClose={() => setSelectedTruckId(null)}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {searchContent}
    </div>
  );
}
