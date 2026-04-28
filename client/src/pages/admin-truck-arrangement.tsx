import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Trash2, ChevronDown, ChevronUp, Phone, Building2, Calendar, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";

const STATUS_OPTIONS = [
  { value: "new", label: "新規", variant: "destructive" as const },
  { value: "confirmed", label: "対応中", variant: "default" as const },
  { value: "completed", label: "完了", variant: "secondary" as const },
];

function InquiryRow({ inquiry }: { inquiry: any }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (status: string) => apiRequest("PATCH", `/api/admin/truck-arrangement/${inquiry.id}`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/truck-arrangement"] }); toast({ title: "更新しました" }); },
    onError: () => toast({ title: "更新に失敗しました", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/truck-arrangement/${inquiry.id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/truck-arrangement"] }); toast({ title: "削除しました" }); },
    onError: () => toast({ title: "削除に失敗しました", variant: "destructive" }),
  });

  const statusInfo = STATUS_OPTIONS.find(s => s.value === inquiry.status) ?? STATUS_OPTIONS[0];

  return (
    <Card data-testid={`card-inquiry-${inquiry.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap cursor-pointer" onClick={() => setExpanded(v => !v)}>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <Badge variant="outline">{inquiry.serviceType}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString("ja-JP")}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />{inquiry.companyName}</span>
              <span className="text-sm text-muted-foreground">{inquiry.contactName}</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{inquiry.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {inquiry.pickupAddress && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />積込：{inquiry.pickupAddress}</span>}
              {inquiry.deliveryAddress && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />配送：{inquiry.deliveryAddress}</span>}
              {inquiry.vehicleSize && <span>車格：{inquiry.vehicleSize}</span>}
              {inquiry.vehicleCount && <span>{inquiry.vehicleCount}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={inquiry.status} onValueChange={v => { updateMutation.mutate(v); }} disabled={updateMutation.isPending}>
              <SelectTrigger className="w-24 h-8 text-xs" onClick={e => e.stopPropagation()} data-testid={`select-status-${inquiry.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost"
              onClick={e => { e.stopPropagation(); if (confirm("削除しますか？")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${inquiry.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-xs text-muted-foreground">■ 積み込み</p>
              <p>住所：{inquiry.pickupAddress}</p>
              {inquiry.pickupDate && <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />集荷日：{inquiry.pickupDate}</p>}
              {inquiry.pickupContact && <p>連絡先：{inquiry.pickupContact}</p>}
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-xs text-muted-foreground">■ 配送</p>
              <p>住所：{inquiry.deliveryAddress}</p>
              {inquiry.deliveryDate && <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />納品日：{inquiry.deliveryDate}</p>}
              {inquiry.deliveryContact && <p>連絡先：{inquiry.deliveryContact}</p>}
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-xs text-muted-foreground">■ 車両・荷物</p>
              {inquiry.vehicleSize && <p>車格：{inquiry.vehicleSize}</p>}
              {inquiry.vehicleCount && <p>台数：{inquiry.vehicleCount}</p>}
              {inquiry.cargoDetails && <p>物量・荷姿：{inquiry.cargoDetails}</p>}
              {inquiry.additionalWork && <p>付帯作業：{inquiry.additionalWork}</p>}
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-xs text-muted-foreground">■ 費用</p>
              {inquiry.desiredFare && <p>希望運賃：{inquiry.desiredFare}</p>}
              {inquiry.highwayFee && <p>高速代：{inquiry.highwayFee}</p>}
              {inquiry.paymentDate && <p>支払日：{inquiry.paymentDate}</p>}
            </div>
            {inquiry.remarks && (
              <div className="sm:col-span-2 space-y-1">
                <p className="font-semibold text-xs text-muted-foreground">■ 備考</p>
                <p className="whitespace-pre-wrap bg-muted/50 p-2 rounded">{inquiry.remarks}</p>
              </div>
            )}
            {inquiry.fax && <p className="text-muted-foreground">FAX：{inquiry.fax}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminTruckArrangement() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: inquiries, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/truck-arrangement"],
  });

  const filtered = inquiries?.filter(i => statusFilter === "all" || i.status === statusFilter) ?? [];
  const newCount = inquiries?.filter(i => i.status === "new").length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-5" data-testid="page-admin-truck-arrangement">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-page-title">トラック手配 依頼管理</h1>
            {newCount > 0 && <Badge variant="destructive">{newCount}件 新規</Badge>}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]" data-testid="select-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center">
            <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">該当する依頼はありません</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">{filtered.map(i => <InquiryRow key={i.id} inquiry={i} />)}</div>
        )}
      </div>
    </DashboardLayout>
  );
}
