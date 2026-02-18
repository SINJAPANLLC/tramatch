export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3" data-testid="text-page-title">プライバシーポリシー</h1>
        <p className="text-muted-foreground">最終更新日: 2026年1月1日</p>
      </div>

      <div className="mb-8">
        <p className="text-muted-foreground leading-relaxed text-center">
          個人情報の取り扱いについて
        </p>
        <p className="text-center mt-2">
          <span className="font-semibold">合同会社SIN JAPAN</span>
        </p>
        <p className="text-muted-foreground leading-relaxed mt-4">
          当社はトラマッチサービス（以下「本サービス」といいます）の利用者の個人情報を管理するにあたっては細心の注意を払い、以下に掲げたとおりに取り扱います。
        </p>
      </div>

      <div className="space-y-8">
        <section data-testid="section-privacy-0">
          <h2 className="text-lg font-semibold mb-3">1. 用語の定義について</h2>
          <p className="text-muted-foreground leading-relaxed">
            個人情報等の定義は「個人情報の保護に関する法律（平成15年法律第57号）」の定めるところに従うものとします。
          </p>
        </section>

        <section data-testid="section-privacy-1">
          <h2 className="text-lg font-semibold mb-3">2. 取得および利用目的について</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            当社は、サービスご利用者の個人情報を以下に掲げる利用目的のために収集します。
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground leading-relaxed pl-2">
            <li>本サービスの会員情報の認証、管理、事務連絡および各種システム機能を提供するため</li>
            <li>本サービスに登録し、または当社と提携した国内および国外の事業者または企業に情報を提供するため</li>
            <li>当社サービスの改善および新サービスの開発のため</li>
            <li>当社のイベント・セミナー等のご案内、運営管理、広報活動のため</li>
            <li>当社および第三者の商品等の広告・宣伝、販売の勧誘・広報活動のため</li>
            <li>アンケート、キャンペーン等の依頼、連絡、プレゼント発送等を行うため</li>
            <li>メールマガジン等の情報を配信するため</li>
            <li>利用者からのお問い合わせ、質問に対する回答を行うため</li>
            <li>当社が提供するサービスの保守・メンテナンス業務を行うため</li>
          </ol>
        </section>

        <section data-testid="section-privacy-2">
          <h2 className="text-lg font-semibold mb-3">3. 個人情報提供の任意性について</h2>
          <p className="text-muted-foreground leading-relaxed">
            個人情報の当社への提供は、ご本人の同意に基づく任意ですが、必要な情報が提供されない場合、会員登録および各種サービス・システムの利用ができない場合もありうることをご了承ください。
          </p>
        </section>

        <section data-testid="section-privacy-3">
          <h2 className="text-lg font-semibold mb-3">4. 個人情報の提供について</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            当社は、法令により認められる場合のほか、下記の場合に個人情報を第三者に提供することがあります。
            なお、下記に記載がない場合もご本人の同意を得た上で個人情報を第三者に提供することがあります。
            個人情報の提供は、特に記述のない限り、暗号化等を施したウェブシステム、電子メール、書面の手交のいずれかによるものとします。
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground leading-relaxed pl-2">
            <li>サービス提供のため、会員登録時に入力いただいた情報を、提携した国内および国外の事業者または個人に提供する場合</li>
            <li>「2. 個人情報の利用目的について」で述べた目的を達成するため、個人情報を外国の第三者に提供する場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
          </ol>
        </section>

        <section data-testid="section-privacy-4">
          <h2 className="text-lg font-semibold mb-3">5. 個人情報の委託について</h2>
          <p className="text-muted-foreground leading-relaxed">
            当社は事業運営上、業務委託先に個人情報の取り扱いを委託することがあります。
            この場合、当社は、個人情報を適切に保護できる管理体制を敷き実行していることを条件として委託先を厳選したうえで、契約等において個人情報の適正管理・機密保持などにより利用者の個人情報の漏洩防止に必要な事項を取決め、適切な管理を実施させます。
          </p>
        </section>

        <section data-testid="section-privacy-5">
          <h2 className="text-lg font-semibold mb-3">6. 仮名加工情報の作成について</h2>
          <p className="text-muted-foreground leading-relaxed">
            当社は取得した情報をもとに仮名加工情報を作成し、以下の目的のため利用することがあります。
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed pl-2 mt-2">
            <li>当社サービスの改善および新サービスの開発のため</li>
          </ul>
        </section>

        <section data-testid="section-privacy-6">
          <h2 className="text-lg font-semibold mb-3">7. 統計処理されたデータの利用について</h2>
          <p className="text-muted-foreground leading-relaxed">
            当社は、取得した提供を受けた個人情報をもとに、個人との対応関係を排斥した統計情報を作成することがあります。統計情報については、当社は何ら制限なく利用することができるものとします。
          </p>
        </section>

        <section data-testid="section-privacy-7">
          <h2 className="text-lg font-semibold mb-3">8. 安全管理について</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <div>
              <p className="font-medium text-foreground">(1) 組織的安全管理措置</p>
              <ul className="list-disc list-inside pl-2 mt-1">
                <li>個人データの取り扱いに関する責任者を設置し、事故等の報告窓口を整備しています。</li>
                <li>個人データの棚卸しや個人データの取り扱いに関する内部監査を実施しています。</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">(2) 人的安全管理措置</p>
              <ul className="list-disc list-inside pl-2 mt-1">
                <li>全従業員向けに個人データの取り扱いに関する研修を実施しています。</li>
                <li>全従業員と個人データの取り扱いに関する覚書を交わしています。</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">(3) 物理的安全管理措置</p>
              <ul className="list-disc list-inside pl-2 mt-1">
                <li>個人データを扱う機器、電子媒体は盗難防止策および暗号化を実施しています。</li>
                <li>個人データを取り扱う執務室は入退出制限を実施しています。</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">(4) 技術的安全管理措置</p>
              <ul className="list-disc list-inside pl-2 mt-1">
                <li>個人データのアクセス制御を実施し、必要最小限の担当者のみが個人データにアクセスする体制を整備しています。</li>
                <li>個人データを取り扱う情報システムを不正アクセスなどから保護する仕組みを導入しています。</li>
              </ul>
            </div>
          </div>
        </section>

        <section data-testid="section-privacy-8">
          <h2 className="text-lg font-semibold mb-3">9. 本人確認について</h2>
          <p className="text-muted-foreground leading-relaxed">
            当社は、利用者の会員登録の場合や利用者がサービスを利用する場合、個人情報の開示、訂正、削除もしくは利用停止の求めに応じる場合など、個人を識別できる情報（氏名、電話番号、メールアドレス、パスワード等）により、本人であることを確認します。ただし、本人以外が個人を識別できる情報を入手し使用した場合、当社は責任を負いません。
          </p>
        </section>

        <section data-testid="section-privacy-9">
          <h2 className="text-lg font-semibold mb-3">10. 個人関連情報の取得および利用について</h2>
          <p className="text-muted-foreground leading-relaxed">
            当社は、プライバシーの保護、利便性の向上、広告の配信、および統計データの取得のため、Cookieを使用します。また、当社は、CookieやJavaScript等の技術を利用して、サイト内におけるユーザーの行動履歴（アクセスしたURL、コンテンツ、参照順等）を取得することがあります。ただし、行動履歴には個人情報は一切含まれません。
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            なお、Cookieの受け取りは、ブラウザの設定によって拒否することができますが、拒否した場合、各種システムをご利用いただく上で一部機能に制約が生じることがあります。
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            取得した属性情報および行動履歴など個人を特定できない情報について、当社は何ら制限なく利用することができるものとします。
          </p>
        </section>

        <section data-testid="section-privacy-10">
          <h2 className="text-lg font-semibold mb-3">11. 情報の開示・訂正・削除について</h2>
          <p className="text-muted-foreground leading-relaxed">
            当社は、個人情報の開示、訂正、追加又は削除、利用目的の通知、利用又は提供の拒否についての依頼を受けた場合は、当社の手続きに従って速やかに対応します。
          </p>
        </section>

        <section data-testid="section-privacy-11">
          <h2 className="text-lg font-semibold mb-3">12. 「個人情報の取り扱いについて」の変更について</h2>
          <p className="text-muted-foreground leading-relaxed">
            当社は、「個人情報の取り扱いについて」を法令に違反しない範囲で任意に変更することが出来るものとします。
          </p>
        </section>

        <section data-testid="section-privacy-12">
          <h2 className="text-lg font-semibold mb-3">13. 個人情報保護管理者およびお問い合わせ先</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            当社では、個人情報を適切に保護するための管理者を下記の者が担当いたしております。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            合同会社SIN JAPAN 個人情報保護管理者：代表社員
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            また個人情報管理に関するお問い合わせや開示、訂正または削除の依頼は、下記までご連絡下さい。
          </p>
          <div className="mt-3 text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">合同会社SIN JAPAN</p>
            <p>住所: 〒243-0303 神奈川県愛甲郡愛川町中津7287</p>
            <p>電話: 046-212-2325</p>
            <p>メール: info@sinjapan.jp</p>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>合同会社SIN JAPAN</p>
        <p>〒243-0303 神奈川県愛甲郡愛川町中津7287</p>
      </div>
    </div>
  );
}
