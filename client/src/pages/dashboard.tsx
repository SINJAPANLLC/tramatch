import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, ArrowRight, MapPin, CheckCircle2, Circle, UserCog, Search, Handshake, Bell, ChevronDown, ChevronUp, ListChecks } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";

interface OnboardingProgress {
  profileComplete: boolean;
  cargoCount: number;
  truckCount: number;
  partnerCount: number;
  notificationSettingDone: boolean;
}

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

function OnboardingChecklist({ progress }: { progress: OnboardingProgress }) {
  const [collapsed, setCollapsed] = useState(false);

  const steps = [
    {
      id: "profile",
      label: "プロフィールを完成させる",
      description: "企業情報を設定すると企業情報登録済バッジが付与されます",
      done: progress.profileComplete,
      href: "/settings",
      action: "設定へ",
      time: "約2分",
    },
    {
      id: "cargo",
      label: "荷物を登録する",
      description: "最初の荷物情報を登録して頂くと荷物にNewバッジが付与されます",
      done: progress.cargoCount > 0,
      href: "/cargo/new",
      action: "登録する",
      time: "約3分",
    },
    {
      id: "truck",
      label: "空車を登録する",
      description: "最初の空車情報を登録して頂くと空車にNewバッジが付与されます",
      done: progress.truckCount > 0,
      href: "/trucks",
      action: "登録する",
      time: "約3分",
    },
    {
      id: "search",
      label: "企業を検索する",
      description: "取引先候補の企業を検索してみる",
      done: false,
      href: "/companies",
      action: "検索する",
      time: "約1分",
    },
    {
      id: "partner",
      label: "取引先を招待する",
      description: "",
      done: progress.partnerCount > 0,
      href: "/partners",
      action: "登録する",
      time: "約1分",
    },
    {
      id: "notification",
      label: "通知設定を確認する",
      description: "メール・LINE通知の設定を確認",
      done: progress.notificationSettingDone,
      href: "/settings",
      action: "設定へ",
      time: "約1分",
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const totalCount = steps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allDone = completedCount === totalCount;
  const remainingCount = totalCount - completedCount;
  const nextStep = steps.find(s => !s.done);

  const encourageMessage = allDone
    ? "すべて完了しました！準備万端です！"
    : remainingCount === 1
      ? "あと1つで完了です！もう少し！"
      : `あと${remainingCount}つ完了するとすべての機能が活用できます`;

  return (
    <Card className={`mb-6 ${!allDone ? "border-primary/40 shadow-md" : ""}`} data-testid="card-onboarding-checklist">
      <CardContent className="p-4 sm:p-5">
        <div
          className="flex items-center justify-between gap-4 flex-wrap cursor-pointer select-none"
          onClick={() => setCollapsed(!collapsed)}
          data-testid="button-toggle-checklist"
        >
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">はじめにやること</h2>
            <Badge variant="secondary" className="text-xs">{completedCount}/{totalCount}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{progressPercent}%</span>
            </div>
            {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {!collapsed && (
          <div className="mt-3 space-y-1" data-testid="list-onboarding-steps">
            {steps.map((step) => {
              const isNext = !step.done && step.id === nextStep?.id;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2.5 rounded-md transition-all ${
                    step.done
                      ? "opacity-60"
                      : isNext
                        ? "bg-primary/5 border border-primary/30 shadow-sm"
                        : "hover-elevate"
                  }`}
                  data-testid={`step-${step.id}`}
                >
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  ) : isNext ? (
                    <div className="relative shrink-0">
                      <Circle className="w-5 h-5 text-primary shrink-0" />
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-ping" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : isNext ? "text-primary font-bold" : "text-foreground"}`}>
                        {step.label}
                      </p>
                      {!step.done && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{step.time}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {!step.done && (
                    <Link href={step.href}>
                      <Button
                        variant={isNext ? "default" : "outline"}
                        size="sm"
                        className={isNext ? "animate-pulse" : ""}
                        data-testid={`button-step-${step.id}`}
                      >
                        {step.action}
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: onboardingProgress } = useQuery<OnboardingProgress>({
    queryKey: ["/api/onboarding-progress"],
  });

  const { data: cargoListings, isLoading: cargoLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/cargo"],
  });

  const { data: truckListings, isLoading: truckLoading } = useQuery<TruckListing[]>({
    queryKey: ["/api/trucks"],
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="bg-primary rounded-md p-5 mb-6">
          <h1 className="text-xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-dashboard-title">
            {user?.companyName}さん、こんにちは
          </h1>
          <p className="text-sm text-primary-foreground mt-1 text-shadow">マッチング情報の概要をご確認ください</p>
        </div>

        {onboardingProgress && (
          <OnboardingChecklist progress={onboardingProgress} />
        )}

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
                            {formatPrice(listing.price)}円
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
                            {formatPrice(listing.price)}円
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
