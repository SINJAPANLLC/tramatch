import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Truck, Package, ArrowRight, PhoneCall } from "lucide-react";
import { trackCtaClick, trackArticleToRegister } from "@/lib/analytics";

interface CtaBlockProps {
  variant?: "shipper" | "carrier" | "both";
  location: string;
  articleSlug?: string;
}

export default function CtaBlock({ variant = "both", location, articleSlug }: CtaBlockProps) {
  const handleClick = (type: string) => {
    trackCtaClick(type, location);
    if (articleSlug) trackArticleToRegister(articleSlug);
  };

  return (
    <div className="space-y-3 my-6" data-testid={`cta-block-${location}`}>
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-5 text-primary-foreground">
        <p className="text-xs font-semibold tracking-wider mb-1 opacity-80">TRUCK ARRANGEMENT</p>
        <h3 className="text-base font-bold mb-1">今すぐトラックを手配する</h3>
        <p className="text-sm opacity-90 mb-3">
          スポット便・定期便・チャーター便に対応。全国ネットワークで最短即日手配。
        </p>
        <Link href="/truck-arrangement" onClick={() => handleClick("truck_arrangement")}>
          <Button size="sm" variant="secondary" className="font-semibold" data-testid={`button-cta-truck-${location}`}>
            <Truck className="w-4 h-4 mr-1.5" />
            トラック手配を依頼する
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
        <h3 className="text-sm font-bold text-foreground mb-1.5">TRA MATCHで物流をもっと効率化</h3>
        <p className="text-xs text-muted-foreground mb-3">AIマッチングで最適な荷物・車両を瞬時に発見。登録無料。</p>
        <div className="flex flex-wrap gap-2">
          {(variant === "shipper" || variant === "both") && (
            <Link href="/register" onClick={() => handleClick("shipper")}>
              <Button size="sm" className="text-xs" data-testid={`button-cta-shipper-${location}`}>
                <Package className="w-3.5 h-3.5 mr-1" />荷主として登録
              </Button>
            </Link>
          )}
          {(variant === "carrier" || variant === "both") && (
            <Link href="/register" onClick={() => handleClick("carrier")}>
              <Button size="sm" variant="outline" className="text-xs" data-testid={`button-cta-carrier-${location}`}>
                <Truck className="w-3.5 h-3.5 mr-1" />運送会社として登録
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function MobileFixedCta({ articleSlug }: { articleSlug?: string }) {
  const handleClick = () => {
    trackCtaClick("mobile_fixed", "bottom");
    if (articleSlug) trackArticleToRegister(articleSlug);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-3 z-50 sm:hidden" data-testid="cta-mobile-fixed">
      <Link href="/register" onClick={handleClick}>
        <Button className="w-full" size="sm" data-testid="button-cta-mobile-register" data-track-cta="mobile_register">
          無料で登録して案件を見る
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
