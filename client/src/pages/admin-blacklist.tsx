import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserX, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, AlertTriangle, Plus, X } from "lucide-react";
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

const addSchema = z.object({
  entityType: z.string().min(1, "種別を選択してください"),
  name: z.string().min(1, "名前を入力してください"),
  detail: z.string().min(1, "詳細を入力してください"),
  prefecture: z.string().optional(),
  contactEmail: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  status: z.string().default("approved"),
});
type AddForm = z.infer<typeof addSchema>;

function AddEntryDialog({ onAdded }: { onAdded: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [reasonInput, setReasonInput] = useState("");

  const form = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { entityType: "", name: "", detail: "", prefecture: "", contactEmail: "", status: "approved" },
  });

  const addMutation = useMutation({
    mutationFn: (data: AddForm) =>
      apiRequest("POST", "/api/admin/blacklist", { ...data, reasons, source: "official" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blacklist"] });
      toast({ title: "追加しました" });
      form.reset();
      setReasons([]);
      setReasonInput("");
      setOpen(false);
      onAdded();
    },
    onError: () => toast({ title: "追加に失敗しました", variant: "destructive" }),
  });

  const addReason = () => {
    const t = reasonInput.trim();
    if (t && !reasons.includes(t)) { setReasons([...reasons, t]); setReasonInput(""); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-entry"><Plus className="w-4 h-4 mr-1" />新規追加</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>強制退会リストに追加</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(d => addMutation.mutate(d))} className="space-y-4">

            <FormField control={form.control} name="entityType" render={({ field }) => (
              <FormItem>
                <FormLabel>種別 <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger data-testid="select-entity-type"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="荷主企業">荷主企業</SelectItem>
                    <SelectItem value="運送会社">運送会社</SelectItem>
                    <SelectItem value="個人">個人</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>名前・社名 <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="株式会社〇〇 / 山田太郎" data-testid="input-name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div>
              <FormLabel>理由タグ</FormLabel>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="例：未払い、詐欺、契約違反"
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addReason(); } }}
                  data-testid="input-reason"
                />
                <Button type="button" variant="outline" onClick={addReason} data-testid="button-add-reason">追加</Button>
              </div>
              {reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {reasons.map(r => (
                    <Badge key={r} variant="secondary" className="flex items-center gap-1">
                      {r}
                      <button type="button" onClick={() => setReasons(reasons.filter(x => x !== r))}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField control={form.control} name="detail" render={({ field }) => (
              <FormItem>
                <FormLabel>詳細 <span className="text-destructive">*</span></FormLabel>
                <FormControl><Textarea placeholder="退会理由や経緯を入力してください" className="min-h-[100px]" data-testid="textarea-detail" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="prefecture" render={({ field }) => (
                <FormItem>
                  <FormLabel>都道府県</FormLabel>
                  <FormControl><Input placeholder="東京都" data-testid="input-prefecture" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>掲載ステータス</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="approved">掲載中</SelectItem>
                      <SelectItem value="pending">審査待ち</SelectItem>
                      <SelectItem value="rejected">非掲載</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="contactEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>連絡先メール（任意）</FormLabel>
                <FormControl><Input type="email" placeholder="info@example.com" data-testid="input-contact-email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={addMutation.isPending} data-testid="button-submit">
              {addMutation.isPending ? "追加中..." : "追加する"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
              <Badge variant="outline">{entry.source === "official" ? "公式情報" : "報告"}</Badge>
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
              <p className="text-xs text-muted-foreground">連絡先：{entry.contactEmail}</p>
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
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="pending">審査待ち</SelectItem>
                <SelectItem value="approved">掲載中</SelectItem>
                <SelectItem value="rejected">非掲載</SelectItem>
              </SelectContent>
            </Select>
            <AddEntryDialog onAdded={() => {}} />
          </div>
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
