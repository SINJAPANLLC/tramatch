import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLog } from "@shared/schema";

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminAuditLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  const { data: response, isLoading } = useQuery<AuditLogsResponse>({
    queryKey: [`/api/admin/audit-logs?page=${currentPage}&limit=${limit}`],
  });

  const logs = response?.logs ?? [];
  const totalPages = response?.totalPages ?? 0;

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatActionType = (action: string) => {
    const actionMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
      approve: { label: "承認", variant: "default" },
      edit: { label: "編集", variant: "secondary" },
      delete: { label: "削除", variant: "destructive" },
    };
    const config = actionMap[action] ?? { label: action, variant: "outline" as const };
    return config;
  };

  const formatTargetType = (targetType: string) => {
    const typeMap: Record<string, string> = {
      user: "ユーザー",
      cargo: "荷物",
      truck: "車両",
    };
    return typeMap[targetType] ?? targetType;
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 py-4">
          <div className="bg-primary rounded-md p-5 mb-5 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">操作ログ</h1>
              <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">管理者の操作履歴</p>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3"><Skeleton className="h-12 w-full" /></div>
                ))}
              </div>
            </Card>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Shield className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground" data-testid="text-empty-message">操作ログはありません</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-audit-logs">
                    <thead>
                      <tr className="border-b bg-muted/60">
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">日時</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">管理者</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">操作</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">対象</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">詳細</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {logs.map((log, index) => {
                        const actionConfig = formatActionType(log.action);
                        return (
                          <tr
                            key={log.id}
                            className={`${index % 2 === 1 ? "bg-muted/20" : ""}`}
                            data-testid={`row-audit-log-${log.id}`}
                          >
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] font-bold text-foreground whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] font-bold text-foreground">{log.userName || "-"}</span>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <Badge variant={actionConfig.variant} className="text-[10px]">
                                {actionConfig.label}
                              </Badge>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] text-foreground font-bold">{formatTargetType(log.targetType)}</span>
                              {log.targetId && <div className="text-[11px] text-muted-foreground font-bold mt-0.5">ID: {log.targetId}</div>}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] text-muted-foreground break-words max-w-[300px]">{log.details || "-"}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="text-sm text-muted-foreground font-semibold" data-testid="text-pagination-info">
                  {response?.total ?? 0} 件中 {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, response?.total ?? 0)} 件目
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    前へ
                  </Button>
                  <span className="text-sm font-semibold text-foreground px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    data-testid="button-next-page"
                  >
                    次へ
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
