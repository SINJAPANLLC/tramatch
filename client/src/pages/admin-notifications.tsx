import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, Send, Mail, Loader2, Sparkles, Plus, Pencil, Trash2,
  ChevronLeft, Eye, Power, CheckCircle, XCircle, MessageSquare, Smartphone
} from "lucide-react";
import { SiLine } from "react-icons/si";
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
  channel: string;
  name: string;
  subject: string | null;
  body: string;
  triggerEvent: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ChannelStatus = {
  configured: boolean;
  label: string;
};

const channelConfig = {
  system: { label: "システム通知", icon: Bell, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  email: { label: "メール通知", icon: Mail, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  line: { label: "LINE通知", icon: Smartphone, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
} as const;

type ChannelKey = keyof typeof channelConfig;

const categoryOptions = [
  { value: "auto_reply", label: "自動返信" },
  { value: "auto_notification", label: "自動通知" },
  { value: "regular", label: "通常通知" },
];

const targetLabels: Record<string, string> = {
  all: "全ユーザー",
  shippers: "荷主のみ",
  carriers: "運送会社のみ",
};

type EmailTemplateInfo = {
  triggerEvent: string;
  name: string;
  description: string;
  variables: { key: string; label: string }[];
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ChannelKey | "send">("system");
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTrigger, setFormTrigger] = useState("");
  const [formCategory, setFormCategory] = useState("regular");

  const [aiPurpose, setAiPurpose] = useState("");
  const [aiTone, setAiTone] = useState("standard");

  const [sendTarget, setSendTarget] = useState("all");
  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendChannels, setSendChannels] = useState<string[]>(["system"]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const currentChannel = activeTab !== "send" ? activeTab : "system";

  const { data: channelStatus } = useQuery<Record<string, ChannelStatus>>({
    queryKey: ["/api/admin/notification-channels/status"],
  });

  const { data: emailTemplateInfo } = useQuery<EmailTemplateInfo[]>({
    queryKey: ["/api/admin/email-template-info"],
    enabled: activeTab === "email",
  });

  const { data: allUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: activeTab === "send",
  });

  const filteredUsers = (allUsers || []).filter((u: any) => {
    if (!u.approved) return false;
    const q = userSearchQuery.toLowerCase();
    if (!q) return true;
    return (u.companyName || "").toLowerCase().includes(q)
      || (u.email || "").toLowerCase().includes(q)
      || (u.contactName || "").toLowerCase().includes(q);
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredUsers.map((u: any) => u.id);
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      ids.forEach((id: string) => newSet.add(id));
      return Array.from(newSet);
    });
  };

  const deselectAll = () => setSelectedUserIds([]);

  const buildTemplateQueryKey = () => {
    const params = new URLSearchParams();
    params.set("channel", currentChannel);
    if (filterCategory && filterCategory !== "all") {
      params.set("category", filterCategory);
    }
    return `/api/admin/notification-templates?${params.toString()}`;
  };

  const { data: templates, isLoading: templatesLoading } = useQuery<NotificationTemplate[]>({
    queryKey: [buildTemplateQueryKey()],
    enabled: activeTab !== "send",
  });

  const invalidateTemplates = () => {
    queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/notification-templates") });
  };

  const createMutation = useMutation({
    mutationFn: async (data: { category: string; channel: string; name: string; subject?: string; body: string; triggerEvent?: string }) => {
      const res = await apiRequest("POST", "/api/admin/notification-templates", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "テンプレートを作成しました" });
      invalidateTemplates();
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
      invalidateTemplates();
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
      invalidateTemplates();
    },
    onError: () => toast({ title: "削除に失敗しました", variant: "destructive" }),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/notification-templates/generate", {
        category: formCategory,
        channel: currentChannel,
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
      setFormCategory(data.category || "regular");
      setIsCreating(true);
      setAiPurpose("");
      toast({ title: "AIがテンプレートを生成しました" });
    },
    onError: () => toast({ title: "AI生成に失敗しました", variant: "destructive" }),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: sendTitle, message: sendMessage, target: sendTarget, channels: sendChannels,
      };
      if (sendTarget === "selected") {
        payload.userIds = selectedUserIds;
      }
      const res = await apiRequest("POST", "/api/admin/notifications/send", payload);
      return res.json();
    },
    onSuccess: (data) => {
      const r = data.results || {};
      const parts = [];
      if (r.system) parts.push(`システム${r.system}件`);
      if (r.email) parts.push(`メール${r.email}件`);
      if (r.line) parts.push(`LINE${r.line}件`);
      toast({ title: `通知を送信しました`, description: parts.join("、") || `${data.count}人対象` });
      setSendTitle("");
      setSendMessage("");
      setSendTarget("all");
      setSelectedUserIds([]);
      setUserSearchQuery("");
    },
    onError: () => toast({ title: "通知の送信に失敗しました", variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: async (data: { channel: string; to: string }) => {
      const res = await apiRequest("POST", "/api/admin/notification-channels/test", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "テスト送信に成功しました" });
      } else {
        toast({ title: "テスト送信に失敗しました", description: data.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "テスト送信に失敗しました", variant: "destructive" }),
  });

  function resetForm() {
    setEditingTemplate(null);
    setIsCreating(false);
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setFormTrigger("");
    setFormCategory("regular");
    setPreviewTemplate(null);
  }

  function startEdit(t: NotificationTemplate) {
    setEditingTemplate(t);
    setIsCreating(false);
    setPreviewTemplate(null);
    setFormName(t.name);
    setFormSubject(t.subject || "");
    setFormBody(t.body);
    setFormTrigger(t.triggerEvent || "");
    setFormCategory(t.category);
  }

  function startCreate() {
    setEditingTemplate(null);
    setIsCreating(true);
    setPreviewTemplate(null);
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setFormTrigger("");
    setFormCategory("regular");
  }

  function handleSaveTemplate() {
    if (!formName.trim() || !formBody.trim()) {
      toast({ title: "名前と本文は必須です", variant: "destructive" });
      return;
    }
    if (currentChannel === "email" && !formSubject.trim()) {
      toast({ title: "メール通知には件名が必要です", variant: "destructive" });
      return;
    }
    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        data: {
          name: formName,
          subject: currentChannel === "email" ? formSubject : null,
          body: formBody,
          triggerEvent: formTrigger || null,
          category: formCategory,
        },
      });
    } else {
      createMutation.mutate({
        category: formCategory,
        channel: currentChannel,
        name: formName,
        subject: currentChannel === "email" ? formSubject : undefined,
        body: formBody,
        triggerEvent: formTrigger || undefined,
      });
    }
  }

  function toggleSendChannel(ch: string) {
    setSendChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  }

  const isEditing = isCreating || editingTemplate !== null;
  const canSave = formName.trim() && formBody.trim() && (currentChannel !== "email" || formSubject.trim());

  const tabs: { key: ChannelKey | "send"; label: string; icon: typeof Bell }[] = [
    { key: "system", label: "システム通知", icon: Bell },
    { key: "email", label: "メール通知", icon: Mail },
    { key: "line", label: "LINE通知", icon: Smartphone },
    { key: "send", label: "一括送信", icon: Send },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-4 space-y-5">
        <div className="bg-primary rounded-md p-5">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">通知管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">システム通知・メール通知・LINE通知のテンプレート管理</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {channelStatus && (
            <div className="flex items-center gap-2 flex-wrap">
              {(Object.entries(channelStatus) as [string, ChannelStatus][]).map(([key, status]) => (
                <Badge
                  key={key}
                  variant={status.configured ? "default" : "secondary"}
                  className="text-xs"
                  data-testid={`badge-channel-status-${key}`}
                >
                  {status.configured ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {status.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => { setActiveTab(tab.key); resetForm(); setFilterCategory("all"); }}
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
                        const cfg = channelConfig[activeTab as ChannelKey];
                        const Icon = cfg.icon;
                        return <><div className={`w-7 h-7 rounded-md ${cfg.bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${cfg.color}`} /></div>{cfg.label}テンプレート</>;
                      })()}
                    </h2>
                    <Button size="sm" onClick={startCreate} data-testid="button-new-template">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      新規作成
                    </Button>
                  </div>

                  <div className="mb-3">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger data-testid="select-filter-category">
                        <SelectValue placeholder="カテゴリで絞り込み" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべてのカテゴリ</SelectItem>
                        {categoryOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {t.subject || t.body.substring(0, 50)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge variant="outline" className="text-[10px]">
                                {categoryOptions.find(c => c.value === t.category)?.label || t.category}
                              </Badge>
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
                      <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
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
                        placeholder={activeTab === "line" ? "例: 新着荷物のLINE通知" : "例: 新規ユーザー登録時の確認メール"}
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
                      <Button variant="ghost" size="sm" onClick={resetForm} data-testid="button-cancel-edit">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        戻る
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs">カテゴリ</Label>
                        <Select value={formCategory} onValueChange={setFormCategory}>
                          <SelectTrigger className="mt-1" data-testid="select-form-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">テンプレート名</Label>
                        <Input className="mt-1" value={formName} onChange={e => setFormName(e.target.value)} placeholder="例: 新規登録確認通知" data-testid="input-template-name" />
                      </div>
                      {currentChannel === "email" && (
                        <div>
                          <Label className="text-xs">メール件名</Label>
                          <Input className="mt-1" value={formSubject} onChange={e => setFormSubject(e.target.value)} placeholder="例: 【トラマッチ】ご登録ありがとうございます" data-testid="input-template-subject" />
                        </div>
                      )}
                      <div>
                        <Label className="text-xs">
                          {currentChannel === "line" ? "LINE メッセージ本文" : currentChannel === "email" ? "メール本文" : "通知メッセージ"}
                        </Label>
                        <Textarea
                          className="mt-1 min-h-[200px] font-mono text-sm"
                          value={formBody}
                          onChange={e => setFormBody(e.target.value)}
                          placeholder={
                            currentChannel === "line"
                              ? "{{会社名}} 様\n新着荷物: {{荷物名}}\n{{出発地}}→{{到着地}}"
                              : "{{会社名}} 様\n\nいつもトラマッチをご利用いただき..."
                          }
                          data-testid="input-template-body"
                        />
                        {currentChannel === "email" && formTrigger && emailTemplateInfo ? (
                          (() => {
                            const info = emailTemplateInfo.find(i => i.triggerEvent === formTrigger);
                            return info ? (
                              <div className="mt-1.5 p-2 bg-muted/40 rounded-md">
                                <p className="text-[11px] text-muted-foreground mb-1">{info.description}</p>
                                <p className="text-[11px] text-foreground">
                                  使用可能な変数: {info.variables.map(v => `{{${v.key}}}（${v.label}）`).join("、")}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-muted-foreground mt-1">
                                変数: {"{{会社名}}"}, {"{{ユーザー名}}"}, {"{{日付}}"} など自由に使用可能
                              </p>
                            );
                          })()
                        ) : (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            変数: {"{{会社名}}"}, {"{{ユーザー名}}"}, {"{{日付}}"}, {"{{荷物名}}"}, {"{{出発地}}"}, {"{{到着地}}"}, {"{{車両タイプ}}"}
                          </p>
                        )}
                        {currentChannel === "line" && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                            LINE通知は簡潔に（200文字程度推奨）
                          </p>
                        )}
                      </div>
                      {formCategory !== "regular" && (
                        <div>
                          <Label className="text-xs">トリガーイベント</Label>
                          {currentChannel === "email" && emailTemplateInfo ? (
                            <Select value={formTrigger || "__custom__"} onValueChange={v => setFormTrigger(v === "__custom__" ? "" : v)}>
                              <SelectTrigger className="mt-1" data-testid="select-template-trigger">
                                <SelectValue placeholder="トリガーイベントを選択" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__custom__">カスタム（自由入力）</SelectItem>
                                {emailTemplateInfo.map(info => (
                                  <SelectItem key={info.triggerEvent} value={info.triggerEvent}>
                                    {info.name}（{info.triggerEvent}）
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input className="mt-1" value={formTrigger} onChange={e => setFormTrigger(e.target.value)} placeholder="例: ユーザー新規登録時" data-testid="input-template-trigger" />
                          )}
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
                        <Button variant="outline" onClick={resetForm} data-testid="button-cancel-save">キャンセル</Button>
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
                      <div className="flex items-center gap-2 flex-wrap">
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
                        <Badge variant="outline">
                          {channelConfig[previewTemplate.channel as ChannelKey]?.label || previewTemplate.channel}
                        </Badge>
                        <Badge variant="outline">
                          {categoryOptions.find(c => c.value === previewTemplate.category)?.label || previewTemplate.category}
                        </Badge>
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
                        {previewTemplate.subject && (
                          <div className="bg-muted/40 px-3 py-2 border-b border-border">
                            <p className="text-xs text-muted-foreground">件名</p>
                            <p className="text-sm font-bold text-foreground">{previewTemplate.subject}</p>
                          </div>
                        )}
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            {previewTemplate.channel === "line" ? "LINEメッセージ" : previewTemplate.channel === "email" ? "メール本文" : "通知メッセージ"}
                          </p>
                          <div className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted/20 p-3 rounded-md min-h-[150px]" data-testid="text-preview-body">
                            {previewTemplate.body}
                          </div>
                        </div>
                      </div>

                      {previewTemplate.channel === "email" && previewTemplate.triggerEvent && emailTemplateInfo && (() => {
                        const info = emailTemplateInfo.find(i => i.triggerEvent === previewTemplate.triggerEvent);
                        return info ? (
                          <div className="p-2.5 bg-muted/40 rounded-md">
                            <p className="text-[11px] font-medium text-foreground mb-1">{info.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {info.variables.map(v => (
                                <Badge key={v.key} variant="outline" className="text-[10px] font-mono">
                                  {`{{${v.key}}}`} = {v.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}

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
                      <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">テンプレートを選択するか、新規作成してください</p>
                      <p className="text-xs text-muted-foreground mt-1">AIを使って自動的に文面を生成することもできます</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  一括通知送信
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">送信チャネル</Label>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {(["system", "email", "line"] as const).map(ch => {
                        const cfg = channelConfig[ch];
                        const Icon = cfg.icon;
                        const isSelected = sendChannels.includes(ch);
                        const status = channelStatus?.[ch];
                        const isConfigured = ch === "system" || status?.configured;
                        return (
                          <Button
                            key={ch}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleSendChannel(ch)}
                            disabled={!isConfigured}
                            data-testid={`button-channel-${ch}`}
                          >
                            <Icon className="w-3.5 h-3.5 mr-1" />
                            {cfg.label}
                            {!isConfigured && <XCircle className="w-3 h-3 ml-1 text-muted-foreground" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">送信先</Label>
                    <Select value={sendTarget} onValueChange={(v) => { setSendTarget(v); if (v !== "selected") { setSelectedUserIds([]); setUserSearchQuery(""); } }}>
                      <SelectTrigger className="mt-1" data-testid="select-send-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全ユーザー</SelectItem>
                        <SelectItem value="shippers">荷主のみ</SelectItem>
                        <SelectItem value="carriers">運送会社のみ</SelectItem>
                        <SelectItem value="selected">個別選択</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {sendTarget === "selected" && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs">ユーザー選択 ({selectedUserIds.length}人選択中)</Label>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={selectAllFiltered} data-testid="button-select-all-users">
                            全選択
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={deselectAll} data-testid="button-deselect-all-users">
                            全解除
                          </Button>
                        </div>
                      </div>
                      <Input
                        className="mb-2"
                        placeholder="会社名・メール・担当者名で検索..."
                        value={userSearchQuery}
                        onChange={e => setUserSearchQuery(e.target.value)}
                        data-testid="input-user-search"
                      />
                      <div className="border border-border rounded-md max-h-[200px] overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">該当するユーザーがいません</p>
                        ) : (
                          filteredUsers.map((u: any) => (
                            <label
                              key={u.id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
                              data-testid={`user-select-${u.id}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(u.id)}
                                onChange={() => toggleUserSelection(u.id)}
                                className="rounded border-border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{u.companyName || u.username}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{u.email} {u.role === "admin" ? "（管理者）" : ""}</p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs">タイトル</Label>
                    <Input className="mt-1" value={sendTitle} onChange={e => setSendTitle(e.target.value)} placeholder="通知タイトル" data-testid="input-send-title" />
                  </div>
                  <div>
                    <Label className="text-xs">本文</Label>
                    <Textarea className="mt-1 min-h-[120px]" value={sendMessage} onChange={e => setSendMessage(e.target.value)} placeholder="通知メッセージ" data-testid="input-send-message" />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => sendMutation.mutate()}
                    disabled={!sendTitle.trim() || !sendMessage.trim() || sendChannels.length === 0 || sendMutation.isPending || (sendTarget === "selected" && selectedUserIds.length === 0)}
                    data-testid="button-send-notification"
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1.5" />
                    )}
                    {sendMutation.isPending ? "送信中..." : sendTarget === "selected" ? `${selectedUserIds.length}人に送信` : "選択チャネルで一括送信"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  チャネル設定状態
                </h2>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-md border border-border">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">システム通知</p>
                          <p className="text-xs text-muted-foreground">アプリ内のベルアイコン通知</p>
                        </div>
                      </div>
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        常に有効
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-md border border-border">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">メール通知</p>
                          <p className="text-xs text-muted-foreground">SMTP設定が必要です</p>
                        </div>
                      </div>
                      <Badge variant={channelStatus?.email?.configured ? "default" : "secondary"} className="text-xs">
                        {channelStatus?.email?.configured ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />設定済み</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" />未設定</>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-md border border-border">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">LINE通知</p>
                          <p className="text-xs text-muted-foreground">LINE Channel Access Tokenが必要です</p>
                        </div>
                      </div>
                      <Badge variant={channelStatus?.line?.configured ? "default" : "secondary"} className="text-xs">
                        {channelStatus?.line?.configured ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />設定済み</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" />未設定</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">必要な環境変数:</p>
                    <div className="space-y-1 text-xs font-mono text-muted-foreground">
                      <p>SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM</p>
                      <p>LINE_CHANNEL_ACCESS_TOKEN</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
