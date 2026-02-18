import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Zap,
  Package,
  Truck,
  FileText,
  Building2,
  ArrowRight,
  Bot,
  ShieldCheck,
  Banknote,
  Warehouse,
  Users,
  Code,
  Handshake,
  Megaphone,
  Clock,
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
    description: "AIが最適な運賃を自動算出。過去の取引データや市場相場を基に、適正価格を提案します。",
    icon: Zap,
    status: "available",
    href: "/cargo/new",
    category: "AI機能",
  },
  {
    title: "AI荷物登録",
    description: "AIチャットで簡単荷物登録。音声入力やテキストから自動で項目を入力します。",
    icon: Package,
    status: "available",
    href: "/cargo",
    category: "AI機能",
  },
  {
    title: "AI空車登録",
    description: "AIチャットで簡単空車登録。空いている車両情報を素早く掲載できます。",
    icon: Truck,
    status: "available",
    href: "/trucks",
    category: "AI機能",
  },
  {
    title: "配車依頼書作成",
    description: "成約後の配車依頼書を自動生成。印刷対応のフォーマットで業務を効率化します。",
    icon: FileText,
    status: "available",
    href: "/completed-cargo",
    category: "業務支援",
  },
  {
    title: "企業検索",
    description: "運送会社・荷主企業を検索。取引先の情報を簡単に確認できます。",
    icon: Building2,
    status: "available",
    href: "/companies",
    category: "業務支援",
  },
  {
    title: "運賃全額保証サービス",
    description: "万が一の未払いリスクをカバー。安心して取引できる運賃保証サービスです。",
    icon: ShieldCheck,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "ファクタリングサービス",
    description: "売掛金を早期に現金化。資金繰りの改善をサポートするファクタリングサービスです。",
    icon: Banknote,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "トラックリースサービス",
    description: "初期費用を抑えて車両を導入。各種トラックのリース・レンタルサービスです。",
    icon: Truck,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "倉庫情報サービス",
    description: "全国の倉庫情報を検索・比較。保管ニーズに合った倉庫をお探しいただけます。",
    icon: Warehouse,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "物流特化人材紹介サービス",
    description: "ドライバー・配車担当など、物流業界に特化した人材紹介・求人サービスです。",
    icon: Users,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "システム開発サービス",
    description: "物流業務に特化したシステム開発。業務効率化のためのカスタムシステムを構築します。",
    icon: Code,
    status: "coming-soon",
    category: "準備中サービス",
  },
  {
    title: "M&A相談サービス",
    description: "運送会社の事業承継・M&Aをサポート。専門アドバイザーが最適なマッチングを行います。",
    icon: Handshake,
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
          <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
            service.status === "available" ? "bg-primary/10" : "bg-muted"
          }`}>
            <service.icon className={`w-5 h-5 ${
              service.status === "available" ? "text-primary" : "text-muted-foreground"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground text-sm">{service.title}</h3>
              {service.status === "available" ? (
                <Badge className="text-xs shrink-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 no-default-hover-elevate no-default-active-elevate">利用可能</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs shrink-0 no-default-hover-elevate no-default-active-elevate">
                  <Clock className="w-3 h-3 mr-1" />
                  準備中
                </Badge>
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

          const categoryIcon = category === "AI機能" ? Bot : category === "業務支援" ? FileText : Clock;
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

        <div className="mt-8">
          <Card className="border-dashed border-2" data-testid="card-sponsor">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground" data-testid="text-sponsor-title">スポンサー募集中</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    トラマッチでは、物流業界を支えるパートナー企業様を募集しています。サービス掲載・広告掲載にご興味のある企業様は、お気軽にお問い合わせください。
                  </p>
                </div>
                <Link href="/contact">
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline cursor-pointer" data-testid="link-sponsor-contact">
                    お問い合わせはこちら
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
