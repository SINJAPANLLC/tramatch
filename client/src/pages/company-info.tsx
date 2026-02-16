import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Phone, Mail, Globe, Calendar, Users, Target } from "lucide-react";

export default function CompanyInfo() {
  const companyData = [
    { label: "会社名", value: "合同会社SIN JAPAN" },
    { label: "所在地", value: "〒243-0303 神奈川県愛甲郡愛川町中津7287" },
    { label: "電話番号", value: "046-212-2325" },
    { label: "FAX", value: "046-212-2326" },
    { label: "メール", value: "info@sinjapan.jp" },
    { label: "事業内容", value: "求荷求車マッチングプラットフォーム「トラマッチ」の運営" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3" data-testid="text-page-title">会社情報</h1>
        <p className="text-muted-foreground text-lg">合同会社SIN JAPANについて</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              会社概要
            </h2>
            <div className="divide-y">
              {companyData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row py-4 first:pt-0 last:pb-0"
                  data-testid={`row-company-${index}`}
                >
                  <span className="font-medium w-32 flex-shrink-0 mb-1 sm:mb-0">{item.label}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              ミッション
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              物流業界における求荷求車の課題を、テクノロジーの力で解決することを目指しています。
              AIを活用した効率的なマッチングにより、荷主と運送会社の双方にとって最適な物流を実現し、
              日本の物流業界の発展に貢献します。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              サービス
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Users, title: "AI求荷求車マッチング", desc: "荷主と運送会社をAIが最適にマッチング" },
                { icon: MapPin, title: "全国対応", desc: "日本全国の荷物・空車情報を網羅" },
                { icon: Calendar, title: "リアルタイム検索", desc: "最新の荷物・空車情報をリアルタイムで検索" },
                { icon: Phone, title: "企業検索・管理", desc: "取引先の管理や企業検索が可能" },
              ].map((service, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                  <service.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{service.title}</p>
                    <p className="text-xs text-muted-foreground">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
