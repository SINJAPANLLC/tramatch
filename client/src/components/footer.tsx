import logoImage from "@assets/tra_match_logo_white.jpg";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary mt-auto text-shadow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <img src={logoImage} alt="TRA MATCH" className="h-10 w-auto" />
            </div>
            <p className="text-base text-primary-foreground leading-relaxed">
              運送会社をつなぐ、AI求荷求車サービス
            </p>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-primary-foreground mb-4">合同会社SIN JAPAN</h3>
            <ul className="space-y-2 text-base text-primary-foreground">
              <li>〒243-0303</li>
              <li>神奈川県愛甲郡愛川町中津7287</li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                TEL 046-212-2325
              </li>
              <li>FAX 046-212-2326</li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                info@sinjapan.jp
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-primary-foreground/30 text-center text-base text-primary-foreground">
          &copy; 2026 TRA MATCH All rights reserved.
        </div>
      </div>
    </footer>
  );
}
