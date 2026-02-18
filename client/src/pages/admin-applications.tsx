import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClipboardList, CheckCircle, X, FileText, Building2, Phone, Mail, MapPin, Truck, User, Clock, Image, ExternalLink, ChevronDown, ChevronUp, Shield, Globe, Hash, Briefcase, Search, Crown } from "lucide-react";
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

function DetailRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: import("react").ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div className="w-[80px] sm:w-[100px] shrink-0 bg-muted/30 px-2 sm:px-3 py-2.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex-1 px-3 py-2.5 text-sm font-bold text-foreground whitespace-pre-wrap break-all">{children || value || "-"}</div>
    </div>
  );
}

type PlanChangeRequestItem = {
  id: string;
  userId: string;
  currentPlan: string;
  requestedPlan: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  companyName: string;
  email: string;
};

const planLabel = (plan: string) => {
  switch (plan) {
    case "free": return "フリー";
    case "premium": return "β版プレミアム";
    case "premium_full": return "プレミアム（¥5,500/月）";
    default: return plan;
  }
};

export default function AdminApplications() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<"user" | "plan" | "user-add">("user");

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: planRequests, isLoading: planLoading } = useQuery<PlanChangeRequestItem[]>({
    queryKey: ["/api/admin/plan-change-requests"],
  });

  const { data: userAddRequests, isLoading: userAddLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/user-add-requests"],
  });

  const pendingPlanRequests = planRequests?.filter(r => r.status === "pending") ?? [];
  const pendingUserAddRequests = userAddRequests?.filter((r: any) => r.status === "pending") ?? [];

  const pendingUsers = users?.filter((u) => !u.approved && u.role !== "admin") ?? [];
  const approvedCount = users?.filter((u) => u.approved && u.role !== "admin")?.length ?? 0;

  const filtered = pendingUsers.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.companyName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.contactName && u.contactName.toLowerCase().includes(q));
  });

  const selectedUser = filtered.find((u) => u.id === selectedUserId) ?? null;

  useEffect(() => {
    if (selectedUserId && !filtered.find((u) => u.id === selectedUserId)) {
      setSelectedUserId(null);
    }
  }, [filtered, selectedUserId]);

  const approveUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/users/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザーを承認しました" });
      setSelectedUserId(null);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "申請を却下しました" });
      setSelectedUserId(null);
    },
  });

  const approvePlan = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/plan-change-requests/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plan-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "プラン変更を承認しました" });
    },
    onError: (error: any) => {
      toast({ title: "承認に失敗しました", description: error?.message || "エラーが発生しました", variant: "destructive" });
    },
  });

  const rejectPlan = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/plan-change-requests/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plan-change-requests"] });
      toast({ title: "プラン変更を却下しました" });
    },
    onError: (error: any) => {
      toast({ title: "却下に失敗しました", description: error?.message || "エラーが発生しました", variant: "destructive" });
    },
  });

  const approveUserAdd = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/user-add-requests/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-add-requests"] });
      toast({ title: "ユーザー追加を承認しました" });
    },
    onError: (error: any) => {
      toast({ title: "承認に失敗しました", description: error?.message || "エラーが発生しました", variant: "destructive" });
    },
  });

  const rejectUserAdd = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/user-add-requests/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-add-requests"] });
      toast({ title: "ユーザー追加を却下しました" });
    },
    onError: (error: any) => {
      toast({ title: "却下に失敗しました", description: error?.message || "エラーが発生しました", variant: "destructive" });
    },
  });

  const formatDate = (user: SafeUser) => {
    if (user.registrationDate) return user.registrationDate;
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("ja-JP");
    return "-";
  };

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className={`flex-1 overflow-y-auto transition-all duration-300`}>
          <div className="px-4 sm:px-6 py-4">
            <div className="bg-primary rounded-md p-5 mb-5">
              <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">申請管理</h1>
              <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">新規ユーザー・プラン変更の承認・却下を行います</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      {isLoading ? <Skeleton className="h-7 w-10" /> : <p className="text-2xl font-bold text-foreground">{pendingUsers.length}</p>}
                      <p className="text-xs text-muted-foreground">ユーザー承認待ち</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      {planLoading ? <Skeleton className="h-7 w-10" /> : <p className="text-2xl font-bold text-foreground">{pendingPlanRequests.length}</p>}
                      <p className="text-xs text-muted-foreground">プラン変更待ち</p>
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
                      {isLoading ? <Skeleton className="h-7 w-10" /> : <p className="text-2xl font-bold text-foreground">{approvedCount}</p>}
                      <p className="text-xs text-muted-foreground">承認済み</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-1 mb-4 border-b border-border">
              <button
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${tab === "user" ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => setTab("user")}
                data-testid="tab-user-applications"
              >
                ユーザー登録申請
                {pendingUsers.length > 0 && (
                  <Badge className="ml-1.5 text-[10px] px-1.5 py-0">{pendingUsers.length}</Badge>
                )}
                {tab === "user" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${tab === "plan" ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => setTab("plan")}
                data-testid="tab-plan-applications"
              >
                プラン変更申請
                {pendingPlanRequests.length > 0 && (
                  <Badge className="ml-1.5 text-[10px] px-1.5 py-0">{pendingPlanRequests.length}</Badge>
                )}
                {tab === "plan" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${tab === "user-add" ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => setTab("user-add")}
                data-testid="tab-user-add-applications"
              >
                ユーザー追加申請
                {pendingUserAddRequests.length > 0 && (
                  <Badge className="ml-1.5 text-[10px] px-1.5 py-0">{pendingUserAddRequests.length}</Badge>
                )}
                {tab === "user-add" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            </div>

            {tab === "user" && (
              <>
                {pendingUsers.length > 3 && (
                  <Card className="mb-4">
                    <CardContent className="p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="企業名・メール・担当者で検索..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                          data-testid="input-application-search"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <span className="font-semibold text-sm" data-testid="text-result-count">
                    承認待ち {filtered.length} 件
                  </span>
                </div>

                {isLoading ? (
                  <Card>
                    <div className="divide-y divide-border">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="px-4 py-3">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : filtered.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <ClipboardList className="w-10 h-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1" data-testid="text-empty-state">承認待ちの申請はありません</p>
                      <p className="text-xs text-muted-foreground">新しいユーザー登録があるとここに表示されます</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full" data-testid="table-applications">
                        <thead>
                          <tr className="border-b bg-muted/60">
                            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">企業名</th>
                            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">担当者</th>
                            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">連絡先</th>
                            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">住所</th>
                            <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">許可証</th>
                            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">申請日</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filtered.map((u, index) => (
                            <tr
                              key={u.id}
                              className={`hover-elevate cursor-pointer transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""} ${selectedUserId === u.id ? "bg-primary/10" : ""}`}
                              onClick={() => setSelectedUserId(u.id)}
                              data-testid={`row-application-${u.id}`}
                            >
                              <td className="px-3 py-3 align-top">
                                <div className="font-bold text-foreground text-[12px] leading-tight truncate max-w-[140px]">{u.companyName}</div>
                                {u.companyNameKana && <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[140px]">{u.companyNameKana}</div>}
                              </td>
                              <td className="px-3 py-3 align-top">
                                <span className="text-[12px] font-bold text-foreground">{u.contactName || "-"}</span>
                              </td>
                              <td className="px-3 py-3 align-top">
                                <div className="text-[12px] text-foreground font-bold truncate max-w-[180px]">{u.email}</div>
                                {u.phone && <div className="text-[11px] text-muted-foreground font-bold mt-0.5">{u.phone}</div>}
                              </td>
                              <td className="px-3 py-3 align-top">
                                <span className="text-[12px] text-foreground font-bold truncate max-w-[160px] block">
                                  {u.postalCode ? `〒${u.postalCode} ` : ""}{u.address || "-"}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-top">
                                {u.permitFile ? (
                                  <Badge variant="default" className="text-[10px]">有</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px]">無</Badge>
                                )}
                              </td>
                              <td className="px-3 py-3 align-top">
                                <span className="text-[12px] text-muted-foreground font-bold whitespace-nowrap">{formatDate(u)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </>
            )}

            {tab === "plan" && (
              <>
                {planLoading ? (
                  <Card>
                    <div className="divide-y divide-border">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="px-4 py-3">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : pendingPlanRequests.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Crown className="w-10 h-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1" data-testid="text-plan-empty">プラン変更の申請はありません</p>
                      <p className="text-xs text-muted-foreground">ユーザーがプレミアムプランに申請するとここに表示されます</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingPlanRequests.map((r) => (
                      <Card key={r.id} data-testid={`card-plan-request-${r.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-foreground text-sm">{r.companyName}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  <Clock className="w-3 h-3 mr-1" />
                                  承認待ち
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{r.email}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                                <span>{planLabel(r.currentPlan)}</span>
                                <span>→</span>
                                <span className="font-bold text-foreground">{planLabel(r.requestedPlan)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                申請日: {new Date(r.createdAt).toLocaleDateString("ja-JP")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => approvePlan.mutate(r.id)}
                                disabled={approvePlan.isPending || rejectPlan.isPending}
                                data-testid={`button-approve-plan-${r.id}`}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                承認
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`${r.companyName} のプラン変更申請を却下しますか？`)) {
                                    rejectPlan.mutate(r.id);
                                  }
                                }}
                                disabled={approvePlan.isPending || rejectPlan.isPending}
                                data-testid={`button-reject-plan-${r.id}`}
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                却下
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "user-add" && (
              <>
                {userAddLoading ? (
                  <Card>
                    <div className="divide-y divide-border">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="px-4 py-3">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : pendingUserAddRequests.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <User className="w-10 h-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1" data-testid="text-user-add-empty">ユーザー追加の申請はありません</p>
                      <p className="text-xs text-muted-foreground">ユーザーが追加申請を行うとここに表示されます</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingUserAddRequests.map((r: any) => (
                      <Card key={r.id} data-testid={`card-user-add-request-${r.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-foreground text-sm">{r.name}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  <Clock className="w-3 h-3 mr-1" />
                                  承認待ち
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{r.email}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                                <span>役割: {r.role === "manager" ? "マネージャー" : "メンバー"}</span>
                                {r.note && <span>| 備考: {r.note}</span>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                申請者: {r.requesterCompanyName} ({r.requesterEmail})
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                申請日: {r.createdAt ? new Date(r.createdAt).toLocaleDateString("ja-JP") : "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => approveUserAdd.mutate(r.id)}
                                disabled={approveUserAdd.isPending || rejectUserAdd.isPending}
                                data-testid={`button-approve-user-add-${r.id}`}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                承認
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`「${r.name}」のユーザー追加申請を却下しますか？`)) {
                                    rejectUserAdd.mutate(r.id);
                                  }
                                }}
                                disabled={approveUserAdd.isPending || rejectUserAdd.isPending}
                                data-testid={`button-reject-user-add-${r.id}`}
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                却下
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {selectedUserId && tab === "user" && (
          <ApplicationDetailPanel
            user={selectedUser}
            onClose={() => setSelectedUserId(null)}
            onApprove={(id) => approveUser.mutate(id)}
            onReject={(id) => {
              if (confirm(`${selectedUser?.companyName} の申請を却下しますか？`)) {
                deleteUser.mutate(id);
              }
            }}
            isApproving={approveUser.isPending}
            isRejecting={deleteUser.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function ApplicationDetailPanel({
  user,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  user: SafeUser | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const [permitExpanded, setPermitExpanded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setPermitExpanded(false);
  }, [user?.id]);

  if (!user) {
    return (
      <div className="w-[420px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const formatDate = () => {
    if (user.registrationDate) return user.registrationDate;
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("ja-JP");
    return "-";
  };

  return (
    <div className="w-full sm:w-[420px] shrink-0 border-l border-border bg-background h-full overflow-y-auto absolute sm:relative right-0 top-0 z-40 sm:z-auto" data-testid="panel-application-detail">
      <div className="sticky top-0 bg-background z-50">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
          <span className="text-sm font-bold text-foreground">申請詳細</span>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-base truncate">{user.companyName}</h3>
            {user.companyNameKana && <p className="text-xs text-muted-foreground">{user.companyNameKana}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="destructive" className="text-xs">未承認</Badge>
          <span className="text-xs text-muted-foreground">{formatDate()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            onClick={() => onApprove(user.id)}
            disabled={isApproving}
            data-testid={`button-approve-${user.id}`}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            {isApproving ? "承認中..." : "承認する"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onReject(user.id)}
            disabled={isRejecting}
            data-testid={`button-reject-${user.id}`}
          >
            <X className="w-4 h-4 mr-1.5" />
            却下
          </Button>
        </div>

        <h4 className="text-sm font-bold text-foreground">基本情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="企業名" value={user.companyName} />
          <DetailRow label="担当者" value={user.contactName} />
          <DetailRow label="メール" value={user.email} />
          <DetailRow label="電話番号" value={user.phone} />
          {user.fax && <DetailRow label="FAX" value={user.fax} />}
          <DetailRow label="住所" value={`${user.postalCode ? `〒${user.postalCode}\n` : ""}${user.address || "-"}`} />
          {user.truckCount && <DetailRow label="保有台数" value={`${user.truckCount}台`} />}
        </div>

        {(user.representative || user.establishedDate || user.capital || user.employeeCount || user.websiteUrl || user.transportLicenseNumber || user.invoiceRegistrationNumber || user.businessArea || user.businessDescription) && (
          <>
            <h4 className="text-sm font-bold text-foreground">詳細情報</h4>
            <div className="border border-border rounded-md overflow-hidden">
              {user.representative && <DetailRow label="代表者" value={user.representative} />}
              {user.establishedDate && <DetailRow label="設立" value={user.establishedDate} />}
              {user.capital && <DetailRow label="資本金" value={user.capital} />}
              {user.employeeCount && <DetailRow label="従業員数" value={`${user.employeeCount}名`} />}
              {user.websiteUrl && (
                <DetailRow label="URL">
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm break-all">{user.websiteUrl}</a>
                </DetailRow>
              )}
              {user.transportLicenseNumber && <DetailRow label="運送許可番号" value={user.transportLicenseNumber} />}
              {user.invoiceRegistrationNumber && <DetailRow label="インボイス" value={user.invoiceRegistrationNumber} />}
              {user.businessArea && <DetailRow label="営業エリア" value={user.businessArea} />}
              {user.businessDescription && <DetailRow label="事業内容" value={user.businessDescription} />}
            </div>
          </>
        )}

        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          許可証・資格証明書
        </h4>
        {user.permitFile ? (
          isImageFile(user.permitFile) ? (
            <div>
              <div
                className="relative rounded-md border overflow-hidden cursor-pointer group"
                onClick={() => setPermitExpanded(!permitExpanded)}
                data-testid={`permit-image-${user.id}`}
              >
                <img
                  src={user.permitFile}
                  alt="許可証"
                  className={`w-full object-cover transition-all ${permitExpanded ? "max-h-[600px] object-contain" : "max-h-[160px]"}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {!permitExpanded && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">クリックで拡大</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setPermitExpanded(!permitExpanded)}>
                  {permitExpanded ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                  {permitExpanded ? "縮小" : "拡大表示"}
                </Button>
                <a href={user.permitFile} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    新しいタブ
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
              <div className="w-10 h-10 rounded-md bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">許可証ファイル（PDF）</p>
                <p className="text-xs text-muted-foreground truncate">{user.permitFile.split("/").pop()}</p>
              </div>
              <a href={user.permitFile} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  開く
                </Button>
              </a>
            </div>
          )
        ) : (
          <div className="p-4 rounded-md bg-muted/30 text-center">
            <Shield className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">未アップロード</p>
          </div>
        )}
      </div>
    </div>
  );
}
