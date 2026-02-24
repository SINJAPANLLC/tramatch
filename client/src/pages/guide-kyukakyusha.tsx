import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SeoHead from "@/components/seo/seo-head";
import Breadcrumb from "@/components/seo/breadcrumb";
import TableOfContents from "@/components/seo/table-of-contents";
import CtaBlock, { MobileFixedCta } from "@/components/seo/cta-block";
import FaqBlock from "@/components/seo/faq-block";
import StructuredData from "@/components/seo/structured-data";

const pillarContent = `## 求荷求車とは？基本的な仕組みを解説

求荷求車（きゅうかきゅうしゃ）とは、「荷物を求める（求荷）」と「車両を求める（求車）」を組み合わせた物流業界の専門用語です。荷物を運びたい荷主と、荷物を探している運送会社をマッチングする仕組みを指します。

従来、荷主は知り合いの運送会社に電話やFAXで依頼し、運送会社は営業活動で荷物を確保していました。しかし、この方法では空車率が高くなり、物流業界全体の非効率性が課題となっていました。国土交通省の調査によると、トラックの空車率は約40%にも達しており、年間数兆円規模の経済損失が発生しています。

求荷求車サービスは、インターネットを通じてこの非効率を解消するために生まれました。荷主が荷物情報を登録し、運送会社が空車情報を登録することで、条件が合う相手を効率的に見つけることができます。

## 求荷求車サービスの使い方

### 荷主側の使い方

1. **荷物情報の登録**: 荷物の種類、重量、サイズ、発地・着地、希望日程を入力します
2. **マッチング結果の確認**: システムが条件に合う運送会社を自動的にリストアップします
3. **見積もり・交渉**: 候補の運送会社と運賃や条件について交渉します
4. **配車確定**: 条件が合えば配車を確定し、輸送を依頼します

トラマッチでは、AIが荷物の条件と空車情報を分析し、最適なマッチングを提案します。従来の手作業による配車作業に比べ、大幅な時間短縮が可能です。

### 運送会社側の使い方

1. **空車情報の登録**: 空いている車両の車種、位置、対応可能エリア、日程を入力します
2. **荷物情報の検索**: 条件に合う荷物情報を検索・閲覧します
3. **応募・交渉**: 気になる案件に応募し、荷主と条件を交渉します
4. **受注確定**: 双方が合意すれば、配送を受注します

特に帰り便の荷物確保に求荷求車サービスは効果的です。配送後の空車走行を減らすことで、売上アップとコスト削減の両方を実現できます。

## 求荷求車サービスの料金体系

求荷求車サービスの料金体系は、サービスによって異なりますが、主に以下の3タイプがあります。

### 月額固定制

毎月一定の利用料金を支払うタイプです。案件数に関わらず一定額なので、多くの案件を扱う企業にとっては割安になります。月額1万円〜5万円程度が一般的です。

### 成功報酬制

マッチングが成立した場合のみ手数料が発生するタイプです。リスクが低いため、初めて利用する企業におすすめです。運賃の5%〜15%程度が一般的な手数料率です。

### フリーミアム制

基本機能は無料で利用でき、高度な機能を使う場合に有料プランに移行するタイプです。トラマッチでは、基本的なマッチング機能を無料でご利用いただけます。AIマッチングや優先表示などの高度な機能は有料プランで提供しています。

## 主要な求荷求車サービスの比較

現在、日本国内には複数の求荷求車サービスが存在します。それぞれの特徴を理解し、自社のニーズに合ったサービスを選ぶことが重要です。

### 選ぶ際のポイント

- **対応エリア**: 全国対応か、特定エリアに強いかを確認
- **車種対応**: 大型車、中型車、軽貨物など必要な車種に対応しているか
- **料金体系**: 月額固定、成功報酬、フリーミアムのどれが自社に合うか
- **機能**: AIマッチング、リアルタイム空車情報、見積もり比較などの機能
- **サポート**: 電話・メール・チャットなどのサポート体制
- **実績**: 登録運送会社数、取扱案件数、業界での評判

トラマッチは、AIマッチング技術を核としたサービスで、登録・基本利用は無料です。全国の運送会社と荷主が利用しており、特に中小企業にとって使いやすい設計になっています。

## 求荷求車サービスのメリット

### 荷主側のメリット

- **コスト削減**: 複数の運送会社から見積もりを取れるため、競争原理が働き運賃を最適化できます
- **時間短縮**: 電話やFAXでの個別交渉が不要になり、配車にかかる時間を大幅に削減できます
- **選択肢の拡大**: 今まで知らなかった運送会社とも出会えるため、より適切なパートナーを見つけられます
- **品質向上**: 運送会社の評価やレビューを参考に、品質の高いサービスを選べます
- **急な配送ニーズへの対応**: リアルタイムの空車情報により、急な配送依頼にも対応可能です

### 運送会社側のメリット

- **空車率の削減**: 空いている車両に効率的に荷物を割り当てられます
- **帰り便の確保**: 配送先からの帰り道で荷物を積めるため、収益が向上します
- **営業コストの削減**: 従来の営業活動に比べ、低コストで新規顧客を獲得できます
- **新規顧客の開拓**: 全国の荷主とつながるチャンネルが得られます
- **安定した受注**: 定期的な案件情報にアクセスでき、受注の安定化につながります

## 求荷求車サービスのデメリットと注意点

### 考慮すべきポイント

- **手数料コスト**: 成功報酬型の場合、マッチング成立ごとに手数料が発生します。頻繁に利用する場合はコストを考慮しましょう
- **品質のばらつき**: 登録している運送会社の品質にはばらつきがある場合があります。レビューや実績を確認しましょう
- **個人情報の管理**: 荷物情報や会社情報を登録するため、セキュリティ対策が万全なサービスを選びましょう
- **依存リスク**: 一つのプラットフォームに依存しすぎると、サービス停止時に影響を受ける可能性があります

### リスクを最小化する方法

- 複数のサービスを併用する
- 信頼できる固定取引先も確保しておく
- 契約前に必ず運送保険や補償内容を確認する
- 初回取引は小さな案件から始める

## 求荷求車サービスの活用事例

### 事例1: 中小運送会社A社（関東エリア）

従業員15名、車両10台の中小運送会社A社は、トラマッチを導入後、帰り便の充足率を30%から75%に改善しました。月間売上は約120万円増加し、燃料費の削減と合わせて大幅な利益改善を実現しています。

### 事例2: 食品メーカーB社（全国配送）

全国に配送拠点を持つ食品メーカーB社は、繁忙期の追加配送車両の確保にトラマッチを活用しています。従来は電話で数十社に連絡していた車両手配が、システム上で完結するようになり、配車担当者の業務時間が週20時間削減されました。

### 事例3: 軽貨物事業者C氏（個人事業主）

独立して軽貨物運送を始めたC氏は、トラマッチで安定的に案件を確保しています。特に、自分の稼働エリアに合った案件をAIが自動推薦してくれるため、効率的に仕事を見つけられると評価しています。`;

const faqItems = [
  { question: "求荷求車とは何ですか？", answer: "求荷求車（きゅうかきゅうしゃ）とは、荷物を運びたい荷主と荷物を探している運送会社をマッチングする仕組みです。インターネットを通じて効率的に取引相手を見つけることができます。" },
  { question: "求荷求車サービスの利用料金はいくらですか？", answer: "サービスによって異なります。月額固定制（1万〜5万円）、成功報酬制（運賃の5〜15%）、フリーミアム制（基本無料）の3タイプがあります。トラマッチでは基本的なマッチング機能を無料でご利用いただけます。" },
  { question: "個人事業主でも利用できますか？", answer: "はい、多くの求荷求車サービスは個人事業主（軽貨物事業者など）でもご利用いただけます。トラマッチでは車両1台からでも登録可能です。" },
  { question: "AIマッチングとは何ですか？", answer: "AIマッチングとは、人工知能が荷物の条件（発着地、車種、日程など）と空車の条件を自動的に分析し、最適な組み合わせを提案する機能です。従来の手動検索に比べ、精度と速度が大幅に向上します。" },
  { question: "空車率の削減にどのくらい効果がありますか？", answer: "導入企業の事例では、空車率が平均30〜50%削減されています。特に帰り便の充足率が大きく改善し、売上と利益の向上に直結しています。" },
  { question: "求荷求車サービスは安全ですか？", answer: "信頼できるサービスでは、登録時の本人確認や運送事業許可の確認、SSL通信暗号化などのセキュリティ対策が施されています。トラマッチでは管理者による審査承認制を採用しています。" },
  { question: "トラボックスとトラマッチの違いは何ですか？", answer: "トラボックスは老舗の求荷求車サービスです。トラマッチはAIマッチング技術を活用した新世代のサービスで、自動マッチング、リアルタイム空車情報、モバイル対応などの最新機能を備えています。" },
  { question: "契約期間の縛りはありますか？", answer: "トラマッチでは契約期間の縛りはありません。いつでも利用開始・停止が可能です。まずは無料プランからお試しいただき、効果を実感されてからプランアップグレードをご検討ください。" },
  { question: "対応している車種を教えてください。", answer: "大型車（10トン以上）、中型車（4トン〜10トン）、小型車（2トン〜4トン）、軽貨物車など、主要な車種に対応しています。冷蔵車や特殊車両にも対応可能です。" },
  { question: "登録にはどのくらい時間がかかりますか？", answer: "基本情報の登録は約5分で完了します。管理者による審査承認後、すぐにサービスをご利用いただけます。審査は通常1営業日以内に完了します。" },
];

export default function GuideKyukakyusha() {
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <SeoHead
        title="求荷求車 完全ガイド 2026 | 仕組み・使い方・料金・比較を網羅 | トラマッチ"
        description="求荷求車の仕組み・使い方・料金体系・主要サービス比較・メリット/デメリット・活用事例・FAQ10問を網羅した完全ガイド。トラマッチのAIマッチングで物流を効率化。"
        canonical="https://tramatch-sinjapan.com/guide/kyukakyusha-complete"
      />
      <StructuredData type="Article" data={{
        headline: "求荷求車 完全ガイド 2026",
        description: "求荷求車の仕組み・使い方・料金・比較を網羅した完全ガイド",
        datePublished: "2026-01-01",
        dateModified: new Date().toISOString(),
        url: "https://tramatch-sinjapan.com/guide/kyukakyusha-complete",
        author: { "@type": "Organization", name: "トラマッチ" },
      }} />

      <div className="bg-primary py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-3 py-1 mb-4">
            <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">完全ガイド 2026年版</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">
            求荷求車 完全ガイド
          </h1>
          <p className="text-primary-foreground/80 mt-3 text-shadow text-lg">
            仕組み・使い方・料金・比較・メリットデメリット・事例・FAQ10問を網羅
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Breadcrumb items={[
          { label: "コラム", href: "/column" },
          { label: "求荷求車 完全ガイド" },
        ]} />

        <CtaBlock variant="both" location="guide-top" />

        <TableOfContents content={pillarContent} />

        <Card className="mb-8">
          <CardContent className="p-5 sm:p-8">
            <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-guide-content">
              {pillarContent.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  const text = line.replace("## ", "");
                  const id = text.replace(/\s+/g, "-").replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, "").toLowerCase();
                  return <h2 key={i} id={id} className="text-xl font-bold mt-8 mb-4 text-foreground scroll-mt-20">{text}</h2>;
                }
                if (line.startsWith("### ")) {
                  const text = line.replace("### ", "");
                  const id = text.replace(/\s+/g, "-").replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, "").toLowerCase();
                  return <h3 key={i} id={id} className="text-lg font-bold mt-6 mb-3 text-foreground scroll-mt-20">{text}</h3>;
                }
                if (line.startsWith("- **")) {
                  const match = line.match(/^- \*\*(.+?)\*\*: (.+)$/);
                  if (match) return <li key={i} className="ml-4 mb-2 list-disc"><strong>{match[1]}</strong>: {match[2]}</li>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} className="ml-4 mb-1 list-disc">{line.replace("- ", "")}</li>;
                }
                if (line.match(/^\d+\. \*\*/)) {
                  const match = line.match(/^\d+\. \*\*(.+?)\*\*: (.+)$/);
                  if (match) return <li key={i} className="ml-4 mb-2 list-decimal"><strong>{match[1]}</strong>: {match[2]}</li>;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="text-foreground leading-relaxed mb-3">{line}</p>;
              })}
            </div>
          </CardContent>
        </Card>

        <FaqBlock items={faqItems} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <Link href="/column/kyukakyusha">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-foreground mb-1">求荷求車コラム</h3>
                <p className="text-xs text-muted-foreground mb-2">マッチングの最新情報</p>
                <span className="text-xs text-primary flex items-center gap-1">記事を見る <ArrowRight className="w-3 h-3" /></span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/column/truck-order">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-foreground mb-1">荷主向けコラム</h3>
                <p className="text-xs text-muted-foreground mb-2">トラック手配のノウハウ</p>
                <span className="text-xs text-primary flex items-center gap-1">記事を見る <ArrowRight className="w-3 h-3" /></span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/column/carrier-sales">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-foreground mb-1">運送会社向けコラム</h3>
                <p className="text-xs text-muted-foreground mb-2">案件獲得・営業戦略</p>
                <span className="text-xs text-primary flex items-center gap-1">記事を見る <ArrowRight className="w-3 h-3" /></span>
              </CardContent>
            </Card>
          </Link>
        </div>

        <CtaBlock variant="both" location="guide-bottom" />

        <div className="mt-8 text-center">
          <Link href="/register">
            <Button size="lg" data-testid="button-register-guide" data-track-cta="guide_register">
              無料で登録する
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      <MobileFixedCta />
    </div>
  );
}
