import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Download, FileText } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

export default function TransportLedger() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">実運送体制管理簿</h1>
            <p className="text-sm text-muted-foreground mt-1">実運送体制の管理・記録</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" data-testid="button-export-ledger">
              <Download className="w-4 h-4 mr-1.5" />
              エクスポート
            </Button>
            <Button data-testid="button-add-record">
              <Plus className="w-4 h-4 mr-1.5" />
              新規記録
            </Button>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-records">0</p>
                <p className="text-xs text-muted-foreground">総記録数</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-transports">0</p>
                <p className="text-xs text-muted-foreground">稼働中</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold text-foreground" data-testid="text-completed-transports">0</p>
                <p className="text-xs text-muted-foreground">完了済み</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-state">管理簿の記録はありません</p>
            <p className="text-xs text-muted-foreground mt-2">実運送の体制情報を記録・管理できます</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
