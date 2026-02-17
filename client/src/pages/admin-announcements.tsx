import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import type { Announcement } from "@shared/schema";

const CATEGORIES = [
  { value: "general", label: "一般" },
  { value: "maintenance", label: "メンテナンス" },
  { value: "update", label: "アップデート" },
  { value: "important", label: "重要" },
  { value: "campaign", label: "キャンペーン" },
];

function getCategoryLabel(value: string) {
  return CATEGORIES.find(c => c.value === value)?.label ?? value;
}

function getCategoryColor(value: string) {
  switch (value) {
    case "important": return "border-red-300 text-red-600";
    case "maintenance": return "border-yellow-300 text-yellow-600";
    case "update": return "border-blue-300 text-blue-600";
    case "campaign": return "border-purple-300 text-purple-600";
    default: return "";
  }
}

function AnnouncementForm({ initial, onSubmit, onCancel, isPending }: {
  initial?: Announcement;
  onSubmit: (data: { title: string; content: string; category: string; isPublished: boolean }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "general");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title: title.trim(), content: content.trim(), category, isPublished });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{initial ? "お知らせを編集" : "新しいお知らせを作成"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ann-title">タイトル</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="お知らせのタイトル"
              data-testid="input-announcement-title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ann-category">カテゴリ</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-announcement-category">
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
            <Label htmlFor="ann-content">内容</Label>
            <Textarea
              id="ann-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="お知らせの内容を入力"
              rows={6}
              data-testid="input-announcement-content"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="ann-published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
              data-testid="switch-announcement-published"
            />
            <Label htmlFor="ann-published" className="cursor-pointer">
              {isPublished ? "公開中" : "下書き"}
            </Label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button type="submit" disabled={isPending || !title.trim() || !content.trim()} data-testid="button-save-announcement">
              {initial ? "更新する" : "作成する"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-announcement">
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  const { data: items, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; isPublished: boolean }) => {
      await apiRequest("POST", "/api/admin/announcements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({ title: "お知らせを作成しました" });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; content: string; category: string; isPublished: boolean }> }) => {
      await apiRequest("PATCH", `/api/admin/announcements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({ title: "お知らせを更新しました" });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({ title: "お知らせを削除しました" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      await apiRequest("PATCH", `/api/admin/announcements/${id}`, { isPublished });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({ title: variables.isPublished ? "お知らせを公開しました" : "お知らせを非公開にしました" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Megaphone className="w-5 h-5 text-primary" />
              お知らせ管理
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ユーザーに向けたお知らせの作成・編集・公開管理
            </p>
          </div>
          {!showForm && !editingItem && (
            <Button onClick={() => setShowForm(true)} data-testid="button-new-announcement">
              <Plus className="w-4 h-4 mr-1.5" />
              新しいお知らせ
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <AnnouncementForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
              isPending={createMutation.isPending}
            />
          </div>
        )}

        {editingItem && (
          <div className="mb-6">
            <AnnouncementForm
              initial={editingItem}
              onSubmit={(data) => updateMutation.mutate({ id: editingItem.id, data })}
              onCancel={() => setEditingItem(null)}
              isPending={updateMutation.isPending}
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : !items?.length ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">お知らせはまだありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const createdDate = new Date(item.createdAt);
              const dateStr = `${createdDate.getFullYear()}/${String(createdDate.getMonth() + 1).padStart(2, "0")}/${String(createdDate.getDate()).padStart(2, "0")}`;

              return (
                <Card key={item.id} data-testid={`card-announcement-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{item.title}</span>
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                            {getCategoryLabel(item.category)}
                          </Badge>
                          {item.isPublished ? (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                              <Eye className="w-3 h-3 mr-1" />
                              公開中
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
                              <EyeOff className="w-3 h-3 mr-1" />
                              下書き
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{item.content}</p>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePublish.mutate({ id: item.id, isPublished: !item.isPublished })}
                          disabled={togglePublish.isPending}
                          data-testid={`button-toggle-publish-${item.id}`}
                        >
                          {item.isPublished ? (
                            <><EyeOff className="w-3.5 h-3.5 mr-1" />非公開</>
                          ) : (
                            <><Eye className="w-3.5 h-3.5 mr-1" />公開</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingItem(item); setShowForm(false); }}
                          data-testid={`button-edit-announcement-${item.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          編集
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-announcement-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
