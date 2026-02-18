import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, Send, Mail, Loader2, Sparkles, Plus, Pencil, Trash2,
  Reply, BellRing, MailCheck, ChevronLeft, Eye, Power
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";

type NotificationTemplate = {
  id: string;
  category: string;
  name: string;
  subject: string;
  body: string;
  triggerEvent: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type SentNotification = {
  title: string;
  target: string;
  count: number;
  sentAt: string;
};

const categoryConfig = {
  auto_reply: { label: "自動返信通知メール", icon: Reply, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  auto_notification: { label: "自動通知メール", icon: BellRing, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
  regular: { label: "通常通知メール", icon: MailCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
} as const;

type CategoryKey = keyof typeof categoryConfig;

const targetLabels: Record<string, string> = {
  all: "全ユーザー",
  shippers: "荷主のみ",
  carriers: "運送会社のみ",
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CategoryKey | "send">("auto_reply");
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);

  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTrigger, setFormTrigger] = useState("");

  const [aiPurpose, setAiPurpose] = useState("");
  const [aiTone, setAiTone] = useState("standard");

  const [sendTarget, setSendTarget] = useState("all");
  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sentHistory, setSentHistory] = useState<SentNotification[]>([]);

  const currentCategory = activeTab !== "send" ? activeTab : "auto_reply";

  const { data: templates, isLoading: templatesLoading } = useQuery<NotificationTemplate[]>({
    queryKey: [`/api/admin/notification-templates?category=${currentCategory}`],
    enabled: activeTab !== "send",
  });

  const createMutation = useMutation({
    mutationFn: async (data: { category: string; name: string; subject: string; body: string; triggerEvent?: string }) => {
      const res = await apiRequest("POST", "/api/admin/notification-templates", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "テンプレートを作成しました" });
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/notification-templates") });
      resetForm();
    },
    onError: () => toast({ title: "作成に失敗しました", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NotificationTemplate> }) => {
      const res = await apiRequest("PATCH", `/api/admin/notification-templates/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "テンプレートを更新しました" });
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/notification-templates") });
      resetForm();
    },
    onError: () => toast({ title: "更新に失敗しました", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/notification-templates/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "テンプレートを削除しました" });
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/notification-templates") });
    },
    onError: () => toast({ title: "削除に失敗しました", variant: "destructive" }),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/notification-templates/generate", {
        category: currentCategory,
        purpose: aiPurpose,
        tone: aiTone,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setFormName(data.name || "");
      setFormSubject(data.subject || "");
      setFormBody(data.body || "");
      setFormTrigger(data.triggerEvent || "");
      setIsCreating(true);
      setAiPurpose("");
      toast({ title: "AIがテンプレートを生成しました" });
    },
    onError: () => toast({ title: "AI生成に失敗しました", variant: "destructive" }),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/notifications/send", {
        title: sendTitle, message: sendMessage, target: sendTarget,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.count}人に通知を送信しました` });
      setSentHistory(prev => [{ title: sendTitle, target: sendTarget, count: data.count, sentAt: new Date().toLocaleString("ja-JP") }, ...prev]);
      setSendTitle("");
      setSendMessage("");
      setSendTarget("all");
    },
    onError: () => toast({ title: "通知の送信に失敗しました", variant: "destructive" }),
  });

  function resetForm() {
    setEditingTemplate(null);
    setIsCreating(false);
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setFormTrigger("");
    setPreviewTemplate(null);
  }

  function startEdit(t: NotificationTemplate) {
    setEditingTemplate(t);
    setIsCreating(false);
    setPreviewTemplate(null);
    setFormName(t.name);
    setFormSubject(t.subject);
    setFormBody(t.body);
    setFormTrigger(t.triggerEvent || "");
  }

  function startCreate() {
    setEditingTemplate(null);
    setIsCreating(true);
    setPreviewTemplate(null);
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setFormTrigger("");
  }

  function handleSaveTemplate() {
    if (!formName.trim() || !formSubject.trim() || !formBody.trim()) {
      toast({ title: "名前、件名、本文は必須です", variant: "destructive" });
      return;
    }
    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        data: { name: formName, subject: formSubject, body: formBody, triggerEvent: formTrigger || null },
      });
    } else {
      createMutation.mutate({
        category: currentCategory,
        name: formName,
        subject: formSubject,
        body: formBody,
        triggerEvent: formTrigger || undefined,
      });
    }
  }

  const isEditing = isCreating || editingTemplate !== null;
  const canSave = formName.trim() && formSubject.trim() && formBody.trim();

  const tabs: { key: CategoryKey | "send"; label: string; icon: typeof Bell }[] = [
    { key: "auto_reply", label: "自動返信", icon: Reply },
    { key: "auto_notification", label: "自動通知", icon: BellRing },
    { key: "regular", label: "通常通知", icon: MailCheck },
    { key: "send", label: "一括送信", icon: Send },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-4 space-y-5">
        <div className="bg-primary rounded-md p-5">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">通知管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">通知テンプレートの管理・AIによるメール文面生成</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => { setActiveTab(tab.key); resetForm(); }}
              data-testid={`tab-${tab.key}`}
            >
              <tab.icon className="w-4 h-4 mr-1.5" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab !== "send" ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {(() => {
                        const cfg = categoryConfig[activeTab];
                        const Icon = cfg.icon;
                        return <><div className={`w-7 h-7 rounded-md ${cfg.bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${cfg.color}`} /></div>{cfg.label}</>;
                      })()}
                    </h2>
                    <Button size="sm" onClick={startCreate} data-testid="button-new-template">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      新規作成
                    </Button>
                  </div>

                  {templatesLoading ? (
                    <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                  ) : templates && templates.length > 0 ? (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {templates.map(t => (
                        <div
                          key={t.id}
                          className={`p-3 rounded-md border cursor-pointer transition-colors ${
                            (editingTemplate?.id === t.id || previewTemplate?.id === t.id) ? "border-primary bg-primary/5" : "border-border hover-elevate"
                          }`}
                          onClick={() => { resetForm(); setPreviewTemplate(t); }}
                          data-testid={`template-item-${t.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{t.subject}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge variant={t.isActive ? "default" : "secondary"} className="text-[10px]">
                                {t.isActive ? "有効" : "無効"}
                              </Badge>
                            </div>
                          </div>
                          {t.triggerEvent && (
                            <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                              トリガー: {t.triggerEvent}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Mail className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">テンプレートがありません</p>
                      <p className="text-xs text-muted-foreground mt-1">「新規作成」またはAIで生成できます</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-ai-generate">
                <CardContent className="p-4">
                  <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AIでテンプレート生成
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">目的・用途</Label>
                      <Input
                        placeholder="例: 新規ユーザー登録時の確認メール"
                        className="mt-1"
                        value={aiPurpose}
                        onChange={e => setAiPurpose(e.target.value)}
                        data-testid="input-ai-purpose"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">文体</Label>
                      <Select value={aiTone} onValueChange={setAiTone}>
                        <SelectTrigger className="mt-1" data-testid="select-ai-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">標準</SelectItem>
                          <SelectItem value="formal">フォーマル</SelectItem>
                          <SelectItem value="friendly">カジュアル</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => generateMutation.mutate()}
                      disabled={!aiPurpose.trim() || generateMutation.isPending}
                      data-testid="button-ai-generate"
                    >
                      {generateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1.5" />
                      )}
                      {generateMutation.isPending ? "生成中..." : "AIで生成"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {isEditing ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-primary" />
                        {editingTemplate ? "テンプレート編集" : "新規テンプレート作成"}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={resetForm}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        戻る
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs">テンプレート名</Label>
                        <Input className="mt-1" value={formName} onChange={e => setFormName(e.target.value)} placeholder="例: 新規登録確認メール" data-testid="input-template-name" />
                      </div>
                      <div>
                        <Label className="text-xs">メール件名</Label>
                        <Input className="mt-1" value={formSubject} onChange={e => setFormSubject(e.target.value)} placeholder="例: 【トラマッチ】ご登録ありがとうございます" data-testid="input-template-subject" />
                      </div>
                      <div>
                        <Label className="text-xs">メール本文</Label>
                        <Textarea
                          className="mt-1 min-h-[200px] font-mono text-sm"
                          value={formBody}
                          onChange={e => setFormBody(e.target.value)}
                          placeholder={"{{会社名}} 様\n\nいつもトラマッチをご利用いただき..."}
                          data-testid="input-template-body"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">
                          使用可能な変数: {"{{会社名}}"}, {"{{ユーザー名}}"}, {"{{日付}}"}, {"{{荷物名}}"}, {"{{出発地}}"}, {"{{到着地}}"}, {"{{車両タイプ}}"}
                        </p>
                      </div>
                      {activeTab !== "regular" && (
                        <div>
                          <Label className="text-xs">トリガーイベント</Label>
                          <Input className="mt-1" value={formTrigger} onChange={e => setFormTrigger(e.target.value)} placeholder="例: ユーザー新規登録時" data-testid="input-template-trigger" />
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={handleSaveTemplate}
                          disabled={!canSave || createMutation.isPending || updateMutation.isPending}
                          data-testid="button-save-template"
                        >
                          {(createMutation.isPending || updateMutation.isPending) ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          ) : null}
                          {editingTemplate ? "更新" : "保存"}
                        </Button>
                        <Button variant="outline" onClick={resetForm}>キャンセル</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : previewTemplate ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        テンプレートプレビュー
                      </h2>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(previewTemplate)} data-testid="button-edit-template">
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateMutation.mutate({
                              id: previewTemplate.id,
                              data: { isActive: !previewTemplate.isActive },
                            });
                            setPreviewTemplate({ ...previewTemplate, isActive: !previewTemplate.isActive });
                          }}
                          data-testid="button-toggle-active"
                        >
                          <Power className="w-3.5 h-3.5 mr-1" />
                          {previewTemplate.isActive ? "無効化" : "有効化"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("このテンプレートを削除しますか？")) {
                              deleteMutation.mutate(previewTemplate.id);
                              setPreviewTemplate(null);
                            }
                          }}
                          data-testid="button-delete-template"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          削除
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={previewTemplate.isActive ? "default" : "secondary"}>
                          {previewTemplate.isActive ? "有効" : "無効"}
                        </Badge>
                        <Badge variant="outline">{categoryConfig[previewTemplate.category as CategoryKey]?.label || previewTemplate.category}</Badge>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">テンプレート名</p>
                        <p className="text-sm font-bold text-foreground">{previewTemplate.name}</p>
                      </div>

                      {previewTemplate.triggerEvent && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">トリガーイベント</p>
                          <p className="text-sm text-foreground">{previewTemplate.triggerEvent}</p>
                        </div>
                      )}

                      <div className="border border-border rounded-md overflow-hidden">
                        <div className="bg-muted/40 px-3 py-2 border-b border-border">
                          <p className="text-xs text-muted-foreground">件名</p>
                          <p className="text-sm font-bold text-foreground">{previewTemplate.subject}</p>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground mb-2">本文</p>
                          <div className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted/20 p-3 rounded-md min-h-[150px]" data-testid="text-preview-body">
                            {previewTemplate.body}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        作成: {new Date(previewTemplate.createdAt).toLocaleString("ja-JP")}
                        {previewTemplate.updatedAt !== previewTemplate.createdAt && (
                          <span className="ml-3">更新: {new Date(previewTemplate.updatedAt).toLocaleString("ja-JP")}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center py-16">
                      <Mail className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">テンプレートを選択するか、新規作成してください</p>
                      <p className="text-xs text-muted-foreground mt-1">AIを使って自動的にメール文面を生成することもできます</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl space-y-5">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  通知を一括送信
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">送信先</Label>
                    <Select value={sendTarget} onValueChange={setSendTarget}>
                      <SelectTrigger className="mt-1" data-testid="select-notification-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全ユーザー</SelectItem>
                        <SelectItem value="shippers">荷主のみ</SelectItem>
                        <SelectItem value="carriers">運送会社のみ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">タイトル</Label>
                    <Input
                      placeholder="通知タイトル"
                      className="mt-1"
                      value={sendTitle}
                      onChange={e => setSendTitle(e.target.value)}
                      data-testid="input-notification-title"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">本文</Label>
                    <Textarea
                      placeholder="通知の内容を入力..."
                      className="mt-1 min-h-[120px]"
                      value={sendMessage}
                      onChange={e => setSendMessage(e.target.value)}
                      data-testid="input-notification-body"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => sendMutation.mutate()}
                    disabled={!sendTitle.trim() || !sendMessage.trim() || sendMutation.isPending}
                    data-testid="button-send-notification"
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1.5" />
                    )}
                    {sendMutation.isPending ? "送信中..." : "通知を送信"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  送信履歴
                </h2>
                {sentHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <Mail className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground" data-testid="text-empty-state">送信した通知はありません</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 flex-wrap p-2 rounded-md bg-muted/30" data-testid={`row-sent-notification-${idx}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.sentAt}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">{targetLabels[item.target]}</Badge>
                          <span className="text-xs text-muted-foreground">{item.count}人</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
