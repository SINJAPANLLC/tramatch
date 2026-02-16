import logoImage from "@assets/IMG_0046_1771206816410.jpg";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src={logoImage} alt="TRA MATCH" className="h-7 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              荷主と運送会社をつなぐ、求荷求車マッチングプラットフォーム
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">サービス</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>荷物情報の掲載</li>
              <li>車両情報の掲載</li>
              <li>マッチング検索</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">サポート</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>ご利用ガイド</li>
              <li>よくある質問</li>
              <li>お問い合わせ</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">会社情報</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>運営会社について</li>
              <li>利用規約</li>
              <li>プライバシーポリシー</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          &copy; 2026 トラマッチ All rights reserved.
        </div>
      </div>
    </footer>
  );
}
