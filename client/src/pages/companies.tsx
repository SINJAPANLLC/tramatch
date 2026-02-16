import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Search, MapPin, Phone, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">企業検索</h1>
          <p className="text-sm text-muted-foreground mt-1">運送会社・荷主企業を検索</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="企業名、地域、キーワードで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-company-search"
                  />
                </div>
              </div>
              <Button data-testid="button-search-company">
                <Search className="w-4 h-4 mr-1.5" />
                検索
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground" data-testid="text-empty-state">企業を検索してください</p>
            <p className="text-xs text-muted-foreground mt-2">企業名や地域名を入力して検索できます</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
