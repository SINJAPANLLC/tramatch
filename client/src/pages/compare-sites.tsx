import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import SeoHead from "@/components/seo/seo-head";
import Breadcrumb from "@/components/seo/breadcrumb";
import CtaBlock, { MobileFixedCta } from "@/components/seo/cta-block";
import FaqBlock from "@/components/seo/faq-block";
import StructuredData from "@/components/seo/structured-data";

const services = [
  {
    name: "トラマッチ",
    highlight: true,
    features: {
      aiMatching: true,
      freeRegistration: true,
      mobile: true,
      realtimeVacancy: true,
      multiChannel: true,
      apiIntegration: false,
    },
    pricing: "基本無料 / 有料プランあり",
    strength: "AIマッチング、モバイル対応、使いやすいUI",
    bestFor: "中小〜大手運送会社、初めて求荷求車を利用する企業",
  },
  {
    name: "トラボックス",
    highlight: false,
    features: {
      aiMatching: false,
      freeRegistration: false,
      mobile: true,
      realtimeVacancy: true,
      multiChannel: false,
      apiIntegration: false,
    },
    pricing: "月額制（要問い合わせ）",
    strength: "老舗サービス、登録会社数が多い",
    bestFor: "既に多くの取引先を持つ中〜大手運送会社",
  },
  {
    name: "ハコベル",
    highlight: false,
    features: {
      aiMatching: true,
      freeRegistration: false,
      mobile: true,
      realtimeVacancy: true,
      multiChannel: false,
      apiIntegration: true,
    },
    pricing: "成功報酬制",
    strength: "大手荷主との取引、システム連携",
    bestFor: "大手荷主企業、物流子会社",
  },
  {
    name: "求車求荷ネット",
    highlight: false,
    features: {
      aiMatching: false,
      freeRegistration: true,
      mobile: false,
      realtimeVacancy: false,
      multiChannel: false,
      apiIntegration: false,
    },
    pricing: "無料 / 一部有料",
    strength: "無料で始められる、シンプルな機能",
    bestFor: "コストを抑えたい小規模運送会社",
  },
];

const featureLabels: Record<string, string> = {
  aiMatching: "AIマッチング",
  freeRegistration: "無料登録",
  mobile: "モバイル対応",
  realtimeVacancy: "リアルタイム空車",
  multiChannel: "マルチチャネル通知",
  apiIntegration: "API連携",
};

const faqItems = [
  { question: "求荷求車サイトを選ぶ際の最も重要なポイントは？", answer: "自社の規模・対応エリア・利用頻度に合った料金体系のサービスを選ぶことが重要です。小規模・低頻度なら無料or成功報酬型、大規模・高頻度なら月額固定型が適しています。" },
  { question: "複数の求荷求車サイトを同時に使うことはできますか？", answer: "はい、可能です。実際に複数サービスを併用する運送会社も多くあります。それぞれのサービスの強みを活かすことで、より多くの案件にアクセスできます。" },
  { question: "求荷求車サイトの乗り換えは簡単ですか？", answer: "基本的には新しいサービスに登録し直すだけで簡単に乗り換えできます。取引履歴の移行はできませんが、既存の取引先との関係は維持できます。" },
];

export default function CompareSites() {
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <SeoHead
        title="求荷求車サイト比較 2026 | 主要4サービスの特徴・料金を徹底比較 | トラマッチ"
        description="2026年最新の求荷求車サイト比較。トラマッチ・トラボックス・ハコベル・求車求荷ネットの特徴・料金・機能・向き不向きを徹底比較します。"
        canonical="https://tramatch-sinjapan.com/compare/kyukakyusha-sites"
      />
      <StructuredData type="Article" data={{
        headline: "求荷求車サイト比較 2026",
        description: "主要4サービスの特徴・料金を徹底比較",
        datePublished: "2026-01-01",
        url: "https://tramatch-sinjapan.com/compare/kyukakyusha-sites",
      }} />

      <div className="bg-primary py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Badge variant="secondary" className="mb-3">比較ガイド 2026年版</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">
            求荷求車サイト比較 2026
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-shadow">
            主要4サービスの特徴・料金・機能を徹底比較
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "コラム", href: "/column" },
          { label: "求荷求車サイト比較 2026" },
        ]} />

        <Card className="mb-8">
          <CardContent className="p-5 sm:p-8">
            <p className="text-foreground leading-relaxed mb-4">
              求荷求車サービスは数多く存在しますが、それぞれ特徴や強みが異なります。本記事では、2026年時点で主要な4つの求荷求車サービスを、機能・料金・対象ユーザーの観点から客観的に比較します。
            </p>
            <p className="text-foreground leading-relaxed">
              各サービスには「向き不向き」があります。自社の規模、利用頻度、必要な機能に合わせて最適なサービスを選ぶことが、物流コスト削減の第一歩です。
            </p>
          </CardContent>
        </Card>

        <CtaBlock variant="both" location="compare-top" />

        <h2 className="text-xl font-bold text-foreground mb-4 mt-8">機能比較表</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-3 text-left font-medium">機能</th>
                {services.map((s) => (
                  <th key={s.name} className={`border p-3 text-center font-medium ${s.highlight ? "bg-primary/10" : ""}`}>
                    {s.name}
                    {s.highlight && <Badge variant="default" className="ml-1 text-xs">おすすめ</Badge>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(featureLabels).map(([key, label]) => (
                <tr key={key}>
                  <td className="border p-3 font-medium">{label}</td>
                  {services.map((s) => (
                    <td key={s.name} className={`border p-3 text-center ${s.highlight ? "bg-primary/5" : ""}`}>
                      {s.features[key as keyof typeof s.features] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 inline" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/40 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="border p-3 font-medium">料金</td>
                {services.map((s) => (
                  <td key={s.name} className={`border p-3 text-center text-xs ${s.highlight ? "bg-primary/5" : ""}`}>{s.pricing}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-4">各サービスの詳細</h2>
        <div className="space-y-4 mb-8">
          {services.map((s) => (
            <Card key={s.name} className={s.highlight ? "border-primary/30" : ""}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-foreground">{s.name}</h3>
                  {s.highlight && <Badge variant="default" className="text-xs">おすすめ</Badge>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">強み</p>
                    <p className="text-foreground">{s.strength}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">料金</p>
                    <p className="text-foreground">{s.pricing}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">向いている企業</p>
                    <p className="text-foreground">{s.bestFor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-foreground mb-3">選び方のまとめ</h2>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span><strong>初めて求荷求車を使う方</strong>には、無料で始められてAIマッチング機能があるトラマッチがおすすめです</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span><strong>大手荷主企業</strong>には、システム連携が充実したハコベルが適しています</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span><strong>コストを最小限にしたい方</strong>は、無料プランのあるサービスから試してみましょう</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <FaqBlock items={faqItems} />

        <CtaBlock variant="both" location="compare-bottom" />

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/guide/kyukakyusha-complete">
            <Button variant="outline" data-testid="button-to-guide">
              求荷求車 完全ガイドを読む <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/register">
            <Button data-testid="button-register-compare" data-track-cta="compare_register">
              トラマッチに無料登録 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <MobileFixedCta />
    </div>
  );
}
