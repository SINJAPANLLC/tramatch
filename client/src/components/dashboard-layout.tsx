import { Link, useLocation } from "wouter";
import { Package, Truck, Plus, Shield, FileText, CheckCircle, XCircle, Building, Users, BookOpen, CreditCard, Star, Settings, Sparkles, ClipboardList, UserCog, DollarSign, Bell, PenTool, Wrench, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  { href: "/partners", label: "取引先管理", icon: Users },
  { href: "/transport-ledger", label: "実運送体制管理簿", icon: BookOpen },
  { href: "/payment", label: "お支払い", icon: CreditCard },
  { href: "/services", label: "便利サービス", icon: Star },
  { href: "/settings", label: "設定", icon: Settings },
];

const adminMenuItems: MenuItem[] = [
  { href: "/admin", label: "管理画面", icon: Shield },
  { href: "/admin/applications", label: "申請管理", icon: ClipboardList },
  { href: "/admin/users", label: "ユーザー管理", icon: UserCog },
  { href: "/admin/revenue", label: "収益管理", icon: DollarSign },
  { href: "/admin/notifications", label: "通知管理", icon: Bell },
  { href: "/admin/announcements", label: "お知らせ", icon: Megaphone },
  { href: "/admin/seo", label: "SEO記事生成", icon: PenTool },
  { href: "/admin/settings", label: "管理設定", icon: Wrench },
];

function SidebarMenu({ items }: { items: MenuItem[] }) {
  const [location] = useLocation();

  return (
    <nav className="space-y-0.5" data-testid="nav-sidebar">
      {items.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r bg-muted/30" data-testid="panel-sidebar">
        <div className="flex-1 overflow-y-auto p-2">
          <SidebarMenu items={userMenuItems} />
          {isAdmin && (
            <>
              <div className="my-3 mx-2 border-t border-border" />
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground">管理者メニュー</p>
              <SidebarMenu items={adminMenuItems} />
            </>
          )}
        </div>
      </aside>
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
