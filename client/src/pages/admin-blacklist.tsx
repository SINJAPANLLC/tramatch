import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserX, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import type { BlacklistEntry } from "@shared/schema";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:  { label: "審査待ち", variant: "destructive" },
  approved: { label: "掲載中",   variant: "default" },
  rejected: { label: "非掲載",   variant: "secondary" },
};

const SOURCE_LABELS: Record<string, string> = {
  official: "公式情報",
  report:   "報告",
};

function EntryRow({ entry }: { entry: BlacklistEntry }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (status: string) => apiRequest("PATCH", `/api/admin/blacklist/${entry.id}`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/blacklist"] }); toast({ title: "更新しました" }); },
    onError: () => toast({ title: "更新に失敗しました", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/blacklist/${entry.id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/blacklist"] }); toast({ title: "削除しました" }); },
    onError: () => toast({ title: "削除に失敗しました", variant: "destructive" }),
  });

  const statusInfo = STATUS_MAP[entry.status] ?? STATUS_MAP.pending;

  return (
    <Card data-testid={`card-entry-${entry.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap cursor-pointer" onClick={() => setExpanded(v => !v)}>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusInfo.variant} data-testid={`badge-status-${entry.id}`}>{statusInfo.label}</Badge>
              <Badge variant="outline">{entry.entityType}</Badge>
              <Badge variant="outline">{SOURCE_LABELS[entry.source] ?? entry.source}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("ja-JP")}</span>
            </div>
            <p className="font-semibold">{entry.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {entry.prefecture && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.prefecture}</span>}
              {(entry.reasons ?? []).map(r => (
                <span key={r} className="flex items-center gap-1 text-orange-600"><AlertTriangle className="w-3 h-3" />{r}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {entry.status !== "approved" && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                onClick={e => { e.stopPropagation(); updateMutation.mutate("approved"); }}
                disabled={updateMutation.isPending}
                data-testid={`button-approve-${entry.id}`}>
                <CheckCircle className="w-3.5 h-3.5 mr-1" />掲載
              </Button>
            )}
            {entry.status !== "rejected" && (
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50"
                onClick={e => { e.stopPropagation(); updateMutation.mutate("rejected"); }}
                disabled={updateMutation.isPending}
                data-testid={`button-reject-${entry.id}`}>
                <XCircle className="w-3.5 h-3.5 mr-1" />非掲載
              </Button>
            )}
            <Button size="icon" variant="ghost"
              onClick={e => { e.stopPropagation(); if (confirm("このエントリを削除しますか？")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${entry.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border-t pt-4 space-y-2">
            <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{entry.detail}</p>
            {entry.contactEmail && (
              <p className="text-xs text-muted-foreground">報告者メール：{entry.contactEmail}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminBlacklist() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: entries, isLoading } = useQuery<BlacklistEntry[]>({
    queryKey: ["/api/admin/blacklist"],
  });

  const filtered = entries?.filter(e => statusFilter === "all" || e.status === statusFilter) ?? [];
  const pendingCount = entries?.filter(e => e.status === "pending").length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="page-admin-blacklist">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <UserX className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-page-title">強制退会リスト管理</h1>
            {pendingCount > 0 && <Badge variant="destructive" data-testid="badge-pending-count">{pendingCount}件審査待ち</Badge>}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="pending">審査待ち</SelectItem>
              <SelectItem value="approved">掲載中</SelectItem>
              <SelectItem value="rejected">非掲載</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center">
            <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">該当するエントリはありません</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(e => <EntryRow key={e.id} entry={e} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
