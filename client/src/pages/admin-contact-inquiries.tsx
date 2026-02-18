import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Trash2, Mail, Phone, Building, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import type { ContactInquiry } from "@shared/schema";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  unread: { label: "未読", variant: "destructive" },
  read: { label: "既読", variant: "secondary" },
  replied: { label: "返信済", variant: "default" },
  closed: { label: "完了", variant: "outline" },
};

const CATEGORY_MAP: Record<string, string> = {
  general: "一般的なお問い合わせ",
  account: "アカウントについて",
  billing: "お支払いについて",
  technical: "技術的なお問い合わせ",
  partnership: "提携・パートナーシップ",
  other: "その他",
};

function InquiryRow({ inquiry }: { inquiry: ContactInquiry }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [adminNote, setAdminNote] = useState(inquiry.adminNote || "");

  const updateMutation = useMutation({
    mutationFn: (data: { status: string; adminNote?: string }) =>
      apiRequest("PATCH", `/api/admin/contact-inquiries/${inquiry.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-inquiries"] });
      toast({ title: "更新しました" });
    },
    onError: () => {
      toast({ title: "更新に失敗しました", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/contact-inquiries/${inquiry.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-inquiries"] });
      toast({ title: "削除しました" });
    },
    onError: () => {
      toast({ title: "削除に失敗しました", variant: "destructive" });
    },
  });

  const statusInfo = STATUS_MAP[inquiry.status] || STATUS_MAP.unread;

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded && inquiry.status === "unread") {
      updateMutation.mutate({ status: "read" });
    }
  };

  return (
    <Card data-testid={`card-inquiry-${inquiry.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap cursor-pointer" onClick={handleExpand}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={statusInfo.variant} data-testid={`badge-status-${inquiry.id}`}>{statusInfo.label}</Badge>
              <Badge variant="outline">{CATEGORY_MAP[inquiry.category] || inquiry.category}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(inquiry.createdAt!).toLocaleDateString("ja-JP")}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{inquiry.companyName}</span>
              <span className="font-medium">{inquiry.name}</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{inquiry.email}</span>
              {inquiry.phone && (
                <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{inquiry.phone}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); if (confirm("このお問い合わせを削除しますか？")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${inquiry.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium mb-1">お問い合わせ内容</p>
              <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{inquiry.message}</p>
            </div>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium mb-1">管理者メモ</p>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="管理者メモを入力..."
                  rows={2}
                  data-testid={`input-admin-note-${inquiry.id}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={inquiry.status}
                  onValueChange={(val) => updateMutation.mutate({ status: val, adminNote })}
                >
                  <SelectTrigger className="w-[130px]" data-testid={`select-status-${inquiry.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">未読</SelectItem>
                    <SelectItem value="read">既読</SelectItem>
                    <SelectItem value="replied">返信済</SelectItem>
                    <SelectItem value="closed">完了</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ status: inquiry.status, adminNote })}
                  disabled={updateMutation.isPending}
                  data-testid={`button-save-note-${inquiry.id}`}
                >
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminContactInquiries() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: inquiries, isLoading } = useQuery<ContactInquiry[]>({
    queryKey: ["/api/admin/contact-inquiries"],
  });

  const filtered = inquiries?.filter(
    (i) => statusFilter === "all" || i.status === statusFilter
  ) || [];

  const unreadCount = inquiries?.filter((i) => i.status === "unread").length || 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="page-admin-contact-inquiries">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-page-title">お問い合わせ管理</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" data-testid="badge-unread-count">{unreadCount}件未読</Badge>
            )}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="unread">未読</SelectItem>
              <SelectItem value="read">既読</SelectItem>
              <SelectItem value="replied">返信済</SelectItem>
              <SelectItem value="closed">完了</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {statusFilter === "all" ? "お問い合わせはまだありません" : `${STATUS_MAP[statusFilter]?.label || ""}のお問い合わせはありません`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((inquiry) => (
              <InquiryRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
