import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Send, Mail, CheckCircle, Clock, AlertTriangle,
  XCircle, Loader2, Trash2, RefreshCw, Users, Building2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

type Invoice = {
  id: string;
  invoiceNumber: string;
  userId: string;
  companyName: string;
  email: string;
  planType: string;
  amount: number;
  tax: number;
  totalAmount: number;
  billingMonth: string;
  dueDate: string;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  sentAt: string | null;
  adminNote: string | null;
  description: string | null;
  createdAt: string;
};

function statusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge variant="default" className="bg-green-600" data-testid="badge-status-paid"><CheckCircle className="w-3 h-3 mr-1" />入金済み</Badge>;
    case "overdue":
      return <Badge variant="destructive" data-testid="badge-status-overdue"><AlertTriangle className="w-3 h-3 mr-1" />期限超過</Badge>;
    case "cancelled":
      return <Badge variant="secondary" data-testid="badge-status-cancelled"><XCircle className="w-3 h-3 mr-1" />取消</Badge>;
    default:
      return <Badge variant="outline" data-testid="badge-status-unpaid"><Clock className="w-3 h-3 mr-1" />未入金</Badge>;
  }
}

export default function AdminInvoices() {
  const { toast } = useToast();
  const [billingMonth, setBillingMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/admin/invoices"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/invoices/generate", { billingMonth });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "請求書発行完了", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
    },
    onError: (error: any) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/invoices/${id}/send`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "送信完了", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
    },
    onError: (error: any) => {
      toast({ title: "送信エラー", description: error.message, variant: "destructive" });
    },
  });

  const bulkSendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/invoices/bulk-send", { invoiceIds: selectedIds });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "一括送信完了", description: data.message });
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
    },
    onError: (error: any) => {
      toast({ title: "送信エラー", description: error.message, variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/invoices/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "更新完了", description: "ステータスを更新しました" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
    },
    onError: (error: any) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/invoices/${id}`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "削除完了", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invoices"] });
    },
    onError: (error: any) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const filtered = invoices?.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    return true;
  }) || [];

  const stats = {
    total: invoices?.length || 0,
    unpaid: invoices?.filter((i) => i.status === "unpaid").length || 0,
    paid: invoices?.filter((i) => i.status === "paid").length || 0,
    overdue: invoices?.filter((i) => i.status === "overdue").length || 0,
    totalAmount: invoices?.reduce((sum, i) => sum + i.totalAmount, 0) || 0,
    paidAmount: invoices?.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.totalAmount, 0) || 0,
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const unsent = filtered.filter((i) => i.status === "unpaid");
    setSelectedIds(unsent.map((i) => i.id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6" data-testid="admin-invoices-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <FileText className="w-6 h-6 text-primary" />
            請求書発行
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card data-testid="card-stat-total">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  発行済み
                </div>
                <p className="text-2xl font-bold">{stats.total}件</p>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-unpaid">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  未入金
                </div>
                <p className="text-2xl font-bold text-orange-600">{stats.unpaid}件</p>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-paid">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <CheckCircle className="w-4 h-4" />
                  入金済み
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.paid}件</p>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-amount">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  請求合計
                </div>
                <p className="text-2xl font-bold">¥{stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">入金: ¥{stats.paidAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card data-testid="card-generate">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              請求書の自動発行
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="space-y-1">
                <Label>請求月</Label>
                <Input
                  type="month"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  className="w-48"
                  data-testid="input-billing-month"
                />
              </div>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                data-testid="button-generate-invoices"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                一括発行
              </Button>
              <p className="text-sm text-muted-foreground">
                プレミアムプランの有料ユーザーに対して請求書を自動発行します
              </p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-invoice-list">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-lg">請求書一覧</CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36" data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="unpaid">未入金</SelectItem>
                    <SelectItem value="paid">入金済み</SelectItem>
                    <SelectItem value="overdue">期限超過</SelectItem>
                    <SelectItem value="cancelled">取消</SelectItem>
                  </SelectContent>
                </Select>
                {selectedIds.length > 0 && (
                  <Button
                    onClick={() => bulkSendMutation.mutate()}
                    disabled={bulkSendMutation.isPending}
                    data-testid="button-bulk-send"
                  >
                    {bulkSendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    選択分を一括送信（{selectedIds.length}件）
                  </Button>
                )}
                <Button variant="outline" onClick={selectAllFiltered} data-testid="button-select-all">
                  <Users className="w-4 h-4 mr-2" />
                  未入金を全選択
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="text-no-invoices">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>請求書がありません</p>
                <p className="text-sm mt-1">上の「一括発行」から請求書を生成してください</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 border rounded-md"
                    data-testid={`invoice-row-${inv.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                        className="w-4 h-4 mt-1"
                        data-testid={`checkbox-invoice-${inv.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Building2 className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-bold text-base text-foreground" data-testid={`text-company-${inv.id}`}>
                            {inv.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground" data-testid={`text-invoice-number-${inv.id}`}>
                            {inv.invoiceNumber}
                          </span>
                          {statusBadge(inv.status)}
                          {inv.sentAt && (
                            <Badge variant="secondary" className="text-xs">
                              <Send className="w-3 h-3 mr-1" />
                              送信済み
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>
                            <Mail className="w-3 h-3 inline mr-1" />
                            {inv.email}
                          </span>
                          <span>{inv.billingMonth}</span>
                          <span>期限: {inv.dueDate}</span>
                        </div>
                        {inv.description && inv.description.includes("追加ユーザー") && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5" data-testid={`text-added-users-${inv.id}`}>
                            <Users className="w-3 h-3 inline mr-1" />
                            {inv.description.split("\n").filter((l: string) => l.includes("追加ユーザー")).join("")}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold" data-testid={`text-amount-${inv.id}`}>
                          ¥{inv.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">（税込）</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                      <Select
                        value={inv.status}
                        onValueChange={(v) => statusMutation.mutate({ id: inv.id, status: v })}
                      >
                        <SelectTrigger className="w-28" data-testid={`select-status-${inv.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">未入金</SelectItem>
                          <SelectItem value="paid">入金済み</SelectItem>
                          <SelectItem value="overdue">期限超過</SelectItem>
                          <SelectItem value="cancelled">取消</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => sendMutation.mutate(inv.id)}
                        disabled={sendMutation.isPending}
                        data-testid={`button-send-${inv.id}`}
                      >
                        <Mail className="w-4 h-4 mr-1.5" />
                        メール送信
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("この請求書を削除しますか？")) {
                            deleteMutation.mutate(inv.id);
                          }
                        }}
                        title="削除"
                        data-testid={`button-delete-${inv.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
