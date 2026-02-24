import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Shield, ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
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
  const [filterAction, setFilterAction] = useState("all");
  const [filterTarget, setFilterTarget] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  const limit = 50;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", String(limit));
    if (filterAction && filterAction !== "all") params.set("action", filterAction);
    if (filterTarget && filterTarget !== "all") params.set("targetType", filterTarget);
    return `/api/admin/audit-logs?${params.toString()}`;
  };

  const { data: response, isLoading } = useQuery<AuditLogsResponse>({
    queryKey: [buildQueryString()],
  });

  const allLogs = response?.logs ?? [];
  const logs = searchUser.trim()
    ? allLogs.filter(l => (l.userName || "").toLowerCase().includes(searchUser.toLowerCase()))
    : allLogs;
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

  const actionOptions = [
    { value: "login", label: "ログイン", variant: "outline" as const, color: "text-blue-600 dark:text-blue-400 border-blue-300" },
    { value: "create", label: "作成", variant: "default" as const, color: "" },
    { value: "edit", label: "編集", variant: "secondary" as const, color: "" },
    { value: "approve", label: "承認", variant: "default" as const, color: "bg-green-600" },
    { value: "delete", label: "削除", variant: "destructive" as const, color: "" },
  ];

  const targetOptions = [
    { value: "session", label: "セッション" },
    { value: "user", label: "ユーザー" },
    { value: "cargo", label: "荷物" },
    { value: "truck", label: "車両" },
    { value: "agent", label: "代理店" },
  ];

  const formatActionType = (action: string) => {
    const found = actionOptions.find(a => a.value === action);
    return found || { value: action, label: action, variant: "outline" as const, color: "" };
  };

  const formatTargetType = (targetType: string) => {
    const found = targetOptions.find(t => t.value === targetType);
    return found?.label || targetType;
  };

  const hasFilters = filterAction !== "all" || filterTarget !== "all" || searchUser.trim();

  const clearFilters = () => {
    setFilterAction("all");
    setFilterTarget("all");
    setSearchUser("");
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 py-4">
          <div className="bg-primary rounded-md p-5 mb-5 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">操作ログ</h1>
              <p className="text-sm text-primary-foreground/80 mt-1 text-shadow">全ユーザーの操作履歴</p>
            </div>
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground">フィルター</span>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs h-7" data-testid="button-clear-filters">
                    <X className="w-3 h-3 mr-1" />
                    クリア
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-40">
                  <Select value={filterAction} onValueChange={v => { setFilterAction(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs" data-testid="select-filter-action">
                      <SelectValue placeholder="操作で絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての操作</SelectItem>
                      {actionOptions.map(a => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select value={filterTarget} onValueChange={v => { setFilterTarget(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs" data-testid="select-filter-target">
                      <SelectValue placeholder="対象で絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての対象</SelectItem>
                      {targetOptions.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-8"
                    placeholder="ユーザー名で検索..."
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    data-testid="input-search-user"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                <p className="text-sm text-muted-foreground" data-testid="text-empty-message">
                  {hasFilters ? "該当する操作ログがありません" : "操作ログはありません"}
                </p>
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
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">ユーザー</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">操作</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">対象</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">詳細</th>
                        <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">IP</th>
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
                              <Badge variant={actionConfig.variant} className={`text-[10px] ${actionConfig.color}`}>
                                {actionConfig.label}
                              </Badge>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] text-foreground font-bold">{formatTargetType(log.targetType)}</span>
                              {log.targetId && <div className="text-[11px] text-muted-foreground font-bold mt-0.5 truncate max-w-[100px]" title={log.targetId}>ID: {log.targetId.substring(0, 8)}...</div>}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[12px] text-muted-foreground break-words max-w-[300px]">{log.details || "-"}</span>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <span className="text-[11px] text-muted-foreground font-mono">{log.ipAddress || "-"}</span>
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
