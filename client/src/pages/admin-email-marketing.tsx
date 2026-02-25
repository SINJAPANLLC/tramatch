import { useState } from "react";
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
import { Mail, Plus, Send, Trash2, Edit, TestTube, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Eye } from "lucide-react";
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

function statusBadge(status: string) {
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

function formatDate(dateVal: string | Date | null) {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function AdminEmailMarketing() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showConfirmSendDialog, setShowConfirmSendDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);

  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formRecipients, setFormRecipients] = useState("");

  const [testEmail, setTestEmail] = useState("");

  const { data: campaigns, isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/admin/email-campaigns"],
    refetchInterval: 5000,
  });

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
    onError: () => {
      toast({ title: "作成に失敗しました", variant: "destructive" });
    },
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
    onError: () => {
      toast({ title: "更新に失敗しました", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/email-campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({ title: "キャンペーンを削除しました" });
    },
    onError: () => {
      toast({ title: "削除に失敗しました", variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
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
    onError: () => {
      toast({ title: "送信の開始に失敗しました", variant: "destructive" });
    },
  });

  const testSendMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; body: string }) => {
      const res = await apiRequest("POST", "/api/admin/email-campaigns/test-send", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "テストメールを送信しました" });
    },
    onError: () => {
      toast({ title: "テスト送信に失敗しました", variant: "destructive" });
    },
  });

  function resetForm() {
    setFormName("");
    setFormSubject("");
    setFormBody("");
    setFormRecipients("");
    setEditingCampaign(null);
  }

  function openCreate() {
    resetForm();
    setShowCreateDialog(true);
  }

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
      updateMutation.mutate({
        id: editingCampaign.id,
        data: { name: formName, subject: formSubject, body: formBody, recipients: formRecipients },
      });
    } else {
      createMutation.mutate({ name: formName, subject: formSubject, body: formBody, recipients: formRecipients });
    }
  }

  function confirmSend(campaign: EmailCampaign) {
    setSelectedCampaign(campaign);
    setShowConfirmSendDialog(true);
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
              <p className="text-sm text-muted-foreground mt-1">一括メール送信キャンペーンの管理</p>
            </div>
            <Button onClick={openCreate} data-testid="button-create-campaign">
              <Plus className="w-4 h-4 mr-1.5" />
              新規作成
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="campaigns" data-testid="tab-campaigns">キャンペーン一覧</TabsTrigger>
              <TabsTrigger value="test" data-testid="tab-test">テスト送信</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
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
                                <h3 className="font-bold text-foreground truncate" data-testid={`text-campaign-name-${campaign.id}`}>{campaign.name}</h3>
                                {statusBadge(campaign.status)}
                              </div>
                              <p className="text-sm text-muted-foreground truncate mb-2" data-testid={`text-campaign-subject-${campaign.id}`}>
                                件名: {campaign.subject}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                <span>宛先: {recipientLines.length}件</span>
                                {campaign.status !== "draft" && (
                                  <>
                                    <span className="text-green-600">送信成功: {campaign.sentCount}</span>
                                    {campaign.failedCount > 0 && (
                                      <span className="text-red-600">失敗: {campaign.failedCount}</span>
                                    )}
                                  </>
                                )}
                                <span>作成: {formatDate(campaign.createdAt)}</span>
                                {campaign.sentAt && <span>送信: {formatDate(campaign.sentAt)}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setSelectedCampaign(campaign); setShowPreviewDialog(true); }}
                                data-testid={`button-preview-${campaign.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {campaign.status === "draft" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEdit(campaign)}
                                    data-testid={`button-edit-${campaign.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => confirmSend(campaign)}
                                    data-testid={`button-send-${campaign.id}`}
                                  >
                                    <Send className="w-3.5 h-3.5 mr-1" />
                                    送信
                                  </Button>
                                </>
                              )}
                              {campaign.status === "sending" && (
                                <Button variant="outline" size="sm" disabled>
                                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                  送信中 ({campaign.sentCount}/{campaign.totalCount})
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteMutation.mutate(campaign.id)}
                                disabled={campaign.status === "sending"}
                                data-testid={`button-delete-${campaign.id}`}
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
                    <p className="text-muted-foreground" data-testid="text-empty-state">キャンペーンがありません</p>
                    <p className="text-sm text-muted-foreground mt-1">「新規作成」からメールキャンペーンを作成してください</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="test" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    テストメール送信
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>送信先メールアドレス</Label>
                    <Input
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      data-testid="input-test-email"
                    />
                  </div>
                  <div>
                    <Label>件名</Label>
                    <Input
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="テストメールの件名"
                      data-testid="input-test-subject"
                    />
                  </div>
                  <div>
                    <Label>本文</Label>
                    <Textarea
                      value={formBody}
                      onChange={(e) => setFormBody(e.target.value)}
                      placeholder="テストメールの本文"
                      rows={8}
                      data-testid="input-test-body"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!testEmail || !formSubject || !formBody) {
                        toast({ title: "すべての項目を入力してください", variant: "destructive" });
                        return;
                      }
                      testSendMutation.mutate({ to: testEmail, subject: formSubject, body: formBody });
                    }}
                    disabled={testSendMutation.isPending}
                    data-testid="button-test-send"
                  >
                    {testSendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1.5" />
                    )}
                    テスト送信
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) { setShowCreateDialog(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "キャンペーン編集" : "新規キャンペーン作成"}</DialogTitle>
            <DialogDescription>
              メール営業キャンペーンの内容を設定してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>キャンペーン名</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例: 2026年3月 新規顧客開拓"
                data-testid="input-campaign-name"
              />
            </div>
            <div>
              <Label>メール件名</Label>
              <Input
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="例: 【トラマッチ】物流コスト削減のご提案"
                data-testid="input-campaign-subject"
              />
            </div>
            <div>
              <Label>メール本文</Label>
              <Textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder={"例:\nお世話になっております。\nトラマッチの○○です。\n\n貴社の物流コスト削減に...\n\nhttps://tramatch-sinjapan.com"}
                rows={12}
                data-testid="input-campaign-body"
              />
              <p className="text-xs text-muted-foreground mt-1">URLは自動的にリンクに変換されます。HTMLタグも使用可能です。</p>
            </div>
            <div>
              <Label>送信先メールアドレス（1行に1アドレス）</Label>
              <Textarea
                value={formRecipients}
                onChange={(e) => setFormRecipients(e.target.value)}
                placeholder={"example1@company.co.jp\nexample2@company.co.jp\nexample3@company.co.jp"}
                rows={6}
                data-testid="input-campaign-recipients"
              />
              <p className="text-xs text-muted-foreground mt-1">
                有効なメールアドレス: <span className="font-medium text-foreground">{recipientCount}件</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit-campaign"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
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
                <div className="border rounded-lg p-4 bg-muted/30 whitespace-pre-wrap text-sm">
                  {selectedCampaign.body}
                </div>
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
            <DialogDescription>
              この操作は取り消せません。本当に送信しますか？
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">キャンペーン:</span> <span className="font-medium">{selectedCampaign.name}</span></p>
              <p><span className="text-muted-foreground">件名:</span> <span className="font-medium">{selectedCampaign.subject}</span></p>
              <p><span className="text-muted-foreground">送信先:</span> <span className="font-medium">{selectedCampaign.recipients.split("\n").filter(e => e.trim() && e.includes("@")).length}件</span></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmSendDialog(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCampaign && sendMutation.mutate(selectedCampaign.id)}
              disabled={sendMutation.isPending}
              data-testid="button-confirm-send"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              送信開始
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
