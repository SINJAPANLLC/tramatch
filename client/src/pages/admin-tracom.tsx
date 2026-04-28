import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, Briefcase, Tag } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import type { TracomReview } from "@shared/schema";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:  { label: "審査待ち", variant: "destructive" },
  approved: { label: "公開中",   variant: "default" },
  rejected: { label: "非公開",   variant: "secondary" },
};

const CATEGORY_LABELS: Record<string, string> = {
  荷主企業: "荷主企業",
  運送会社: "運送会社",
  ドライバー: "ドライバー",
  その他: "その他",
};

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
      ))}
      <span className="text-xs ml-1 font-medium">{value.toFixed(1)}</span>
    </span>
  );
}

function ReviewRow({ review }: { review: TracomReview }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (status: string) => apiRequest("PATCH", `/api/admin/tracom-reviews/${review.id}`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/tracom-reviews"] }); toast({ title: "更新しました" }); },
    onError: () => toast({ title: "更新に失敗しました", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/tracom-reviews/${review.id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/tracom-reviews"] }); toast({ title: "削除しました" }); },
    onError: () => toast({ title: "削除に失敗しました", variant: "destructive" }),
  });

  const statusInfo = STATUS_MAP[review.status] ?? STATUS_MAP.pending;

  return (
    <Card data-testid={`card-review-${review.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap cursor-pointer" onClick={() => setExpanded(v => !v)}>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusInfo.variant} data-testid={`badge-status-${review.id}`}>{statusInfo.label}</Badge>
              <Badge variant="outline">{CATEGORY_LABELS[review.category] ?? review.category}</Badge>
              <StarRating value={review.rating} />
              <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("ja-JP")}</span>
            </div>
            <p className="font-medium text-sm">{review.title}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {review.targetName && <span>対象：{review.targetName}</span>}
              {review.nickname && <span>投稿者：{review.nickname}</span>}
              {review.prefecture && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{review.prefecture}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {review.status !== "approved" && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                onClick={e => { e.stopPropagation(); updateMutation.mutate("approved"); }}
                disabled={updateMutation.isPending}
                data-testid={`button-approve-${review.id}`}>
                <CheckCircle className="w-3.5 h-3.5 mr-1" />公開
              </Button>
            )}
            {review.status !== "rejected" && (
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50"
                onClick={e => { e.stopPropagation(); updateMutation.mutate("rejected"); }}
                disabled={updateMutation.isPending}
                data-testid={`button-reject-${review.id}`}>
                <XCircle className="w-3.5 h-3.5 mr-1" />非公開
              </Button>
            )}
            <Button size="icon" variant="ghost"
              onClick={e => { e.stopPropagation(); if (confirm("この口コミを削除しますか？")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${review.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border-t pt-4 space-y-3">
            <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{review.body}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {review.experience && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{review.experience}</span>}
              {review.workStyle && <span>{review.workStyle}</span>}
              {(review.tags ?? []).map(tag => (
                <span key={tag} className="flex items-center gap-1"><Tag className="w-3 h-3" />{tag}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminTracom() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: reviews, isLoading } = useQuery<TracomReview[]>({
    queryKey: ["/api/admin/tracom-reviews"],
  });

  const filtered = reviews?.filter(r => statusFilter === "all" || r.status === statusFilter) ?? [];
  const pendingCount = reviews?.filter(r => r.status === "pending").length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="page-admin-tracom">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-page-title">トラコミ（口コミ）管理</h1>
            {pendingCount > 0 && <Badge variant="destructive" data-testid="badge-pending-count">{pendingCount}件審査待ち</Badge>}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="pending">審査待ち</SelectItem>
              <SelectItem value="approved">公開中</SelectItem>
              <SelectItem value="rejected">非公開</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">該当する口コミはありません</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => <ReviewRow key={r.id} review={r} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
