import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Search, MapPin, Phone, User, Truck, Globe, FileText, X, Mail, Briefcase } from "lucide-react";
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

function DetailRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-1.5">
      {icon && <div className="shrink-0 mt-0.5 text-primary">{icon}</div>}
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground break-words">{value}</div>
      </div>
    </div>
  );
}

function CompanyDetailPanel({ company, onClose }: { company: CompanyResult; onClose: () => void }) {
  return (
    <div className="w-[340px] shrink-0 border-l border-border bg-background overflow-y-auto" data-testid="panel-company-detail">
      <div className="sticky top-0 bg-background z-10 px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <h2 className="font-bold text-sm text-foreground truncate">{company.companyName}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-company-panel">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-4 py-4 space-y-1">
        {company.companyNameKana && (
          <p className="text-xs text-muted-foreground mb-3">{company.companyNameKana}</p>
        )}

        <div className="border-b border-border pb-3 mb-3">
          <h3 className="text-xs font-bold text-muted-foreground mb-2">基本情報</h3>
          <DetailRow label="住所" value={company.address} icon={<MapPin className="w-3.5 h-3.5" />} />
          <DetailRow label="電話番号" value={company.phone} icon={<Phone className="w-3.5 h-3.5" />} />
          <DetailRow label="FAX" value={company.fax} icon={<Phone className="w-3.5 h-3.5" />} />
          <DetailRow label="メール" value={company.email} icon={<Mail className="w-3.5 h-3.5" />} />
        </div>

        <div className="border-b border-border pb-3 mb-3">
          <h3 className="text-xs font-bold text-muted-foreground mb-2">担当者・代表者</h3>
          <DetailRow label="担当者" value={company.contactName} icon={<User className="w-3.5 h-3.5" />} />
          <DetailRow label="代表者" value={company.representative} icon={<User className="w-3.5 h-3.5" />} />
        </div>

        <div className="border-b border-border pb-3 mb-3">
          <h3 className="text-xs font-bold text-muted-foreground mb-2">事業情報</h3>
          <DetailRow label="保有台数" value={company.truckCount ? `${company.truckCount}台` : null} icon={<Truck className="w-3.5 h-3.5" />} />
          <DetailRow label="対応エリア" value={company.businessArea} icon={<Globe className="w-3.5 h-3.5" />} />
          <DetailRow label="事業内容" value={company.businessDescription} icon={<Briefcase className="w-3.5 h-3.5" />} />
          <DetailRow label="許可番号" value={company.transportLicenseNumber} icon={<FileText className="w-3.5 h-3.5" />} />
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
