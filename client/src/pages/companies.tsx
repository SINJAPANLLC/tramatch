import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building, Search, MapPin, Phone, User, Truck, Globe, FileText, X, Mail, Briefcase, Package, Loader2, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";

type CompanyResult = {
  id: string;
  companyName: string;
  companyNameKana: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  contactName: string | null;
  userType: string;
  truckCount: string | null;
  businessArea: string | null;
  representative: string | null;
  businessDescription: string | null;
  transportLicenseNumber: string | null;
};

type CompanyDetail = {
  companyName: string;
  companyNameKana: string | null;
  address: string | null;
  postalCode: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  contactName: string | null;
  userType: string;
  truckCount: string | null;
  businessArea: string | null;
  representative: string | null;
  businessDescription: string | null;
  transportLicenseNumber: string | null;
  websiteUrl: string | null;
  invoiceRegistrationNumber: string | null;
  registrationDate: string | null;
  establishedDate: string | null;
  capital: string | null;
  employeeCount: string | null;
  officeLocations: string | null;
  annualRevenue: string | null;
  bankInfo: string | null;
  majorClients: string | null;
  closingDay: string | null;
  paymentMonth: string | null;
  paymentTerms: string | null;
  memberOrganization: string | null;
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

function DetailRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: React.ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div className="w-[100px] sm:w-[130px] shrink-0 bg-muted/30 px-2 sm:px-3 py-2.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex-1 px-3 py-2.5 text-sm font-bold text-foreground whitespace-pre-wrap">{children || value || "-"}</div>
    </div>
  );
}

function CompanyDetailPanel({ company, onClose }: { company: CompanyResult; onClose: () => void }) {
  const { data: detail, isLoading } = useQuery<CompanyDetail>({
    queryKey: ["/api/companies", company.id],
    enabled: !!company.id,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    const info = detail || company;
    const row = (label: string, value: string | null | undefined) =>
      `<tr><td style="padding:6px 10px;font-weight:bold;white-space:nowrap;border:1px solid #ddd;background:#f9f9f9;font-size:13px;width:140px">${label}</td><td style="padding:6px 10px;border:1px solid #ddd;font-size:13px">${value || "-"}</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>企業情報 - ${info.companyName}</title>
<style>body{font-family:'Hiragino Sans','Meiryo',sans-serif;margin:20px;color:#333}
h2{font-size:18px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px}
table{border-collapse:collapse;width:100%;margin-bottom:16px}
.header{text-align:center;margin-bottom:24px}
.header h1{font-size:22px;color:#40E0D0;margin:0}
@media print{body{margin:10px}}</style></head><body>
<div class="header"><h1>トラマッチ 企業情報</h1><p style="font-size:12px;color:#888">印刷日: ${new Date().toLocaleString("ja-JP")}</p></div>
<h2>基本情報</h2>
<table>
${row("法人名・事業者名", info.companyName)}
${row("住所", detail?.postalCode ? `〒${detail.postalCode} ${detail.address || "-"}` : info.address)}
${row("電話番号", info.phone)}
${row("FAX番号", info.fax)}
${row("メール", info.email)}
${row("請求事業者登録番号", detail?.invoiceRegistrationNumber)}
${row("業務内容・会社PR", info.businessDescription)}
${row("保有車両台数", info.truckCount ? `${info.truckCount} 台` : "-")}
${row("ウェブサイトURL", detail?.websiteUrl)}
</table>
<h2>詳細情報</h2>
<table>
${row("代表者", info.representative)}
${row("設立", detail?.establishedDate)}
${row("資本金", detail?.capital ? `${detail.capital} 万円` : "-")}
${row("従業員数", detail?.employeeCount)}
${row("事業所所在地", detail?.officeLocations)}
${row("年間売上", detail?.annualRevenue ? `${detail.annualRevenue} 万円` : "-")}
${row("取引先銀行", detail?.bankInfo)}
${row("主要取引先", detail?.majorClients)}
${row("営業地域", info.businessArea)}
</table>
<h2>信用情報</h2>
<table>
${row("加入組織", detail?.memberOrganization)}
${row("国交省認可番号", info.transportLicenseNumber)}
${row("安全性優良事業所", detail?.safetyExcellenceCert || "無")}
${row("グリーン経営認証", detail?.greenManagementCert || "無")}
${row("ISO9000", detail?.iso9000 || "無")}
${row("ISO14000", detail?.iso14000 || "無")}
${row("ISO39001", detail?.iso39001 || "無")}
${row("荷物保険", detail?.cargoInsurance)}
</table>
</body></html>`;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => { printWindow.print(); };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full sm:w-[420px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[420px] shrink-0 border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-company-detail">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
          <span className="text-sm font-bold text-foreground">企業情報</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={handlePrint} data-testid="button-company-print">
              印刷
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-company-panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="text-base font-bold text-foreground">{detail?.companyName || company.companyName}</h3>

        <Card className="p-3">
          <div className="text-xs font-bold text-muted-foreground mb-3">トラマッチでの実績</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-bold">委託</span>
              </div>
              <div className="text-xs text-muted-foreground font-bold">成約 <span className="text-lg text-foreground">{detail?.cargoCount1m ?? 0}</span></div>
              <div className="text-xs text-muted-foreground font-bold">登録 <span className="text-lg text-foreground">{detail?.cargoCount3m ?? 0}</span></div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-bold">受託</span>
              </div>
              <div className="text-xs text-muted-foreground font-bold">成約 <span className="text-lg text-foreground">{detail?.truckCount1m ?? 0}</span></div>
              <div className="text-xs text-muted-foreground font-bold">登録 <span className="text-lg text-foreground">{detail?.truckCount3m ?? 0}</span></div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground font-bold text-right mt-2">
            トラマッチ登録年月 {detail?.registrationDate || "-"}
          </div>
        </Card>

        <h4 className="text-sm font-bold text-foreground">基本情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="法人名・事業者名">
            <div>
              {(detail?.companyNameKana || company.companyNameKana) && (
                <div className="text-[10px] text-muted-foreground mb-0.5">{detail?.companyNameKana || company.companyNameKana}</div>
              )}
              <div className="text-primary font-bold">{detail?.companyName || company.companyName}</div>
            </div>
          </DetailRow>
          <DetailRow label="住所" value={detail?.postalCode ? `〒${detail.postalCode}\n${detail.address || "-"}` : company.address} />
          <DetailRow label="電話番号" value={detail?.phone || company.phone} />
          <DetailRow label="FAX番号" value={detail?.fax || company.fax} />
          <DetailRow label="請求事業者登録番号" value={detail?.invoiceRegistrationNumber} />
          <DetailRow label="業務内容・会社PR" value={detail?.businessDescription || company.businessDescription} />
          <DetailRow label="保有車両台数" value={(detail?.truckCount || company.truckCount) ? `${detail?.truckCount || company.truckCount} 台` : "-"} />
          <DetailRow label="ウェブサイトURL" value={detail?.websiteUrl} />
          <DetailRow label="登録年月" value={detail?.registrationDate} />
        </div>

        <h4 className="text-sm font-bold text-foreground">詳細情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="代表者" value={detail?.representative || company.representative} />
          <DetailRow label="設立" value={detail?.establishedDate} />
          <DetailRow label="資本金" value={detail?.capital ? `${detail.capital} 万円` : null} />
          <DetailRow label="従業員数" value={detail?.employeeCount} />
          <DetailRow label="事業所所在地" value={detail?.officeLocations} />
          <DetailRow label="年間売上" value={detail?.annualRevenue ? `${detail.annualRevenue} 万円` : null} />
          <DetailRow label="取引先銀行" value={detail?.bankInfo} />
          <DetailRow label="主要取引先" value={detail?.majorClients} />
          <DetailRow label="締め日" value={detail?.closingDay} />
          <DetailRow label="支払月・支払日" value={detail?.paymentMonth} />
          <DetailRow label="営業地域" value={detail?.businessArea || company.businessArea} />
        </div>

        <h4 className="text-sm font-bold text-foreground">信用情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="加入組織" value={detail?.memberOrganization} />
          <DetailRow label="国交省認可番号" value={detail?.transportLicenseNumber || company.transportLicenseNumber} />
          <DetailRow label="デジタコ搭載数" value={detail?.digitalTachographCount} />
          <DetailRow label="GPS搭載数" value={detail?.gpsCount} />
          <DetailRow label="安全性優良事業所" value={detail?.safetyExcellenceCert || "無"} />
          <DetailRow label="グリーン経営認証" value={detail?.greenManagementCert || "無"} />
          <DetailRow label="ISO9000" value={detail?.iso9000 || "無"} />
          <DetailRow label="ISO14000" value={detail?.iso14000 || "無"} />
          <DetailRow label="ISO39001" value={detail?.iso39001 || "無"} />
          <DetailRow label="荷物保険" value={detail?.cargoInsurance} />
        </div>
      </div>
    </div>
  );
}

export default function Companies() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: companies, isLoading } = useQuery<CompanyResult[]>({
    queryKey: [`/api/companies/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length > 0,
  });

  const filtered = companies ?? [];
  const selectedCompany = filtered.find(c => c.id === selectedId) || null;

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto transition-all duration-300">
          <div className="px-4 sm:px-6 py-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">企業検索</h1>
              <p className="text-sm text-muted-foreground mt-1">登録企業を検索</p>
            </div>

            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="企業名、地域、キーワードで検索..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                        data-testid="input-company-search"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {companies && searchQuery && (
              <div className="mb-3">
                <span className="text-sm text-muted-foreground">{filtered.length}件の結果</span>
              </div>
            )}

            {isLoading && (
              <Card>
                <div className="divide-y divide-border">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!isLoading && searchQuery.length > 0 && filtered.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground" data-testid="text-no-results">検索結果が見つかりませんでした</p>
                  <p className="text-xs text-muted-foreground mt-2">別のキーワードで検索してみてください</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && searchQuery.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground" data-testid="text-empty-state">企業を検索してください</p>
                  <p className="text-xs text-muted-foreground mt-2">企業名や地域名を入力して検索できます</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && filtered.length > 0 && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-companies">
                    <thead>
                      <tr className="border-b bg-muted/60">
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">企業名</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">住所</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">電話番号</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">担当者</th>
                        <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">台数</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">対応エリア</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((company, index) => (
                        <tr
                          key={company.id}
                          className={`hover-elevate cursor-pointer transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""} ${selectedId === company.id ? "bg-primary/10" : ""}`}
                          onClick={() => setSelectedId(selectedId === company.id ? null : company.id)}
                          data-testid={`row-company-${company.id}`}
                        >
                          <td className="px-3 py-3 align-top max-w-[180px]">
                            <div className="font-bold text-foreground text-[12px] leading-tight truncate">{company.companyName}</div>
                            {company.companyNameKana && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{company.companyNameKana}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 align-top">
                            <span className="text-[12px] text-muted-foreground">{company.address || "-"}</span>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <span className="text-[12px] text-muted-foreground whitespace-nowrap">{company.phone || "-"}</span>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <span className="text-[12px] text-muted-foreground">{company.contactName || "-"}</span>
                          </td>
                          <td className="px-3 py-3 text-center align-top">
                            <span className="text-[12px] font-bold">{company.truckCount ? `${company.truckCount}台` : "-"}</span>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <span className="text-[12px] text-muted-foreground">{company.businessArea || "-"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>

        {selectedCompany && (
          <CompanyDetailPanel
            company={selectedCompany}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
