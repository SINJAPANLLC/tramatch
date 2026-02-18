import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserCog, Trash2, Search, FileText, CheckCircle, Crown, Users, Building2, Phone, Mail, MapPin, Truck, User, Shield, ChevronDown, ChevronUp, Image, ExternalLink, Clock, UserCheck, UserX } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
  plan: string;
  address?: string;
  postalCode?: string;
  contactName?: string;
  fax?: string;
  truckCount?: string;
  permitFile?: string;
  createdAt?: string;
  registrationDate?: string;
  representative?: string;
  businessArea?: string;
  businessDescription?: string;
  transportLicenseNumber?: string;
  websiteUrl?: string;
};

function isImageFile(path: string): boolean {
  const ext = path.toLowerCase().split(".").pop() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
}

function userTypeLabel(type: string) {
  switch (type) {
    case "carrier": return "運送会社";
    case "shipper": return "荷主";
    case "both": return "運送会社・荷主";
    default: return type;
  }
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<"all" | "approved" | "pending" | "admin">("all");

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

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
      toast({ title: "ユーザーを削除しました" });
    },
  });

  const changePlan = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}/plan`, { plan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "プランを変更しました" });
    },
    onError: () => {
      toast({ title: "プラン変更に失敗しました", variant: "destructive" });
    },
  });

  const allNonAdmin = users?.filter(u => u.role !== "admin") ?? [];
  const approvedCount = allNonAdmin.filter(u => u.approved).length;
  const pendingCount = allNonAdmin.filter(u => !u.approved).length;
  const adminCount = users?.filter(u => u.role === "admin")?.length ?? 0;

  const filteredUsers = users?.filter((u) => {
    if (filterType === "approved" && (u.role === "admin" || !u.approved)) return false;
    if (filterType === "pending" && (u.role === "admin" || u.approved)) return false;
    if (filterType === "admin" && u.role !== "admin") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.companyName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.contactName && u.contactName.toLowerCase().includes(q));
    }
    return true;
  }) ?? [];

  const formatDate = (user: SafeUser) => {
    if (user.registrationDate) return user.registrationDate;
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("ja-JP");
    return "-";
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
        <div className="bg-primary rounded-md p-5 mb-6">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">ユーザー管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">全ユーザーの管理・プラン切替</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card
            className={`cursor-pointer hover-elevate ${filterType === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterType("all")}
            data-testid="card-filter-all"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{users?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">全ユーザー</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover-elevate ${filterType === "approved" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterType("approved")}
            data-testid="card-filter-approved"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                  <p className="text-xs text-muted-foreground">承認済み</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover-elevate ${filterType === "pending" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterType("pending")}
            data-testid="card-filter-pending"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                  <UserX className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">承認待ち</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover-elevate ${filterType === "admin" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setFilterType("admin")}
            data-testid="card-filter-admin"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{adminCount}</p>
                  <p className="text-xs text-muted-foreground">管理者</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="企業名、メールアドレス、担当者名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-user-search"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length}件表示
            {searchQuery && ` (「${searchQuery}」で検索中)`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">該当するユーザーがいません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const expanded = expandedIds.has(u.id);
              const isAdmin = u.role === "admin";

              return (
                <Card key={u.id} data-testid={`card-user-${u.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${isAdmin ? "bg-blue-50 dark:bg-blue-950/30" : "bg-primary/10"}`}>
                          {isAdmin ? <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Building2 className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{u.companyName}</h3>
                            {u.companyNameKana && <span className="text-xs text-muted-foreground">({u.companyNameKana})</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                              {isAdmin ? "管理者" : "一般"}
                            </Badge>
                            {!isAdmin && (
                              <Badge variant={u.approved ? "default" : "destructive"} className="text-xs">
                                {u.approved ? "承認済" : "未承認"}
                              </Badge>
                            )}
                            {!isAdmin && (
                              <Badge variant={u.plan === "premium" ? "default" : "outline"} className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                {u.plan === "premium" ? "プレミアム" : "フリー"}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{formatDate(u)}</span>
                          </div>
                        </div>
                      </div>
                      {!isAdmin && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {!u.approved && (
                            <Button
                              size="sm"
                              onClick={() => approveUser.mutate(u.id)}
                              disabled={approveUser.isPending}
                              data-testid={`button-approve-user-${u.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              承認
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={u.plan === "premium" ? "outline" : "default"}
                            onClick={() => changePlan.mutate({ id: u.id, plan: u.plan === "premium" ? "free" : "premium" })}
                            disabled={changePlan.isPending}
                            data-testid={`button-plan-toggle-${u.id}`}
                          >
                            <Crown className="w-4 h-4 mr-1.5" />
                            {u.plan === "premium" ? "フリーに変更" : "プレミアムに変更"}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`${u.companyName} を削除しますか？`)) {
                                deleteUser.mutate(u.id);
                              }
                            }}
                            disabled={deleteUser.isPending}
                            data-testid={`button-delete-user-${u.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3 pl-[52px]">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground truncate">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">{u.phone}</span>
                          {u.fax && <span className="text-xs text-muted-foreground">(FAX: {u.fax})</span>}
                        </div>
                      )}
                      {u.contactName && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">担当者:</span>
                          <span className="text-foreground">{u.contactName}</span>
                        </div>
                      )}
                      {u.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground truncate">{u.postalCode ? `〒${u.postalCode} ` : ""}{u.address}</span>
                        </div>
                      )}
                      {u.truckCount && (
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">保有台数:</span>
                          <span className="text-foreground">{u.truckCount}台</span>
                        </div>
                      )}
                      {u.businessArea && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">営業エリア:</span>
                          <span className="text-foreground truncate">{u.businessArea}</span>
                        </div>
                      )}
                    </div>

                    {(u.permitFile || u.transportLicenseNumber || u.businessDescription || u.representative) && (
                      <div className="pl-[52px] mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(u.id)}
                          data-testid={`button-expand-user-${u.id}`}
                        >
                          {expanded ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                          {expanded ? "詳細を閉じる" : "詳細を見る"}
                        </Button>

                        {expanded && (
                          <div className="mt-3 pt-3 border-t space-y-3">
                            {u.representative && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">代表者:</span>
                                <span className="text-foreground">{u.representative}</span>
                              </div>
                            )}
                            {u.transportLicenseNumber && (
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">運送許可番号:</span>
                                <span className="text-foreground">{u.transportLicenseNumber}</span>
                              </div>
                            )}
                            {u.businessDescription && (
                              <div className="flex items-start gap-2 text-sm">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="text-muted-foreground shrink-0">事業内容:</span>
                                <span className="text-foreground">{u.businessDescription}</span>
                              </div>
                            )}
                            {u.websiteUrl && (
                              <div className="flex items-center gap-2 text-sm">
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{u.websiteUrl}</a>
                              </div>
                            )}

                            {u.permitFile && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5" />
                                  許可証・資格証明書
                                </p>
                                {isImageFile(u.permitFile) ? (
                                  <div>
                                    <div className="relative rounded-md border overflow-hidden max-w-[300px]">
                                      <img
                                        src={u.permitFile}
                                        alt="許可証"
                                        className="w-full object-contain max-h-[400px]"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                      />
                                    </div>
                                    <a
                                      href={u.permitFile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                                      data-testid={`link-permit-${u.id}`}
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      新しいタブで開く
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 max-w-[300px]">
                                    <div className="w-10 h-10 rounded-md bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                                      <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-foreground truncate">許可証ファイル</p>
                                      <p className="text-xs text-muted-foreground truncate">{u.permitFile.split("/").pop()}</p>
                                    </div>
                                    <a href={u.permitFile} target="_blank" rel="noopener noreferrer" data-testid={`link-permit-${u.id}`}>
                                      <Button variant="outline" size="sm">
                                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                        開く
                                      </Button>
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
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
