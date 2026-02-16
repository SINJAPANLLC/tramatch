import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

export default function CompletedCargo() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">成約した荷物</h1>
          <p className="text-sm text-muted-foreground mt-1">成約済みの荷物情報の一覧</p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-state">成約した荷物はまだありません</p>
            <p className="text-xs text-muted-foreground mt-2">荷物のマッチングが成立すると、ここに表示されます</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
