import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Truck, Package, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "ホーム" },
    { href: "/cargo", label: "荷物を探す" },
    { href: "/trucks", label: "車両を探す" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground" data-testid="text-logo">
              トラマッチ
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="text-sm font-medium"
                  data-testid={`link-nav-${item.href.replace("/", "") || "home"}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
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
        <div className="md:hidden border-t border-border bg-white dark:bg-gray-950 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className="w-full justify-start text-sm font-medium"
              >
                {item.label}
              </Button>
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
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
          </div>
        </div>
      )}
    </header>
  );
}
