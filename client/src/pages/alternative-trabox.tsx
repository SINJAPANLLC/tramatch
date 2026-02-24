import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import SeoHead from "@/components/seo/seo-head";
import Breadcrumb from "@/components/seo/breadcrumb";
import CtaBlock, { MobileFixedCta } from "@/components/seo/cta-block";
import FaqBlock from "@/components/seo/faq-block";
import StructuredData from "@/components/seo/structured-data";

const faqItems = [
  { question: "トラボックスからトラマッチに乗り換えるのは簡単ですか？", answer: "はい、トラマッチへの登録は約5分で完了します。既存のトラボックスアカウントを維持したまま、トラマッチを併用することも可能です。" },
  { question: "トラマッチはトラボックスと併用できますか？", answer: "はい、問題なく併用できます。複数サービスの併用は業界では一般的で、より多くの案件にアクセスできるメリットがあります。" },
  { question: "トラマッチの方がトラボックスより優れている点は？", answer: "トラマッチはAIマッチング機能、モバイル最適化UI、マルチチャネル通知（アプリ内・メール・LINE）、無料の基本プランなどが特徴です。特にAI技術によるマッチング精度の高さが好評です。" },
];

export default function AlternativeTrabox() {
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <SeoHead
        title="トラボックスの代わり 2026 | 乗り換え・併用検討者向けガイド | トラマッチ"
        description="トラボックスの代わりとなる求荷求車サービスを検討中の方向けのガイド。トラマッチとの機能比較、乗り換えメリット、併用の方法を紹介します。"
        canonical="https://tramatch-sinjapan.com/alternative/trabox"
      />
      <StructuredData type="Article" data={{
        headline: "トラボックスの代わり 2026",
        description: "乗り換え・併用検討者向けガイド",
        datePublished: "2026-01-01",
        url: "https://tramatch-sinjapan.com/alternative/trabox",
      }} />

      <div className="bg-primary py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Badge variant="secondary" className="mb-3">代替サービスガイド 2026年版</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">
            トラボックスの代わり 2026
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-shadow">
            乗り換え・併用を検討されている方向けの選び方ガイド
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "コラム", href: "/column" },
          { label: "トラボックスの代わり 2026" },
        ]} />

        <Card className="mb-8">
          <CardContent className="p-5 sm:p-8">
            <p className="text-foreground leading-relaxed mb-4">
              トラボックスは日本の求荷求車業界を牽引してきた老舗サービスです。長年の実績があり、多くの運送会社・荷主に利用されています。一方で、近年はAIマッチングやモバイル対応など新しい技術を取り入れた次世代サービスも登場しています。
            </p>
            <p className="text-foreground leading-relaxed mb-4">
              この記事では、トラボックスからの乗り換えや併用を検討されている方に向けて、代替サービスの選び方と各サービスの特徴を客観的にご紹介します。
            </p>
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                本記事は事実に基づいた客観的な情報提供を目的としています。特定のサービスを否定するものではありません。
              </p>
            </div>
          </CardContent>
        </Card>

        <CtaBlock variant="both" location="alternative-top" />

        <h2 className="text-xl font-bold text-foreground mb-4 mt-8">トラボックスの特徴</h2>
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-foreground"><strong>業界での知名度が高い</strong>: 長年の運営実績があり、多くの運送会社が登録しています</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-foreground"><strong>登録会社数が多い</strong>: 大手から中小まで幅広い運送会社が利用しています</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-foreground"><strong>リアルタイム情報</strong>: 空車・荷物情報がリアルタイムで更新されます</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-foreground mb-4">乗り換え・併用を検討する理由</h2>
        <Card className="mb-6">
          <CardContent className="p-5">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <span className="text-foreground"><strong>AIマッチング機能</strong>が欲しい場合: 条件に合う荷物/車両を自動的にマッチングするAI機能は、作業効率を大幅に向上させます</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <span className="text-foreground"><strong>料金を見直したい</strong>場合: 無料プランやフリーミアム制のサービスで、まずはコストを抑えて始めたい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                <span className="text-foreground"><strong>モバイル対応</strong>が必要な場合: 外出先やドライバーがスマートフォンで操作できる環境が必要</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                <span className="text-foreground"><strong>通知機能</strong>の充実: メール・LINE・アプリ内通知など、マルチチャネルで情報を受け取りたい</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">5</span>
                <span className="text-foreground"><strong>案件の幅を広げたい</strong>場合: 複数のプラットフォームを使うことで、より多くの案件にアクセスできます</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-foreground mb-4">トラマッチとの比較</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-3 text-left font-medium">項目</th>
                <th className="border p-3 text-center font-medium">トラボックス</th>
                <th className="border p-3 text-center font-medium bg-primary/10">トラマッチ</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["AIマッチング", "なし", "あり"],
                ["料金", "月額制", "基本無料"],
                ["モバイル対応", "一部対応", "完全対応"],
                ["通知", "メール", "メール・LINE・アプリ内"],
                ["登録審査", "あり", "あり（管理者承認制）"],
                ["API連携", "一部あり", "開発中"],
                ["運営歴", "長い", "新しい"],
                ["登録会社数", "多い", "成長中"],
              ].map(([item, trabox, tramatch], i) => (
                <tr key={i}>
                  <td className="border p-3 font-medium">{item}</td>
                  <td className="border p-3 text-center">{trabox}</td>
                  <td className="border p-3 text-center bg-primary/5">{tramatch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card className="mb-8 border-primary/30">
          <CardContent className="p-5">
            <h3 className="text-base font-bold text-foreground mb-3">おすすめの使い分け</h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>まずは<strong>トラマッチの無料プランで併用</strong>してみて、効果を確認することをおすすめします</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>AIマッチングの精度に満足したら、<strong>メインサービスとして活用</strong>を検討してください</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>両サービスを併用することで、<strong>案件数の最大化</strong>が可能です</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <FaqBlock items={faqItems} />

        <CtaBlock variant="both" location="alternative-bottom" />

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/compare/kyukakyusha-sites">
            <Button variant="outline" data-testid="button-to-compare">
              全サービス比較を見る <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/register">
            <Button data-testid="button-register-alternative" data-track-cta="alternative_register">
              トラマッチに無料登録 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <MobileFixedCta />
    </div>
  );
}
