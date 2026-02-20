import { Link, useLocation } from "wouter";
import { Package, Truck, Plus, Shield, FileText, CheckCircle, XCircle, Building, Users, BookOpen, CreditCard, Star, Settings, Sparkles, ClipboardList, UserCog, DollarSign, Bell, PenTool, Wrench, Megaphone, Activity, MessageSquare, ChevronDown, ChevronRight, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const userMenuItems: MenuItem[] = [
  { href: "/cargo", label: "AI荷物検索", icon: Sparkles },
  { href: "/cargo/new", label: "AI荷物登録", icon: Plus },
  { href: "/my-cargo", label: "登録した荷物", icon: FileText },
  { href: "/completed-cargo", label: "成約した荷物", icon: CheckCircle },
  { href: "/trucks", label: "AI空車検索・登録", icon: Truck },
  { href: "/companies", label: "企業検索", icon: Building },
  { href: "/payment", label: "プラン", icon: CreditCard },
  { href: "/services", label: "便利サービス", icon: Star },
  { href: "/settings", label: "設定", icon: Settings },
];

const agentMenuItem: MenuItem = { href: "/admin/agents", label: "エージェント", icon: Building };

const adminMenuItems: MenuItem[] = [
  { href: "/admin", label: "管理画面", icon: Shield },
  { href: "/admin/applications", label: "申請管理", icon: ClipboardList },
  { href: "/admin/users", label: "ユーザー管理", icon: UserCog },
  { href: "/admin/revenue", label: "収益管理", icon: DollarSign },
  { href: "/admin/invoices", label: "請求書発行", icon: FileText },
  { href: "/admin/notifications", label: "通知管理", icon: Bell },
  { href: "/admin/announcements", label: "お知らせ", icon: Megaphone },
  { href: "/admin/seo", label: "SEO記事生成", icon: PenTool },
  { href: "/admin/listings", label: "掲載管理", icon: Package },
  { href: "/admin/contact-inquiries", label: "お問い合わせ", icon: MessageSquare },
  { href: "/admin/audit-logs", label: "操作ログ", icon: Activity },
  { href: "/admin/settings", label: "管理設定", icon: Wrench },
];

function SidebarMenu({ items, onNavigate }: { items: MenuItem[]; onNavigate?: () => void }) {
  const [location] = useLocation();

  return (
    <nav className="space-y-1" data-testid="nav-sidebar">
      {items.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <button
              onClick={onNavigate}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
              data-testid={`link-sidebar-${item.href.replace(/\//g, "-").slice(1)}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useAuth();
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");
  const [adminMenuOpen, setAdminMenuOpen] = useState(isAdminPage);

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <SidebarMenu items={userMenuItems} onNavigate={onNavigate} />
      {isAdmin && (
        <>
          <div className="my-3 mx-2 border-t border-border" />
          <SidebarMenu items={[agentMenuItem]} onNavigate={onNavigate} />
          <div className="my-3 mx-2 border-t border-border" />
          <button
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-md"
            data-testid="button-toggle-admin-menu"
          >
            <span>管理者メニュー</span>
            {adminMenuOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {adminMenuOpen && <SidebarMenu items={adminMenuItems} onNavigate={onNavigate} />}
        </>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("tramatch_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });
  const [location] = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    localStorage.setItem("tramatch_sidebar_open", String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex h-full overflow-hidden">
      {sidebarOpen && (
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r bg-muted/30" data-testid="panel-sidebar">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground px-1">メニュー</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              data-testid="button-sidebar-close"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>
          <SidebarContent />
        </aside>
      )}
      {!sidebarOpen && (
        <div className="hidden lg:flex items-start pt-2 pl-1 shrink-0 border-r bg-muted/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-sidebar-open"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="lg:hidden">
        <button
          className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-2 border-white/30"
          onClick={() => setMobileOpen(true)}
          style={{ display: mobileOpen ? "none" : "flex" }}
          data-testid="button-mobile-sidebar-open"
        >
          <Menu className="w-6 h-6" />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[70]" data-testid="panel-mobile-sidebar">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex flex-col animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">メニュー</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  data-testid="button-mobile-sidebar-close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
