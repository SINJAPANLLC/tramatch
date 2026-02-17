import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight, Truck, Loader2, Phone, X, FileText, CreditCard } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";

function formatDateCompact(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const cleaned = dateStr.replace(/\//g, "-");
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return dateStr;
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

function formatDateFull(dateStr: string | null | undefined) {
  if (!dateStr) return "指定なし";
  const cleaned = dateStr.replace(/\//g, "-");
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return dateStr;
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`;
}

function DetailRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: React.ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div className="w-[120px] shrink-0 bg-muted/30 px-3 py-2.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex-1 px-3 py-2.5 text-sm text-foreground whitespace-pre-wrap">{children || value || "-"}</div>
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
  const [panelTab, setPanelTab] = useState<"deal" | "company" | "request">("deal");
  const { toast } = useToast();

  const reactivateMutation = useMutation({
    mutationFn: async (cargoId: string) => {
      await apiRequest("PATCH", `/api/cargo/${cargoId}/status`, { status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "掲載中に戻しました" });
    },
    onError: () => {
      toast({ title: "エラー", description: "処理に失敗しました", variant: "destructive" });
    },
  });

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
    setPanelTab("deal");
  }, [listing?.id]);

  const handlePrint = () => {
    if (!listing) return;
    const row = (label: string, value: string | null | undefined) =>
      `<tr><td style="padding:6px 10px;font-weight:bold;white-space:nowrap;border:1px solid #ddd;background:#f9f9f9;font-size:13px;width:140px">${label}</td><td style="padding:6px 10px;border:1px solid #ddd;font-size:13px">${value || "-"}</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>成約情報 - ${listing.companyName}</title>
<style>body{font-family:'Hiragino Sans','Meiryo',sans-serif;margin:20px;color:#333}h2{font-size:18px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px}table{border-collapse:collapse;width:100%;margin-bottom:16px}.header{text-align:center;margin-bottom:24px}.header h1{font-size:22px;color:#40E0D0;margin:0}@media print{body{margin:10px}}</style></head><body>
<div class="header"><h1>トラマッチ 成約情報</h1><p style="font-size:12px;color:#888">印刷日: ${new Date().toLocaleString("ja-JP")}</p></div>
<h2>成約情報</h2>
<table>${row("成約番号", listing.cargoNumber ? String(listing.cargoNumber) : "-")}${row("企業名", listing.companyName)}${row("担当者", listing.contactPerson)}${row("連絡先", listing.contactPhone)}${row("荷種", listing.cargoType)}${row("車種", listing.vehicleType)}${row("運賃", listing.price ? `${formatPrice(listing.price)}円(税別)` : "要相談")}${row("高速代", listing.highwayFee || "なし")}${row("発日時", `${formatDateFull(listing.desiredDate)} ${listing.departureTime || ""}`)}${row("発地", `${listing.departureArea} ${listing.departureAddress || ""}`)}${row("着日時", `${formatDateFull(listing.arrivalDate)} ${listing.arrivalTime || ""}`)}${row("着地", `${listing.arrivalArea} ${listing.arrivalAddress || ""}`)}${row("備考", listing.description)}</table></body></html>`;
    const printWindow = window.open("", "_blank");
    if (printWindow) { printWindow.document.write(html); printWindow.document.close(); printWindow.onload = () => { printWindow.print(); }; }
  };

  if (!listing) {
    return (
      <div className="w-[440px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  const createdDate = new Date(listing.createdAt);
  const changeLimitDate = new Date(createdDate);
  changeLimitDate.setDate(changeLimitDate.getDate() + 5);
  changeLimitDate.setHours(23, 59, 0, 0);

  return (
    <div className="w-[440px] shrink-0 border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-cargo-detail">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
          <div className="flex items-center gap-0.5">
            {[
              { key: "deal" as const, label: "成約情報" },
              { key: "company" as const, label: "企業情報" },
              { key: "request" as const, label: "依頼書" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPanelTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${panelTab === tab.key ? "text-primary border border-primary bg-primary/5" : "text-muted-foreground"}`}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={handlePrint} data-testid="button-print">
              印刷
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {panelTab === "deal" ? (
        <div className="p-3 space-y-3">
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="成約番号" value={listing.cargoNumber ? String(listing.cargoNumber) : "-"} />
            <DetailRow label="成約日時" value={createdDate.toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })} />
            <DetailRow label="変更期限">
              <span className="text-destructive font-bold text-xs">
                {changeLimitDate.toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </DetailRow>
            <DetailRow label="おまかせ請求" value="対象外" />
            <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-muted/20 border-b border-border">最新状態は取引で確認してください</div>
            <DetailRow label="荷物番号" value={listing.cargoNumber ? String(listing.cargoNumber) : "未設定"} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="運送会社">
              <div>
                <div className="font-bold">{listing.companyName}</div>
                {listing.contactPerson && <div className="text-xs text-muted-foreground mt-0.5">担当者：{listing.contactPerson}</div>}
                <div className="text-xs text-muted-foreground">TEL：{listing.contactPhone}</div>
                {companyInfo?.fax && <div className="text-xs text-muted-foreground">FAX：{companyInfo.fax}</div>}
              </div>
            </DetailRow>
            <DetailRow label="荷主会社">
              <div>
                <div className="font-bold">{companyInfo?.companyName || listing.companyName}</div>
                {companyInfo?.contactName && <div className="text-xs text-muted-foreground mt-0.5">担当者：{companyInfo.contactName}</div>}
              </div>
            </DetailRow>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="発日時">
              <span className="font-bold">{formatDateFull(listing.desiredDate)} {listing.departureTime || ""}</span>
            </DetailRow>
            <DetailRow label="発地">
              <span className="font-bold">{listing.departureArea} {listing.departureAddress || ""}</span>
            </DetailRow>
            <DetailRow label="積み時間" value={listing.loadingTime || ""} />
            <DetailRow label="着日時">
              <span className="font-bold">{formatDateFull(listing.arrivalDate)} {listing.arrivalTime || ""}</span>
            </DetailRow>
            <DetailRow label="着地">
              <span className="font-bold">{listing.arrivalArea} {listing.arrivalAddress || ""}</span>
            </DetailRow>
            <DetailRow label="卸し時間" value={listing.unloadingTime || ""} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="荷種" value={listing.cargoType} />
            <DetailRow label="引越し案件" value={listing.movingJob === "あり" ? "あり" : "×"} />
            <DetailRow label="積合" value={listing.consolidation || "不可"} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="希望車種">
              <div>
                <span>重量：{listing.weight || "-"} 車種：{listing.vehicleType}{listing.bodyType ? ` / ${listing.bodyType}` : ""}</span>
              </div>
            </DetailRow>
            <DetailRow label="車両指定" value={listing.vehicleSpec || "指定なし"} />
            <DetailRow label="必要装備" value={listing.equipment || ""} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="運賃">
              <span className="font-bold text-base">{listing.price ? `${formatPrice(listing.price)}円(税別)` : "要相談"}</span>
            </DetailRow>
            <DetailRow label="高速代" value={listing.highwayFee || "金額未定"} />
            <DetailRow label="待機料" value="金額未定" />
            <DetailRow label="付帯作業料" value="金額未定" />
            <DetailRow label="搬出料" value="金額未定" />
            <DetailRow label="駐車代" value="金額未定" />
            <DetailRow label="通関料" value="金額未定" />
            <DetailRow label="燃料サーチャージ" value="金額未定" />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="備考" value={listing.description} />
            <DetailRow label="入金予定日" value={listing.paymentDate || "支払サイトに準拠"} />
          </div>

          <Button
            variant="outline"
            className="w-full text-green-600 border-green-300"
            onClick={() => reactivateMutation.mutate(listing.id)}
            disabled={reactivateMutation.isPending}
            data-testid="button-reactivate"
          >
            {reactivateMutation.isPending ? "処理中..." : "掲載に戻す"}
          </Button>
        </div>
      ) : panelTab === "company" ? (
        <div className="p-3 space-y-3">
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
      ) : (
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">依頼書</h3>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="成約番号" value={listing.cargoNumber ? String(listing.cargoNumber) : "-"} />
            <DetailRow label="荷物番号" value={listing.cargoNumber ? String(listing.cargoNumber) : "-"} />
            <DetailRow label="成約日" value={createdDate.toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="荷主">
              <div className="font-bold">{companyInfo?.companyName || listing.companyName}</div>
            </DetailRow>
            <DetailRow label="運送会社">
              <div className="font-bold">{listing.companyName}</div>
            </DetailRow>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="発地">
              <div>
                <div className="font-bold">{listing.departureArea} {listing.departureAddress || ""}</div>
                <div className="text-xs text-muted-foreground">{formatDateFull(listing.desiredDate)} {listing.departureTime || ""}</div>
              </div>
            </DetailRow>
            <DetailRow label="着地">
              <div>
                <div className="font-bold">{listing.arrivalArea} {listing.arrivalAddress || ""}</div>
                <div className="text-xs text-muted-foreground">{formatDateFull(listing.arrivalDate)} {listing.arrivalTime || ""}</div>
              </div>
            </DetailRow>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="荷種" value={listing.cargoType} />
            <DetailRow label="車種" value={`${listing.vehicleType}${listing.bodyType ? ` / ${listing.bodyType}` : ""}`} />
            <DetailRow label="重量" value={listing.weight || "-"} />
            <DetailRow label="積合" value={listing.consolidation || "不可"} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="運賃">
              <span className="font-bold">{listing.price ? `${formatPrice(listing.price)}円(税別)` : "要相談"}</span>
            </DetailRow>
            <DetailRow label="高速代" value={listing.highwayFee || "なし"} />
            <DetailRow label="備考" value={listing.description} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={handlePrint} data-testid="button-print-request">
              <FileText className="w-3.5 h-3.5 mr-1" />
              依頼書を印刷
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletedCargoTable({ items, selectedId, onSelect, onReactivate, isReactivating }: {
  items: CargoListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReactivate: (id: string) => void;
  isReactivating: boolean;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground" data-testid="text-empty-state">成約した荷物はまだありません</p>
          <p className="text-xs text-muted-foreground mt-2">「登録した荷物」ページから荷物を成約済みにできます</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs" data-testid="table-completed-cargo">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">成約番号</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">状態</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">運送会社</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">発日時・発地</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">着日時・着地</th>
              <th className="text-right px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">運賃</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">高速代</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">車種</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">車</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">入金予定日</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-muted/30 ${selectedId === item.id ? "bg-primary/5" : ""}`}
                onClick={() => onSelect(item.id)}
                data-testid={`row-completed-cargo-${item.id}`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap font-bold">{item.cargoNumber || "-"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600">成約</Badge>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-bold">{item.companyName}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-bold">{formatDateCompact(item.desiredDate)} {item.departureTime || ""}</div>
                  <div className="text-muted-foreground">{item.departureArea}{item.departureAddress ? ` ${item.departureAddress}` : ""}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-bold">{formatDateCompact(item.arrivalDate)} {item.arrivalTime || ""}</div>
                  <div className="text-muted-foreground">{item.arrivalArea}{item.arrivalAddress ? ` ${item.arrivalAddress}` : ""}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-right font-bold">
                  {item.price ? `${formatPrice(item.price)}円` : "-"}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.highwayFee || "なし"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.vehicleType || "-"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.bodyType || "-"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.paymentDate || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CompletedCargo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<"own" | "contracted" | "billing">("own");

  const { data: allCargo, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const completedCargo = allCargo?.filter((c) => c.userId === user?.id && c.status === "completed") ?? [];
  const sorted = [...completedCargo].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedCargo = useMemo(() => {
    if (!selectedCargoId || !allCargo) return null;
    return allCargo.find((l) => l.id === selectedCargoId) || null;
  }, [selectedCargoId, allCargo]);

  const reactivate = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/cargo/${id}/status`, { status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      toast({ title: "掲載中に戻しました" });
    },
  });

  const mainTabs = [
    { key: "own" as const, label: "自社荷物の成約", icon: Package },
    { key: "contracted" as const, label: "受託荷物の成約", icon: Truck },
    { key: "billing" as const, label: "請求・支払", icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-4">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">成約した荷物</h1>
              <p className="text-sm text-muted-foreground mt-1">
                成約済みの荷物情報の管理
                {sorted.length > 0 && <span className="ml-2">({sorted.length}件)</span>}
              </p>
            </div>

            <div className="flex items-center gap-1 border-b border-border mb-4">
              {mainTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setMainTab(tab.key); setSelectedCargoId(null); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-[1px] ${
                    mainTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`tab-main-${tab.key}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : mainTab === "own" ? (
              <CompletedCargoTable
                items={sorted}
                selectedId={selectedCargoId}
                onSelect={setSelectedCargoId}
                onReactivate={(id) => reactivate.mutate(id)}
                isReactivating={reactivate.isPending}
              />
            ) : mainTab === "contracted" ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-bold" data-testid="text-contracted-empty">受託荷物の成約はまだありません</p>
                  <p className="text-xs text-muted-foreground mt-2">他社から受託した荷物の成約情報がここに表示されます</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-bold" data-testid="text-billing-empty">請求・支払情報はまだありません</p>
                  <p className="text-xs text-muted-foreground mt-2">成約した荷物の請求・支払情報がここに表示されます</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {selectedCargoId && selectedCargo && (
          <CargoDetailPanel listing={selectedCargo} onClose={() => setSelectedCargoId(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
