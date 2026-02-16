import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, FileText, Shield, BarChart3, Headphones, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";

const serviceItems = [
  {
    title: "AI運賃見積もり",
    description: "AIが最適な運賃を自動算出します",
    icon: Zap,
    status: "準備中",
  },
  {
    title: "契約書テンプレート",
    description: "運送契約に必要な書類テンプレートを提供",
    icon: FileText,
    status: "準備中",
  },
  {
    title: "保険サービス",
    description: "貨物保険・車両保険の一括見積もり",
    icon: Shield,
    status: "準備中",
  },
  {
    title: "運行分析レポート",
    description: "運行データの分析・レポート作成",
    icon: BarChart3,
    status: "準備中",
  },
  {
    title: "サポートデスク",
    description: "24時間対応のカスタマーサポート",
    icon: Headphones,
    status: "準備中",
  },
];

export default function Services() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">便利サービス</h1>
          <p className="text-sm text-muted-foreground mt-1">業務に役立つ各種サービス</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceItems.map((service, index) => (
            <Card key={index} data-testid={`card-service-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground text-sm">{service.title}</h3>
                      <Badge variant="secondary" className="text-xs shrink-0">{service.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
