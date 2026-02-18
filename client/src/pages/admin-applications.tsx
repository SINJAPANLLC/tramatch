import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, X, FileText, Building2, Phone, Mail, MapPin, Truck, User, Clock, Image, ExternalLink, ChevronDown, ChevronUp, Shield, Globe, Hash, Briefcase } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

type SafeUser = {
  id: string;
  username: string;
  companyName: string;
  companyNameKana?: string;
  phone: string;
  email: string;
  userType: string;
  role: string;
  approved: boolean;
  address?: string;
  postalCode?: string;
  contactName?: string;
  fax?: string;
  truckCount?: string;
  permitFile?: string;
  createdAt?: string;
  registrationDate?: string;
  representative?: string;
  establishedDate?: string;
  capital?: string;
  employeeCount?: string;
  websiteUrl?: string;
  transportLicenseNumber?: string;
  businessArea?: string;
  businessDescription?: string;
  invoiceRegistrationNumber?: string;
};

function isImageFile(path: string): boolean {
  const ext = path.toLowerCase().split(".").pop() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
}

function PermitFileViewer({ permitFile, userId }: { permitFile: string; userId: string }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = isImageFile(permitFile);

  return (
    <div className="mt-4 pl-[52px]">
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        許可証・資格証明書
      </p>
      {isImage ? (
        <div>
          <div
            className="relative rounded-md border overflow-hidden cursor-pointer max-w-[320px] group"
            onClick={() => setPreviewOpen(!previewOpen)}
            data-testid={`permit-image-${userId}`}
          >
            <img
              src={permitFile}
              alt="許可証"
              className={`w-full object-cover transition-all ${previewOpen ? "max-h-[600px] object-contain" : "max-h-[160px]"}`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="hidden flex-col items-center justify-center py-6 text-muted-foreground">
              <Image className="w-8 h-8 mb-1" />
              <p className="text-xs">画像を読み込めません</p>
            </div>
            {!previewOpen && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">クリックで拡大</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(!previewOpen)}
              data-testid={`button-toggle-permit-${userId}`}
            >
              {previewOpen ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
              {previewOpen ? "縮小" : "拡大表示"}
            </Button>
            <a
              href={permitFile}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`link-permit-newtab-${userId}`}
            >
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                新しいタブで開く
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 max-w-[320px]">
          <div className="w-10 h-10 rounded-md bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              許可証ファイル（PDF）
            </p>
            <p className="text-xs text-muted-foreground truncate">{permitFile.split("/").pop()}</p>
          </div>
          <a
            href={permitFile}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`link-permit-${userId}`}
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              開く
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  );
}

export default function AdminApplications() {
  const { toast } = useToast();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const pendingUsers = users?.filter((u) => !u.approved && u.role !== "admin") ?? [];
  const approvedCount = users?.filter((u) => u.approved && u.role !== "admin")?.length ?? 0;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const approveUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/users/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザーを承認しました" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "申請を却下しました" });
    },
  });

  const formatDate = (user: SafeUser) => {
    if (user.registrationDate) return user.registrationDate;
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("ja-JP");
    return "-";
  };

  const userTypeLabel = (type: string) => {
    switch (type) {
      case "carrier": return "運送会社";
      case "shipper": return "荷主";
      case "both": return "運送会社・荷主";
      default: return type;
    }
  };

  const hasExtraInfo = (u: SafeUser) => {
    return u.representative || u.establishedDate || u.capital || u.employeeCount ||
      u.websiteUrl || u.transportLicenseNumber || u.businessArea ||
      u.businessDescription || u.invoiceRegistrationNumber || u.postalCode;
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
        <div className="bg-primary rounded-md p-5 mb-6">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">申請管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">新規ユーザーの承認・却下を行います</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{pendingUsers.length}</p>
                  )}
                  <p className="text-xs text-muted-foreground">承認待ち</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">承認済み</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium text-foreground mb-1" data-testid="text-empty-state">承認待ちの申請はありません</p>
              <p className="text-sm text-muted-foreground">新しいユーザー登録があるとここに表示されます</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((u) => {
              const expanded = expandedIds.has(u.id);
              const extra = hasExtraInfo(u);

              return (
                <Card key={u.id} data-testid={`card-application-${u.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{u.companyName}</h3>
                            {u.companyNameKana && (
                              <span className="text-xs text-muted-foreground">({u.companyNameKana})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <Badge variant="destructive" className="text-xs">未承認</Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(u)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveUser.mutate(u.id)}
                          disabled={approveUser.isPending}
                          data-testid={`button-approve-${u.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          承認する
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUser.mutate(u.id)}
                          disabled={deleteUser.isPending}
                          data-testid={`button-reject-${u.id}`}
                        >
                          <X className="w-4 h-4 mr-1.5" />
                          却下
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-[52px]">
                      {u.contactName && <InfoRow icon={User} label="担当者" value={u.contactName} />}
                      <InfoRow icon={Mail} label="メール" value={u.email} />
                      {u.phone && (
                        <InfoRow icon={Phone} label="TEL" value={u.phone + (u.fax ? ` / FAX: ${u.fax}` : "")} />
                      )}
                      {(u.postalCode || u.address) && (
                        <InfoRow icon={MapPin} label="住所" value={`${u.postalCode ? `〒${u.postalCode} ` : ""}${u.address || ""}`} />
                      )}
                      {u.truckCount && <InfoRow icon={Truck} label="保有台数" value={`${u.truckCount}台`} />}
                    </div>

                    {extra && (
                      <div className="pl-[52px] mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(u.id)}
                          data-testid={`button-expand-${u.id}`}
                        >
                          {expanded ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                          {expanded ? "詳細を閉じる" : "詳細情報を見る"}
                        </Button>

                        {expanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 pt-3 border-t">
                            {u.representative && <InfoRow icon={User} label="代表者" value={u.representative} />}
                            {u.establishedDate && <InfoRow icon={Clock} label="設立" value={u.establishedDate} />}
                            {u.capital && <InfoRow icon={Briefcase} label="資本金" value={u.capital} />}
                            {u.employeeCount && <InfoRow icon={User} label="従業員数" value={`${u.employeeCount}名`} />}
                            {u.websiteUrl && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground shrink-0">URL:</span>
                                <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{u.websiteUrl}</a>
                              </div>
                            )}
                            {u.transportLicenseNumber && <InfoRow icon={Hash} label="運送許可番号" value={u.transportLicenseNumber} />}
                            {u.invoiceRegistrationNumber && <InfoRow icon={Hash} label="インボイス番号" value={u.invoiceRegistrationNumber} />}
                            {u.businessArea && <InfoRow icon={MapPin} label="営業エリア" value={u.businessArea} />}
                            {u.businessDescription && (
                              <div className="sm:col-span-2 flex items-start gap-2 text-sm">
                                <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-muted-foreground shrink-0">事業内容:</span>
                                <span className="text-foreground">{u.businessDescription}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {u.permitFile ? (
                      <PermitFileViewer permitFile={u.permitFile} userId={u.id} />
                    ) : (
                      <div className="mt-4 pl-[52px]">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          許可証: 未アップロード
                        </p>
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
