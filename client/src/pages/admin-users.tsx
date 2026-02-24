import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, FileText, CheckCircle, Crown, Users, Building2, Phone, Mail, MapPin, Truck, User, UserPlus, Shield, X, ExternalLink, ChevronDown, ChevronUp, Globe, Hash, Briefcase, Clock, UserCheck, UserX, Pencil, Save, Plus, ShieldCheck, ShieldOff, Eye, EyeOff, StickyNote } from "lucide-react";
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
  establishedDate?: string;
  capital?: string;
  employeeCount?: string;
  websiteUrl?: string;
  transportLicenseNumber?: string;
  businessArea?: string;
  businessDescription?: string;
  invoiceRegistrationNumber?: string;
  paymentTerms?: string;
  officeLocations?: string;
  annualRevenue?: string;
  bankInfo?: string;
  majorClients?: string;
  closingDay?: string;
  paymentMonth?: string;
  autoInvoiceAcceptance?: string;
  memberOrganization?: string;
  digitalTachographCount?: string;
  gpsCount?: string;
  safetyExcellenceCert?: string;
  greenManagementCert?: string;
  iso9000?: string;
  iso14000?: string;
  iso39001?: string;
  cargoInsurance?: string;
  lineUserId?: string;
  closingMonth?: string;
  paymentDay?: string;
  bankName?: string;
  bankBranch?: string;
  accountType?: string;
  accountNumber?: string;
  accountHolderKana?: string;
  accountingContactName?: string;
  accountingContactEmail?: string;
  accountingContactPhone?: string;
  accountingContactFax?: string;
  adminMemo?: string | null;
  addedByUserId?: string | null;
};

function isImageFile(path: string): boolean {
  const ext = path.toLowerCase().split(".").pop() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
}

function DetailRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: import("react").ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div className="w-[100px] shrink-0 bg-muted/30 px-3 py-2.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex-1 px-3 py-2.5 text-sm font-bold text-foreground whitespace-pre-wrap break-all">{children || value || "-"}</div>
    </div>
  );
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "approved" | "pending" | "admin">("all");

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const allNonAdmin = users?.filter(u => u.role !== "admin") ?? [];
  const approvedCount = allNonAdmin.filter(u => u.approved).length;
  const pendingCount = allNonAdmin.filter(u => !u.approved).length;
  const adminCount = users?.filter(u => u.role === "admin")?.length ?? 0;

  const filtered = useMemo(() => {
    return (users ?? []).filter((u) => {
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
    });
  }, [users, filterType, searchQuery]);

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
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザーを削除しました" });
      setSelectedUserId(null);
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ companyName: "", contactName: "", email: "", phone: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);

  const addUser = useMutation({
    mutationFn: async (data: typeof addForm) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザーを追加しました" });
      setShowAddForm(false);
      setAddForm({ companyName: "", contactName: "", email: "", phone: "", password: "", role: "user" });
    },
    onError: async (error: any) => {
      const msg = error?.message || "ユーザーの追加に失敗しました";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "役割を変更しました" });
    },
    onError: () => {
      toast({ title: "役割の変更に失敗しました", variant: "destructive" });
    },
  });

  const [editSuccess, setEditSuccess] = useState(false);
  const editUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, string | null> }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザー情報を更新しました" });
      setEditSuccess(true);
    },
    onError: () => {
      toast({ title: "更新に失敗しました", variant: "destructive" });
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
        <div className="flex-1 overflow-y-auto transition-all duration-300">
          <div className="px-4 sm:px-6 py-4">
            <div className="bg-primary rounded-md p-5 mb-5">
              <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">ユーザー管理</h1>
              <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">全ユーザーの管理・プラン切替</p>
            </div>

            <div className="flex justify-end mb-3">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                data-testid="button-add-user"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                ユーザー追加
              </Button>
            </div>

            {showAddForm && (
              <Card className="mb-5">
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">新規ユーザー追加</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">企業名 <span className="text-destructive">*</span></Label>
                      <Input
                        value={addForm.companyName}
                        onChange={(e) => setAddForm(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="株式会社〇〇"
                        data-testid="input-add-companyName"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">担当者名</Label>
                      <Input
                        value={addForm.contactName}
                        onChange={(e) => setAddForm(prev => ({ ...prev, contactName: e.target.value }))}
                        placeholder="山田 太郎"
                        data-testid="input-add-contactName"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">メールアドレス <span className="text-destructive">*</span></Label>
                      <Input
                        type="email"
                        value={addForm.email}
                        onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="user@example.com"
                        data-testid="input-add-email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">電話番号 <span className="text-destructive">*</span></Label>
                      <Input
                        value={addForm.phone}
                        onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="03-1234-5678"
                        data-testid="input-add-phone"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">パスワード <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={addForm.password}
                          onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="パスワード"
                          className="pr-10"
                          data-testid="input-add-password"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">役割</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={addForm.role === "user" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setAddForm(prev => ({ ...prev, role: "user" }))}
                          data-testid="button-add-role-user"
                        >
                          <User className="w-3.5 h-3.5 mr-1" />
                          一般ユーザー
                        </Button>
                        <Button
                          type="button"
                          variant={addForm.role === "admin" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setAddForm(prev => ({ ...prev, role: "admin" }))}
                          data-testid="button-add-role-admin"
                        >
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          管理者
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-5">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setAddForm({ companyName: "", contactName: "", email: "", phone: "", password: "", role: "user" });
                      }}
                      data-testid="button-add-cancel"
                    >
                      キャンセル
                    </Button>
                    <Button
                      onClick={() => {
                        if (!addForm.companyName || !addForm.email || !addForm.phone || !addForm.password) {
                          toast({ title: "必須項目を入力してください", variant: "destructive" });
                          return;
                        }
                        addUser.mutate(addForm);
                      }}
                      disabled={addUser.isPending}
                      data-testid="button-add-submit"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {addUser.isPending ? "追加中..." : "追加する"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
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
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="企業名・メール・担当者で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-user-search"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span className="font-semibold text-sm" data-testid="text-result-count">
                {filtered.length} 件表示
                {searchQuery && ` (「${searchQuery}」で検索中)`}
              </span>
            </div>

            {isLoading ? (
              <Card>
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-3"><Skeleton className="h-12 w-full" /></div>
                  ))}
                </div>
              </Card>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">該当するユーザーがいません</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-users">
                    <thead>
                      <tr className="border-b bg-muted/60">
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">企業名</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">担当者</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">連絡先</th>
                        <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">ステータス</th>
                        <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">プラン</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">登録日</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((u, index) => {
                        const isAdmin = u.role === "admin";
                        return (
                          <tr
                            key={u.id}
                            className={`hover-elevate cursor-pointer transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""} ${selectedUserId === u.id ? "bg-primary/10" : ""}`}
                            onClick={() => setSelectedUserId(u.id)}
                            data-testid={`row-user-${u.id}`}
                          >
                            <td className="px-3 py-3 align-top">
                              <div className="flex items-center gap-1.5">
                                <div className="font-bold text-foreground text-[12px] leading-tight truncate max-w-[140px]">{u.companyName}</div>
                                {u.addedByUserId && (
                                  <Badge variant="outline" className="text-[9px] shrink-0 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    <UserPlus className="w-2.5 h-2.5 mr-0.5" />追加
                                  </Badge>
                                )}
                              </div>
                              {u.companyNameKana && <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[140px]">{u.companyNameKana}</div>}
                              {u.addedByUserId && (() => {
                                const parent = users?.find(p => p.id === u.addedByUserId);
                                return parent ? (
                                  <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 truncate max-w-[180px]">
                                    親: {parent.contactName || parent.companyName}
                                  </div>
                                ) : null;
                              })()}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] font-bold text-foreground">{u.contactName || "-"}</span>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <div className="text-[12px] text-foreground font-bold truncate max-w-[180px]">{u.email}</div>
                              {u.phone && <div className="text-[11px] text-muted-foreground font-bold mt-0.5">{u.phone}</div>}
                            </td>
                            <td className="px-3 py-3 text-center align-top">
                              {isAdmin ? (
                                <Badge variant="default" className="text-[10px]">管理者</Badge>
                              ) : u.approved ? (
                                <Badge variant="default" className="text-[10px]">承認済</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px]">未承認</Badge>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center align-top">
                              {isAdmin ? (
                                <span className="text-[11px] text-muted-foreground font-bold">-</span>
                              ) : (
                                <Badge variant={u.plan === "premium" || u.plan === "premium_full" ? "default" : "outline"} className="text-[10px]">
                                  {u.plan === "premium" ? "β版プレミアム" : u.plan === "premium_full" ? "プレミアム" : "フリー"}
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] text-muted-foreground font-bold whitespace-nowrap">{formatDate(u)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>

        {selectedUserId && (
          <UserDetailPanel
            user={selectedUser}
            allUsers={users ?? []}
            onClose={() => setSelectedUserId(null)}
            onApprove={(id) => approveUser.mutate(id)}
            onDelete={(id) => {
              if (confirm(`${selectedUser?.companyName} を削除しますか？`)) {
                deleteUser.mutate(id);
              }
            }}
            onChangePlan={(id, plan) => changePlan.mutate({ id, plan })}
            onEditUser={(id, data) => { setEditSuccess(false); editUser.mutate({ id, data }); }}
            onChangeRole={(id, role) => {
              const label = role === "admin" ? "管理者に変更" : "一般ユーザーに変更";
              if (confirm(`${selectedUser?.companyName} を${label}しますか？`)) {
                changeRole.mutate({ id, role });
              }
            }}
            isApproving={approveUser.isPending}
            isDeleting={deleteUser.isPending}
            isChangingPlan={changePlan.isPending}
            isEditing={editUser.isPending}
            isChangingRole={changeRole.isPending}
            editSuccess={editSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function EditField({ label, name, value, onChange, type = "text" }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; type?: "text" | "textarea" }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-bold text-muted-foreground">{label}</Label>
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="text-sm min-h-[80px]"
          data-testid={`input-edit-${name}`}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="text-sm h-9"
          data-testid={`input-edit-${name}`}
        />
      )}
    </div>
  );
}

function UserDetailPanel({
  user,
  allUsers,
  onClose,
  onApprove,
  onDelete,
  onChangePlan,
  onEditUser,
  onChangeRole,
  isApproving,
  isDeleting,
  isChangingPlan,
  isEditing,
  isChangingRole,
  editSuccess,
}: {
  user: SafeUser | null;
  allUsers: SafeUser[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onChangePlan: (id: string, plan: string) => void;
  onEditUser: (id: string, data: Record<string, string | null>) => void;
  onChangeRole: (id: string, role: string) => void;
  isApproving: boolean;
  isDeleting: boolean;
  isChangingPlan: boolean;
  isEditing: boolean;
  isChangingRole: boolean;
  editSuccess: boolean;
}) {
  const { toast } = useToast();
  const [permitExpanded, setPermitExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [memoText, setMemoText] = useState(user?.adminMemo || "");
  const [memoEditing, setMemoEditing] = useState(false);

  useEffect(() => {
    setMemoText(user?.adminMemo || "");
    setMemoEditing(false);
  }, [user?.id, user?.adminMemo]);

  const saveMemo = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await apiRequest("PATCH", `/api/admin/users/${user.id}`, { adminMemo: memoText || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setMemoEditing(false);
      toast({ title: "メモを保存しました" });
    },
    onError: () => {
      toast({ title: "メモの保存に失敗しました", variant: "destructive" });
    },
  });

  const initEditData = (u: SafeUser) => {
    setEditData({
      companyName: u.companyName || "",
      companyNameKana: u.companyNameKana || "",
      contactName: u.contactName || "",
      email: u.email || "",
      phone: u.phone || "",
      fax: u.fax || "",
      postalCode: u.postalCode || "",
      address: u.address || "",
      truckCount: u.truckCount || "",
      representative: u.representative || "",
      establishedDate: u.establishedDate || "",
      capital: u.capital || "",
      employeeCount: u.employeeCount || "",
      websiteUrl: u.websiteUrl || "",
      transportLicenseNumber: u.transportLicenseNumber || "",
      invoiceRegistrationNumber: u.invoiceRegistrationNumber || "",
      businessArea: u.businessArea || "",
      businessDescription: u.businessDescription || "",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editMode) {
          setEditMode(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, editMode]);

  useEffect(() => {
    setPermitExpanded(false);
    setEditMode(false);
  }, [user?.id]);

  useEffect(() => {
    if (editSuccess && editMode) {
      setEditMode(false);
    }
  }, [editSuccess, editMode]);

  const handleFieldChange = (name: string, value: string) => {
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!user) return;
    const changedData: Record<string, string | null> = {};
    for (const [key, val] of Object.entries(editData)) {
      const original = (user as any)[key] || "";
      if (val !== original) {
        changedData[key] = val || null;
      }
    }
    if (Object.keys(changedData).length === 0) {
      setEditMode(false);
      return;
    }
    onEditUser(user.id, changedData);
  };

  if (!user) {
    return (
      <div className="w-[420px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  const formatDate = () => {
    if (user.registrationDate) return user.registrationDate;
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("ja-JP");
    return "-";
  };

  return (
    <div className="w-full sm:w-[420px] shrink-0 border-l border-border bg-background h-full overflow-y-auto absolute sm:relative right-0 top-0 z-40 sm:z-auto" data-testid="panel-user-detail">
      <div className="sticky top-0 bg-background z-50">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
          <span className="text-sm font-bold text-foreground">{editMode ? "ユーザー編集" : "ユーザー詳細"}</span>
          <div className="flex items-center gap-1">
            {!editMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { initEditData(user); setEditMode(true); }}
                data-testid="button-edit-user"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                編集
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(false)}
                  data-testid="button-cancel-edit"
                >
                  キャンセル
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isEditing}
                  data-testid="button-save-user"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {isEditing ? "保存中..." : "保存"}
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!editMode ? (
          <>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${isAdmin ? "bg-blue-50 dark:bg-blue-950/30" : "bg-primary/10"}`}>
                {isAdmin ? <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Building2 className="w-5 h-5 text-primary" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-base truncate">{user.companyName}</h3>
                {user.companyNameKana && <p className="text-xs text-muted-foreground">{user.companyNameKana}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin ? (
                <Badge variant="default" className="text-xs">管理者</Badge>
              ) : (
                <>
                  <Badge variant={user.approved ? "default" : "destructive"} className="text-xs">
                    {user.approved ? "承認済" : "未承認"}
                  </Badge>
                  <Badge variant={user.plan === "premium" || user.plan === "premium_full" ? "default" : "outline"} className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    {user.plan === "premium" ? "β版プレミアム" : user.plan === "premium_full" ? "プレミアム" : "フリー"}
                  </Badge>
                  {user.addedByUserId && (
                    <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      <UserPlus className="w-3 h-3 mr-1" />追加ユーザー
                    </Badge>
                  )}
                </>
              )}
              <span className="text-xs text-muted-foreground">{formatDate()}</span>
            </div>

            {user.addedByUserId && (() => {
              const parent = allUsers.find(p => p.id === user.addedByUserId);
              return parent ? (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3" data-testid="info-added-by">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
                    <UserPlus className="w-3 h-3 inline mr-1" />追加元ユーザー
                  </p>
                  <p className="text-sm text-foreground">{parent.companyName}</p>
                  <p className="text-xs text-muted-foreground">{parent.contactName} ({parent.email})</p>
                </div>
              ) : null;
            })()}

            {!user.addedByUserId && (() => {
              const children = allUsers.filter(u => u.addedByUserId === user.id);
              return children.length > 0 ? (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3" data-testid="info-added-users">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
                    <Users className="w-3 h-3 inline mr-1" />追加ユーザー ({children.length}名)
                  </p>
                  <div className="space-y-1.5">
                    {children.map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <UserPlus className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-foreground">{c.contactName || c.email}</span>
                        <span className="text-xs text-muted-foreground">({c.email})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            <div className="space-y-2">
              {!isAdmin && (
                <div className="space-y-2">
                  {!user.approved && (
                    <Button
                      className="w-full"
                      onClick={() => onApprove(user.id)}
                      disabled={isApproving}
                      data-testid={`button-approve-user-${user.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      {isApproving ? "承認中..." : "承認する"}
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-bold text-muted-foreground shrink-0">プラン</Label>
                    <Select
                      value={user.plan}
                      onValueChange={(value) => {
                        if (value !== user.plan) {
                          const planLabels: Record<string, string> = { free: "フリー", premium: "β版プレミアム", premium_full: "プレミアム" };
                          if (confirm(`${user.companyName} のプランを「${planLabels[value]}」に変更しますか？`)) {
                            onChangePlan(user.id, value);
                          }
                        }
                      }}
                      disabled={isChangingPlan}
                    >
                      <SelectTrigger className="flex-1 h-8 text-sm" data-testid={`select-plan-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">フリー</SelectItem>
                        <SelectItem value="premium">β版プレミアム</SelectItem>
                        <SelectItem value="premium_full">プレミアム</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onChangeRole(user.id, "user")}
                    disabled={isChangingRole}
                    data-testid={`button-demote-user-${user.id}`}
                  >
                    <ShieldOff className="w-4 h-4 mr-1.5" />
                    {isChangingRole ? "変更中..." : "一般ユーザーに変更"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onChangeRole(user.id, "admin")}
                    disabled={isChangingRole}
                    data-testid={`button-promote-user-${user.id}`}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    {isChangingRole ? "変更中..." : "管理者に変更"}
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full text-destructive"
                onClick={() => onDelete(user.id)}
                disabled={isDeleting}
                data-testid={`button-delete-user-${user.id}`}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                ユーザーを削除
              </Button>
            </div>

            <h4 className="text-sm font-bold text-foreground">基本情報</h4>
            <div className="border border-border rounded-md overflow-hidden">
              <DetailRow label="企業名" value={user.companyName} />
              {user.companyNameKana && <DetailRow label="カナ" value={user.companyNameKana} />}
              <DetailRow label="担当者" value={user.contactName} />
              <DetailRow label="メール" value={user.email} />
              <DetailRow label="電話番号" value={user.phone} />
              {user.fax && <DetailRow label="FAX" value={user.fax} />}
              <DetailRow label="住所" value={`${user.postalCode ? `〒${user.postalCode}\n` : ""}${user.address || "-"}`} />
              <DetailRow label="ユーザー種別" value={user.userType === "shipper" ? "荷主" : user.userType === "carrier" ? "運送会社" : user.userType === "both" ? "荷主・運送会社" : user.userType} />
              {user.truckCount && <DetailRow label="保有台数" value={`${user.truckCount}台`} />}
            </div>

            <h4 className="text-sm font-bold text-foreground">企業詳細</h4>
            <div className="border border-border rounded-md overflow-hidden">
              {user.representative && <DetailRow label="代表者" value={user.representative} />}
              {user.establishedDate && <DetailRow label="設立" value={user.establishedDate} />}
              {user.capital && <DetailRow label="資本金" value={user.capital} />}
              {user.employeeCount && <DetailRow label="従業員数" value={`${user.employeeCount}名`} />}
              {user.officeLocations && <DetailRow label="事業所" value={user.officeLocations} />}
              {user.annualRevenue && <DetailRow label="年商" value={user.annualRevenue} />}
              {user.majorClients && <DetailRow label="主要取引先" value={user.majorClients} />}
              {user.memberOrganization && <DetailRow label="加盟団体" value={user.memberOrganization} />}
              {user.websiteUrl && (
                <DetailRow label="URL">
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm break-all">{user.websiteUrl}</a>
                </DetailRow>
              )}
              {user.businessArea && <DetailRow label="営業エリア" value={user.businessArea} />}
              {user.businessDescription && <DetailRow label="事業内容" value={user.businessDescription} />}
              {!user.representative && !user.establishedDate && !user.capital && !user.employeeCount && !user.officeLocations && !user.annualRevenue && !user.majorClients && !user.memberOrganization && !user.websiteUrl && !user.businessArea && !user.businessDescription && (
                <DetailRow label="-" value="未登録" />
              )}
            </div>

            <h4 className="text-sm font-bold text-foreground">運送関連</h4>
            <div className="border border-border rounded-md overflow-hidden">
              {user.transportLicenseNumber && <DetailRow label="運送許可番号" value={user.transportLicenseNumber} />}
              {user.invoiceRegistrationNumber && <DetailRow label="インボイス番号" value={user.invoiceRegistrationNumber} />}
              {user.digitalTachographCount && <DetailRow label="デジタコ" value={`${user.digitalTachographCount}台`} />}
              {user.gpsCount && <DetailRow label="GPS" value={`${user.gpsCount}台`} />}
              {user.cargoInsurance && <DetailRow label="貨物保険" value={user.cargoInsurance} />}
              {user.autoInvoiceAcceptance && <DetailRow label="自動受領" value={user.autoInvoiceAcceptance} />}
              {!user.transportLicenseNumber && !user.invoiceRegistrationNumber && !user.digitalTachographCount && !user.gpsCount && !user.cargoInsurance && !user.autoInvoiceAcceptance && (
                <DetailRow label="-" value="未登録" />
              )}
            </div>

            {(user.safetyExcellenceCert || user.greenManagementCert || user.iso9000 || user.iso14000 || user.iso39001) && (
              <>
                <h4 className="text-sm font-bold text-foreground">認証・資格</h4>
                <div className="border border-border rounded-md overflow-hidden">
                  {user.safetyExcellenceCert && <DetailRow label="安全性優良" value={user.safetyExcellenceCert} />}
                  {user.greenManagementCert && <DetailRow label="グリーン経営" value={user.greenManagementCert} />}
                  {user.iso9000 && <DetailRow label="ISO9000" value={user.iso9000} />}
                  {user.iso14000 && <DetailRow label="ISO14000" value={user.iso14000} />}
                  {user.iso39001 && <DetailRow label="ISO39001" value={user.iso39001} />}
                </div>
              </>
            )}

            <h4 className="text-sm font-bold text-foreground">支払・決済情報</h4>
            <div className="border border-border rounded-md overflow-hidden">
              {user.closingDay && <DetailRow label="締め日" value={user.closingDay} />}
              {user.closingMonth && <DetailRow label="締め月" value={user.closingMonth} />}
              {user.paymentMonth && <DetailRow label="支払月" value={user.paymentMonth} />}
              {user.paymentDay && <DetailRow label="支払日" value={user.paymentDay} />}
              {user.paymentTerms && <DetailRow label="支払条件" value={user.paymentTerms} />}
              {!user.closingDay && !user.closingMonth && !user.paymentMonth && !user.paymentDay && !user.paymentTerms && (
                <DetailRow label="-" value="未登録" />
              )}
            </div>

            {(user.bankName || user.bankBranch || user.accountNumber || user.bankInfo) && (
              <>
                <h4 className="text-sm font-bold text-foreground">銀行口座情報</h4>
                <div className="border border-border rounded-md overflow-hidden">
                  {user.bankName && <DetailRow label="銀行名" value={user.bankName} />}
                  {user.bankBranch && <DetailRow label="支店名" value={user.bankBranch} />}
                  {user.accountType && <DetailRow label="口座種別" value={user.accountType} />}
                  {user.accountNumber && <DetailRow label="口座番号" value={user.accountNumber} />}
                  {user.accountHolderKana && <DetailRow label="口座名義" value={user.accountHolderKana} />}
                  {user.bankInfo && <DetailRow label="その他" value={user.bankInfo} />}
                </div>
              </>
            )}

            {(user.accountingContactName || user.accountingContactEmail || user.accountingContactPhone) && (
              <>
                <h4 className="text-sm font-bold text-foreground">経理担当者</h4>
                <div className="border border-border rounded-md overflow-hidden">
                  {user.accountingContactName && <DetailRow label="担当者名" value={user.accountingContactName} />}
                  {user.accountingContactEmail && <DetailRow label="メール" value={user.accountingContactEmail} />}
                  {user.accountingContactPhone && <DetailRow label="電話番号" value={user.accountingContactPhone} />}
                  {user.accountingContactFax && <DetailRow label="FAX" value={user.accountingContactFax} />}
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

            <div className="border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-2" data-testid="section-admin-memo">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">管理者メモ</span>
                </div>
                {!memoEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setMemoEditing(true)}
                    data-testid="button-edit-memo"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    編集
                  </Button>
                )}
              </div>
              {memoEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    placeholder="このユーザーに関するメモを入力..."
                    className="text-sm min-h-[80px] bg-white dark:bg-background border-amber-200 dark:border-amber-800"
                    data-testid="input-admin-memo"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => { setMemoText(user.adminMemo || ""); setMemoEditing(false); }}
                      data-testid="button-cancel-memo"
                    >
                      キャンセル
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => saveMemo.mutate()}
                      disabled={saveMemo.isPending}
                      data-testid="button-save-memo"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {saveMemo.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap" data-testid="text-admin-memo">
                  {user.adminMemo || <span className="text-muted-foreground text-xs">メモなし</span>}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground">基本情報</h4>
            <div className="space-y-3">
              <EditField label="企業名" name="companyName" value={editData.companyName} onChange={handleFieldChange} />
              <EditField label="企業名（カナ）" name="companyNameKana" value={editData.companyNameKana} onChange={handleFieldChange} />
              <EditField label="担当者名" name="contactName" value={editData.contactName} onChange={handleFieldChange} />
              <EditField label="メールアドレス" name="email" value={editData.email} onChange={handleFieldChange} />
              <EditField label="電話番号" name="phone" value={editData.phone} onChange={handleFieldChange} />
              <EditField label="FAX" name="fax" value={editData.fax} onChange={handleFieldChange} />
              <EditField label="郵便番号" name="postalCode" value={editData.postalCode} onChange={handleFieldChange} />
              <EditField label="住所" name="address" value={editData.address} onChange={handleFieldChange} />
              <EditField label="保有台数" name="truckCount" value={editData.truckCount} onChange={handleFieldChange} />
            </div>

            <h4 className="text-sm font-bold text-foreground">詳細情報</h4>
            <div className="space-y-3">
              <EditField label="代表者" name="representative" value={editData.representative} onChange={handleFieldChange} />
              <EditField label="設立年月" name="establishedDate" value={editData.establishedDate} onChange={handleFieldChange} />
              <EditField label="資本金" name="capital" value={editData.capital} onChange={handleFieldChange} />
              <EditField label="従業員数" name="employeeCount" value={editData.employeeCount} onChange={handleFieldChange} />
              <EditField label="Webサイト" name="websiteUrl" value={editData.websiteUrl} onChange={handleFieldChange} />
              <EditField label="運送許可番号" name="transportLicenseNumber" value={editData.transportLicenseNumber} onChange={handleFieldChange} />
              <EditField label="インボイス番号" name="invoiceRegistrationNumber" value={editData.invoiceRegistrationNumber} onChange={handleFieldChange} />
              <EditField label="営業エリア" name="businessArea" value={editData.businessArea} onChange={handleFieldChange} />
              <EditField label="事業内容" name="businessDescription" value={editData.businessDescription} onChange={handleFieldChange} type="textarea" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditMode(false)}
                data-testid="button-cancel-edit-bottom"
              >
                キャンセル
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isEditing}
                data-testid="button-save-user-bottom"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {isEditing ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
