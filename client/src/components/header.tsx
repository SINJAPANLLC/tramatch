import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Truck, Package, Menu, X, LogIn, LogOut, UserPlus, Bell, User, Check, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { CargoListing, TruckListing, Notification } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoImage from "@assets/IMG_0046_1771206816410.jpg";

function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 15000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const markAsRead = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const formatTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString("ja-JP");
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "cargo_new": return <Package className="w-4 h-4 text-blue-500" />;
      case "truck_new": return <Truck className="w-4 h-4 text-green-500" />;
      case "user_approved": return <Check className="w-4 h-4 text-emerald-500" />;
      case "user_registered": return <UserPlus className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[8px] h-2 rounded-full"
              style={{ backgroundColor: "#40E0D0" }}
              data-testid="badge-notification-dot"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" data-testid="dropdown-notifications">
        <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
          <h3 className="text-sm font-semibold" data-testid="text-notification-title">通知</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead.mutate()}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              全て既読
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto" data-testid="list-notifications">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground" data-testid="text-no-notifications">
              通知はありません
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-3 border-b border-border last:border-b-0 ${
                  !notif.isRead ? "bg-primary/5" : ""
                }`}
                data-testid={`notification-item-${notif.id}`}
              >
                <div className="mt-0.5 shrink-0">{typeIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!notif.isRead ? "font-medium" : "text-muted-foreground"}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatTime(notif.createdAt)}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); markAsRead.mutate(notif.id); }}
                      data-testid={`button-read-${notif.id}`}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(notif.id); }}
                    data-testid={`button-delete-notification-${notif.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const dashboardPaths = [
    "/home", "/cargo", "/cargo/new", "/trucks", "/trucks/new",
    "/my-cargo", "/completed-cargo", "/companies", "/partners",
    "/transport-ledger", "/payment", "/services", "/settings",
    "/admin", "/admin/applications", "/admin/users", "/admin/revenue",
    "/admin/notifications", "/admin/seo", "/admin/settings",
  ];
  const isOnDashboard = isAuthenticated && dashboardPaths.some((p) => location === p || location.startsWith(p + "/"));

  const { data: cargoListings } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
    enabled: !!isOnDashboard,
  });

  const { data: truckListings } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
    enabled: !!isOnDashboard,
  });

  const navItems: { href: string; label: string }[] = [];

  if (isOnDashboard) {
    return (
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 h-12">
            <div className="flex items-center gap-4">
              <Link href="/home" className="flex items-center shrink-0" data-testid="text-logo">
                <img src={logoImage} alt="TRA MATCH" className="h-6 w-auto" />
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="text-xs gap-1.5 font-normal" data-testid="text-stat-cargo">
                  <Package className="w-3 h-3" />
                  荷物数 {cargoListings?.length ?? 0}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1.5 font-normal" data-testid="text-stat-trucks">
                  <Truck className="w-3 h-3" />
                  空車数 {truckListings?.length ?? 0}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-foreground text-xs font-medium" data-testid="text-header-username">{user?.contactName || user?.companyName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                data-testid="button-logout"
                className="text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b-2 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap h-16">
          <Link href={isAuthenticated ? "/home" : "/"} className="flex items-center shrink-0" data-testid="text-logo">
            <img src={logoImage} alt="TRA MATCH" className="h-7 sm:h-8 w-auto" />
          </Link>

          {navItems.length > 0 && (
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
          )}

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                onClick={() => logout.mutate()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                ログアウト
              </Button>
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
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => { logout.mutate(); setMobileMenuOpen(false); }}
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                ログアウト
              </Button>
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
