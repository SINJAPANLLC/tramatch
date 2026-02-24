import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Truck, Package, ArrowRight } from "lucide-react";
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
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-5 my-6" data-testid={`cta-block-${location}`}>
      <h3 className="text-base font-bold text-foreground mb-2">
        トラマッチで効率的な物流を実現しませんか？
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        AIマッチングで最適な荷物・車両を瞬時に見つけます。登録は無料、今すぐ始めましょう。
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {(variant === "shipper" || variant === "both") && (
          <Link href="/register" onClick={() => handleClick("shipper")}>
            <Button className="w-full sm:w-auto" data-testid={`button-cta-shipper-${location}`} data-track-cta="shipper">
              <Package className="w-4 h-4 mr-1.5" />
              荷主として登録
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
        {(variant === "carrier" || variant === "both") && (
          <Link href="/register" onClick={() => handleClick("carrier")}>
            <Button variant="outline" className="w-full sm:w-auto" data-testid={`button-cta-carrier-${location}`} data-track-cta="carrier">
              <Truck className="w-4 h-4 mr-1.5" />
              運送会社として登録
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
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
