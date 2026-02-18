import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateJP(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${y}/${Number(m)}/${Number(d)}`;
}

export default function TransportLedger() {
  const { toast } = useToast();
  const today = formatDateForInput(new Date());
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [shipperName, setShipperName] = useState("");
  const [matchType, setMatchType] = useState("exact");

  const handleExport = () => {
    if (!dateFrom || !dateTo) {
      toast({ title: "発日範囲は必須です", variant: "destructive" });
      return;
    }
    toast({ title: "Excel出力", description: "エクスポート機能は現在準備中です" });
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-foreground mb-6" data-testid="text-page-title">実運送体制管理簿出力</h1>

        <Card>
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-white bg-red-500 rounded px-1.5 py-0.5 font-bold">必須</span>
                  <Label className="font-bold text-sm">発日範囲</Label>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[160px] text-sm"
                    data-testid="input-date-from"
                  />
                  <span className="text-muted-foreground text-sm">～</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[160px] text-sm"
                    data-testid="input-date-to"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-[30px]" />
                  <Label className="font-bold text-sm">真荷主名</Label>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    placeholder="真荷主名"
                    value={shipperName}
                    onChange={(e) => setShipperName(e.target.value)}
                    className="w-[220px] text-sm"
                    data-testid="input-shipper-name"
                  />
                  <Select value={matchType} onValueChange={setMatchType}>
                    <SelectTrigger className="w-[120px] text-sm" data-testid="select-match-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact">完全一致</SelectItem>
                      <SelectItem value="partial">部分一致</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleExport} data-testid="button-export-excel">
                  <Download className="w-4 h-4 mr-1.5" />
                  この条件でExcelを出力
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
