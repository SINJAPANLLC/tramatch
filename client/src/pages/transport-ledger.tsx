import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus, Download, Pencil, Trash2, X, ChevronDown, ChevronUp, Truck, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import type { TransportRecord } from "@shared/schema";

type RecordFormData = {
  transportCompany: string;
  shipperName: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleType: string;
  departureArea: string;
  arrivalArea: string;
  transportDate: string;
  cargoDescription: string;
  fare: string;
  status: string;
  notes: string;
};

const emptyForm: RecordFormData = {
  transportCompany: "",
  shipperName: "",
  driverName: "",
  driverPhone: "",
  vehicleNumber: "",
  vehicleType: "",
  departureArea: "",
  arrivalArea: "",
  transportDate: "",
  cargoDescription: "",
  fare: "",
  status: "active",
  notes: "",
};

export default function TransportLedger() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TransportRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<RecordFormData>(emptyForm);

  const { data: records, isLoading } = useQuery<TransportRecord[]>({
    queryKey: ["/api/transport-records"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: RecordFormData) => {
      await apiRequest("POST", "/api/transport-records", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport-records"] });
      setShowAddForm(false);
      setForm(emptyForm);
      toast({ title: "記録を追加しました" });
    },
    onError: () => {
      toast({ title: "記録の追加に失敗しました", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RecordFormData }) => {
      await apiRequest("PATCH", `/api/transport-records/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport-records"] });
      setEditingRecord(null);
      setForm(emptyForm);
      toast({ title: "記録を更新しました" });
    },
    onError: () => {
      toast({ title: "記録の更新に失敗しました", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/transport-records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport-records"] });
      setDeleteConfirmId(null);
      toast({ title: "記録を削除しました" });
    },
    onError: () => {
      toast({ title: "記録の削除に失敗しました", variant: "destructive" });
    },
  });

  const update = (field: keyof RecordFormData, value: string) =>
    setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    if (!form.transportCompany.trim()) return;
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openEditForm = (record: TransportRecord) => {
    setEditingRecord(record);
    setForm({
      transportCompany: record.transportCompany,
      shipperName: record.shipperName || "",
      driverName: record.driverName || "",
      driverPhone: record.driverPhone || "",
      vehicleNumber: record.vehicleNumber || "",
      vehicleType: record.vehicleType || "",
      departureArea: record.departureArea || "",
      arrivalArea: record.arrivalArea || "",
      transportDate: record.transportDate || "",
      cargoDescription: record.cargoDescription || "",
      fare: record.fare || "",
      status: record.status,
      notes: record.notes || "",
    });
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingRecord(null);
    setForm(emptyForm);
  };

  const handleExport = () => {
    toast({ title: "準備中", description: "エクスポート機能は現在準備中です" });
  };

  const totalRecords = records?.length ?? 0;
  const activeCount = records?.filter((r) => r.status === "active").length ?? 0;
  const completedCount = records?.filter((r) => r.status === "completed").length ?? 0;

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge className="text-xs bg-green-600 text-white shrink-0">稼働中</Badge>;
    return <Badge variant="secondary" className="text-xs shrink-0">完了</Badge>;
  };

  const isFormOpen = showAddForm || editingRecord !== null;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">実運送体制管理簿</h1>
            <p className="text-sm text-muted-foreground mt-1">実運送体制の管理・記録</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExport} data-testid="button-export-ledger">
              <Download className="w-4 h-4 mr-1.5" />
              エクスポート
            </Button>
            <Button onClick={() => { setEditingRecord(null); setForm(emptyForm); setShowAddForm(true); }} data-testid="button-add-record">
              <Plus className="w-4 h-4 mr-1.5" />
              新規記録
            </Button>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-records">{totalRecords}</p>
                <p className="text-xs text-muted-foreground">総記録数</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-transports">{activeCount}</p>
                <p className="text-xs text-muted-foreground">稼働中</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-completed-transports">{completedCount}</p>
                <p className="text-xs text-muted-foreground">完了済み</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isFormOpen && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <h2 className="text-base font-bold text-foreground">
                  {editingRecord ? "記録を編集" : "新規記録を追加"}
                </h2>
                <Button variant="ghost" size="icon" onClick={cancelForm} data-testid="button-close-record-form">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>運送会社名 *</Label>
                  <Input value={form.transportCompany} onChange={(e) => update("transportCompany", e.target.value)} data-testid="input-transport-company" />
                </div>
                <div>
                  <Label>荷主名</Label>
                  <Input value={form.shipperName} onChange={(e) => update("shipperName", e.target.value)} data-testid="input-shipper-name" />
                </div>
                <div>
                  <Label>運転者名</Label>
                  <Input value={form.driverName} onChange={(e) => update("driverName", e.target.value)} data-testid="input-driver-name" />
                </div>
                <div>
                  <Label>運転者電話番号</Label>
                  <Input value={form.driverPhone} onChange={(e) => update("driverPhone", e.target.value)} data-testid="input-driver-phone" />
                </div>
                <div>
                  <Label>車両番号</Label>
                  <Input value={form.vehicleNumber} onChange={(e) => update("vehicleNumber", e.target.value)} data-testid="input-vehicle-number" />
                </div>
                <div>
                  <Label>車両種別</Label>
                  <Input value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)} data-testid="input-vehicle-type" />
                </div>
                <div>
                  <Label>出発地</Label>
                  <Input value={form.departureArea} onChange={(e) => update("departureArea", e.target.value)} data-testid="input-departure-area" />
                </div>
                <div>
                  <Label>到着地</Label>
                  <Input value={form.arrivalArea} onChange={(e) => update("arrivalArea", e.target.value)} data-testid="input-arrival-area" />
                </div>
                <div>
                  <Label>運送日</Label>
                  <Input type="date" value={form.transportDate} onChange={(e) => update("transportDate", e.target.value)} data-testid="input-transport-date" />
                </div>
                <div>
                  <Label>運賃</Label>
                  <Input value={form.fare} onChange={(e) => update("fare", e.target.value)} data-testid="input-fare" />
                </div>
                <div>
                  <Label>貨物内容</Label>
                  <Input value={form.cargoDescription} onChange={(e) => update("cargoDescription", e.target.value)} data-testid="input-cargo-description" />
                </div>
                <div>
                  <Label>ステータス</Label>
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    data-testid="select-status"
                  >
                    <option value="active">稼働中</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <Label>備考</Label>
                <Input value={form.notes} onChange={(e) => update("notes", e.target.value)} data-testid="input-record-notes" />
              </div>
              <div className="flex justify-end gap-2 mt-4 flex-wrap">
                <Button variant="outline" onClick={cancelForm} data-testid="button-cancel-record">キャンセル</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !form.transportCompany.trim()} data-testid="button-submit-record">
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 flex-wrap">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!isLoading && (!records || records.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">管理簿の記録はありません</p>
              <p className="text-xs text-muted-foreground mt-2">実運送の体制情報を記録・管理できます</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && records && records.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-transport-records">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 text-muted-foreground font-medium">日付</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">運送会社</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">運転者</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">区間</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">車両</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">ステータス</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b last:border-b-0" data-testid={`row-record-${record.id}`}>
                      <td className="p-3 text-foreground whitespace-nowrap">
                        {record.transportDate || "-"}
                      </td>
                      <td className="p-3 text-foreground">
                        {record.transportCompany}
                      </td>
                      <td className="p-3 text-foreground">
                        {record.driverName || "-"}
                      </td>
                      <td className="p-3 text-foreground whitespace-nowrap">
                        {record.departureArea && record.arrivalArea
                          ? `${record.departureArea} → ${record.arrivalArea}`
                          : record.departureArea || record.arrivalArea || "-"}
                      </td>
                      <td className="p-3 text-foreground">
                        {record.vehicleNumber || record.vehicleType || "-"}
                      </td>
                      <td className="p-3">
                        {statusBadge(record.status)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(record)} data-testid={`button-edit-record-${record.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(record.id)} data-testid={`button-delete-record-${record.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-testid="dialog-delete-confirm">
            <Card className="w-full max-w-sm mx-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-2">記録を削除</h2>
                <p className="text-sm text-muted-foreground mb-4">この記録を削除してもよろしいですか？この操作は取り消せません。</p>
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
