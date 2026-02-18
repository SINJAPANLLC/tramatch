import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Plus, Pencil, Trash2, Search, Building2, Phone, Mail, Globe, Users, ChevronDown, ChevronRight, UserPlus, KeyRound, Copy, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import type { Agent } from "@shared/schema";

const PREFECTURES = [
  { region: "北海道・東北", items: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { region: "関東", items: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { region: "甲信越・北陸", items: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県"] },
  { region: "東海", items: ["岐阜県", "静岡県", "愛知県", "三重県"] },
  { region: "近畿", items: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { region: "中国", items: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { region: "四国", items: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { region: "九州・沖縄", items: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];

const ALL_PREFECTURES = PREFECTURES.flatMap(r => r.items);

const REGION_COLORS: Record<string, { bg: string; text: string }> = {
  "北海道・東北": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400" },
  "関東": { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
  "甲信越・北陸": { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
  "東海": { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-600 dark:text-teal-400" },
  "近畿": { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400" },
  "中国": { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400" },
  "四国": { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-600 dark:text-cyan-400" },
  "九州・沖縄": { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400" },
};

function getRegionForPrefecture(pref: string): string {
  return PREFECTURES.find(r => r.items.includes(pref))?.region ?? "";
}

type FormData = {
  prefecture: string;
  companyName: string;
  representativeName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  websiteUrl: string;
  businessArea: string;
  note: string;
  status: string;
};

const emptyForm: FormData = {
  prefecture: "",
  companyName: "",
  representativeName: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  postalCode: "",
  websiteUrl: "",
  businessArea: "",
  note: "",
  status: "active",
};

export default function AdminAgents() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(PREFECTURES.map(r => r.region)));
  const [credentialDialog, setCredentialDialog] = useState<{ open: boolean; loginEmail: string; password: string }>({ open: false, loginEmail: "", password: "" });

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/admin/agents"],
  });

  const createAgent = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/admin/agents", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      setDialogOpen(false);
      resetForm();
      if (data.generatedPassword) {
        setCredentialDialog({ open: true, loginEmail: data.loginEmail || data.email || "", password: data.generatedPassword });
      } else {
        toast({ title: "代理店を登録しました" });
      }
    },
    onError: () => {
      toast({ title: "代理店の登録に失敗しました", variant: "destructive" });
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      await apiRequest("PATCH", `/api/admin/agents/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: "代理店を更新しました" });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "代理店の更新に失敗しました", variant: "destructive" });
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: "代理店を削除しました" });
    },
    onError: () => {
      toast({ title: "代理店の削除に失敗しました", variant: "destructive" });
    },
  });

  const createAccount = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/agents/${id}/create-account`);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      if (data.generatedPassword) {
        setCredentialDialog({ open: true, loginEmail: data.loginEmail, password: data.generatedPassword });
      } else {
        toast({ title: "既存ユーザーを紐付けました" });
      }
    },
    onError: () => {
      toast({ title: "アカウント作成に失敗しました", variant: "destructive" });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/agents/${id}/reset-password`);
      return res.json();
    },
    onSuccess: (data: any) => {
      setCredentialDialog({ open: true, loginEmail: data.loginEmail || "（既存メール）", password: data.newPassword });
    },
    onError: () => {
      toast({ title: "パスワードリセットに失敗しました", variant: "destructive" });
    },
  });

  const bulkCreateAccounts = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/agents/bulk-create-accounts");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: `${data.created}件のアカウントを作成しました` });
    },
    onError: () => {
      toast({ title: "一括アカウント作成に失敗しました", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingAgent(null);
  };

  const openCreateDialog = (pref?: string) => {
    resetForm();
    if (pref) setForm({ ...emptyForm, prefecture: pref });
    setDialogOpen(true);
  };

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent);
    setForm({
      prefecture: agent.prefecture,
      companyName: agent.companyName,
      representativeName: agent.representativeName ?? "",
      contactName: agent.contactName ?? "",
      phone: agent.phone ?? "",
      email: agent.email ?? "",
      address: agent.address ?? "",
      postalCode: agent.postalCode ?? "",
      websiteUrl: agent.websiteUrl ?? "",
      businessArea: agent.businessArea ?? "",
      note: agent.note ?? "",
      status: agent.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.prefecture || !form.companyName) {
      toast({ title: "都道府県と企業名は必須です", variant: "destructive" });
      return;
    }
    if (editingAgent) {
      updateAgent.mutate({ id: editingAgent.id, data: form });
    } else {
      createAgent.mutate(form);
    }
  };

  const agentsByPrefecture = useMemo(() => {
    const map: Record<string, Agent[]> = {};
    ALL_PREFECTURES.forEach(p => { map[p] = []; });
    agents?.forEach(a => {
      if (!map[a.prefecture]) map[a.prefecture] = [];
      map[a.prefecture].push(a);
    });
    return map;
  }, [agents]);

  const filtered = useMemo(() => {
    let list = agents ?? [];
    if (selectedRegion !== "all") {
      const regionPrefs = PREFECTURES.find(r => r.region === selectedRegion)?.items ?? [];
      list = list.filter(a => regionPrefs.includes(a.prefecture));
    }
    if (selectedPrefecture !== "all") {
      list = list.filter(a => a.prefecture === selectedPrefecture);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.companyName.toLowerCase().includes(q) ||
        (a.contactName && a.contactName.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        a.prefecture.includes(q)
      );
    }
    return list;
  }, [agents, selectedRegion, selectedPrefecture, searchQuery]);

  const totalAgents = agents?.length ?? 0;
  const activeAgents = agents?.filter(a => a.status === "active").length ?? 0;
  const coveredPrefectures = new Set(agents?.map(a => a.prefecture) ?? []).size;

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-4 overflow-y-auto h-full">
        <div className="bg-primary rounded-md p-5 mb-5">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">エージェント管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">47都道府県の代理店を管理</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Card data-testid="card-stat-total">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalAgents}</p>
                  <p className="text-xs text-muted-foreground">総代理店数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-active">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeAgents}</p>
                  <p className="text-xs text-muted-foreground">稼働中</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-coverage">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coveredPrefectures} / 47</p>
                  <p className="text-xs text-muted-foreground">カバー地域</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="企業名・担当者・メールで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-agent-search"
            />
          </div>
          <Select value={selectedRegion} onValueChange={(v) => { setSelectedRegion(v); setSelectedPrefecture("all"); }}>
            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-region-filter">
              <SelectValue placeholder="地域" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全地域</SelectItem>
              {PREFECTURES.map(r => (
                <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-prefecture-filter">
              <SelectValue placeholder="都道府県" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全都道府県</SelectItem>
              {(selectedRegion !== "all"
                ? PREFECTURES.find(r => r.region === selectedRegion)?.items ?? []
                : ALL_PREFECTURES
              ).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {agents && agents.some(a => !a.userId) && (
            <Button variant="outline" onClick={() => {
              if (confirm("アカウント未作成の代理店全てにログインアカウントを一括作成しますか？")) bulkCreateAccounts.mutate();
            }} disabled={bulkCreateAccounts.isPending} data-testid="button-bulk-create-accounts">
              <UserPlus className="w-4 h-4 mr-1.5" />
              {bulkCreateAccounts.isPending ? "作成中..." : "一括アカウント作成"}
            </Button>
          )}
          <Button onClick={() => openCreateDialog()} data-testid="button-add-agent">
            <Plus className="w-4 h-4 mr-1.5" />
            代理店を追加
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : searchQuery || selectedPrefecture !== "all" || selectedRegion !== "all" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">{filtered.length} 件の代理店</p>
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Building2 className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">該当する代理店がありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map(agent => (
                  <AgentCard key={agent.id} agent={agent} onEdit={openEditDialog} onDelete={(id) => {
                    if (confirm("この代理店を削除しますか？")) deleteAgent.mutate(id);
                  }} onCreateAccount={(id) => createAccount.mutate(id)} onResetPassword={(id) => {
                    if (confirm("パスワードをリセットしますか？")) resetPassword.mutate(id);
                  }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {PREFECTURES.map(region => {
              const regionAgents = region.items.flatMap(p => agentsByPrefecture[p] ?? []);
              const isExpanded = expandedRegions.has(region.region);
              const colors = REGION_COLORS[region.region];

              return (
                <Card key={region.region} data-testid={`card-region-${region.region}`}>
                  <div
                    className="flex items-center justify-between gap-2 p-4 cursor-pointer"
                    onClick={() => toggleRegion(region.region)}
                    data-testid={`button-toggle-region-${region.region}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md ${colors.bg} flex items-center justify-center shrink-0`}>
                        <MapPin className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{region.region}</h3>
                        <p className="text-xs text-muted-foreground">{region.items.length}都道府県 / {regionAgents.length}代理店</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={regionAgents.length > 0 ? "default" : "outline"} className="text-xs">
                        {regionAgents.length}社
                      </Badge>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t px-4 pb-4">
                      <div className="space-y-2 mt-3">
                        {region.items.map(pref => {
                          const prefAgents = agentsByPrefecture[pref] ?? [];
                          return (
                            <div key={pref} data-testid={`section-prefecture-${pref}`}>
                              <div className="flex items-center justify-between gap-2 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">{pref}</span>
                                  {prefAgents.length > 0 && (
                                    <Badge variant="outline" className="text-[10px]">{prefAgents.length}社</Badge>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => openCreateDialog(pref)} data-testid={`button-add-agent-${pref}`}>
                                  <Plus className="w-3.5 h-3.5 mr-1" />
                                  追加
                                </Button>
                              </div>
                              {prefAgents.length > 0 ? (
                                <div className="space-y-2 ml-2 mb-3">
                                  {prefAgents.map(agent => (
                                    <AgentCard key={agent.id} agent={agent} compact onEdit={openEditDialog} onDelete={(id) => {
                                      if (confirm("この代理店を削除しますか？")) deleteAgent.mutate(id);
                                    }} onCreateAccount={(id) => createAccount.mutate(id)} onResetPassword={(id) => {
                                      if (confirm("パスワードをリセットしますか？")) resetPassword.mutate(id);
                                    }} />
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground ml-2 mb-2">未登録</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" data-testid="dialog-agent-form">
            <DialogHeader>
              <DialogTitle>{editingAgent ? "代理店を編集" : "代理店を追加"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>都道府県 *</Label>
                  <Select value={form.prefecture} onValueChange={(v) => setForm({ ...form, prefecture: v })}>
                    <SelectTrigger data-testid="select-prefecture">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_PREFECTURES.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ステータス</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">稼働中</SelectItem>
                      <SelectItem value="inactive">停止中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>企業名 *</Label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="株式会社〇〇運送" data-testid="input-company-name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>代表者名</Label>
                  <Input value={form.representativeName} onChange={(e) => setForm({ ...form, representativeName: e.target.value })} placeholder="山田 太郎" data-testid="input-representative" />
                </div>
                <div>
                  <Label>担当者名</Label>
                  <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="田中 一郎" data-testid="input-contact" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>電話番号</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03-1234-5678" data-testid="input-phone" />
                </div>
                <div>
                  <Label>メールアドレス</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@example.com" data-testid="input-email" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>郵便番号</Label>
                  <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="123-4567" data-testid="input-postal-code" />
                </div>
                <div>
                  <Label>Webサイト</Label>
                  <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://example.com" data-testid="input-website" />
                </div>
              </div>
              <div>
                <Label>住所</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="〇〇市〇〇町1-2-3" data-testid="input-address" />
              </div>
              <div>
                <Label>営業エリア</Label>
                <Input value={form.businessArea} onChange={(e) => setForm({ ...form, businessArea: e.target.value })} placeholder="関東一円, 東北エリア" data-testid="input-business-area" />
              </div>
              <div>
                <Label>備考</Label>
                <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="特記事項があれば入力" className="resize-none" rows={3} data-testid="input-note" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} data-testid="button-cancel">
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createAgent.isPending || updateAgent.isPending}
                data-testid="button-submit-agent"
              >
                {createAgent.isPending || updateAgent.isPending ? "保存中..." : editingAgent ? "更新する" : "登録する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={credentialDialog.open} onOpenChange={(open) => { if (!open) setCredentialDialog({ open: false, loginEmail: "", password: "" }); }}>
          <DialogContent className="max-w-sm" data-testid="dialog-credentials">
            <DialogHeader>
              <DialogTitle>ログイン情報</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">以下の情報でログインできます。この画面を閉じるとパスワードは再表示できません。</p>
              <div>
                <Label className="text-xs text-muted-foreground">ログインメール</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={credentialDialog.loginEmail} readOnly className="text-sm" data-testid="input-credential-email" />
                  <Button variant="outline" size="icon" onClick={() => {
                    navigator.clipboard.writeText(credentialDialog.loginEmail);
                    toast({ title: "コピーしました" });
                  }} data-testid="button-copy-email">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">パスワード</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={credentialDialog.password} readOnly className="text-sm font-mono" data-testid="input-credential-password" />
                  <Button variant="outline" size="icon" onClick={() => {
                    navigator.clipboard.writeText(credentialDialog.password);
                    toast({ title: "コピーしました" });
                  }} data-testid="button-copy-password">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setCredentialDialog({ open: false, loginEmail: "", password: "" })} data-testid="button-close-credentials">
                閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function AgentCard({ agent, compact, onEdit, onDelete, onCreateAccount, onResetPassword }: {
  agent: Agent;
  compact?: boolean;
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onCreateAccount: (id: string) => void;
  onResetPassword: (id: string) => void;
}) {
  const region = getRegionForPrefecture(agent.prefecture);
  const colors = REGION_COLORS[region] ?? { bg: "bg-muted", text: "text-muted-foreground" };

  return (
    <Card className="hover-elevate" data-testid={`card-agent-${agent.id}`}>
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-foreground text-sm truncate">{agent.companyName}</span>
              <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-[10px] shrink-0">
                {agent.status === "active" ? "稼働中" : "停止中"}
              </Badge>
              {!compact && (
                <Badge variant="outline" className={`text-[10px] shrink-0 ${colors.text}`}>
                  {agent.prefecture}
                </Badge>
              )}
              {agent.userId ? (
                <Badge variant="outline" className="text-[10px] shrink-0 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" />アカウント有
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] shrink-0 text-muted-foreground">
                  アカウント無
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {agent.representativeName && (
                <span className="text-xs text-muted-foreground">代表: {agent.representativeName}</span>
              )}
              {agent.contactName && (
                <span className="text-xs text-muted-foreground">担当: {agent.contactName}</span>
              )}
              <div className="flex items-center gap-3 flex-wrap mt-0.5">
                {agent.phone && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />{agent.phone}
                  </span>
                )}
                {agent.email && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />{agent.email}
                  </span>
                )}
                {agent.websiteUrl && (
                  <a href={agent.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <Globe className="w-3 h-3" />Web
                  </a>
                )}
              </div>
              {agent.loginEmail && (
                <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" />ログイン: {agent.loginEmail}
                </span>
              )}
              {agent.businessArea && (
                <span className="text-xs text-muted-foreground mt-0.5">エリア: {agent.businessArea}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!agent.userId && (
              <Button variant="ghost" size="icon" onClick={() => onCreateAccount(agent.id)} data-testid={`button-create-account-${agent.id}`} title="アカウント作成">
                <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </Button>
            )}
            {agent.userId && (
              <Button variant="ghost" size="icon" onClick={() => onResetPassword(agent.id)} data-testid={`button-reset-password-${agent.id}`} title="パスワードリセット">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onEdit(agent)} data-testid={`button-edit-agent-${agent.id}`}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(agent.id)} data-testid={`button-delete-agent-${agent.id}`}>
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
