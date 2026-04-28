import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Flag, MapPin, CheckCircle2, Building2, User, Paperclip, X } from "lucide-react";

type BlacklistEntry = {
  id: string;
  entityType: string;
  name: string;
  reasons: string[];
  detail: string;
  source: string;
  prefecture: string | null;
  createdAt: string;
};

const ENTITY_TYPES = ["すべて", "企業・荷主", "運送会社", "ドライバー"];
const REASONS = ["未払い", "虚偽登録", "無断キャンセル", "ハラスメント", "詐欺行為", "規約違反", "その他"];
const SOURCES = ["すべて", "TRA MATCH確認済み", "通報情報"];

const REASON_COLORS: Record<string, string> = {
  "未払い": "bg-red-100 text-red-700",
  "虚偽登録": "bg-purple-100 text-purple-700",
  "無断キャンセル": "bg-orange-100 text-orange-700",
  "ハラスメント": "bg-pink-100 text-pink-700",
  "詐欺行為": "bg-red-100 text-red-800",
  "規約違反": "bg-yellow-100 text-yellow-700",
  "その他": "bg-gray-100 text-gray-600",
};

const reportSchema = z.object({
  entityType: z.string().min(1, "種別を選択してください"),
  name: z.string().min(1, "名前・企業名を入力してください"),
  reasons: z.array(z.string()).min(1, "理由を1つ以上選択してください"),
  detail: z.string().min(10, "10文字以上入力してください").max(1000),
  prefecture: z.string().optional(),
  contactEmail: z.string().email("メールアドレスの形式が正しくありません").optional().or(z.literal("")),
});

export default function BlacklistPage() {
  const [entityType, setEntityType] = useState("すべて");
  const [activeReason, setActiveReason] = useState("すべて");
  const [activeSource, setActiveSource] = useState("すべて");
  const [showDialog, setShowDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery<BlacklistEntry[]>({
    queryKey: ["/api/blacklist", entityType, activeReason, activeSource],
    queryFn: () => {
      const params = new URLSearchParams();
      if (entityType !== "すべて") params.set("entityType", entityType);
      if (activeReason !== "すべて") params.set("reason", activeReason);
      if (activeSource !== "すべて") params.set("source", activeSource === "TRA MATCH確認済み" ? "official" : "report");
      return fetch(`/api/blacklist?${params}`).then(r => r.json());
    },
  });

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: { entityType: "", name: "", reasons: [], detail: "", prefecture: "", contactEmail: "" },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: z.infer<typeof reportSchema>) => {
      const formData = new FormData();
      formData.append("entityType", data.entityType);
      formData.append("name", data.name);
      data.reasons.forEach(r => formData.append("reasons", r));
      formData.append("detail", data.detail);
      if (data.prefecture) formData.append("prefecture", data.prefecture);
      if (data.contactEmail) formData.append("contactEmail", data.contactEmail);
      evidenceFiles.forEach(f => formData.append("evidenceFiles", f));
      const res = await fetch("/api/blacklist/report", { method: "POST", body: formData });
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist"] });
      setSubmitted(true);
    },
    onError: () => toast({ title: "送信に失敗しました", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-14 px-4 text-center">
        <p className="text-sm font-semibold tracking-widest mb-2 opacity-80">BLACKLIST</p>
        <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3" data-testid="text-page-title">
          <AlertTriangle className="w-9 h-9 text-yellow-300" />強制退会リスト
        </h1>
        <p className="text-base opacity-90 mb-1">未払い・虚偽登録・悪質行為などにより強制退会となった企業・ドライバーの一覧です。</p>
        <p className="text-base opacity-90 mb-6">取引前の確認にご活用ください。</p>
        <Button onClick={() => setShowDialog(true)} variant="outline" className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20" data-testid="button-report">
          <Flag className="w-4 h-4 mr-2" />通報する
        </Button>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Info boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3 border border-green-200 bg-green-50 rounded-lg p-4">
            <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 text-sm">TRA MATCH確認済み</p>
              <p className="text-xs text-green-700 mt-0.5">TRA MATCH上でのトラブルを管理者が確認・審査した情報です。</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border border-orange-200 bg-orange-50 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 text-sm">通報情報</p>
              <p className="text-xs text-orange-700 mt-0.5">他プラットフォーム含むユーザー通報を審査後に掲載した情報です。TRA MATCHが事実を保証するものではありません。</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {ENTITY_TYPES.map(t => (
              <button key={t} onClick={() => setEntityType(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${entityType === t ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"}`}
                data-testid={`filter-entity-${t}`}>{t}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["すべて", ...REASONS].map(r => (
              <button key={r} onClick={() => setActiveReason(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeReason === r ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"}`}
                data-testid={`filter-reason-${r}`}>{r}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map(s => (
              <button key={s} onClick={() => setActiveSource(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeSource === s ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"}`}
                data-testid={`filter-source-${s}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>該当する情報はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card key={entry.id} className="border" data-testid={`card-blacklist-${entry.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${entry.entityType === "ドライバー" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                        {entry.entityType === "ドライバー" ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {entry.entityType}
                      </span>
                      {entry.source === "official" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <Shield className="w-3 h-3" />TRA MATCH確認済み
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          <Flag className="w-3 h-3" />通報情報
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(entry.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2" data-testid={`text-blacklist-name-${entry.id}`}>{entry.name}</h3>
                  {entry.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {entry.reasons.map(r => (
                        <span key={r} className={`text-xs px-2 py-0.5 rounded ${REASON_COLORS[r] || "bg-gray-100 text-gray-600"}`}>{r}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.detail}</p>
                  {entry.prefecture && (
                    <p className="text-xs text-muted-foreground mt-2"><MapPin className="w-3 h-3 inline mr-0.5" />{entry.prefecture}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12 border-t pt-10">
          <p className="text-muted-foreground mb-3">このリストに載っていない悪質な事業者を知っていますか？</p>
          <Button onClick={() => setShowDialog(true)} data-testid="button-report-bottom">
            <Flag className="w-4 h-4 mr-2" />通報フォームから報告する
          </Button>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showDialog} onOpenChange={(o) => { setShowDialog(o); if (!o) { setSubmitted(false); form.reset(); setEvidenceFiles([]); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="w-4 h-4 text-orange-500" />通報する</DialogTitle>
            <DialogDescription className="sr-only">悪質な事業者を通報するフォームです。</DialogDescription>
          </DialogHeader>
          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">通報を受け付けました</h3>
              <p className="text-muted-foreground text-sm">内容を確認の上、審査後に掲載いたします。<br />ご協力ありがとうございました。</p>
              <Button className="mt-6" onClick={() => { setShowDialog(false); setSubmitted(false); form.reset(); }}>閉じる</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => submitMutation.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="entityType" render={({ field }) => (
                  <FormItem><FormLabel>種別 <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-entity-type"><SelectValue placeholder="選択してください" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["企業・荷主", "運送会社", "ドライバー"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>企業名・氏名（一部可） <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="例：〇〇運輸、山田〇〇" {...field} data-testid="input-name" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="reasons" render={() => (
                  <FormItem>
                    <FormLabel>理由 <span className="text-destructive">*</span></FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {REASONS.map(reason => (
                        <FormField key={reason} control={form.control} name="reasons" render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value?.includes(reason)} data-testid={`checkbox-${reason}`}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, reason] : current.filter(v => v !== reason));
                                }} />
                            </FormControl>
                            <FormLabel className="font-normal text-sm cursor-pointer">{reason}</FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="detail" render={({ field }) => (
                  <FormItem><FormLabel>詳細 <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Textarea rows={4} placeholder="具体的な状況・経緯を入力してください" {...field} data-testid="input-detail" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="prefecture" render={({ field }) => (
                  <FormItem><FormLabel>都道府県（任意）</FormLabel>
                    <FormControl><Input placeholder="例：大阪府" {...field} data-testid="input-prefecture" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem><FormLabel>連絡先メール（任意・非公開）</FormLabel>
                    <FormControl><Input type="email" placeholder="確認が必要な場合に連絡します" {...field} data-testid="input-contact-email" /></FormControl><FormMessage /></FormItem>
                )} />

                <div>
                  <p className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4" />証拠ファイル（任意・最大5枚）
                  </p>
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" data-testid="label-file-upload">
                    <div className="text-center">
                      <Paperclip className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">JPG・PNG・PDF（各5MB以内）</p>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      className="hidden"
                      data-testid="input-evidence-files"
                      onChange={e => {
                        const newFiles = Array.from(e.target.files ?? []);
                        setEvidenceFiles(prev => [...prev, ...newFiles].slice(0, 5));
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {evidenceFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {evidenceFiles.map((f, i) => (
                        <li key={i} className="flex items-center justify-between text-xs bg-muted/60 rounded px-2 py-1">
                          <span className="truncate max-w-[80%]">{f.name}</span>
                          <button type="button" onClick={() => setEvidenceFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-2" data-testid={`button-remove-file-${i}`}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">キャンセル</Button>
                  <Button type="submit" className="flex-1" disabled={submitMutation.isPending} data-testid="button-submit-report">
                    {submitMutation.isPending ? "送信中..." : "通報する"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
