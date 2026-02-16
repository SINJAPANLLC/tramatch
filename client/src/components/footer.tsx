import { Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">トラマッチ</span>
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
