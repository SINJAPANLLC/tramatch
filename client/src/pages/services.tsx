import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Zap,
  Package,
  Truck,
  FileText,
  Building2,
  ScrollText,
  Shield,
  BarChart3,
  ArrowRight,
  Bot,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type ServiceItem = {
  title: string;
  description: string;
  icon: typeof Zap;
  status: "available" | "coming-soon";
  href?: string;
  category: string;
};

const serviceItems: ServiceItem[] = [
  {
    title: "AI運賃見積もり",
    description: "AIが最適な運賃を自動算出",
    icon: Zap,
    status: "available",
    href: "/cargo/new",
    category: "AI機能",
  },
  {
    title: "AI荷物登録",
    description: "AIチャットで簡単荷物登録",
    icon: Package,
    status: "available",
    href: "/cargo",
    category: "AI機能",
  },
  {
    title: "AI空車登録",
    description: "AIチャットで簡単空車登録",
    icon: Truck,
    status: "available",
    href: "/trucks",
    category: "AI機能",
  },
  {
    title: "配車依頼書作成",
    description: "成約後の配車依頼書を自動生成",
    icon: FileText,
    status: "available",
    href: "/completed-cargo",
    category: "業務支援",
  },
  {
    title: "企業検索",
    description: "運送会社・荷主企業を検索",
    icon: Building2,
    status: "available",
    href: "/companies",
    category: "業務支援",
  },
  {
    title: "契約書テンプレート",
    description: "運送契約書類のテンプレート",
    icon: ScrollText,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "保険サービス",
    description: "貨物保険・車両保険の見積もり",
    icon: Shield,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "運行分析レポート",
    description: "運行データの分析",
    icon: BarChart3,
    status: "coming-soon",
    category: "準備中サービス",
  },
];

const categories = ["AI機能", "業務支援", "準備中サービス"];

function ServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  const content = (
    <Card className={service.status === "available" ? "hover-elevate cursor-pointer" : ""} data-testid={`card-service-${index}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <service.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground text-sm">{service.title}</h3>
              {service.status === "available" ? (
                <Badge className="text-xs shrink-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 no-default-hover-elevate no-default-active-elevate">利用可能</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs shrink-0 no-default-hover-elevate no-default-active-elevate">準備中</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
          </div>
          {service.status === "available" && (
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (service.status === "available" && service.href) {
    return (
      <Link href={service.href} data-testid={`link-service-${index}`}>
        {content}
      </Link>
    );
  }

  return content;
}

export default function Services() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">便利サービス</h1>
          <p className="text-sm text-muted-foreground mt-1">業務に役立つ各種サービス</p>
        </div>

        {categories.map((category) => {
          const items = serviceItems.filter((s) => s.category === category);
          if (items.length === 0) return null;

          const categoryIcon = category === "AI機能" ? Bot : category === "業務支援" ? FileText : BarChart3;
          const CategoryIcon = categoryIcon;

          return (
            <div key={category} className="mb-6">
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <CategoryIcon className="w-4 h-4 text-primary" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((service) => {
                  const globalIndex = serviceItems.indexOf(service);
                  return (
                    <ServiceCard key={service.title} service={service} index={globalIndex} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
