import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, ArrowRight, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";

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

export default function Dashboard() {
  const { user } = useAuth();

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
