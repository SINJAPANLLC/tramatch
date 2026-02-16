import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Building, Phone, Mail } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

export default function Partners() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">取引先管理</h1>
            <p className="text-sm text-muted-foreground mt-1">取引先企業の管理・登録</p>
          </div>
          <Button data-testid="button-add-partner">
            <Plus className="w-4 h-4 mr-1.5" />
            取引先を追加
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-state">登録された取引先はありません</p>
            <p className="text-xs text-muted-foreground mt-2">取引先を追加して管理できます</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
