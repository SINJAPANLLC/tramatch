import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SeoArticle } from "@shared/schema";
import SeoHead from "@/components/seo/seo-head";
import Breadcrumb from "@/components/seo/breadcrumb";
import CtaBlock from "@/components/seo/cta-block";
import FaqBlock from "@/components/seo/faq-block";
import StructuredData from "@/components/seo/structured-data";
import { trackCategoryArticleClick } from "@/lib/analytics";

interface CategoryConfig {
  title: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  faq: { question: string; answer: string }[];
  ctaVariant: "shipper" | "carrier" | "both";
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  kyukakyusha: {
    title: "求荷求車・マッチング",
    metaTitle: "求荷求車・マッチングコラム | トラマッチ - AIで最適な荷物と車両をマッチング",
    metaDescription: "求荷求車マッチングに関する最新情報・ノウハウを集めたコラム。AIマッチング、空車活用、コスト削減など物流効率化のための情報をお届けします。",
    description: `求荷求車（きゅうかきゅうしゃ）とは、荷物を運んでほしい荷主と、空車を持つ運送会社を効率的にマッチングする仕組みです。従来は電話やFAXで行われていた荷物探し・車探しが、インターネットの普及により大きく変化しました。

トラマッチでは、AIを活用した高度なマッチングアルゴリズムにより、発着地・車種・日程などの条件を自動的にマッチングし、最適な運送パートナーを瞬時に見つけることができます。空車率の削減と物流コストの最適化を同時に実現し、運送業界全体の効率化に貢献しています。

このカテゴリでは、求荷求車の基礎知識から最新のマッチング技術、活用事例まで幅広い情報をお届けします。初めて求荷求車サービスを利用する方から、既に利用中の方まで役立つノウハウを提供しています。`,
    faq: [
      { question: "求荷求車とは何ですか？", answer: "求荷求車とは、荷物を運んでほしい荷主と、荷物を探している運送会社をマッチングする仕組みです。「求荷」は荷物を求めること、「求車」は車両を求めることを意味します。" },
      { question: "トラマッチの求荷求車マッチングの特徴は？", answer: "トラマッチはAIを活用した自動マッチング機能を備えており、発着地・車種・日程などの条件から最適なパートナーを瞬時に見つけることができます。登録は無料で、すぐにご利用いただけます。" },
      { question: "求荷求車サービスを使うメリットは？", answer: "空車率の削減によるコスト最適化、営業効率の向上、新規取引先の開拓、物流ネットワークの拡大などのメリットがあります。特にAIマッチングにより、従来の電話・FAXに比べて大幅に時間を短縮できます。" },
    ],
    ctaVariant: "both",
  },
  "truck-order": {
    title: "トラック手配・荷主向け",
    metaTitle: "トラック手配・荷主向けコラム | トラマッチ - 最適な運送会社を見つける",
    metaDescription: "荷主の方向けのトラック手配・運送会社選びのノウハウコラム。配車計画、運賃交渉、物流パートナー選びなど実用的な情報を提供します。",
    description: `荷主にとって、信頼できる運送会社の選定と効率的なトラック手配は物流コストと品質を左右する重要な課題です。適切な車種の選択、運賃の交渉、配車計画の最適化など、考慮すべきポイントは多岐にわたります。

トラマッチでは、荷主が簡単にトラックを手配できるシステムを提供しています。荷物の種類・量・発着地を入力するだけで、最適な運送会社の候補が表示されます。複数の運送会社から見積もりを比較でき、コスト面でも品質面でも最適な選択が可能です。

このカテゴリでは、荷主の方がスムーズにトラック手配を行うためのノウハウや、運送会社との良好な関係構築のコツ、物流コスト削減の具体的な方法を紹介しています。`,
    faq: [
      { question: "初めてトラック手配をする場合、何から始めれば良いですか？", answer: "まずは荷物の種類・量・サイズ・重量を把握し、発着地と希望日程を決めましょう。トラマッチに登録すれば、これらの条件を入力するだけで最適な運送会社が見つかります。" },
      { question: "運賃の相場はどのように調べられますか？", answer: "トラマッチでは複数の運送会社から見積もりを受け取れるため、相場感を掴むことができます。距離・車種・荷物の種類により運賃は大きく変わりますので、まずは無料登録して確認することをおすすめします。" },
      { question: "急ぎの荷物にも対応できますか？", answer: "はい、トラマッチでは当日・翌日配送にも対応可能な運送会社を見つけることができます。空車情報がリアルタイムで更新されるため、急な配送ニーズにも柔軟に対応できます。" },
    ],
    ctaVariant: "shipper",
  },
  "carrier-sales": {
    title: "運送会社の案件獲得・営業",
    metaTitle: "運送会社の案件獲得・営業コラム | トラマッチ - 空車を活用して売上アップ",
    metaDescription: "運送会社の案件獲得・営業に関するコラム。空車活用、帰り便、新規顧客開拓、売上向上のための戦略を紹介します。",
    description: `運送会社にとって、空車率の削減と安定した案件の確保は経営の根幹に関わる課題です。特に帰り便の有効活用や新規顧客の開拓は、売上向上と利益改善に直結します。

トラマッチは、運送会社が効率的に荷物を見つけるためのプラットフォームです。AIが空車の位置・日程・車種条件に合った荷物を自動でマッチングするため、営業にかける時間と労力を大幅に削減できます。帰り便での荷物確保も簡単に行えます。

このカテゴリでは、運送会社が売上を伸ばすための営業戦略、空車活用の具体的な方法、業界動向に基づいた経営ノウハウなどを紹介しています。中小運送会社から大手まで、実践的な情報を提供します。`,
    faq: [
      { question: "空車情報を登録するとどのくらいで案件が見つかりますか？", answer: "トラマッチでは、AIマッチングにより登録後すぐにマッチング候補が表示されます。エリア・時期によりますが、多くの場合数時間以内に最適な荷物情報が見つかります。" },
      { question: "帰り便の荷物を効率的に見つけるにはどうすればいい？", answer: "トラマッチに配送先エリアと帰路の空車情報を登録しておくと、AIが自動的に帰り道の荷物をマッチングします。これにより空車走行を減らし、売上アップにつなげることができます。" },
      { question: "小規模な運送会社でも利用できますか？", answer: "はい、車両1台からでもご利用いただけます。トラマッチは中小運送会社の方にも使いやすい設計で、登録は無料です。手数料は成約時のみ発生するため、リスクなく始められます。" },
    ],
    ctaVariant: "carrier",
  },
};

function formatDate(dateVal: string | Date) {
  const d = new Date(dateVal);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ColumnCategory() {
  const [location] = useLocation();
  const category = location.replace(/\/+$/, "").split("/").pop() || "";
  const config = CATEGORY_CONFIG[category];

  const { data: articles, isLoading } = useQuery<SeoArticle[]>({
    queryKey: ["/api/columns/category", category],
    queryFn: async () => {
      const res = await fetch(`/api/columns/category/${category}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!category && !!config,
  });

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-4">カテゴリが見つかりません</h1>
          <Link href="/column">
            <button className="text-primary hover:underline">コラム一覧に戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={config.metaTitle}
        description={config.metaDescription}
        canonical={`https://tramatch-sinjapan.com/column/${category}`}
      />
      <StructuredData type="WebPage" data={{ name: config.metaTitle, description: config.metaDescription }} />

      <div className="bg-primary py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-page-title">
            {config.title}
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-shadow">
            {config.metaDescription}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "コラム", href: "/column" },
          { label: config.title },
        ]} />

        <Card className="mb-8">
          <CardContent className="p-5 sm:p-8">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {config.description.split("\n\n").map((p, i) => (
                <p key={i} className="text-foreground leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <CtaBlock variant={config.ctaVariant} location={`category-${category}-top`} />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              記事一覧
            </h2>
            <Link href="/guide/kyukakyusha-complete">
              <span className="text-sm text-primary hover:underline flex items-center gap-1">
                完全ガイドはこちら <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent></Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {articles.map((article) => (
                <Link key={article.id} href={`/column/${article.slug}`} onClick={() => trackCategoryArticleClick(category || "", article.slug)}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-column-${article.id}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {article.keywords?.split(",").slice(0, 3).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
                        ))}
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {article.metaDescription || ""}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.createdAt)}
                        </div>
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          続きを読む <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card><CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">このカテゴリの記事はまだありません</p>
            </CardContent></Card>
          )}
        </div>

        <FaqBlock items={config.faq} />

        <CtaBlock variant={config.ctaVariant} location={`category-${category}-bottom`} />
      </div>
    </div>
  );
}
