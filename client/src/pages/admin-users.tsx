import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserCog, Trash2, Search, FileText, CheckCircle, Crown } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";

type SafeUser = {
  id: string;
  username: string;
  companyName: string;
  phone: string;
  email: string;
  userType: string;
  role: string;
  approved: boolean;
  plan: string;
  address?: string;
  contactName?: string;
  fax?: string;
  truckCount?: string;
  permitFile?: string;
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const approveUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/users/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザーを承認しました" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "ユーザーを削除しました" });
    },
  });

  const changePlan = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}/plan`, { plan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "プランを変更しました" });
    },
    onError: () => {
      toast({ title: "プラン変更に失敗しました", variant: "destructive" });
    },
  });

  const filteredUsers = users?.filter((u) =>
    !searchQuery ||
    u.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.contactName && u.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
  ) ?? [];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">ユーザー管理</h1>
            <p className="text-sm text-muted-foreground mt-1">全ユーザーの管理・プラン切替</p>
          </div>
          <Badge variant="secondary" data-testid="badge-user-count">
            全{users?.length ?? 0}件
          </Badge>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="企業名、メールアドレス、担当者名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-user-search"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <Card key={u.id} data-testid={`card-user-${u.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground text-sm">{u.companyName}</h3>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs shrink-0">
                          {u.role === "admin" ? "管理者" : "一般"}
                        </Badge>
                        {u.role !== "admin" && (
                          <Badge variant={u.approved ? "default" : "destructive"} className="text-xs shrink-0">
                            {u.approved ? "承認済" : "未承認"}
                          </Badge>
                        )}
                        {u.role !== "admin" && (
                          <Badge
                            variant={u.plan === "premium" ? "default" : "outline"}
                            className={`text-xs shrink-0 ${u.plan === "premium" ? "" : ""}`}
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            {u.plan === "premium" ? "プレミアム" : "フリー"}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {u.email} {u.contactName ? `/ ${u.contactName}` : ""} {u.phone ? `/ ${u.phone}` : ""}
                      </div>
                      {u.truckCount && <p className="text-xs text-muted-foreground mt-0.5">保有台数: {u.truckCount}</p>}
                      {u.permitFile && (
                        <a href={u.permitFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                          <FileText className="w-3 h-3" />
                          許可証を確認
                        </a>
                      )}
                    </div>
                    {u.role !== "admin" && (
                      <div className="flex items-center gap-1">
                        {!u.approved && (
                          <Button
                            size="sm"
                            onClick={() => approveUser.mutate(u.id)}
                            disabled={approveUser.isPending}
                            data-testid={`button-approve-user-${u.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            承認
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={u.plan === "premium" ? "outline" : "default"}
                          onClick={() => changePlan.mutate({ id: u.id, plan: u.plan === "premium" ? "free" : "premium" })}
                          disabled={changePlan.isPending}
                          data-testid={`button-plan-toggle-${u.id}`}
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          {u.plan === "premium" ? "フリーに変更" : "プレミアムに変更"}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteUser.mutate(u.id)}
                          disabled={deleteUser.isPending}
                          data-testid={`button-delete-user-${u.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
