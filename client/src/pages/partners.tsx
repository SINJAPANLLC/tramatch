import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Pencil, Trash2, X, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import type { Partner } from "@shared/schema";

const PREFECTURES = [
  "北海道","青森","岩手","宮城","秋田","山形","福島",
  "茨城","栃木","群馬","埼玉","千葉","東京","神奈川",
  "新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知",
  "三重","滋賀","京都","大阪","兵庫","奈良","和歌山",
  "鳥取","島根","岡山","広島","山口","徳島","香川","愛媛","高知",
  "福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄",
];

const PER_PAGE_OPTIONS = [20, 50, 100];

type PartnerFormData = {
  companyName: string;
  companyNameKana: string;
  representative: string;
  contactName: string;
  phone: string;
  fax: string;
  email: string;
  postalCode: string;
  address: string;
  businessType: string;
  truckCount: string;
  notes: string;
};

const emptyForm: PartnerFormData = {
  companyName: "",
  companyNameKana: "",
  representative: "",
  contactName: "",
  phone: "",
  fax: "",
  email: "",
  postalCode: "",
  address: "",
  businessType: "運送会社",
  truckCount: "",
  notes: "",
};

function PartnerForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isSubmitting,
  title,
}: {
  form: PartnerFormData;
  setForm: (f: PartnerFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  title: string;
}) {
  const update = (field: keyof PartnerFormData, value: string) =>
    setForm({ ...form, [field]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-testid="dialog-partner-form">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onCancel} data-testid="button-close-form">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label>企業名 *</Label>
              <Input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} data-testid="input-company-name" />
            </div>
            <div>
              <Label>フリガナ</Label>
              <Input value={form.companyNameKana} onChange={(e) => update("companyNameKana", e.target.value)} data-testid="input-company-name-kana" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>代表者</Label>
                <Input value={form.representative} onChange={(e) => update("representative", e.target.value)} data-testid="input-representative" />
              </div>
              <div>
                <Label>担当者</Label>
                <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} data-testid="input-contact-name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>電話番号</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} data-testid="input-phone" />
              </div>
              <div>
                <Label>FAX</Label>
                <Input value={form.fax} onChange={(e) => update("fax", e.target.value)} data-testid="input-fax" />
              </div>
            </div>
            <div>
              <Label>メールアドレス</Label>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} data-testid="input-email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>郵便番号</Label>
                <Input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} data-testid="input-postal-code" />
              </div>
              <div>
                <Label>業種</Label>
                <select
                  value={form.businessType}
                  onChange={(e) => update("businessType", e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="select-business-type"
                >
                  <option value="運送会社">運送会社</option>
                  <option value="荷主">荷主</option>
                  <option value="その他">その他</option>
                </select>
              </div>
            </div>
            <div>
              <Label>住所</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} data-testid="input-address" />
            </div>
            <div>
              <Label>保有車両数</Label>
              <Input value={form.truckCount} onChange={(e) => update("truckCount", e.target.value)} data-testid="input-truck-count" />
            </div>
            <div>
              <Label>備考</Label>
              <Input value={form.notes} onChange={(e) => update("notes", e.target.value)} data-testid="input-notes" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 flex-wrap">
            <Button variant="outline" onClick={onCancel} data-testid="button-cancel">キャンセル</Button>
            <Button onClick={onSubmit} disabled={isSubmitting || !form.companyName.trim()} data-testid="button-submit-partner">
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} data-testid="button-prev-page">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-xs text-muted-foreground px-2">{page}</span>
      <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} data-testid="button-next-page">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function Partners() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"partners" | "invite">("partners");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchPrefecture, setSearchPrefecture] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [appliedSearch, setAppliedSearch] = useState({ keyword: "", prefecture: "", city: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerFormData>(emptyForm);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      await apiRequest("POST", "/api/partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setShowForm(false);
      setForm(emptyForm);
      toast({ title: "取引先を追加しました" });
    },
    onError: () => {
      toast({ title: "取引先の追加に失敗しました", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PartnerFormData }) => {
      await apiRequest("PATCH", `/api/partners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setEditingPartner(null);
      setShowForm(false);
      setForm(emptyForm);
      toast({ title: "取引先を更新しました" });
    },
    onError: () => {
      toast({ title: "取引先の更新に失敗しました", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setDeleteConfirmId(null);
      toast({ title: "取引先を削除しました" });
    },
    onError: () => {
      toast({ title: "取引先の削除に失敗しました", variant: "destructive" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/partners/invite", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "招待メールを送信しました" });
      setInviteEmail("");
    },
    onError: (error: Error) => {
      toast({ title: "招待に失敗しました", description: error.message, variant: "destructive" });
    },
  });

  const openAddForm = () => {
    setEditingPartner(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (partner: Partner) => {
    setEditingPartner(partner);
    setForm({
      companyName: partner.companyName,
      companyNameKana: partner.companyNameKana || "",
      representative: partner.representative || "",
      contactName: partner.contactName || "",
      phone: partner.phone || "",
      fax: partner.fax || "",
      email: partner.email || "",
      postalCode: partner.postalCode || "",
      address: partner.address || "",
      businessType: partner.businessType || "運送会社",
      truckCount: partner.truckCount || "",
      notes: partner.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleSearch = () => {
    setAppliedSearch({ keyword: searchKeyword, prefecture: searchPrefecture, city: searchCity });
    setPage(1);
  };

  const filteredPartners = useMemo(() => {
    if (!partners) return [];
    return partners.filter((p) => {
      const { keyword, prefecture, city } = appliedSearch;
      if (keyword && !p.companyName.toLowerCase().includes(keyword.toLowerCase()) &&
          !(p.contactName && p.contactName.toLowerCase().includes(keyword.toLowerCase())) &&
          !(p.phone && p.phone.includes(keyword))) {
        return false;
      }
      if (prefecture && !(p.address && p.address.includes(prefecture))) return false;
      if (city && !(p.address && p.address.includes(city))) return false;
      return true;
    });
  }, [partners, appliedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / perPage));
  const paginated = filteredPartners.slice((page - 1) * perPage, page * perPage);

  const tabBar = (
    <div className="flex items-center gap-0 border-b border-border mb-5">
      <button
        onClick={() => setActiveTab("partners")}
        className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === "partners" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
        data-testid="tab-partners"
      >
        取引先
      </button>
      <button
        onClick={() => setActiveTab("invite")}
        className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === "invite" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
        data-testid="tab-invite"
      >
        招待
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-4">
        {tabBar}

        {activeTab === "partners" && (
          <>
            <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
              <div className="flex items-end gap-2 flex-wrap">
                <div className="min-w-[200px]">
                  <Input
                    placeholder="キーワード 例：トラマッチ 0876"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="text-sm"
                    data-testid="input-search-keyword"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="w-[130px]">
                  <Select value={searchPrefecture} onValueChange={setSearchPrefecture}>
                    <SelectTrigger className="text-sm" data-testid="select-search-prefecture">
                      <SelectValue placeholder="都道府県" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全て</SelectItem>
                      {PREFECTURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[130px]">
                  <Input
                    placeholder="市区町村"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="text-sm"
                    data-testid="input-search-city"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} data-testid="button-search">
                  <Search className="w-4 h-4 mr-1.5" />
                  検索
                </Button>
              </div>
              <Button variant="outline" onClick={openAddForm} data-testid="button-add-partner">
                <UserPlus className="w-4 h-4 mr-1.5" />
                取引先を追加
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <span className="text-sm text-muted-foreground font-bold" data-testid="text-result-count">
                検索結果 {filteredPartners.length}件
              </span>
              <div className="flex items-center gap-2">
                <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-auto text-xs" data-testid="select-per-page">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PER_PAGE_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n}件 / ページ</SelectItem>)}
                  </SelectContent>
                </Select>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-partners">
                  <thead>
                    <tr className="border-b bg-muted/60">
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">企業名</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">住所</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">電話番号</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">FAX番号</th>
                      <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">過去委託</th>
                      <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">過去受託</th>
                      <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading && Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-3 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-3 py-3"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-3 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-3 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-3 py-3"><Skeleton className="h-4 w-16 mx-auto" /></td>
                        <td className="px-3 py-3"><Skeleton className="h-4 w-16 mx-auto" /></td>
                        <td className="px-3 py-3"><Skeleton className="h-4 w-20 mx-auto" /></td>
                      </tr>
                    ))}

                    {!isLoading && paginated.map((partner, index) => (
                      <tr
                        key={partner.id}
                        className={`hover-elevate transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                        data-testid={`row-partner-${partner.id}`}
                      >
                        <td className="px-3 py-3 align-top">
                          <div className="font-bold text-foreground text-[12px] leading-tight">{partner.companyName}</div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span className="text-[12px] text-muted-foreground">{partner.address || "-"}</span>
                        </td>
                        <td className="px-3 py-3 align-top whitespace-nowrap">
                          <span className="text-[12px] text-muted-foreground">{partner.phone || "-"}</span>
                        </td>
                        <td className="px-3 py-3 align-top whitespace-nowrap">
                          <span className="text-[12px] text-muted-foreground">{partner.fax || "-"}</span>
                        </td>
                        <td className="px-3 py-3 align-top text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge variant="secondary" className="text-[10px]">なし</Badge>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge variant="secondary" className="text-[10px]">なし</Badge>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditForm(partner)}
                              data-testid={`button-edit-partner-${partner.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(partner.id)}
                              data-testid={`button-delete-partner-${partner.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate("/cargo/new")}
                              data-testid={`button-cargo-register-${partner.id}`}
                            >
                              荷物登録
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!isLoading && paginated.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                          <p className="font-medium text-muted-foreground" data-testid="text-empty-state">
                            {appliedSearch.keyword || appliedSearch.prefecture || appliedSearch.city
                              ? "検索結果が見つかりませんでした"
                              : "登録された取引先はありません"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">「取引先を追加」から追加できます</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex items-center justify-end gap-2 flex-wrap mt-4">
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-auto text-xs" data-testid="select-per-page-bottom">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n}件 / ページ</SelectItem>)}
                </SelectContent>
              </Select>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}

        {activeTab === "invite" && (
          <Card>
            <CardContent className="p-8 text-center">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">取引先を招待</p>
              <p className="text-xs text-muted-foreground mt-2 mb-4">メールアドレスを入力して取引先を招待できます</p>
              <div className="max-w-md mx-auto flex items-center gap-2">
                <Input placeholder="メールアドレスを入力..." className="text-sm" data-testid="input-invite-email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <Button data-testid="button-send-invite" onClick={() => inviteMutation.mutate(inviteEmail)} disabled={inviteMutation.isPending || !inviteEmail.trim()}>
                  {inviteMutation.isPending ? "送信中..." : "招待する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <PartnerForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingPartner(null); setForm(emptyForm); }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            title={editingPartner ? "取引先を編集" : "取引先を追加"}
          />
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-testid="dialog-delete-confirm">
            <Card className="w-full max-w-sm mx-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-2">取引先を削除</h2>
                <p className="text-sm text-muted-foreground mb-4">この取引先を削除してもよろしいですか？この操作は取り消せません。</p>
                <div className="flex justify-end gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => setDeleteConfirmId(null)} data-testid="button-cancel-delete">キャンセル</Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
                    disabled={deleteMutation.isPending}
                    data-testid="button-confirm-delete"
                  >
                    {deleteMutation.isPending ? "削除中..." : "削除"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
