import { Link } from "wouter";
import { Banknote, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FactoringPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground py-14 px-4 text-center">
        <p className="text-sm font-semibold tracking-widest mb-2 opacity-80">FACTORING SERVICE</p>
        <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3" data-testid="text-page-title">
          <Banknote className="w-9 h-9" />ファクタリングサービス
        </h1>
        <p className="text-base opacity-90">売掛金を早期資金化。運送会社のキャッシュフローを改善します。</p>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8">
          <Clock className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-coming-soon">準備中</h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-2">
          ファクタリングサービスは現在準備中です。
        </p>
        <p className="text-muted-foreground leading-relaxed mb-10">
          近日中にサービスを開始いたします。<br />
          詳細が決まり次第、会員の皆様にお知らせします。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/contact">
            <Button variant="outline" data-testid="button-contact">
              <Mail className="w-4 h-4 mr-2" />お問い合わせ
            </Button>
          </Link>
          <Link href="/">
            <Button data-testid="button-home">トップページへ戻る</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
