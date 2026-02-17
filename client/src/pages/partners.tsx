import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Building, Phone, Mail, MapPin, Search, Pencil, Trash2, X, Truck } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import type { Partner } from "@shared/schema";

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

export default function Partners() {
  const { toast } = useToast();
  const [searchFilter, setSearchFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerFormData>(emptyForm);

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

  const filteredPartners = partners?.filter((p) =>
    !searchFilter || p.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (p.contactName && p.contactName.toLowerCase().includes(searchFilter.toLowerCase()))
  ) ?? [];

  const totalCount = partners?.length ?? 0;
  const carrierCount = partners?.filter((p) => p.businessType === "運送会社").length ?? 0;
  const shipperCount = partners?.filter((p) => p.businessType === "荷主").length ?? 0;
  const otherCount = partners?.filter((p) => p.businessType !== "運送会社" && p.businessType !== "荷主").length ?? 0;

  const businessTypeBadge = (type: string | null) => {
    if (type === "運送会社") return <Badge variant="default" className="text-xs shrink-0">運送会社</Badge>;
    if (type === "荷主") return <Badge variant="secondary" className="text-xs shrink-0">荷主</Badge>;
    return <Badge variant="outline" className="text-xs shrink-0">{type || "その他"}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">取引先管理</h1>
            <p className="text-sm text-muted-foreground mt-1">取引先企業の管理・登録</p>
          </div>
          <Button onClick={openAddForm} data-testid="button-add-partner">
            <Plus className="w-4 h-4 mr-1.5" />
            取引先を追加
          </Button>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-partners">{totalCount}</p>
                <p className="text-xs text-muted-foreground">取引先合計</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-carrier-count">{carrierCount}</p>
                <p className="text-xs text-muted-foreground">運送会社</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-shipper-count">{shipperCount}</p>
                <p className="text-xs text-muted-foreground">荷主</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-other-count">{otherCount}</p>
                <p className="text-xs text-muted-foreground">その他</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="取引先名で検索..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9"
              data-testid="input-search-partners"
            />
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredPartners.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">
                {searchFilter ? "検索結果が見つかりませんでした" : "登録された取引先はありません"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">取引先を追加して管理できます</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && filteredPartners.length > 0 && (
          <div className="space-y-3">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} data-testid={`card-partner-${partner.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground">{partner.companyName}</h3>
                      {businessTypeBadge(partner.businessType)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(partner)} data-testid={`button-edit-partner-${partner.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(partner.id)} data-testid={`button-delete-partner-${partner.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    {partner.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                        <span>{partner.address}</span>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                        <span>{partner.phone}</span>
                      </div>
                    )}
                    {partner.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
                        <span>{partner.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      {partner.contactName && (
                        <span>担当: {partner.contactName}</span>
                      )}
                      {partner.truckCount && (
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          {partner.truckCount}台
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
