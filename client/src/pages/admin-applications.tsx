import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, X, FileText, Building2, Phone, Mail, MapPin, Truck, User, Clock } from "lucide-react";
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
  createdAt?: string;
  registrationDate?: string;
};

export default function AdminApplications() {
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const pendingUsers = users?.filter((u) => !u.approved && u.role !== "admin") ?? [];
  const approvedCount = users?.filter((u) => u.approved && u.role !== "admin")?.length ?? 0;

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

  const formatDate = (user: SafeUser) => {
    if (user.registrationDate) return user.registrationDate;
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("ja-JP");
    return "-";
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
        <div className="bg-primary rounded-md p-5 mb-6">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">申請管理</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">新規ユーザーの承認・却下を行います</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{pendingUsers.length}</p>
                  )}
                  <p className="text-xs text-muted-foreground">承認待ち</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">承認済み</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium text-foreground mb-1" data-testid="text-empty-state">承認待ちの申請はありません</p>
              <p className="text-sm text-muted-foreground">新しいユーザー登録があるとここに表示されます</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((u) => (
              <Card key={u.id} data-testid={`card-application-${u.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{u.companyName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="destructive" className="text-xs">未承認</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(u)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveUser.mutate(u.id)}
                        disabled={approveUser.isPending}
                        data-testid={`button-approve-${u.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        承認する
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteUser.mutate(u.id)}
                        disabled={deleteUser.isPending}
                        data-testid={`button-reject-${u.id}`}
                      >
                        <X className="w-4 h-4 mr-1.5" />
                        却下
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-[52px]">
                    {u.contactName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">担当者:</span>
                        <span className="text-foreground">{u.contactName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{u.phone}</span>
                        {u.fax && <span className="text-muted-foreground text-xs">(FAX: {u.fax})</span>}
                      </div>
                    )}
                    {u.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground truncate">{u.address}</span>
                      </div>
                    )}
                    {u.truckCount && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">保有台数:</span>
                        <span className="text-foreground">{u.truckCount}台</span>
                      </div>
                    )}
                  </div>

                  {u.permitFile && (
                    <div className="mt-3 pl-[52px]">
                      <a
                        href={u.permitFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        data-testid={`link-permit-${u.id}`}
                      >
                        <FileText className="w-4 h-4" />
                        許可証を確認する
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
