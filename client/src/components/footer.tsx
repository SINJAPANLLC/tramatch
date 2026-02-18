import logoImage from "@assets/tra_match_logo_white.jpg";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary mt-auto text-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:flex-1">
            <div className="flex items-center mb-4">
              <img src={logoImage} alt="TRA MATCH" className="h-10 w-auto" />
            </div>
            <p className="text-base text-primary-foreground leading-relaxed mb-4">
              運送会社をつなぐ、AI求荷求車サービス
            </p>
            <div className="text-sm text-primary-foreground space-y-1">
              <p className="font-semibold">合同会社SIN JAPAN</p>
              <p>〒243-0303</p>
              <p>神奈川県愛甲郡愛川町中津7287</p>
              <p>TEL 046-212-2325</p>
              <p>FAX 046-212-2326</p>
              <p>Mail info@sinjapan.jp</p>
            </div>
          </div>
          <div className="flex gap-16 md:gap-20 md:self-end md:pb-2">
            <div>
              <h3 className="text-base font-semibold text-primary-foreground mb-3">サポート</h3>
              <ul className="space-y-2 text-base text-primary-foreground">
                <li><Link href="/guide" className="hover:underline" data-testid="link-guide">ご利用ガイド</Link></li>
                <li><Link href="/faq" className="hover:underline" data-testid="link-faq">よくある質問</Link></li>
                <li><Link href="/contact" className="hover:underline" data-testid="link-contact">お問い合わせ</Link></li>
                <li><Link href="/columns" className="hover:underline" data-testid="link-columns">コラム記事</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-foreground mb-3">会社情報</h3>
              <ul className="space-y-2 text-base text-primary-foreground">
                <li><Link href="/company-info" className="hover:underline" data-testid="link-company-info">会社情報</Link></li>
                <li><Link href="/terms" className="hover:underline" data-testid="link-terms">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:underline" data-testid="link-privacy">プライバシーポリシー</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-primary-foreground/30 text-center text-base text-primary-foreground">
          &copy; 2026 SIN JAPAN LLC All rights reserved.
        </div>
      </div>
    </footer>
  );
}
