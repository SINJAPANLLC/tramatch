import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Search, MapPin, Phone, User, Truck, Globe, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

function CompanyCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

export default function Companies() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "carrier" | "shipper">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const filtered = companies?.filter((c) => {
    if (filterType === "all") return true;
    return c.userType === filterType;
  }) ?? [];

  const userTypeBadge = (type: string) => {
    if (type === "carrier") return <Badge variant="default" className="text-xs shrink-0">運送会社</Badge>;
    if (type === "shipper") return <Badge variant="secondary" className="text-xs shrink-0">荷主</Badge>;
    return <Badge variant="outline" className="text-xs shrink-0">{type}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">企業検索</h1>
          <p className="text-sm text-muted-foreground mt-1">運送会社・荷主企業を検索</p>
        </div>

        <Card className="mb-6">
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

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            data-testid="button-filter-all"
          >
            全て
          </Button>
          <Button
            variant={filterType === "carrier" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("carrier")}
            data-testid="button-filter-carrier"
          >
            <Truck className="w-4 h-4 mr-1.5" />
            運送会社
          </Button>
          <Button
            variant={filterType === "shipper" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("shipper")}
            data-testid="button-filter-shipper"
          >
            <Building className="w-4 h-4 mr-1.5" />
            荷主
          </Button>
          {companies && searchQuery && (
            <span className="text-sm text-muted-foreground ml-2">
              {filtered.length}件の結果
            </span>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
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
          <div className="space-y-3">
            {filtered.map((company) => {
              const isExpanded = expandedId === company.id;
              return (
                <Card
                  key={company.id}
                  className="cursor-pointer hover-elevate"
                  data-testid={`card-company-${company.id}`}
                  onClick={() => setExpandedId(isExpanded ? null : company.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">{company.companyName}</h3>
                        {userTypeBadge(company.userType)}
                      </div>
                      <Button variant="ghost" size="icon" data-testid={`button-expand-${company.id}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                      {company.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span>{company.address}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.contactName && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span>担当: {company.contactName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        {company.truckCount && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-primary" />
                            {company.truckCount}台
                          </span>
                        )}
                        {company.businessArea && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-primary" />
                            {company.businessArea}
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                        {company.companyNameKana && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-[100px]">フリガナ:</span>
                            <span className="text-foreground">{company.companyNameKana}</span>
                          </div>
                        )}
                        {company.representative && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-[100px]">代表者:</span>
                            <span className="text-foreground">{company.representative}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-[100px]">メール:</span>
                            <span className="text-foreground">{company.email}</span>
                          </div>
                        )}
                        {company.fax && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-[100px]">FAX:</span>
                            <span className="text-foreground">{company.fax}</span>
                          </div>
                        )}
                        {company.businessDescription && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-[100px]">事業内容:</span>
                            <span className="text-foreground">{company.businessDescription}</span>
                          </div>
                        )}
                        {company.transportLicenseNumber && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-[100px]">
                              <FileText className="w-3.5 h-3.5 inline mr-1" />
                              許可番号:
                            </span>
                            <span className="text-foreground">{company.transportLicenseNumber}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
