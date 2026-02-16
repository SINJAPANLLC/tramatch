import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, X, FileText, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
  address?: string;
  contactName?: string;
  fax?: string;
  truckCount?: string;
  permitFile?: string;
};

export default function AdminApplications() {
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const pendingUsers = users?.filter((u) => !u.approved && u.role !== "admin") ?? [];

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
      toast({ title: "申請を却下しました" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">申請管理</h1>
            <p className="text-sm text-muted-foreground mt-1">新規ユーザーの承認・却下</p>
          </div>
          <Badge variant="secondary" data-testid="badge-pending-count">
            承認待ち: {pendingUsers.length}件
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground" data-testid="text-empty-state">承認待ちの申請はありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <Card key={u.id} data-testid={`card-application-${u.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-foreground text-sm">{u.companyName}</h3>
                        <Badge variant="destructive" className="text-xs shrink-0">未承認</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>{u.email} {u.contactName ? `/ ${u.contactName}` : ""}</p>
                        {u.phone && <p>TEL: {u.phone} {u.fax ? `/ FAX: ${u.fax}` : ""}</p>}
                        {u.address && <p>{u.address}</p>}
                        {u.truckCount && <p>保有台数: {u.truckCount}</p>}
                      </div>
                      {u.permitFile && (
                        <a href={u.permitFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2" data-testid={`link-permit-${u.id}`}>
                          <FileText className="w-3 h-3" />
                          許可証を確認
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveUser.mutate(u.id)}
                        disabled={approveUser.isPending}
                        data-testid={`button-approve-${u.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteUser.mutate(u.id)}
                        disabled={deleteUser.isPending}
                        data-testid={`button-reject-${u.id}`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        却下
                      </Button>
                    </div>
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
