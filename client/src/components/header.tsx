import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Truck, Package, Menu, X, LogIn, LogOut, UserPlus, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/IMG_0046_1771206816410.jpg";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const navItems = [
    ...(isAuthenticated ? [{ href: "/home", label: "ホーム" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "管理画面" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b-2 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap h-16">
          <Link href="/" className="flex items-center shrink-0" data-testid="text-logo">
            <img src={logoImage} alt="TRA MATCH" className="h-7 sm:h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5" data-testid="nav-desktop">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium px-3 ${location === item.href ? "text-primary" : ""}`}
                  data-testid={`link-nav-${item.href.replace("/", "") || "lp"}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/cargo/new">
                  <Button variant="outline" data-testid="button-post-cargo">
                    <Package className="w-4 h-4 mr-1.5" />
                    荷物を掲載
                  </Button>
                </Link>
                <Link href="/trucks/new">
                  <Button data-testid="button-post-truck">
                    <Truck className="w-4 h-4 mr-1.5" />
                    車両を掲載
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => logout.mutate()}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm" data-testid="button-header-login">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-header-register">
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    無料会員登録
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm font-medium ${location === item.href ? "text-primary" : ""}`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            {isAuthenticated ? (
              <>
                <Link href="/cargo/new" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    <Package className="w-4 h-4 mr-1.5" />
                    荷物を掲載
                  </Button>
                </Link>
                <Link href="/trucks/new" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    <Truck className="w-4 h-4 mr-1.5" />
                    車両を掲載
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => { logout.mutate(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    ログイン
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    無料会員登録
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
