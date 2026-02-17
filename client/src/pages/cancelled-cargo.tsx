import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, Package, MapPin, ArrowRight, Calendar, Weight, Truck, Clock, Eye, CircleDot, Phone, Loader2, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";

function CancelledCard({ item, onReactivate, isReactivating, isSelected, onSelect }: { item: CargoListing; onReactivate: () => void; isReactivating: boolean; isSelected: boolean; onSelect: () => void }) {
  const createdDate = new Date(item.createdAt);
  const dateStr = `${createdDate.getFullYear()}/${String(createdDate.getMonth() + 1).padStart(2, "0")}/${String(createdDate.getDate()).padStart(2, "0")}`;

  return (
    <Card className={`hover-elevate cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`} data-testid={`card-cancelled-cargo-${item.id}`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid={`link-cancelled-title-${item.id}`}>
                {item.title}
              </span>
              {item.transportType && (
                <Badge variant="outline" className={`text-xs ${item.transportType === "スポット" ? "border-blue-300 text-blue-600" : "border-primary/30 text-primary"}`}>
                  {item.transportType}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                <XCircle className="w-3 h-3 mr-1" />
                不成約
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{item.departureArea}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground mx-1" />
              <span className="font-medium text-foreground">{item.arrivalArea}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              {item.desiredDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.desiredDate}
                </span>
              )}
              {item.cargoType && (
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {item.cargoType}
                </span>
              )}
              {item.weight && (
                <span className="flex items-center gap-1">
                  <Weight className="w-3 h-3" />
                  {item.weight}
                </span>
              )}
              {item.vehicleType && (
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {item.vehicleType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {item.price && (
                <span className="text-sm font-semibold text-primary">
                  {formatPrice(item.price)}円
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                {item.viewCount ?? 0}人が閲覧
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                登録日: {dateStr}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onReactivate(); }}
              disabled={isReactivating}
              className="text-green-600 border-green-300"
              data-testid={`button-reactivate-cancelled-${item.id}`}
            >
              <CircleDot className="w-3.5 h-3.5 mr-1" />
              再掲載する
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
            <span className="text-xs text-muted-foreground font-bold">{listing.highwayFee ? (listing.highwayFee.includes("高速代") ? listing.highwayFee : `高速代：${listing.highwayFee}`) : ""}</span>
          </div>

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
              <Badge variant="default">不成約</Badge>
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

export default function CancelledCargo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);

  const { data: allCargo, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const cancelledCargo = allCargo?.filter((c) => c.userId === user?.id && c.status === "cancelled") ?? [];
  const sorted = [...cancelledCargo].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">成約しなかった荷物</h1>
              <p className="text-sm text-muted-foreground mt-1">
                不成約となった荷物情報の一覧
                {sorted.length > 0 && <span className="ml-2">({sorted.length}件)</span>}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground" data-testid="text-empty-state">不成約の荷物はありません</p>
                  <p className="text-xs text-muted-foreground mt-2">「登録した荷物」ページから荷物を不成約にできます</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sorted.map((item) => (
                  <CancelledCard
                    key={item.id}
                    item={item}
                    onReactivate={() => reactivate.mutate(item.id)}
                    isReactivating={reactivate.isPending}
                    isSelected={selectedCargoId === item.id}
                    onSelect={() => setSelectedCargoId(item.id)}
                  />
                ))}
              </div>
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
