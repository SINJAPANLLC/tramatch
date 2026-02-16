import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FaqItem[] = [
  {
    category: "アカウント",
    question: "登録後すぐに利用できますか？",
    answer: "新規登録後、管理者による承認が必要です。承認が完了次第、登録メールアドレスにてログインが可能になります。通常1〜2営業日以内に承認されます。",
  },
  {
    category: "アカウント",
    question: "パスワードを忘れた場合はどうすればよいですか？",
    answer: "お問い合わせページからパスワードリセットのご依頼をお送りください。確認後、新しいパスワードをご案内いたします。",
  },
  {
    category: "アカウント",
    question: "登録情報を変更したい場合は？",
    answer: "ログイン後、設定ページから会社情報やメールアドレスの変更が可能です。許可証の再アップロードも設定ページから行えます。",
  },
  {
    category: "荷物・空車",
    question: "荷物の登録に費用はかかりますか？",
    answer: "荷物の登録自体は無料です。詳しい料金体系についてはお支払いページをご確認ください。",
  },
  {
    category: "荷物・空車",
    question: "登録した荷物や空車情報を削除できますか？",
    answer: "はい、「登録した荷物」ページから登録した荷物の削除が可能です。空車情報もAI空車検索ページから管理・削除できます。",
  },
  {
    category: "荷物・空車",
    question: "AI検索はどのように動作しますか？",
    answer: "AIが登録されている荷物・空車の情報を分析し、出発地・到着地・日時・車両タイプなどの条件に基づいて最適なマッチングを提案します。",
  },
  {
    category: "マッチング",
    question: "マッチング後の流れはどうなりますか？",
    answer: "条件に合う荷物や車両が見つかったら、相手企業の連絡先を確認し、直接交渉を行います。条件が合意されたら成約となります。",
  },
  {
    category: "マッチング",
    question: "成約した荷物の管理はどこでできますか？",
    answer: "「成約した荷物」ページで成約済みの荷物一覧を確認できます。また、「実運送体制管理簿」ページで運送体制の管理も可能です。",
  },
  {
    category: "その他",
    question: "対応エリアはどこですか？",
    answer: "日本全国に対応しております。都道府県を指定して荷物・空車情報を登録・検索できます。",
  },
  {
    category: "その他",
    question: "セキュリティ対策はどうなっていますか？",
    answer: "SSL暗号化通信を採用し、パスワードはハッシュ化して保存しています。また、許可証の確認により、信頼できる事業者のみがご利用いただけます。",
  },
];

function FaqAccordion({ item, index }: { item: FaqItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      className="cursor-pointer hover-elevate"
      onClick={() => setIsOpen(!isOpen)}
      data-testid={`card-faq-${index}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold">{item.question}</p>
            {isOpen && (
              <p className="mt-3 text-muted-foreground leading-relaxed">{item.answer}</p>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Faq() {
  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3" data-testid="text-page-title">よくある質問</h1>
        <p className="text-muted-foreground text-lg">トラマッチに関するよくあるご質問をまとめました</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-primary" data-testid={`text-category-${category}`}>{category}</h2>
          <div className="space-y-3">
            {faqItems
              .filter((item) => item.category === category)
              .map((item, index) => (
                <FaqAccordion key={index} item={item} index={faqItems.indexOf(item)} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
