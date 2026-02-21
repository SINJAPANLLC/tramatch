import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight, Truck, Loader2, Phone, X, FileText, CreditCard } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CargoListing, DispatchRequest } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { formatPrice } from "@/lib/utils";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatDateCompact(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const cleaned = dateStr.replace(/\//g, "-");
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return dateStr;
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

function formatDateFull(dateStr: string | null | undefined) {
  if (!dateStr) return "指定なし";
  const cleaned = dateStr.replace(/\//g, "-");
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return dateStr;
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`;
}

function DetailRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: React.ReactNode }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <div className="w-[90px] sm:w-[120px] shrink-0 bg-muted/30 px-2 sm:px-3 py-2.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="flex-1 px-3 py-2.5 text-sm text-foreground whitespace-pre-wrap">{children || value || "-"}</div>
    </div>
  );
}

type CompanyInfo = {
  companyName: string;
  address: string | null;
  phone: string;
  fax: string | null;
  email: string;
  contactName: string | null;
  userType: string;
  truckCount: string | null;
  paymentTerms: string | null;
  businessDescription: string | null;
  companyNameKana: string | null;
  postalCode: string | null;
  websiteUrl: string | null;
  invoiceRegistrationNumber: string | null;
  registrationDate: string | null;
  representative: string | null;
  establishedDate: string | null;
  capital: string | null;
  employeeCount: string | null;
  officeLocations: string | null;
  annualRevenue: string | null;
  bankInfo: string | null;
  majorClients: string | null;
  closingMonth: string | null;
  closingDay: string | null;
  paymentMonth: string | null;
  paymentDay: string | null;
  businessArea: string | null;
  autoInvoiceAcceptance: string | null;
  memberOrganization: string | null;
  transportLicenseNumber: string | null;
  digitalTachographCount: string | null;
  gpsCount: string | null;
  safetyExcellenceCert: string | null;
  greenManagementCert: string | null;
  iso9000: string | null;
  iso14000: string | null;
  iso39001: string | null;
  cargoInsurance: string | null;
  cargoCount1m: number;
  cargoCount3m: number;
  truckCount1m: number;
  truckCount3m: number;
};

function EditDealForm({ listing, onClose }: { listing: CargoListing; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    price: listing.price || "",
    highwayFee: listing.highwayFee || "",
    description: listing.description || "",
    departureTime: listing.departureTime || "",
    arrivalTime: listing.arrivalTime || "",
    vehicleType: listing.vehicleType || "",
    bodyType: listing.bodyType || "",
    weight: listing.weight || "",
    paymentDate: listing.paymentDate || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("PATCH", `/api/cargo/${listing.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-cargo"] });
      toast({ title: "成約内容を変更しました" });
      onClose();
    },
    onError: () => {
      toast({ title: "エラー", description: "変更に失敗しました", variant: "destructive" });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="border border-primary/30 rounded-md p-3 bg-primary/5 space-y-3">
      <h4 className="text-sm font-bold text-foreground">成約内容の変更</h4>

      <div className="space-y-2">
        <div>
          <Label className="text-xs">運賃（税別）</Label>
          <Input
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="例: 18000"
            data-testid="input-edit-price"
          />
        </div>
        <div>
          <Label className="text-xs">高速代</Label>
          <Input
            value={formData.highwayFee}
            onChange={(e) => handleChange("highwayFee", e.target.value)}
            placeholder="例: あり / なし / 金額"
            data-testid="input-edit-highway"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">発時間</Label>
            <Input
              value={formData.departureTime}
              onChange={(e) => handleChange("departureTime", e.target.value)}
              placeholder="例: 11時"
              data-testid="input-edit-departure-time"
            />
          </div>
          <div>
            <Label className="text-xs">着時間</Label>
            <Input
              value={formData.arrivalTime}
              onChange={(e) => handleChange("arrivalTime", e.target.value)}
              placeholder="例: 13時"
              data-testid="input-edit-arrival-time"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">車種</Label>
            <Input
              value={formData.vehicleType}
              onChange={(e) => handleChange("vehicleType", e.target.value)}
              data-testid="input-edit-vehicle-type"
            />
          </div>
          <div>
            <Label className="text-xs">車体</Label>
            <Input
              value={formData.bodyType}
              onChange={(e) => handleChange("bodyType", e.target.value)}
              data-testid="input-edit-body-type"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">入金予定日</Label>
          <Input
            value={formData.paymentDate}
            onChange={(e) => handleChange("paymentDate", e.target.value)}
            placeholder="例: 2026/04/30"
            data-testid="input-edit-payment-date"
          />
        </div>
        <div>
          <Label className="text-xs">備考</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
            data-testid="input-edit-description"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => updateMutation.mutate(formData)}
          disabled={updateMutation.isPending}
          data-testid="button-save-edit"
        >
          {updateMutation.isPending ? "保存中..." : "変更を保存"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onClose}
          data-testid="button-cancel-edit"
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
}

function DispatchRequestTab({ listing, companyInfo, isContracted = false }: { listing: CargoListing; companyInfo: CompanyInfo | undefined; isContracted?: boolean }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: dispatchRequest, isLoading: isLoadingDR } = useQuery<DispatchRequest | null>({
    queryKey: [`/api/dispatch-requests/${listing.id}`],
    enabled: !!listing.id,
  });

  const taxRate = 0.1;
  const calcTax = (amount: string | null | undefined) => {
    if (!amount) return "";
    const num = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return "";
    return formatPrice(String(Math.floor(num * taxRate)));
  };
  const calcTotal = (amount: string | null | undefined) => {
    if (!amount) return "";
    const num = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return "";
    return formatPrice(String(Math.floor(num * (1 + taxRate))));
  };

  const defaultFormData = {
    cargoId: listing.id,
    transportCompany: listing.companyName || "",
    shipperCompany: companyInfo?.companyName || listing.companyName || "",
    contactPerson: listing.contactPerson || companyInfo?.contactName || "",
    loadingDate: listing.desiredDate || "",
    loadingTime: listing.departureTime || "",
    loadingPlace: `${listing.departureArea} ${listing.departureAddress || ""}`.trim(),
    unloadingDate: listing.arrivalDate || "",
    unloadingTime: listing.arrivalTime || "",
    unloadingPlace: `${listing.arrivalArea} ${listing.arrivalAddress || ""}`.trim(),
    cargoType: listing.cargoType || "",
    totalWeight: "",
    weightVehicle: `${listing.weight || ""}/${listing.vehicleType || ""}${listing.bodyType ? `/${listing.bodyType}` : ""}`,
    notes: listing.description || "",
    vehicleEquipment: listing.equipment || "",
    fare: listing.price || "",
    highwayFee: listing.highwayFee || "",
    waitingFee: "",
    additionalWorkFee: "",
    exportFee: "",
    parkingFee: "",
    customsFee: "",
    fuelSurcharge: "",
    totalAmount: "",
    tax: "",
    paymentMethod: "銀行振込",
    paymentDueDate: listing.paymentDate || "",
    primeContractorName: "",
    primeContractorPhone: "",
    primeContractorContact: "",
    contractLevel: "",
    actualShipperName: "",
    actualTransportCompany: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    transportCompanyNotes: "",
    status: "draft",
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (dispatchRequest) {
      setFormData({
        cargoId: listing.id,
        transportCompany: dispatchRequest.transportCompany || "",
        shipperCompany: dispatchRequest.shipperCompany || "",
        contactPerson: dispatchRequest.contactPerson || "",
        loadingDate: dispatchRequest.loadingDate || "",
        loadingTime: dispatchRequest.loadingTime || "",
        loadingPlace: dispatchRequest.loadingPlace || "",
        unloadingDate: dispatchRequest.unloadingDate || "",
        unloadingTime: dispatchRequest.unloadingTime || "",
        unloadingPlace: dispatchRequest.unloadingPlace || "",
        cargoType: dispatchRequest.cargoType || "",
        totalWeight: dispatchRequest.totalWeight || "",
        weightVehicle: dispatchRequest.weightVehicle || "",
        notes: dispatchRequest.notes || "",
        vehicleEquipment: dispatchRequest.vehicleEquipment || "",
        fare: dispatchRequest.fare || "",
        highwayFee: dispatchRequest.highwayFee || "",
        waitingFee: dispatchRequest.waitingFee || "",
        additionalWorkFee: dispatchRequest.additionalWorkFee || "",
        exportFee: dispatchRequest.exportFee || "",
        parkingFee: dispatchRequest.parkingFee || "",
        customsFee: dispatchRequest.customsFee || "",
        fuelSurcharge: dispatchRequest.fuelSurcharge || "",
        totalAmount: dispatchRequest.totalAmount || "",
        tax: dispatchRequest.tax || "",
        paymentMethod: dispatchRequest.paymentMethod || "銀行振込",
        paymentDueDate: dispatchRequest.paymentDueDate || "",
        primeContractorName: dispatchRequest.primeContractorName || "",
        primeContractorPhone: dispatchRequest.primeContractorPhone || "",
        primeContractorContact: dispatchRequest.primeContractorContact || "",
        contractLevel: dispatchRequest.contractLevel || "",
        actualShipperName: dispatchRequest.actualShipperName || "",
        actualTransportCompany: dispatchRequest.actualTransportCompany || "",
        vehicleNumber: dispatchRequest.vehicleNumber || "",
        driverName: dispatchRequest.driverName || "",
        driverPhone: dispatchRequest.driverPhone || "",
        transportCompanyNotes: dispatchRequest.transportCompanyNotes || "",
        status: dispatchRequest.status || "draft",
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [dispatchRequest, listing.id]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/dispatch-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dispatch-requests/${listing.id}`] });
      toast({ title: "配車依頼書を作成しました" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "エラー", description: "作成に失敗しました", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PATCH", `/api/dispatch-requests/${dispatchRequest!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dispatch-requests/${listing.id}`] });
      toast({ title: "配車依頼書を更新しました" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "エラー", description: "更新に失敗しました", variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!dispatchRequest) {
        const res = await apiRequest("POST", "/api/dispatch-requests", formData);
        const created = await res.json();
        await apiRequest("PATCH", `/api/dispatch-requests/${created.id}/send`, {});
      } else {
        await apiRequest("PATCH", `/api/dispatch-requests/${dispatchRequest.id}`, formData);
        await apiRequest("PATCH", `/api/dispatch-requests/${dispatchRequest.id}/send`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dispatch-requests/${listing.id}`] });
      toast({ title: isContracted ? "車番連絡を送信しました" : "配車依頼書を送信しました" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "エラー", description: "送信に失敗しました", variant: "destructive" });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (dispatchRequest) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePrintDispatch = () => {
    const dr = dispatchRequest || formData;
    const row = (label: string, value: string | null | undefined) =>
      `<tr><td style="padding:5px 8px;font-weight:bold;white-space:nowrap;border:1px solid #ddd;background:#f5f5f5;font-size:12px;width:130px">${label}</td><td style="padding:5px 8px;border:1px solid #ddd;font-size:12px">${value || ""}</td></tr>`;
    const row2 = (l1: string, v1: string | null | undefined, l2: string, v2: string | null | undefined) =>
      `<tr><td style="padding:5px 8px;font-weight:bold;white-space:nowrap;border:1px solid #ddd;background:#f5f5f5;font-size:12px;width:130px">${l1}</td><td style="padding:5px 8px;border:1px solid #ddd;font-size:12px">${v1 || ""}</td><td style="padding:5px 8px;font-weight:bold;white-space:nowrap;border:1px solid #ddd;background:#f5f5f5;font-size:12px;width:130px">${l2}</td><td style="padding:5px 8px;border:1px solid #ddd;font-size:12px">${v2 || ""}</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>配車依頼書</title>
<style>body{font-family:'Hiragino Sans','Meiryo',sans-serif;margin:20px;color:#333}h2{font-size:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;margin:16px 0 8px}table{border-collapse:collapse;width:100%;margin-bottom:12px}.header{text-align:center;margin-bottom:20px}.header h1{font-size:20px;color:#40E0D0;margin:0}@media print{body{margin:10px}}</style></head><body>
<div class="header"><h1>配車依頼書</h1><p style="font-size:11px;color:#888">作成日: ${new Date().toLocaleString("ja-JP")}</p></div>
<h2>運行情報</h2><table>${row2("成約番号(管理番号)", listing.cargoNumber ? String(listing.cargoNumber) : "-", "作成日", (dr as any).createdAt ? new Date((dr as any).createdAt).toLocaleDateString("ja-JP") : "-")}${row("運送会社", (dr as any).transportCompany)}${row("荷主会社", (dr as any).shipperCompany)}${row("担当者", (dr as any).contactPerson)}${row2("積み日", `${(dr as any).loadingDate} ${(dr as any).loadingTime || ""}`, "積み地", (dr as any).loadingPlace)}${row2("卸し日", `${(dr as any).unloadingDate} ${(dr as any).unloadingTime || ""}`, "卸し地", (dr as any).unloadingPlace)}</table>
<h2>荷物情報</h2><table>${row("荷種", (dr as any).cargoType)}${row("荷物総重量", (dr as any).totalWeight)}${row("重量・車種", (dr as any).weightVehicle)}${row("注意事項", (dr as any).notes)}${row("車両装備", (dr as any).vehicleEquipment)}</table>
<h2>運賃情報</h2><table>${row("運賃", (dr as any).fare ? `${formatPrice((dr as any).fare)}円 (税別)` : "")}${row2("高速代", (dr as any).highwayFee, "待機料", (dr as any).waitingFee)}${row2("付帯作業料", (dr as any).additionalWorkFee, "搬出料", (dr as any).exportFee)}${row2("駐車代", (dr as any).parkingFee, "通関料", (dr as any).customsFee)}${row("燃料サーチャージ", (dr as any).fuelSurcharge)}${row2("合計額", (dr as any).totalAmount ? `${formatPrice((dr as any).totalAmount)}円` : "", "消費税", (dr as any).tax ? `${formatPrice((dr as any).tax)}円` : "")}${row2("支払方法", (dr as any).paymentMethod, "入金予定日", (dr as any).paymentDueDate)}</table>
<h2>取引関係者情報</h2><table>${row("元請事業者名", (dr as any).primeContractorName)}${row("元請事業者電話番号", (dr as any).primeContractorPhone)}${row("元請担当者名", (dr as any).primeContractorContact)}${row("請負階層", (dr as any).contractLevel)}${row("真荷主名", (dr as any).actualShipperName)}</table>
<h2>車番・ドライバー</h2><table>${row("実運送会社", (dr as any).actualTransportCompany)}${row("車番", (dr as any).vehicleNumber)}${row("ドライバー名", (dr as any).driverName)}${row("携帯番号", (dr as any).driverPhone)}${row("注意事項(運送会社)", (dr as any).transportCompanyNotes)}</table></body></html>`;
    const printWindow = window.open("", "_blank");
    if (printWindow) { printWindow.document.write(html); printWindow.document.close(); printWindow.onload = () => { printWindow.print(); }; }
  };

  if (isLoadingDR) {
    return (
      <div className="p-3 flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const isSent = dispatchRequest?.status === "sent";
  const showForm = isEditing || !dispatchRequest;

  if (!showForm && dispatchRequest) {
    return (
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">{isContracted ? "車番連絡" : "配車依頼書"}</h3>
          </div>
          {isSent ? (
            <Badge variant="outline" className="text-[10px] border-green-300 text-green-600">送信済み</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-yellow-300 text-yellow-600">下書き</Badge>
          )}
        </div>

        {isSent && dispatchRequest.sentAt && (
          <div className="text-[10px] text-muted-foreground">送信日時: {new Date(dispatchRequest.sentAt).toLocaleString("ja-JP")}</div>
        )}

        <h4 className="text-xs font-bold text-muted-foreground mt-2">運行情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="成約番号(管理番号)" value={listing.cargoNumber ? String(listing.cargoNumber) : "-"} />
          <DetailRow label="作成日" value={dispatchRequest.createdAt ? new Date(dispatchRequest.createdAt).toLocaleDateString("ja-JP") : "-"} />
          <DetailRow label="運送会社" value={dispatchRequest.transportCompany} />
          <DetailRow label="荷主会社" value={dispatchRequest.shipperCompany} />
          <DetailRow label="担当者" value={dispatchRequest.contactPerson} />
          <DetailRow label="積み日" value={`${dispatchRequest.loadingDate || ""} ${dispatchRequest.loadingTime || ""}`} />
          <DetailRow label="積み地" value={dispatchRequest.loadingPlace} />
          <DetailRow label="卸し日" value={`${dispatchRequest.unloadingDate || ""} ${dispatchRequest.unloadingTime || ""}`} />
          <DetailRow label="卸し地" value={dispatchRequest.unloadingPlace} />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground">荷物情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="荷種" value={dispatchRequest.cargoType} />
          <DetailRow label="荷物総重量" value={dispatchRequest.totalWeight} />
          <DetailRow label="重量・車種" value={dispatchRequest.weightVehicle} />
          <DetailRow label="注意事項" value={dispatchRequest.notes} />
          <DetailRow label="車両装備" value={dispatchRequest.vehicleEquipment} />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground">運賃情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="運賃" value={dispatchRequest.fare ? `${formatPrice(dispatchRequest.fare)}円 (税別)` : ""} />
          <DetailRow label="高速代" value={dispatchRequest.highwayFee} />
          <DetailRow label="待機料" value={dispatchRequest.waitingFee} />
          <DetailRow label="付帯作業料" value={dispatchRequest.additionalWorkFee} />
          <DetailRow label="搬出料" value={dispatchRequest.exportFee} />
          <DetailRow label="駐車代" value={dispatchRequest.parkingFee} />
          <DetailRow label="通関料" value={dispatchRequest.customsFee} />
          <DetailRow label="燃料サーチャージ" value={dispatchRequest.fuelSurcharge} />
          <DetailRow label="合計額" value={dispatchRequest.totalAmount ? `${formatPrice(dispatchRequest.totalAmount)}円` : ""} />
          <DetailRow label="消費税" value={dispatchRequest.tax ? `${formatPrice(dispatchRequest.tax)}円` : ""} />
          <DetailRow label="支払方法" value={dispatchRequest.paymentMethod} />
          <DetailRow label="入金予定日" value={dispatchRequest.paymentDueDate} />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground">取引関係者情報</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="元請事業者名" value={dispatchRequest.primeContractorName} />
          <DetailRow label="元請事業者電話番号" value={dispatchRequest.primeContractorPhone} />
          <DetailRow label="元請担当者名" value={dispatchRequest.primeContractorContact} />
          <DetailRow label="請負階層" value={dispatchRequest.contractLevel} />
          <DetailRow label="真荷主名" value={dispatchRequest.actualShipperName} />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground">車番・ドライバー</h4>
        <div className="border border-border rounded-md overflow-hidden">
          <DetailRow label="実運送会社" value={dispatchRequest.actualTransportCompany} />
          <DetailRow label="車番" value={dispatchRequest.vehicleNumber} />
          <DetailRow label="ドライバー名" value={dispatchRequest.driverName} />
          <DetailRow label="携帯番号" value={dispatchRequest.driverPhone} />
          <DetailRow label="注意事項(運送会社)" value={dispatchRequest.transportCompanyNotes} />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setIsEditing(true)} data-testid="button-edit-dispatch">
            編集
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handlePrintDispatch} data-testid="button-print-dispatch">
            印刷
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-foreground">{isContracted ? "車番連絡" : "配車依頼書"}{dispatchRequest ? "を編集" : "を作成"}</h3>
      </div>

      {!dispatchRequest && (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5">
          {isContracted
            ? "車番連絡はまだ送信されていません。車番・ドライバー情報を入力して送信してください。"
            : "配車依頼書はまだ送信されていません。内容を編集して送信することができます。"}
        </div>
      )}

      <h4 className="text-xs font-bold text-muted-foreground">運行情報</h4>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">成約番号</Label>
            <Input value={listing.cargoNumber ? String(listing.cargoNumber) : "-"} readOnly className="text-xs bg-muted/20" />
          </div>
          <div>
            <Label className="text-[10px]">作成日</Label>
            <Input value={new Date().toLocaleDateString("ja-JP")} readOnly className="text-xs bg-muted/20" />
          </div>
        </div>
        <div>
          <Label className="text-[10px]">運送会社</Label>
          <Input value={formData.transportCompany} onChange={(e) => handleChange("transportCompany", e.target.value)} className="text-xs" data-testid="input-dispatch-transport" />
        </div>
        <div>
          <Label className="text-[10px]">荷主会社</Label>
          <Input value={formData.shipperCompany} onChange={(e) => handleChange("shipperCompany", e.target.value)} className="text-xs" data-testid="input-dispatch-shipper" />
        </div>
        <div>
          <Label className="text-[10px]">担当者</Label>
          <Input value={formData.contactPerson} onChange={(e) => handleChange("contactPerson", e.target.value)} className="text-xs" data-testid="input-dispatch-contact" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">積み日</Label>
            <Input value={formData.loadingDate} onChange={(e) => handleChange("loadingDate", e.target.value)} className="text-xs" data-testid="input-dispatch-loading-date" />
          </div>
          <div>
            <Label className="text-[10px]">積み時間</Label>
            <Input value={formData.loadingTime} onChange={(e) => handleChange("loadingTime", e.target.value)} className="text-xs" data-testid="input-dispatch-loading-time" />
          </div>
        </div>
        <div>
          <Label className="text-[10px]">積み地</Label>
          <Input value={formData.loadingPlace} onChange={(e) => handleChange("loadingPlace", e.target.value)} className="text-xs" data-testid="input-dispatch-loading-place" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">卸し日</Label>
            <Input value={formData.unloadingDate} onChange={(e) => handleChange("unloadingDate", e.target.value)} className="text-xs" data-testid="input-dispatch-unloading-date" />
          </div>
          <div>
            <Label className="text-[10px]">卸し時間</Label>
            <Input value={formData.unloadingTime} onChange={(e) => handleChange("unloadingTime", e.target.value)} className="text-xs" data-testid="input-dispatch-unloading-time" />
          </div>
        </div>
        <div>
          <Label className="text-[10px]">卸し地</Label>
          <Input value={formData.unloadingPlace} onChange={(e) => handleChange("unloadingPlace", e.target.value)} className="text-xs" data-testid="input-dispatch-unloading-place" />
        </div>
      </div>

      <h4 className="text-xs font-bold text-muted-foreground">荷物情報</h4>
      <div className="space-y-2">
        <div>
          <Label className="text-[10px]">荷種</Label>
          <Input value={formData.cargoType} onChange={(e) => handleChange("cargoType", e.target.value)} className="text-xs" data-testid="input-dispatch-cargo-type" />
        </div>
        <div>
          <Label className="text-[10px]">荷物総重量</Label>
          <Input value={formData.totalWeight} onChange={(e) => handleChange("totalWeight", e.target.value)} className="text-xs" data-testid="input-dispatch-total-weight" />
        </div>
        <div>
          <Label className="text-[10px]">重量・車種</Label>
          <Input value={formData.weightVehicle} onChange={(e) => handleChange("weightVehicle", e.target.value)} className="text-xs" data-testid="input-dispatch-weight-vehicle" />
        </div>
        <div>
          <Label className="text-[10px]">注意事項</Label>
          <Textarea value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={2} className="text-xs" data-testid="input-dispatch-notes" />
        </div>
        <div>
          <Label className="text-[10px]">車両装備</Label>
          <Input value={formData.vehicleEquipment} onChange={(e) => handleChange("vehicleEquipment", e.target.value)} className="text-xs" data-testid="input-dispatch-equipment" />
        </div>
      </div>

      <h4 className="text-xs font-bold text-muted-foreground">運賃情報</h4>
      <div className="space-y-2">
        <div>
          <Label className="text-[10px]">運賃 (税別)</Label>
          <Input value={formData.fare} onChange={(e) => handleChange("fare", e.target.value)} className="text-xs" data-testid="input-dispatch-fare" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">高速代</Label>
            <Input value={formData.highwayFee} onChange={(e) => handleChange("highwayFee", e.target.value)} className="text-xs" data-testid="input-dispatch-highway" />
          </div>
          <div>
            <Label className="text-[10px]">待機料</Label>
            <Input value={formData.waitingFee} onChange={(e) => handleChange("waitingFee", e.target.value)} className="text-xs" data-testid="input-dispatch-waiting" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">付帯作業料</Label>
            <Input value={formData.additionalWorkFee} onChange={(e) => handleChange("additionalWorkFee", e.target.value)} className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">搬出料</Label>
            <Input value={formData.exportFee} onChange={(e) => handleChange("exportFee", e.target.value)} className="text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">駐車代</Label>
            <Input value={formData.parkingFee} onChange={(e) => handleChange("parkingFee", e.target.value)} className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">通関料</Label>
            <Input value={formData.customsFee} onChange={(e) => handleChange("customsFee", e.target.value)} className="text-xs" />
          </div>
        </div>
        <div>
          <Label className="text-[10px]">燃料サーチャージ</Label>
          <Input value={formData.fuelSurcharge} onChange={(e) => handleChange("fuelSurcharge", e.target.value)} className="text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">合計額</Label>
            <Input value={formData.totalAmount} onChange={(e) => handleChange("totalAmount", e.target.value)} placeholder={formData.fare ? calcTotal(formData.fare) : ""} className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">消費税</Label>
            <Input value={formData.tax} onChange={(e) => handleChange("tax", e.target.value)} placeholder={formData.fare ? calcTax(formData.fare) : ""} className="text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">支払方法</Label>
            <Input value={formData.paymentMethod} onChange={(e) => handleChange("paymentMethod", e.target.value)} className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">入金予定日</Label>
            <Input value={formData.paymentDueDate} onChange={(e) => handleChange("paymentDueDate", e.target.value)} className="text-xs" />
          </div>
        </div>
      </div>

      <h4 className="text-xs font-bold text-muted-foreground">取引関係者情報</h4>
      <div className="space-y-2">
        <div>
          <Label className="text-[10px]">元請事業者名</Label>
          <Input value={formData.primeContractorName} onChange={(e) => handleChange("primeContractorName", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">元請事業者電話番号</Label>
          <Input value={formData.primeContractorPhone} onChange={(e) => handleChange("primeContractorPhone", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">元請担当者名</Label>
          <Input value={formData.primeContractorContact} onChange={(e) => handleChange("primeContractorContact", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">請負階層</Label>
          <Input value={formData.contractLevel} onChange={(e) => handleChange("contractLevel", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">真荷主名</Label>
          <Input value={formData.actualShipperName} onChange={(e) => handleChange("actualShipperName", e.target.value)} className="text-xs" />
        </div>
      </div>

      <h4 className="text-xs font-bold text-muted-foreground">車番・ドライバー</h4>
      <div className="space-y-2">
        <div>
          <Label className="text-[10px]">実運送会社</Label>
          <Input value={formData.actualTransportCompany} onChange={(e) => handleChange("actualTransportCompany", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">車番</Label>
          <Input value={formData.vehicleNumber} onChange={(e) => handleChange("vehicleNumber", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">ドライバー名</Label>
          <Input value={formData.driverName} onChange={(e) => handleChange("driverName", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">携帯番号</Label>
          <Input value={formData.driverPhone} onChange={(e) => handleChange("driverPhone", e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label className="text-[10px]">注意事項(運送会社)</Label>
          <Textarea value={formData.transportCompanyNotes} onChange={(e) => handleChange("transportCompanyNotes", e.target.value)} rows={2} className="text-xs" />
        </div>
      </div>

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-2">
        <Button
          size="sm"
          className="flex-1 text-xs"
          onClick={handleSave}
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-save-dispatch"
        >
          {createMutation.isPending || updateMutation.isPending ? "保存中..." : "下書き保存"}
        </Button>
        <Button
          size="sm"
          variant="default"
          className="flex-1 text-xs bg-green-600 hover:bg-green-700"
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending}
          data-testid="button-send-dispatch"
        >
          {sendMutation.isPending ? "送信中..." : isContracted ? "車番連絡を送信" : "送信する"}
        </Button>
        {dispatchRequest && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setIsEditing(false)}
            data-testid="button-cancel-dispatch-edit"
          >
            戻る
          </Button>
        )}
      </div>
    </div>
  );
}

function CargoDetailPanel({ listing, onClose, isContracted = false }: { listing: CargoListing | null; onClose: () => void; isContracted?: boolean }) {
  const [panelTab, setPanelTab] = useState<"deal" | "company" | "request">("deal");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const cancelDealMutation = useMutation({
    mutationFn: async (cargoId: string) => {
      await apiRequest("PATCH", `/api/cargo/${cargoId}/status`, { status: "active" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-cargo"] });
      toast({ title: "成約を取り消しました", description: "荷物は「登録した荷物」に戻りました" });
      onClose();
    },
    onError: () => {
      toast({ title: "エラー", description: "処理に失敗しました", variant: "destructive" });
    },
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/companies", listing?.userId],
    enabled: !!listing?.userId,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setPanelTab("deal");
    setShowCancelConfirm(false);
    setIsEditing(false);
  }, [listing?.id]);

  const handlePrint = () => {
    if (!listing) return;
    const row = (label: string, value: string | null | undefined) =>
      `<tr><td style="padding:6px 10px;font-weight:bold;white-space:nowrap;border:1px solid #ddd;background:#f9f9f9;font-size:13px;width:140px">${label}</td><td style="padding:6px 10px;border:1px solid #ddd;font-size:13px">${value || "-"}</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>成約情報 - ${listing.companyName}</title>
<style>body{font-family:'Hiragino Sans','Meiryo',sans-serif;margin:20px;color:#333}h2{font-size:18px;border-bottom:2px solid #40E0D0;padding-bottom:6px;margin:20px 0 12px}table{border-collapse:collapse;width:100%;margin-bottom:16px}.header{text-align:center;margin-bottom:24px}.header h1{font-size:22px;color:#40E0D0;margin:0}@media print{body{margin:10px}}</style></head><body>
<div class="header"><h1>トラマッチ 成約情報</h1><p style="font-size:12px;color:#888">印刷日: ${new Date().toLocaleString("ja-JP")}</p></div>
<h2>成約情報</h2>
<table>${row("成約番号", listing.cargoNumber ? String(listing.cargoNumber) : "-")}${row("企業名", listing.companyName)}${row("担当者", listing.contactPerson)}${row("連絡先", listing.contactPhone)}${row("荷種", listing.cargoType)}${row("車種", listing.vehicleType)}${row("運賃", listing.price ? `${formatPrice(listing.price)}円(税別)` : "要相談")}${row("高速代", listing.highwayFee || "なし")}${row("発日時", `${formatDateFull(listing.desiredDate)} ${listing.departureTime || ""}`)}${row("発地", `${listing.departureArea} ${listing.departureAddress || ""}`)}${row("着日時", `${formatDateFull(listing.arrivalDate)} ${listing.arrivalTime || ""}`)}${row("着地", `${listing.arrivalArea} ${listing.arrivalAddress || ""}`)}${row("備考", listing.description)}</table></body></html>`;
    const printWindow = window.open("", "_blank");
    if (printWindow) { printWindow.document.write(html); printWindow.document.close(); printWindow.onload = () => { printWindow.print(); }; }
  };

  if (!listing) {
    return (
      <div className="w-[440px] shrink-0 border-l border-border bg-background h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  const createdDate = new Date(listing.createdAt);
  const changeLimitDate = new Date(createdDate);
  changeLimitDate.setDate(changeLimitDate.getDate() + 5);
  changeLimitDate.setHours(23, 59, 0, 0);

  return (
    <div className="w-[440px] shrink-0 border-l border-border bg-background h-full overflow-y-auto" data-testid="panel-cargo-detail">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
          <div className="flex items-center gap-0.5">
            {[
              { key: "deal" as const, label: "成約情報" },
              { key: "company" as const, label: "企業情報" },
              { key: "request" as const, label: isContracted ? "車番連絡" : "依頼書" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPanelTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${panelTab === tab.key ? "text-primary border border-primary bg-primary/5" : "text-muted-foreground"}`}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={handlePrint} data-testid="button-print">
              印刷
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {panelTab === "deal" ? (
        <div className="p-3 space-y-3">
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="成約番号" value={listing.cargoNumber ? String(listing.cargoNumber) : "-"} />
            <DetailRow label="成約日時" value={createdDate.toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })} />
            <DetailRow label="変更期限">
              <span className="text-destructive font-bold text-xs">
                {changeLimitDate.toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </DetailRow>
            <DetailRow label="荷物番号" value={listing.cargoNumber ? String(listing.cargoNumber) : "未設定"} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="運送会社">
              <div>
                <div className="font-bold">{listing.companyName}</div>
                {listing.contactPerson && <div className="text-xs text-muted-foreground mt-0.5">担当者：{listing.contactPerson}</div>}
                <div className="text-xs text-muted-foreground">TEL：{listing.contactPhone}</div>
                {companyInfo?.fax && <div className="text-xs text-muted-foreground">FAX：{companyInfo.fax}</div>}
              </div>
            </DetailRow>
            <DetailRow label="荷主会社">
              <div>
                <div className="font-bold">{companyInfo?.companyName || listing.companyName}</div>
                {companyInfo?.contactName && <div className="text-xs text-muted-foreground mt-0.5">担当者：{companyInfo.contactName}</div>}
              </div>
            </DetailRow>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="発日時">
              <span className="font-bold">{formatDateFull(listing.desiredDate)} {listing.departureTime || ""}</span>
            </DetailRow>
            <DetailRow label="発地">
              <span className="font-bold">{listing.departureArea} {listing.departureAddress || ""}</span>
            </DetailRow>
            <DetailRow label="着日時">
              <span className="font-bold">{formatDateFull(listing.arrivalDate)} {listing.arrivalTime || ""}</span>
            </DetailRow>
            <DetailRow label="着地">
              <span className="font-bold">{listing.arrivalArea} {listing.arrivalAddress || ""}</span>
            </DetailRow>
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="荷種" value={listing.cargoType} />
            <DetailRow label="引越し案件" value={listing.movingJob === "あり" ? "あり" : "×"} />
            <DetailRow label="積合" value={listing.consolidation || "不可"} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="希望車種">
              <div>
                <span>重量：{listing.weight || "-"} 車種：{listing.vehicleType}{listing.bodyType ? ` / ${listing.bodyType}` : ""}</span>
              </div>
            </DetailRow>
            <DetailRow label="車両指定" value={listing.vehicleSpec || "指定なし"} />
            <DetailRow label="必要装備" value={listing.equipment || ""} />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="運賃">
              <span className="font-bold text-base">{listing.price ? `${formatPrice(listing.price)}円(税別)` : "要相談"}</span>
            </DetailRow>
            <DetailRow label="高速代" value={listing.highwayFee || "金額未定"} />
            <DetailRow label="待機料" value="金額未定" />
            <DetailRow label="付帯作業料" value="金額未定" />
            <DetailRow label="搬出料" value="金額未定" />
            <DetailRow label="駐車代" value="金額未定" />
            <DetailRow label="通関料" value="金額未定" />
            <DetailRow label="燃料サーチャージ" value="金額未定" />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="備考" value={listing.description} />
            <DetailRow label="入金予定日" value={listing.paymentDate || "支払サイトに準拠"} />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditing(true)}
              data-testid="button-edit-deal"
            >
              成約内容を変更
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive border-destructive/30"
              onClick={() => setShowCancelConfirm(true)}
              data-testid="button-cancel-deal"
            >
              成約を取り消す
            </Button>
          </div>

          {showCancelConfirm && (
            <div className="border border-destructive/30 rounded-md p-3 bg-destructive/5">
              <p className="text-sm font-bold text-destructive mb-2">この成約を取り消しますか？</p>
              <p className="text-xs text-muted-foreground mb-3">取り消すと荷物は「不成約」に移動します。この操作は変更期限内のみ可能です。</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    cancelDealMutation.mutate(listing.id);
                    setShowCancelConfirm(false);
                  }}
                  disabled={cancelDealMutation.isPending}
                  data-testid="button-confirm-cancel-deal"
                >
                  {cancelDealMutation.isPending ? "処理中..." : "取り消す"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                  data-testid="button-dismiss-cancel"
                >
                  戻る
                </Button>
              </div>
            </div>
          )}

          {isEditing && (
            <EditDealForm listing={listing} onClose={() => setIsEditing(false)} />
          )}
        </div>
      ) : panelTab === "company" ? (
        <div className="p-3 space-y-3">
          <h3 className="text-base font-bold text-foreground">{companyInfo?.companyName || listing.companyName}</h3>

          <Card className="p-3">
            <div className="text-xs font-bold text-muted-foreground mb-3">トラマッチでの実績</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-bold">委託</span>
                </div>
                <div className="text-xs text-muted-foreground font-bold">成約 <span className="text-lg text-foreground">{companyInfo?.cargoCount1m ?? 0}</span></div>
                <div className="text-xs text-muted-foreground font-bold">登録 <span className="text-lg text-foreground">{companyInfo?.cargoCount3m ?? 0}</span></div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-bold">受託</span>
                </div>
                <div className="text-xs text-muted-foreground font-bold">成約 <span className="text-lg text-foreground">{companyInfo?.truckCount1m ?? 0}</span></div>
                <div className="text-xs text-muted-foreground font-bold">登録 <span className="text-lg text-foreground">{companyInfo?.truckCount3m ?? 0}</span></div>
              </div>
            </div>
          </Card>

          <h4 className="text-sm font-bold text-foreground">基本情報</h4>
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="法人名・事業者名">
              <div>
                {companyInfo?.companyNameKana && (
                  <div className="text-[10px] text-muted-foreground mb-0.5">{companyInfo.companyNameKana}</div>
                )}
                <div className="text-primary font-bold">{companyInfo?.companyName || listing.companyName}</div>
              </div>
            </DetailRow>
            <DetailRow label="住所" value={companyInfo?.postalCode ? `〒${companyInfo.postalCode}\n${companyInfo.address || "-"}` : companyInfo?.address} />
            <DetailRow label="電話番号" value={listing.contactPhone} />
            <DetailRow label="FAX番号" value={companyInfo?.fax} />
            <DetailRow label="請求事業者登録番号" value={companyInfo?.invoiceRegistrationNumber} />
            <DetailRow label="業務内容・会社PR" value={companyInfo?.businessDescription} />
            <DetailRow label="保有車両台数" value={companyInfo?.truckCount ? `${companyInfo.truckCount} 台` : "-"} />
            <DetailRow label="ウェブサイトURL" value={companyInfo?.websiteUrl} />
          </div>

          <h4 className="text-sm font-bold text-foreground">詳細情報</h4>
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="代表者" value={companyInfo?.representative} />
            <DetailRow label="設立" value={companyInfo?.establishedDate} />
            <DetailRow label="資本金" value={companyInfo?.capital ? `${companyInfo.capital} 万円` : null} />
            <DetailRow label="従業員数" value={companyInfo?.employeeCount} />
            <DetailRow label="事業所所在地" value={companyInfo?.officeLocations} />
            <DetailRow label="年間売上" value={companyInfo?.annualRevenue ? `${companyInfo.annualRevenue} 万円` : null} />
            <DetailRow label="取引先銀行" value={companyInfo?.bankInfo} />
            <DetailRow label="主要取引先" value={companyInfo?.majorClients} />
            <DetailRow label="締め日" value={[companyInfo?.closingMonth, companyInfo?.closingDay].filter(Boolean).join(" ") || null} />
            <DetailRow label="支払月・支払日" value={[companyInfo?.paymentMonth, companyInfo?.paymentDay].filter(Boolean).join(" ") || null} />
            <DetailRow label="営業地域" value={companyInfo?.businessArea} />
          </div>

          <h4 className="text-sm font-bold text-foreground">信用情報</h4>
          <div className="border border-border rounded-md overflow-hidden">
            <DetailRow label="加入組織" value={companyInfo?.memberOrganization} />
            <DetailRow label="国交省認可番号" value={companyInfo?.transportLicenseNumber} />
            <DetailRow label="デジタコ搭載数" value={companyInfo?.digitalTachographCount} />
            <DetailRow label="GPS搭載数" value={companyInfo?.gpsCount} />
            <DetailRow label="安全性優良事業所" value={companyInfo?.safetyExcellenceCert || "無"} />
            <DetailRow label="グリーン経営認証" value={companyInfo?.greenManagementCert || "無"} />
            <DetailRow label="ISO9000" value={companyInfo?.iso9000 || "無"} />
            <DetailRow label="ISO14000" value={companyInfo?.iso14000 || "無"} />
            <DetailRow label="ISO39001" value={companyInfo?.iso39001 || "無"} />
            <DetailRow label="荷物保険" value={companyInfo?.cargoInsurance} />
          </div>
        </div>
      ) : (
        <DispatchRequestTab listing={listing} companyInfo={companyInfo} isContracted={isContracted} />
      )}
    </div>
  );
}

function BillingTable({ paymentItems, invoiceItems, selectedId, onSelect }: {
  paymentItems: CargoListing[];
  invoiceItems: CargoListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [billingTab, setBillingTab] = useState<"payment" | "invoice">("payment");
  const items = billingTab === "payment" ? paymentItems : invoiceItems;

  const getBillingStatus = (item: CargoListing) => {
    if (!item.paymentDate) return { label: "未設定", cls: "border-gray-300 text-gray-500" };
    const dueDate = new Date(item.paymentDate.replace(/\//g, "-"));
    const now = new Date();
    if (dueDate < now) return { label: billingTab === "payment" ? "支払済" : "入金済", cls: "border-green-300 text-green-600" };
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return { label: billingTab === "payment" ? "支払予定" : "入金待ち", cls: "border-yellow-300 text-yellow-600" };
    return { label: billingTab === "payment" ? "支払予定" : "請求中", cls: "border-blue-300 text-blue-600" };
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-3">
        <button
          onClick={() => { setBillingTab("payment"); onSelect(""); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
            billingTab === "payment"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          data-testid="tab-billing-payment"
        >
          支払い ({paymentItems.length})
        </button>
        <button
          onClick={() => { setBillingTab("invoice"); onSelect(""); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
            billingTab === "invoice"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          data-testid="tab-billing-invoice"
        >
          請求 ({invoiceItems.length})
        </button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-bold" data-testid="text-billing-empty">
              {billingTab === "payment" ? "支払い情報はまだありません" : "請求情報はまだありません"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {billingTab === "payment"
                ? "自社荷物を成約した場合の支払い情報がここに表示されます"
                : "受託荷物を成約した場合の請求情報がここに表示されます"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-testid="table-billing">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">成約番号</th>
                  <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">取引先</th>
                  <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">発地→着地</th>
                  <th className="text-right px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">運賃(税別)</th>
                  <th className="text-right px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">消費税</th>
                  <th className="text-right px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">合計(税込)</th>
                  <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">
                    {billingTab === "payment" ? "支払予定日" : "入金予定日"}
                  </th>
                  <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">状態</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const priceNum = item.price ? parseInt(item.price.replace(/[^0-9]/g, ""), 10) : 0;
                  const tax = Math.floor(priceNum * 0.1);
                  const total = priceNum + tax;
                  const status = getBillingStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-muted/30 ${selectedId === item.id ? "bg-primary/5" : ""}`}
                      onClick={() => onSelect(item.id)}
                      data-testid={`row-billing-${item.id}`}
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap font-bold">{item.cargoNumber || "-"}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-bold">{item.companyName}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                        {item.departureArea} → {item.arrivalArea}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-bold">
                        {priceNum > 0 ? `${formatPrice(String(priceNum))}円` : "-"}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right text-muted-foreground">
                        {tax > 0 ? `${formatPrice(String(tax))}円` : "-"}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-bold">
                        {total > 0 ? `${formatPrice(String(total))}円` : "-"}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.paymentDate || "-"}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Badge variant="outline" className={`text-[10px] ${status.cls}`}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DispatchStatusBadge({ cargoId }: { cargoId: string }) {
  const { data: dr } = useQuery<DispatchRequest | null>({
    queryKey: [`/api/dispatch-requests/${cargoId}`],
  });

  if (!dr) {
    return <Badge variant="outline" className="text-[10px] border-gray-300 text-gray-500">未作成</Badge>;
  }
  if (dr.status === "sent") {
    return <Badge variant="outline" className="text-[10px] border-green-300 text-green-600">送信済</Badge>;
  }
  return <Badge variant="outline" className="text-[10px] border-yellow-300 text-yellow-600">下書き</Badge>;
}

function CompletedCargoTable({ items, selectedId, onSelect }: {
  items: CargoListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground" data-testid="text-empty-state">成約した荷物はまだありません</p>
          <p className="text-xs text-muted-foreground mt-2">「登録した荷物」ページから荷物を成約済みにできます</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs" data-testid="table-completed-cargo">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">成約番号</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">状態</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">運送会社</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">発日時・発地</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">着日時・着地</th>
              <th className="text-right px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">運賃</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">高速代</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">車種</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">車</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">依頼書</th>
              <th className="text-left px-3 py-2.5 font-bold text-muted-foreground whitespace-nowrap">入金予定日</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-muted/30 ${selectedId === item.id ? "bg-primary/5" : ""}`}
                onClick={() => onSelect(item.id)}
                data-testid={`row-completed-cargo-${item.id}`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap font-bold">{item.cargoNumber || "-"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600">成約</Badge>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-bold">{item.companyName}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-bold">{formatDateCompact(item.desiredDate)} {item.departureTime || ""}</div>
                  <div className="text-muted-foreground">{item.departureArea}{item.departureAddress ? ` ${item.departureAddress}` : ""}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-bold">{formatDateCompact(item.arrivalDate)} {item.arrivalTime || ""}</div>
                  <div className="text-muted-foreground">{item.arrivalArea}{item.arrivalAddress ? ` ${item.arrivalAddress}` : ""}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-right font-bold">
                  {item.price ? `${formatPrice(item.price)}円` : "-"}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.highwayFee || "なし"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.vehicleType || "-"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.bodyType || "-"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <DispatchStatusBadge cargoId={item.id} />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{item.paymentDate || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CompletedCargo() {
  const { user } = useAuth();
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<"own" | "contracted" | "billing">("own");

  const { data: allCargo, isLoading } = useQuery<CargoListing[]>({
    queryKey: ["/api/my-cargo"],
  });

  const { data: contractedCargo, isLoading: isLoadingContracted } = useQuery<CargoListing[]>({
    queryKey: ["/api/contracted-cargo"],
  });

  const completedOwn = allCargo?.filter((c) => c.status === "completed") ?? [];
  const completedContracted = contractedCargo?.filter((c) => c.status === "completed") ?? [];
  const sorted = [...completedOwn].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedContracted = [...completedContracted].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedCargo = useMemo(() => {
    if (!selectedCargoId) return null;
    const fromOwn = allCargo?.find((l) => l.id === selectedCargoId);
    if (fromOwn) return fromOwn;
    const fromContracted = contractedCargo?.find((l) => l.id === selectedCargoId);
    return fromContracted || null;
  }, [selectedCargoId, allCargo, contractedCargo]);

  const mainTabs = [
    { key: "own" as const, label: "自社荷物の成約", icon: Package },
    { key: "contracted" as const, label: "受託荷物の成約", icon: Truck },
    { key: "billing" as const, label: "請求・支払", icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-4">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">成約した荷物</h1>
              <p className="text-sm text-muted-foreground mt-1">
                成約済みの荷物情報の管理
                {mainTab === "own" && sorted.length > 0 && <span className="ml-2">({sorted.length}件)</span>}
                {mainTab === "contracted" && sortedContracted.length > 0 && <span className="ml-2">({sortedContracted.length}件)</span>}
              </p>
            </div>

            <div className="flex items-center gap-1 border-b border-border mb-4">
              {mainTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setMainTab(tab.key); setSelectedCargoId(null); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-[1px] ${
                    mainTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`tab-main-${tab.key}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {(isLoading || isLoadingContracted) ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : mainTab === "own" ? (
              <CompletedCargoTable
                items={sorted}
                selectedId={selectedCargoId}
                onSelect={setSelectedCargoId}
              />
            ) : mainTab === "contracted" ? (
              sortedContracted.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-bold" data-testid="text-contracted-empty">受託荷物の成約はまだありません</p>
                    <p className="text-xs text-muted-foreground mt-2">他社から受託した荷物の成約情報がここに表示されます</p>
                  </CardContent>
                </Card>
              ) : (
                <CompletedCargoTable
                  items={sortedContracted}
                  selectedId={selectedCargoId}
                  onSelect={setSelectedCargoId}
                />
              )
            ) : (
              <BillingTable
                paymentItems={sorted}
                invoiceItems={sortedContracted}
                selectedId={selectedCargoId}
                onSelect={setSelectedCargoId}
              />
            )}
          </div>
        </div>
        {selectedCargoId && selectedCargo && (
          <CargoDetailPanel listing={selectedCargo} onClose={() => setSelectedCargoId(null)} isContracted={mainTab === "contracted"} />
        )}
      </div>
    </DashboardLayout>
  );
}
