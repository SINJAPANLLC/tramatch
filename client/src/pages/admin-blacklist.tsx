import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserX, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, AlertTriangle, Shield, MessageCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import type { BlacklistEntry } from "@shared/schema";

const PREFECTURES = ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"];

const WITHDRAWAL_REASONS = ["未払い","詐欺行為","契約違反","ハラスメント","不正利用","虚偽申告","その他"];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:  { label: "審査待ち", variant: "destructive" },
  approved: { label: "掲載中",   variant: "default" },
  rejected: { label: "非掲載",   variant: "secondary" },
};

const addSchema = z.object({
  entityType: z.string().min(1, "種別を選択してください"),
  name: z.string().min(1, "名前・会社名を入力してください"),
  withdrawalReason: z.string().min(1, "退会理由を選択してください"),
  source: z.string().min(1, "情報の出所を選択してください"),
  prefecture: z.string().optional(),
  withdrawalDate: z.string().optional(),
  detail: z.string().optional(),
  reasons: z.array(z.string()).default([]),
  contactEmail: z.string().optional(),
});
type AddForm = z.infer<typeof addSchema>;

function ToggleGroup({ options, value, onChange }: {
  options: { label: string; value: string; activeClass?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            value === o.value
              ? o.activeClass ?? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
          data-testid={`toggle-${o.value.replace(/\s/g, "-")}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AddEntryForm({ onCancel }: { onCancel?: () => void }) {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      entityType: "企業・荷主",
      name: "",
      withdrawalReason: "",
      source: "official",
      prefecture: "",
      withdrawalDate: today,
      detail: "",
      reasons: [],
      contactEmail: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: AddForm) =>
      apiRequest("POST", "/api/admin/blacklist", {
        ...data,
        reasons: data.withdrawalReason ? [data.withdrawalReason] : [],
        detail: data.detail ?? "",
        status: "approved",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blacklist"] });
      toast({ title: "登録しました" });
      reset();
    },
    onError: () => toast({ title: "登録に失敗しました", variant: "destructive" }),
  });

  return (
    <Card className="mb-6">
      <CardContent className="pt-5 pb-5">
        <h2 className="font-semibold text-base mb-4">新規登録</h2>
        <form onSubmit={handleSubmit(d => addMutation.mutate(d))} className="space-y-4">

          <div>
            <label className="text-sm font-medium mb-1.5 block">種別 <span className="text-destructive">*</span></label>
            <Controller control={control} name="entityType" render={({ field }) => (
              <ToggleGroup
                value={field.value}
                onChange={field.onChange}
                options={[
                  { label: "企業・荷主", value: "企業・荷主" },
                  { label: "ドライバー", value: "ドライバー" },
                  { label: "運送会社", value: "運送会社" },
                  { label: "その他", value: "その他" },
                ]}
              />
            )} />
            {errors.entityType && <p className="text-destructive text-xs mt-1">{errors.entityType.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">名前・会社名 <span className="text-destructive">*</span></label>
              <Input placeholder="例：株式会社〇〇、山田太郎" data-testid="input-name" {...register("name")} />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">退会理由 <span className="text-destructive">*</span></label>
              <Controller control={control} name="withdrawalReason" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger data-testid="select-withdrawal-reason">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {WITHDRAWAL_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {errors.withdrawalReason && <p className="text-destructive text-xs mt-1">{errors.withdrawalReason.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">情報の出所 <span className="text-destructive">*</span></label>
            <Controller control={control} name="source" render={({ field }) => (
              <ToggleGroup
                value={field.value}
                onChange={field.onChange}
                options={[
                  { label: "🛡 KEI MATCH確認済み", value: "official", activeClass: "bg-green-600 text-white border-green-600" },
                  { label: "💬 通報情報", value: "report", activeClass: "bg-primary text-primary-foreground border-primary" },
                ]}
              />
            )} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">都道府県</label>
              <Controller control={control} name="prefecture" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger data-testid="select-prefecture">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREFECTURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">退会日</label>
              <Input type="date" data-testid="input-withdrawal-date" {...register("withdrawalDate")} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">詳細（任意）</label>
            <Textarea
              placeholder="具体的な経緯・状況など（公開されます）"
              className="min-h-[100px]"
              data-testid="textarea-detail"
              {...register("detail")}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={addMutation.isPending} data-testid="button-submit">
              {addMutation.isPending ? "登録中..." : "登録する"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">キャンセル</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
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
              {(entry as any).withdrawalReason && <Badge variant="secondary">{(entry as any).withdrawalReason}</Badge>}
              <Badge variant="outline">{entry.source === "official" ? "🛡 確認済み" : "💬 通報"}</Badge>
              <span className="text-xs text-muted-foreground">{(entry as any).withdrawalDate ?? new Date(entry.createdAt).toLocaleDateString("ja-JP")}</span>
            </div>
            <p className="font-semibold">{entry.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {entry.prefecture && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.prefecture}</span>}
              {(entry.reasons ?? []).filter(r => r !== (entry as any).withdrawalReason).map(r => (
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
        {expanded && entry.detail && (
          <div className="mt-4 border-t pt-4 space-y-2">
            <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{entry.detail}</p>
            {entry.contactEmail && <p className="text-xs text-muted-foreground">連絡先：{entry.contactEmail}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminBlacklist() {
  const { data: entries, isLoading } = useQuery<BlacklistEntry[]>({
    queryKey: ["/api/admin/blacklist"],
  });

  const approved = entries?.filter(e => e.status !== "pending" && e.source === "official") ?? [];
  const reports = entries?.filter(e => e.source === "report") ?? [];
  const pendingReports = reports.filter(e => e.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4" data-testid="page-admin-blacklist">
        <div className="flex items-center gap-3">
          <UserX className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="text-page-title">強制退会リスト管理</h1>
        </div>

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list" data-testid="tab-list">
              <Shield className="w-4 h-4 mr-1.5" />強制退会リスト（{approved.length}）
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <MessageCircle className="w-4 h-4 mr-1.5" />通報一覧
              {pendingReports > 0 && <Badge variant="destructive" className="ml-1.5 text-xs px-1.5">{pendingReports}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4 space-y-3">
            <AddEntryForm />
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : approved.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <UserX className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">登録されたエントリはありません</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">{approved.map(e => <EntryRow key={e.id} entry={e} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : reports.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">通報はまだありません</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">{reports.map(e => <EntryRow key={e.id} entry={e} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
