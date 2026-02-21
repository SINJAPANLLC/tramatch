import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Brain, Plus, Pencil, Trash2, ArrowUpCircle, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";

type AiTrainingExample = {
  id: string;
  category: string;
  inputText: string;
  expectedOutput: string;
  note: string | null;
  isActive: boolean;
  useCount: number;
  successRate: number;
  createdBy: string | null;
  createdAt: string;
};

type AiCorrectionLog = {
  id: string;
  category: string;
  originalInput: string;
  aiOutput: string;
  correctedOutput: string;
  correctedFields: string | null;
  userId: string | null;
  promoted: boolean;
  createdAt: string;
};

const CATEGORIES = [
  { value: "cargo", label: "荷物" },
  { value: "truck", label: "空車" },
];

function getCategoryLabel(value: string) {
  return CATEGORIES.find(c => c.value === value)?.label ?? value;
}

function getCategoryColor(value: string) {
  switch (value) {
    case "cargo": return "border-teal-300 text-teal-600";
    case "truck": return "border-blue-300 text-blue-600";
    default: return "";
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function truncateText(text: string, maxLen: number = 80) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

type TrainingFormData = {
  category: string;
  inputText: string;
  expectedOutput: string;
  note: string;
};

function TrainingDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: AiTrainingExample;
  onSubmit: (data: TrainingFormData) => void;
  isPending: boolean;
}) {
  const [category, setCategory] = useState(initial?.category ?? "cargo");
  const [inputText, setInputText] = useState(initial?.inputText ?? "");
  const [expectedOutput, setExpectedOutput] = useState(initial?.expectedOutput ?? "");
  const [note, setNote] = useState(initial?.note ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !expectedOutput.trim()) return;
    onSubmit({
      category,
      inputText: inputText.trim(),
      expectedOutput: expectedOutput.trim(),
      note: note.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "学習データを編集" : "新しい学習データを追加"}</DialogTitle>
          <DialogDescription>
            {initial ? "学習データの内容を変更します" : "AIの学習に使用するデータを登録します"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="training-category">カテゴリ</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-training-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="training-input">入力テキスト</Label>
            <Textarea
              id="training-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ユーザーの入力例"
              rows={4}
              data-testid="input-training-input-text"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="training-output">期待される出力</Label>
            <Textarea
              id="training-output"
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              placeholder="期待されるAIの出力"
              rows={4}
              data-testid="input-training-expected-output"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="training-note">メモ</Label>
            <Input
              id="training-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="任意のメモ"
              data-testid="input-training-note"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-training">
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending || !inputText.trim() || !expectedOutput.trim()} data-testid="button-save-training">
              {initial ? "更新する" : "追加する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>削除の確認</DialogTitle>
          <DialogDescription>この操作は元に戻せません。本当に削除しますか？</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-delete">
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending} data-testid="button-confirm-delete">
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TrainingExamplesTab() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AiTrainingExample | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery<AiTrainingExample[]>({
    queryKey: ["/api/admin/ai-training"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TrainingFormData) => {
      await apiRequest("POST", "/api/admin/ai-training", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-training"] });
      toast({ title: "学習データを追加しました" });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TrainingFormData }) => {
      await apiRequest("PATCH", `/api/admin/ai-training/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-training"] });
      toast({ title: "学習データを更新しました" });
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ai-training/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-training"] });
      toast({ title: "学習データを削除しました" });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/ai-training/${id}`, { isActive });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-training"] });
      toast({ title: variables.isActive ? "学習データを有効にしました" : "学習データを無効にしました" });
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <p className="text-sm text-muted-foreground">
          AIの学習に使用するデータの管理
        </p>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-new-training">
          <Plus className="w-4 h-4 mr-1.5" />
          新しい学習データ
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : !items?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-training">学習データはまだありません</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">カテゴリ</TableHead>
                    <TableHead>入力テキスト</TableHead>
                    <TableHead>期待出力</TableHead>
                    <TableHead className="w-[120px]">メモ</TableHead>
                    <TableHead className="w-[70px] text-center">有効</TableHead>
                    <TableHead className="w-[70px] text-center">使用回数</TableHead>
                    <TableHead className="w-[100px]">作成日</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} data-testid={`row-training-${item.id}`}>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm" data-testid={`text-input-${item.id}`}>
                          {truncateText(item.inputText, 60)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm text-muted-foreground" data-testid={`text-output-${item.id}`}>
                          {truncateText(item.expectedOutput, 60)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {item.note || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: item.id, isActive: checked })
                          }
                          disabled={toggleActiveMutation.isPending}
                          data-testid={`switch-active-${item.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm" data-testid={`text-use-count-${item.id}`}>{item.useCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingItem(item)}
                            data-testid={`button-edit-training-${item.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteTarget(item.id)}
                            data-testid={`button-delete-training-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <TrainingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      {editingItem && (
        <TrainingDialog
          open={!!editingItem}
          onOpenChange={(open) => { if (!open) setEditingItem(null); }}
          initial={editingItem}
          onSubmit={(data) => updateMutation.mutate({ id: editingItem.id, data })}
          isPending={updateMutation.isPending}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

function CorrectionLogsTab() {
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery<AiCorrectionLog[]>({
    queryKey: ["/api/admin/ai-corrections"],
  });

  const promoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/admin/ai-corrections/${id}/promote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-corrections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-training"] });
      toast({ title: "学習データに昇格しました" });
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ai-corrections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-corrections"] });
      toast({ title: "修正ログを削除しました" });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    },
  });

  function parseCorrectedFields(fields: string | null): string {
    if (!fields) return "-";
    try {
      const parsed = JSON.parse(fields);
      if (Array.isArray(parsed)) return parsed.join(", ");
      if (typeof parsed === "object") return Object.keys(parsed).join(", ");
      return String(parsed);
    } catch {
      return fields;
    }
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          ユーザーによるAI出力の修正履歴
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : !items?.length ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-corrections">修正ログはまだありません</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">カテゴリ</TableHead>
                    <TableHead>元の入力</TableHead>
                    <TableHead>修正項目</TableHead>
                    <TableHead className="w-[100px]">ユーザーID</TableHead>
                    <TableHead className="w-[80px] text-center">状態</TableHead>
                    <TableHead className="w-[100px]">作成日</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} data-testid={`row-correction-${item.id}`}>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm" data-testid={`text-original-input-${item.id}`}>
                          {truncateText(item.originalInput, 60)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground" data-testid={`text-corrected-fields-${item.id}`}>
                          {parseCorrectedFields(item.correctedFields)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground" data-testid={`text-user-id-${item.id}`}>
                          {item.userId || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.promoted ? (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-600" data-testid={`badge-promoted-${item.id}`}>
                            昇格済
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-500" data-testid={`badge-not-promoted-${item.id}`}>
                            未昇格
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!item.promoted && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => promoteMutation.mutate(item.id)}
                              disabled={promoteMutation.isPending}
                              data-testid={`button-promote-${item.id}`}
                            >
                              <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                              昇格
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteTarget(item.id)}
                            data-testid={`button-delete-correction-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

export default function AdminAiTraining() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Brain className="w-5 h-5 text-primary" />
            AI学習管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AIの学習データと修正ログの管理
          </p>
        </div>

        <Tabs defaultValue="training" className="space-y-4">
          <TabsList data-testid="tabs-ai-training">
            <TabsTrigger value="training" data-testid="tab-training">学習データ</TabsTrigger>
            <TabsTrigger value="corrections" data-testid="tab-corrections">修正ログ</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <TrainingExamplesTab />
          </TabsContent>

          <TabsContent value="corrections">
            <CorrectionLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
