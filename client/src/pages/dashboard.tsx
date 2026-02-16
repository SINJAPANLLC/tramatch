import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Search, ArrowRight, MapPin, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CargoListing, TruckListing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-primary rounded-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-primary-foreground text-shadow-lg" data-testid="text-dashboard-title">
          {user?.companyName}さん、こんにちは
        </h1>
        <p className="text-sm text-primary-foreground mt-1 text-shadow">マッチング情報の概要をご確認ください</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-stat-cargo">{cargoListings?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground">荷物情報</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-stat-trucks">{truckListings?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground">車両情報</div>
            </div>
          </CardContent>
        </Card>
        <Link href="/cargo/new">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4 h-full">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-medium text-foreground">荷物を掲載</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trucks/new">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4 h-full">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-medium text-foreground">車両を掲載</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 className="text-lg font-bold text-foreground">最新の荷物情報</h2>
            <Link href="/cargo">
              <Button variant="ghost" size="sm" data-testid="link-dashboard-all-cargo">
                すべて見る <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {cargoLoading
              ? Array.from({ length: 3 }).map((_, i) => <ListingSkeleton key={i} />)
              : cargoListings?.slice(0, 5).map((listing) => (
                  <Link key={listing.id} href={`/cargo/${listing.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-dash-cargo-${listing.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <h3 className="font-medium text-foreground text-sm line-clamp-1">{listing.title}</h3>
                          <Badge variant="secondary" className="text-xs shrink-0">{listing.vehicleType}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span>{listing.departureArea} → {listing.arrivalArea}</span>
                          <span className="ml-auto text-xs">{listing.desiredDate}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 className="text-lg font-bold text-foreground">最新の車両情報</h2>
            <Link href="/trucks">
              <Button variant="ghost" size="sm" data-testid="link-dashboard-all-trucks">
                すべて見る <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {truckLoading
              ? Array.from({ length: 3 }).map((_, i) => <ListingSkeleton key={i} />)
              : truckListings?.slice(0, 5).map((listing) => (
                  <Link key={listing.id} href={`/trucks/${listing.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-dash-truck-${listing.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <h3 className="font-medium text-foreground text-sm line-clamp-1">{listing.title}</h3>
                          <Badge variant="secondary" className="text-xs shrink-0">{listing.vehicleType}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span>{listing.currentArea} → {listing.destinationArea}</span>
                          <span className="ml-auto text-xs">{listing.availableDate}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
