import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Truck,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Warehouse,
  Users,
  Code,
  Handshake,
  Megaphone,
  Mail,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

type ServiceItem = {
  title: string;
  description: string;
  icon: typeof Truck;
};

const serviceItems: ServiceItem[] = [
  {
    title: "運賃全額保証サービス",
    description: "万が一の未払いリスクをカバー。安心して取引できる運賃保証サービスです。",
    icon: ShieldCheck,
  },
  {
    title: "ファクタリングサービス",
    description: "売掛金を早期に現金化。資金繰りの改善をサポートするファクタリングサービスです。",
    icon: Banknote,
  },
  {
    title: "トラックリースサービス",
    description: "初期費用を抑えて車両を導入。各種トラックのリース・レンタルサービスです。",
    icon: Truck,
  },
  {
    title: "倉庫情報サービス",
    description: "全国の倉庫情報を検索・比較。保管ニーズに合った倉庫をお探しいただけます。",
    icon: Warehouse,
  },
  {
    title: "物流特化人材紹介サービス",
    description: "ドライバー・配車担当など、物流業界に特化した人材紹介・求人サービスです。",
    icon: Users,
  },
  {
    title: "システム開発サービス",
    description: "物流業務に特化したシステム開発。業務効率化のためのカスタムシステムを構築します。",
    icon: Code,
  },
  {
    title: "M&A相談サービス",
    description: "運送会社の事業承継・M&Aをサポート。専門アドバイザーが最適なマッチングを行います。",
    icon: Handshake,
  },
];

function ServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  return (
    <Link href="/contact">
      <Card className="cursor-pointer hover:bg-primary/10 transition-colors" data-testid={`card-service-${index}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <service.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-foreground text-sm">{service.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
              <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
                <Mail className="w-3 h-3" />
                お問い合わせ
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Services() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">便利サービス</h1>
          <p className="text-sm text-muted-foreground mt-1">業務に役立つ各種サービス</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {serviceItems.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>

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
    </DashboardLayout>
  );
}
