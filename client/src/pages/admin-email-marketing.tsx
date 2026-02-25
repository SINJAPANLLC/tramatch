import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail, Plus, Send, Trash2, Edit, Loader2, CheckCircle2, XCircle, Clock,
  AlertTriangle, Eye, Search, Globe, Users, Settings, Bot, ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipients: string;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  status: string;
  sentAt: string | null;
  createdAt: string;
};

type EmailLead = {
  id: string;
  companyName: string;
  email: string | null;
  fax: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  industry: string | null;
  source: string | null;
  status: string;
  sentAt: string | null;
  sentSubject: string | null;
  createdAt: string;
};

type LeadsResponse = {
  leads: EmailLead[];
  total: number;
  todaySent: number;
  newCount: number;
  sentCount: number;
  failedCount: number;
};

function campaignStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-600 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />送信完了</Badge>;
    case "failed":
      return <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />失敗</Badge>;
    case "sending":
      return <Badge variant="default" className="text-xs"><Loader2 className="w-3 h-3 mr-1 animate-spin" />送信中</Badge>;
    case "draft":
      return <Badge variant="secondary" className="text-xs"><Clock className="w-3 h-3 mr-1" />下書き</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function leadStatusBadge(status: string) {
  switch (status) {
    case "new":
      return <Badge variant="secondary" className="text-xs">未送信</Badge>;
    case "sent":
      return <Badge className="bg-green-600 text-xs">送信済</Badge>;
    case "failed":
      return <Badge variant="destructive" className="text-xs">失敗</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function formatDate(dateVal: string | Date | null) {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function AdminEmailMarketing() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("leads");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showConfirmSendDialog, setShowConfirmSendDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);

  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formRecipients, setFormRecipients] = useState("");

  const [crawlUrl, setCrawlUrl] = useState("");
  const [leadFilter, setLeadFilter] = useState("");
  const [leadEmailSubject, setLeadEmailSubject] = useState("");
  const [leadEmailBody, setLeadEmailBody] = useState("");

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/admin/email-campaigns"],
    refetchInterval: 5000,
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery<LeadsResponse>({
    queryKey: ["/api/admin/email-leads", leadFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "200" });
      if (leadFilter) params.set("status", leadFilter);
      const res = await fetch(`/api/admin/email-leads?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: leadSettings } = useQuery<{ subject: string; body: string }>({
    queryKey: ["/api/admin/email-leads/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/email-leads/settings", { credentials: "include" });
      if (!res.ok) return { subject: "", body: "" };
      return res.json();
    },
  });

  useEffect(() => {
    if (leadSettings) {
      if (leadSettings.subject) setLeadEmailSubject(leadSettings.subject);
      if (leadSettings.body) setLeadEmailBody(leadSettings.body);
    }
  }, [leadSettings]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; subject: string; body: string; recipients: string }) => {
      const res = await apiRequest("POST", "/api/admin/email-campaigns", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({ title: "キャンペーンを作成しました" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => toast({ title: "作成に失敗しました", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmailCampaign> }) => {
      const res = await apiRequest("PATCH", `/api/admin/email-campaigns/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({ title: "キャンペーンを更新しました" });
      setEditingCampaign(null);
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => toast({ title: "更新に失敗しました", variant: "destructive" }),
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/admin/email-campaigns/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({ title: "キャンペーンを削除しました" });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/email-campaigns/${id}/send`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({ title: data.message || "送信を開始しました" });
      setShowConfirmSendDialog(false);
      setSelectedCampaign(null);
    },
    onError: () => toast({ title: "送信の開始に失敗しました", variant: "destructive" }),
  });

  const crawlMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/email-leads/crawl");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-leads"] });
    },
    onError: () => toast({ title: "クロールの開始に失敗しました", variant: "destructive" }),
  });

  const crawlUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/admin/email-leads/crawl-url", { url });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-leads"] });
      setCrawlUrl("");
    },
    onError: () => toast({ title: "URLクロールに失敗しました", variant: "destructive" }),
  });

  const sendLeadsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/email-leads/send-now");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-leads"] });
    },
    onError: () => toast({ title: "送信の開始に失敗しました", variant: "destructive" }),
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/admin/email-leads/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-leads"] });
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: { subject: string; body: string }) => {
      const res = await apiRequest("PATCH", "/api/admin/email-leads/settings", data);
      return res.json();
    },
    onSuccess: () => toast({ title: "テンプレートを保存しました" }),
    onError: () => toast({ title: "保存に失敗しました", variant: "destructive" }),
  });

  function resetForm() {
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setFormRecipients("");
    setEditingCampaign(null);
  }

  function openCreate() { resetForm(); setShowCreateDialog(true); }

  function openEdit(campaign: EmailCampaign) {
    setEditingCampaign(campaign);
    setFormName(campaign.name);
    setFormSubject(campaign.subject);
    setFormBody(campaign.body);
    setFormRecipients(campaign.recipients);
    setShowCreateDialog(true);
  }

  function handleSubmit() {
    if (!formName || !formSubject || !formBody || !formRecipients) {
      toast({ title: "すべての項目を入力してください", variant: "destructive" });
      return;
    }
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data: { name: formName, subject: formSubject, body: formBody, recipients: formRecipients } });
    } else {
      createMutation.mutate({ name: formName, subject: formSubject, body: formBody, recipients: formRecipients });
    }
  }

  const recipientCount = formRecipients.split("\n").filter(e => e.trim() && e.includes("@")).length;

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
                <Mail className="w-5 h-5 text-primary" />
                メール営業
              </h1>
              <p className="text-sm text-muted-foreground mt-1">AIリード自動収集 & 一括メール送信</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground" data-testid="text-stat-total">{leadsData?.total || 0}</p>
                <p className="text-xs text-muted-foreground">総リード数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600" data-testid="text-stat-new">{leadsData?.newCount || 0}</p>
                <p className="text-xs text-muted-foreground">未送信</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600" data-testid="text-stat-sent">{leadsData?.sentCount || 0}</p>
                <p className="text-xs text-muted-foreground">送信済</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-orange-600" data-testid="text-stat-today">{leadsData?.todaySent || 0}/300</p>
                <p className="text-xs text-muted-foreground">本日送信</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="leads" data-testid="tab-leads">
                <Users className="w-3.5 h-3.5 mr-1" />
                リード一覧
              </TabsTrigger>
              <TabsTrigger value="crawl" data-testid="tab-crawl">
                <Bot className="w-3.5 h-3.5 mr-1" />
                自動収集
              </TabsTrigger>
              <TabsTrigger value="template" data-testid="tab-template">
                <Settings className="w-3.5 h-3.5 mr-1" />
                テンプレート
              </TabsTrigger>
              <TabsTrigger value="campaigns" data-testid="tab-campaigns">
                <Send className="w-3.5 h-3.5 mr-1" />
                キャンペーン
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leads" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1.5">
                  {[
                    { key: "", label: "すべて" },
                    { key: "new", label: "未送信" },
                    { key: "sent", label: "送信済" },
                    { key: "failed", label: "失敗" },
                  ].map(f => (
                    <Badge
                      key={f.key}
                      variant={leadFilter === f.key ? "default" : "secondary"}
                      className="cursor-pointer px-3 py-1"
                      onClick={() => setLeadFilter(f.key)}
                      data-testid={`badge-filter-${f.key || "all"}`}
                    >
                      {f.label}
                    </Badge>
                  ))}
                </div>
                <div className="flex-1" />
                <Button
                  size="sm"
                  onClick={() => sendLeadsMutation.mutate()}
                  disabled={sendLeadsMutation.isPending || (leadsData?.newCount || 0) === 0}
                  data-testid="button-send-leads"
                >
                  {sendLeadsMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                  新規リードに一括送信
                </Button>
              </div>

              {leadsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : leadsData && leadsData.leads.length > 0 ? (
                <div className="space-y-2">
                  {leadsData.leads.map(lead => (
                    <Card key={lead.id} data-testid={`card-lead-${lead.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm text-foreground truncate">{lead.companyName}</span>
                              {leadStatusBadge(lead.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              {lead.email && <span className="font-mono">{lead.email}</span>}
                              {lead.fax && <span>FAX: {lead.fax}</span>}
                              {lead.phone && <span>TEL: {lead.phone}</span>}
                              {lead.industry && <span>{lead.industry}</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                              {lead.website && (
                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                                  <ExternalLink className="w-3 h-3" />サイト
                                </a>
                              )}
                              <span>取得: {formatDate(lead.createdAt)}</span>
                              {lead.sentAt && <span>送信: {formatDate(lead.sentAt)}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                            onClick={() => deleteLeadMutation.mutate(lead.id)}
                            data-testid={`button-delete-lead-${lead.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground" data-testid="text-empty-leads">リードがありません</p>
                    <p className="text-sm text-muted-foreground mt-1">「自動収集」タブからAIクロールを開始してください</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="crawl" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    AIリード自動収集
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                    <p className="font-medium text-foreground">自動スケジュール</p>
                    <p className="text-muted-foreground">毎日 07:00 JST にAIが自動でクロールを実行し、一般貨物・利用運送企業のメールアドレスを収集します。</p>
                    <p className="text-muted-foreground">毎日 10:00 JST に未送信リードへ営業メールを自動送信します（上限300件/日）。</p>
                  </div>
                  <Button
                    onClick={() => crawlMutation.mutate()}
                    disabled={crawlMutation.isPending}
                    data-testid="button-start-crawl"
                  >
                    {crawlMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Search className="w-4 h-4 mr-1.5" />}
                    今すぐAIクロール実行
                  </Button>
                  <p className="text-xs text-muted-foreground">AIが検索クエリを生成し、運送会社のウェブサイトからメール・FAX番号を自動抽出します。完了まで数分かかります。</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    URL指定クロール
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={crawlUrl}
                      onChange={(e) => setCrawlUrl(e.target.value)}
                      placeholder="https://example.co.jp/company"
                      className="flex-1"
                      data-testid="input-crawl-url"
                    />
                    <Button
                      onClick={() => { if (crawlUrl) crawlUrlMutation.mutate(crawlUrl); }}
                      disabled={crawlUrlMutation.isPending || !crawlUrl}
                      data-testid="button-crawl-url"
                    >
                      {crawlUrlMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
                      抽出
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">企業のウェブサイトURLを入力すると、ページからメールアドレス・FAX番号を抽出します。</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    自動送信メールテンプレート
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">AIクロールで収集したリードへの自動送信メールの内容を設定します。{"{company}"}で会社名に置換されます。</p>
                  <div>
                    <Label>件名</Label>
                    <Input
                      value={leadEmailSubject}
                      onChange={(e) => setLeadEmailSubject(e.target.value)}
                      placeholder="【トラマッチ】物流コスト削減のご提案"
                      data-testid="input-lead-subject"
                    />
                  </div>
                  <div>
                    <Label>本文</Label>
                    <Textarea
                      value={leadEmailBody}
                      onChange={(e) => setLeadEmailBody(e.target.value)}
                      placeholder="営業メールの本文を入力..."
                      rows={15}
                      data-testid="input-lead-body"
                    />
                  </div>
                  <Button
                    onClick={() => saveSettingsMutation.mutate({ subject: leadEmailSubject, body: leadEmailBody })}
                    disabled={saveSettingsMutation.isPending}
                    data-testid="button-save-template"
                  >
                    {saveSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                    テンプレートを保存
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-4 space-y-4">
              <div className="flex justify-end">
                <Button onClick={openCreate} data-testid="button-create-campaign">
                  <Plus className="w-4 h-4 mr-1.5" />
                  新規キャンペーン
                </Button>
              </div>

              {campaignsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.map((campaign) => {
                    const recipientLines = campaign.recipients.split("\n").filter(e => e.trim() && e.includes("@"));
                    return (
                      <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-foreground truncate">{campaign.name}</h3>
                                {campaignStatusBadge(campaign.status)}
                              </div>
                              <p className="text-sm text-muted-foreground truncate mb-2">件名: {campaign.subject}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                <span>宛先: {recipientLines.length}件</span>
                                {campaign.status !== "draft" && (
                                  <>
                                    <span className="text-green-600">成功: {campaign.sentCount}</span>
                                    {campaign.failedCount > 0 && <span className="text-red-600">失敗: {campaign.failedCount}</span>}
                                  </>
                                )}
                                <span>作成: {formatDate(campaign.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedCampaign(campaign); setShowPreviewDialog(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {campaign.status === "draft" && (
                                <>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(campaign)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="default" size="sm" onClick={() => { setSelectedCampaign(campaign); setShowConfirmSendDialog(true); }}>
                                    <Send className="w-3.5 h-3.5 mr-1" />送信
                                  </Button>
                                </>
                              )}
                              {campaign.status === "sending" && (
                                <Button variant="outline" size="sm" disabled>
                                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                  {campaign.sentCount}/{campaign.totalCount}
                                </Button>
                              )}
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                                disabled={campaign.status === "sending"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Mail className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground">キャンペーンがありません</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) { setShowCreateDialog(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "キャンペーン編集" : "新規キャンペーン作成"}</DialogTitle>
            <DialogDescription>手動でメール送信先を指定してキャンペーンを作成します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>キャンペーン名</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例: 2026年3月 新規顧客開拓" data-testid="input-campaign-name" />
            </div>
            <div>
              <Label>メール件名</Label>
              <Input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="例: 【トラマッチ】物流コスト削減のご提案" data-testid="input-campaign-subject" />
            </div>
            <div>
              <Label>メール本文</Label>
              <Textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="メール本文を入力..." rows={12} data-testid="input-campaign-body" />
              <p className="text-xs text-muted-foreground mt-1">URLは自動的にリンクに変換されます。HTMLタグも使用可能です。</p>
            </div>
            <div>
              <Label>送信先メールアドレス（1行に1アドレス）</Label>
              <Textarea value={formRecipients} onChange={(e) => setFormRecipients(e.target.value)} placeholder={"example1@company.co.jp\nexample2@company.co.jp"} rows={6} data-testid="input-campaign-recipients" />
              <p className="text-xs text-muted-foreground mt-1">
                有効なメールアドレス: <span className="font-medium text-foreground">{recipientCount}件</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>キャンセル</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-campaign">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editingCampaign ? "更新" : "作成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>メールプレビュー</DialogTitle>
            <DialogDescription>{selectedCampaign?.name}</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">件名</Label>
                <p className="font-medium text-foreground">{selectedCampaign.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">本文</Label>
                <div className="border rounded-lg p-4 bg-muted/30 whitespace-pre-wrap text-sm">{selectedCampaign.body}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">送信先 ({selectedCampaign.recipients.split("\n").filter(e => e.trim() && e.includes("@")).length}件)</Label>
                <div className="border rounded-lg p-3 bg-muted/30 text-xs max-h-32 overflow-y-auto font-mono">
                  {selectedCampaign.recipients.split("\n").filter(e => e.trim()).map((e, i) => (
                    <div key={i} className={e.includes("@") ? "text-foreground" : "text-red-500"}>{e.trim()}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmSendDialog} onOpenChange={setShowConfirmSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              送信確認
            </DialogTitle>
            <DialogDescription>この操作は取り消せません。本当に送信しますか？</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">キャンペーン:</span> <span className="font-medium">{selectedCampaign.name}</span></p>
              <p><span className="text-muted-foreground">件名:</span> <span className="font-medium">{selectedCampaign.subject}</span></p>
              <p><span className="text-muted-foreground">送信先:</span> <span className="font-medium">{selectedCampaign.recipients.split("\n").filter(e => e.trim() && e.includes("@")).length}件</span></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmSendDialog(false)}>キャンセル</Button>
            <Button
              variant="destructive"
              onClick={() => selectedCampaign && sendCampaignMutation.mutate(selectedCampaign.id)}
              disabled={sendCampaignMutation.isPending}
              data-testid="button-confirm-send"
            >
              {sendCampaignMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
              送信開始
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
