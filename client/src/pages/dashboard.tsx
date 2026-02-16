import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, ArrowRight, MapPin, Search, Plus, Home, Shield, User, Building2, Phone, BookmarkCheck, Clock, FileText, Handshake, Settings, ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

function ListingSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

type MenuItem = {
  href?: string;
  label: string;
  icon: React.ElementType;
  children?: { href: string; label: string }[];
};

function SidebarMenu({ items, location }: { items: MenuItem[]; location: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <nav className="space-y-0.5" data-testid="nav-sidebar">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expanded[item.label];
        const isActive = item.href === location;
        const isChildActive = item.children?.some((c) => c.href === location);

        if (hasChildren) {
          return (
            <div key={item.label}>
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                  isChildActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
                data-testid={`button-sidebar-${item.label}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              </button>
              {isExpanded && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-border pl-2">
                  {item.children!.map((child) => (
                    <Link key={child.href} href={child.href}>
                      <button
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                          location === child.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        data-testid={`link-sidebar-${child.href.replace(/\//g, "-").slice(1)}`}
                      >
                        {child.label}
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link key={item.href} href={item.href!}>
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
              data-testid={`link-sidebar-${item.href!.replace(/\//g, "-").slice(1)}`}
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

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [location] = useLocation();

  const { data: cargoListings, isLoading: cargoLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: truckListings, isLoading: truckLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  const menuItems: MenuItem[] = [
    {
      label: "荷物検索",
      icon: Search,
      children: [
        { href: "/cargo", label: "荷物一覧" },
      ],
    },
    { href: "/cargo/new", label: "荷物登録", icon: Plus },
    {
      label: "マイ荷物・成約",
      icon: Handshake,
      children: [
        { href: "/home", label: "ダッシュボード" },
      ],
    },
    {
      label: "空車検索・登録",
      icon: Truck,
      children: [
        { href: "/trucks", label: "車両一覧" },
        { href: "/trucks/new", label: "車両登録" },
      ],
    },
    ...(isAdmin ? [{ href: "/admin", label: "管理画面", icon: Shield } as MenuItem] : []),
    { href: "/settings" as string, label: "設定", icon: Settings },
  ];

  return (
    <div className="flex h-full">
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r bg-muted/30 overflow-y-auto" data-testid="panel-sidebar">
        <div className="p-3 border-b bg-primary">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary-foreground truncate" data-testid="text-sidebar-company">{user?.companyName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <SidebarMenu items={menuItems} location={location} />
        </div>

        {(user?.phone || user?.address) && (
          <div className="p-3 border-t space-y-1.5">
            {user?.address && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3 shrink-0 mt-0.5" />
                <span className="break-all leading-tight">{user.address}</span>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="w-3 h-3 shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        )}
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6">
          <div className="bg-primary rounded-md p-5 mb-6">
            <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-dashboard-title">
              {user?.companyName}さん、こんにちは
            </h1>
            <p className="text-sm text-primary-foreground mt-1 text-shadow">マッチング情報の概要をご確認ください</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  最新の荷物情報
                </h2>
                <Link href="/cargo">
                  <Button variant="ghost" size="sm" data-testid="link-dashboard-all-cargo">
                    すべて見る <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {cargoLoading
                  ? Array.from({ length: 3 }).map((_, i) => <ListingSkeleton key={i} />)
                  : cargoListings?.slice(0, 5).map((listing) => (
                      <Card key={listing.id} data-testid={`card-dash-cargo-${listing.id}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                            <h3 className="font-medium text-foreground text-sm line-clamp-1">{listing.title}</h3>
                            <Badge variant="secondary" className="text-xs shrink-0">{listing.vehicleType}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                            <span>{listing.departureArea} → {listing.arrivalArea}</span>
                            <span className="ml-auto text-xs">{listing.desiredDate}</span>
                          </div>
                          {listing.price && (
                            <div className="text-xs text-foreground font-medium mt-1">
                              {listing.price}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  最新の車両情報
                </h2>
                <Link href="/trucks">
                  <Button variant="ghost" size="sm" data-testid="link-dashboard-all-trucks">
                    すべて見る <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {truckLoading
                  ? Array.from({ length: 3 }).map((_, i) => <ListingSkeleton key={i} />)
                  : truckListings?.slice(0, 5).map((listing) => (
                      <Card key={listing.id} data-testid={`card-dash-truck-${listing.id}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                            <h3 className="font-medium text-foreground text-sm line-clamp-1">{listing.title}</h3>
                            <Badge variant="secondary" className="text-xs shrink-0">{listing.vehicleType}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                            <span>{listing.currentArea} → {listing.destinationArea}</span>
                            <span className="ml-auto text-xs">{listing.availableDate}</span>
                          </div>
                          {listing.price && (
                            <div className="text-xs text-foreground font-medium mt-1">
                              {listing.price}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
