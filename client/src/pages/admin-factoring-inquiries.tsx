import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banknote, Trash2, ChevronDown, ChevronUp, Building2, Phone, Mail, Wallet, Calendar, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import type { FactoringInquiry } from "@shared/schema";

const TIMING_LABELS: Record<string, string> = {
  immediate:      "すぐにでも",
  within_month:   "1ヶ月以内",
  within_3months: "3ヶ月以内",
  consulting:     "まずは相談したい",
};

function InquiryRow({ inquiry }: { inquiry: FactoringInquiry }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/factoring-inquiries/${inquiry.id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/factoring-inquiries"] }); toast({ title: "削除しました" }); },
    onError: () => toast({ title: "削除に失敗しました", variant: "destructive" }),
  });

  return (
    <Card data-testid={`card-inquiry-${inquiry.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap cursor-pointer" onClick={() => setExpanded(v => !v)}>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {inquiry.desiredTiming && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{TIMING_LABELS[inquiry.desiredTiming] ?? inquiry.desiredTiming}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString("ja-JP")}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className="flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5" />{inquiry.companyName}</span>
              <span>{inquiry.contactName}</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{inquiry.email}</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{inquiry.phone}</span>
            </div>
            {inquiry.receivableAmount && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Wallet className="w-3 h-3" />売掛金額：{inquiry.receivableAmount}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="icon" variant="ghost"
              onClick={e => { e.stopPropagation(); if (confirm("この問い合わせを削除しますか？")) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${inquiry.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-medium mb-1 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />お問い合わせ内容</p>
            <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{inquiry.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminFactoringInquiries() {
  const { data: inquiries, isLoading } = useQuery<FactoringInquiry[]>({
    queryKey: ["/api/admin/factoring-inquiries"],
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="page-admin-factoring">
        <div className="flex items-center gap-3">
          <Banknote className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">ファクタリング問い合わせ</h1>
          {inquiries && <Badge variant="outline">{inquiries.length}件</Badge>}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : !inquiries?.length ? (
          <Card><CardContent className="p-8 text-center">
            <Banknote className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">問い合わせはまだありません</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {inquiries.map(i => <InquiryRow key={i.id} inquiry={i} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
