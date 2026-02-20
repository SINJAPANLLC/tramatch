import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User as UserType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCargoListingSchema, type InsertCargoListing } from "@shared/schema";
import { Package, Sparkles, Upload, Mic, MicOff, FileText, Loader2, CalendarIcon, Send, ChevronDown, ChevronUp, CheckCircle2, CircleDot, Bot, User, Banknote, MessageSquare, Copy } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useState, useRef, useCallback, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

const VEHICLE_TYPES = [
  "軽車両", "1t車", "1.5t車", "2t車", "3t車", "4t車", "5t車", "6t車",
  "7t車", "8t車", "10t車", "11t車", "13t車", "15t車",
  "増トン車", "大型車", "トレーラー", "フルトレーラー", "その他"
];
const BODY_TYPES = [
  "平ボディ", "バン", "箱車", "ウイング", "幌ウイング", "冷蔵車", "冷凍車", "冷凍冷蔵車",
  "ダンプ", "タンクローリー", "車載車", "セルフローダー", "セーフティローダー",
  "ユニック", "クレーン付き", "パワーゲート付き", "エアサス",
  "コンテナ車", "海上コンテナ", "低床", "高床",
  "ショート", "ロング", "ワイド", "ワイドロング",
  "その他"
];
const TEMP_CONTROLS = ["指定なし", "常温", "冷蔵（0〜10℃）", "冷凍（-18℃以下）", "定温"];
const HIGHWAY_FEE_OPTIONS = ["込み", "別途", "高速代なし"];
const TRANSPORT_TYPE_OPTIONS = ["スポット", "定期"];
const CONSOLIDATION_OPTIONS = ["不可", "可能"];
const DRIVER_WORK_OPTIONS = ["手積み手降ろし", "フォークリフト", "クレーン", "ゲート車", "パレット", "作業なし", "その他"];
const LOADING_METHODS = ["パレット", "バラ積み", "段ボール", "フレコン", "その他"];
const TIME_OPTIONS = ["指定なし", "午前中", "午後", "夕方以降", "終日可", "0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];
const URGENCY_OPTIONS = ["通常", "至急"];
const AUTO_INVOICE_OPTIONS = ["推奨", "受入可", "受入不可", "未定"];

const AREAS = [
  "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島",
  "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川",
  "新潟", "富山", "石川", "福井", "山梨", "長野",
  "岐阜", "静岡", "愛知", "三重",
  "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
  "鳥取", "島根", "岡山", "広島", "山口",
  "徳島", "香川", "愛媛", "高知",
  "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"
];

const SELECT_FIELD_OPTIONS: Record<string, string[]> = {
  departureArea: AREAS,
  arrivalArea: AREAS,
  departureTime: TIME_OPTIONS,
  arrivalTime: TIME_OPTIONS,
  vehicleType: VEHICLE_TYPES,
  bodyType: BODY_TYPES,
  temperatureControl: TEMP_CONTROLS,
  highwayFee: HIGHWAY_FEE_OPTIONS,
  transportType: TRANSPORT_TYPE_OPTIONS,
  consolidation: CONSOLIDATION_OPTIONS,
  driverWork: DRIVER_WORK_OPTIONS,
  loadingMethod: LOADING_METHODS,
  urgency: URGENCY_OPTIONS,
};

const FIELD_ALIASES: Record<string, Record<string, string>> = {
  highwayFee: { "あり": "込み", "なし": "高速代なし", "高速代あり": "込み", "高速代込み": "込み", "高速代別途": "別途" },
  driverWork: { "作業なし（車上渡し）": "作業なし", "車上渡し": "作業なし" },
  bodyType: { "箱": "箱車" },
};

function findBestMatch(value: string, options: string[], fieldName?: string): string {
  if (!value) return "";
  const exact = options.find((o) => o === value);
  if (exact) return exact;
  if (fieldName && FIELD_ALIASES[fieldName]) {
    const alias = FIELD_ALIASES[fieldName][value];
    if (alias && options.includes(alias)) return alias;
  }
  const includes = options.find((o) => o.includes(value) || value.includes(o));
  if (includes) return includes;
  return "";
}

const CARGO_FIELDS = [
  "title", "departureArea", "departureAddress", "arrivalArea", "arrivalAddress",
  "desiredDate", "departureTime", "arrivalDate", "arrivalTime",
  "cargoType", "weight", "vehicleType", "bodyType", "temperatureControl",
  "price", "transportType", "consolidation", "driverWork", "packageCount", "loadingMethod",
  "highwayFee", "equipment", "vehicleSpec", "truckCount",
  "urgency", "movingJob", "contactPerson",
  "description",
];

const MULTI_SELECT_FIELDS = ["vehicleType", "bodyType"];

const FIELD_LABELS: Record<string, string> = {
  title: "タイトル", departureArea: "発地", departureAddress: "発地詳細",
  arrivalArea: "着地", arrivalAddress: "着地詳細",
  desiredDate: "発日", departureTime: "発時間", arrivalDate: "着日", arrivalTime: "着時間",
  cargoType: "荷種", weight: "重量", vehicleType: "車種", bodyType: "車体",
  temperatureControl: "温度管理", price: "運賃(税別)", transportType: "形態",
  consolidation: "積合", driverWork: "作業", packageCount: "個数",
  loadingMethod: "荷姿", highwayFee: "高速代",
  equipment: "必要装備", vehicleSpec: "車両指定", truckCount: "台数",
  urgency: "緊急度", movingJob: "引越し", contactPerson: "担当者",
  description: "備考",
};

function normalizeAiItem(raw: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of CARGO_FIELDS) {
    const val = raw[key];
    if (val == null) { result[key] = ""; continue; }
    const str = String(val).trim();
    if (!str) { result[key] = ""; continue; }
    if (MULTI_SELECT_FIELDS.includes(key)) {
      const options = SELECT_FIELD_OPTIONS[key];
      if (options) {
        const parts = str.split(/[,、]/).map(s => s.trim()).filter(Boolean);
        const matched = parts.map(p => findBestMatch(p, options, key)).filter(Boolean);
        result[key] = matched.join(", ");
      } else {
        result[key] = str;
      }
    } else {
      const options = SELECT_FIELD_OPTIONS[key];
      if (options) {
        result[key] = findBestMatch(str, options, key);
      } else {
        result[key] = str;
      }
    }
  }
  return result;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  extractedFields?: Record<string, string>;
  priceSuggestion?: { min: number; max: number; reason: string } | null;
  items?: Record<string, unknown>[];
  status?: string;
};

export default function CargoForm() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const editMatch = location.match(/^\/cargo\/edit\/(.+)$/);
  const editId = editMatch ? editMatch[1] : null;
  const isEditMode = !!editId;

  const { data: editCargo, isLoading: isLoadingEdit } = useQuery<import("@shared/schema").CargoListing>({
    queryKey: ["/api/cargo", editId],
    enabled: isEditMode,
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: isEditMode
        ? "荷物情報を編集できます。フォームの内容を変更して「更新する」ボタンを押してください。"
        : "荷物登録のお手伝いをします！\n\n荷物の情報をテキストで貼り付けるか、ファイルをアップロードしてください。運賃の相談もできます。\n\n例：「3月5日に横浜から大阪まで食品10トンを冷凍車で運びたい」",
      status: "chatting",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useQuery<UserType>({ queryKey: ["/api/user"] });
  const [pendingItems, setPendingItems] = useState<Record<string, unknown>[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [editLoaded, setEditLoaded] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  const { data: myCargoList } = useQuery<import("@shared/schema").CargoListing[]>({
    queryKey: ["/api/my-cargo"],
    enabled: showCopyDialog,
  });

  const form = useForm<InsertCargoListing>({
    resolver: zodResolver(insertCargoListingSchema),
    defaultValues: {
      title: "", departureArea: "", departureAddress: "", departureTime: "",
      arrivalArea: "", arrivalAddress: "", arrivalTime: "", cargoType: "",
      weight: "", desiredDate: "", arrivalDate: "", vehicleType: "", bodyType: "",
      temperatureControl: "", price: "", highwayFee: "", transportType: "スポット",
      consolidation: "", driverWork: "", packageCount: "", loadingMethod: "",
      description: "", companyName: "", contactPhone: "", contactEmail: "",
      loadingTime: "", unloadingTime: "", equipment: "", vehicleSpec: "",
      truckCount: "", urgency: "", movingJob: "", contactPerson: "",
    },
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  useEffect(() => {
    if (isEditMode && editCargo && !editLoaded) {
      const fields: Record<string, string> = {};
      for (const key of CARGO_FIELDS) {
        const val = (editCargo as any)[key];
        if (val != null && val !== "") {
          fields[key] = String(val);
          form.setValue(key as keyof InsertCargoListing, String(val));
        }
      }
      if (editCargo.companyName) form.setValue("companyName", editCargo.companyName);
      if (editCargo.contactPhone) form.setValue("contactPhone", editCargo.contactPhone);
      if (editCargo.contactEmail) form.setValue("contactEmail", editCargo.contactEmail || "");
      setExtractedFields(fields);
      setEditLoaded(true);
    }
  }, [isEditMode, editCargo, editLoaded, form]);

  const applyFieldsToForm = useCallback((fields: Record<string, string>) => {
    let count = 0;
    for (const key of CARGO_FIELDS) {
      const val = fields[key];
      if (val) {
        form.setValue(key as keyof InsertCargoListing, val);
        count++;
      }
    }
    return count;
  }, [form]);

  const mergeExtractedFields = useCallback((newFields: Record<string, unknown>) => {
    const normalized = normalizeAiItem(newFields);
    setExtractedFields(prev => {
      const merged = { ...prev };
      for (const key of CARGO_FIELDS) {
        if (normalized[key]) merged[key] = normalized[key];
      }
      return merged;
    });
    const normalizedClean: Record<string, string> = {};
    for (const key of CARGO_FIELDS) {
      if (normalized[key]) normalizedClean[key] = normalized[key];
    }
    return normalizedClean;
  }, []);

  const copyFromCargo = useCallback((cargo: import("@shared/schema").CargoListing) => {
    form.reset({
      title: "", departureArea: "", departureAddress: "", departureTime: "",
      arrivalArea: "", arrivalAddress: "", arrivalTime: "", cargoType: "",
      weight: "", desiredDate: "", arrivalDate: "", vehicleType: "", bodyType: "",
      temperatureControl: "", price: "", highwayFee: "", transportType: "スポット",
      consolidation: "", driverWork: "", packageCount: "", loadingMethod: "",
      description: "", companyName: "", contactPhone: "", contactEmail: "",
      loadingTime: "", unloadingTime: "", equipment: "", vehicleSpec: "",
      truckCount: "", urgency: "", movingJob: "", contactPerson: "",
    });
    const fields: Record<string, string> = {};
    for (const key of CARGO_FIELDS) {
      const val = (cargo as any)[key];
      if (val != null && val !== "") {
        fields[key] = String(val);
        form.setValue(key as keyof InsertCargoListing, String(val));
      }
    }
    if (cargo.companyName) form.setValue("companyName", cargo.companyName);
    if (cargo.contactPhone) form.setValue("contactPhone", cargo.contactPhone);
    if (cargo.contactEmail) form.setValue("contactEmail", cargo.contactEmail || "");
    form.setValue("title", "");
    form.setValue("desiredDate", "");
    form.setValue("arrivalDate", "");
    fields["title"] = "";
    fields["desiredDate"] = "";
    fields["arrivalDate"] = "";
    setExtractedFields(fields);
    setShowCopyDialog(false);
    toast({ title: "案件をコピーしました", description: "タイトルと日付は空欄にしています。必要な箇所を編集してください。" });
  }, [form, toast]);

  const loadNextPendingItem = useCallback(() => {
    if (pendingItems.length > 0) {
      const nextItem = pendingItems[0];
      const remaining = pendingItems.slice(1);
      setPendingItems(remaining);
      setCurrentItemIndex(prev => prev + 1);
      form.reset({
        title: "", departureArea: "", departureAddress: "", departureTime: "",
        arrivalArea: "", arrivalAddress: "", arrivalTime: "", cargoType: "",
        weight: "", desiredDate: "", arrivalDate: "", vehicleType: "", bodyType: "",
        temperatureControl: "", price: "", highwayFee: "", transportType: "スポット",
        consolidation: "", driverWork: "", packageCount: "", loadingMethod: "",
        description: "", companyName: "", contactPhone: "", contactEmail: "",
        loadingTime: "", unloadingTime: "", equipment: "", vehicleSpec: "",
        truckCount: "", urgency: "", movingJob: "", contactPerson: "",
      });
      const normalized = normalizeAiItem(nextItem);
      setExtractedFields(normalized);
      applyFieldsToForm(normalized);
      toast({
        title: `次の荷物を入力しました（${currentItemIndex + 2}/${totalItems}件目）`,
        description: remaining.length > 0 ? `残り${remaining.length}件` : "これが最後の荷物です",
      });
    } else {
      setPendingItems([]);
      setCurrentItemIndex(0);
      setTotalItems(0);
      setLocation("/cargo");
    }
  }, [pendingItems, currentItemIndex, totalItems, form, applyFieldsToForm, toast, setLocation]);

  const mutation = useMutation({
    mutationFn: async (data: InsertCargoListing) => {
      if (isEditMode && editId) {
        const res = await apiRequest("PATCH", `/api/cargo/${editId}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/cargo", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cargo"] });
      if (isEditMode) {
        toast({ title: "荷物情報を更新しました" });
        setLocation("/my-cargo");
      } else if (pendingItems.length > 0) {
        toast({ title: "荷物情報を掲載しました", description: "次の荷物を読み込みます..." });
        loadNextPendingItem();
      } else {
        toast({ title: "荷物情報を掲載しました" });
        setTotalItems(0);
        setCurrentItemIndex(0);
        setLocation("/cargo");
      }
    },
    onError: (error: Error) => {
      toast({ title: "エラーが発生しました", description: error.message, variant: "destructive" });
    },
  });

  const sendChatMessage = useCallback(async (userMessage: string, opts?: { skipGuard?: boolean; skipUserMsg?: boolean }) => {
    if (!userMessage.trim()) return;
    if (!opts?.skipGuard && isAiProcessing) return;

    let userMsg: ChatMessage | null = null;
    if (!opts?.skipUserMsg) {
      userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
      };
      setChatMessages(prev => [...prev, userMsg!]);
    }
    setChatInput("");
    setIsAiProcessing(true);

    try {
      const currentMessages = userMsg ? [...chatMessages, userMsg] : chatMessages;
      const allMessages = currentMessages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          content: m.role === "assistant" ? (m.content || "") : m.content,
        }));

      const response = await fetch("/api/ai/cargo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          extractedFields: extractedFields,
        }),
      });

      if (!response.ok) throw new Error("AI通信エラー");
      const data = await response.json();

      if (data.extractedFields && Object.keys(data.extractedFields).length > 0) {
        const merged = mergeExtractedFields(data.extractedFields);
        applyFieldsToForm(merged);
      }

      if (data.items && data.items.length > 0) {
        if (data.items.length === 1) {
          const singleItem = normalizeAiItem(data.items[0]);
          const hasFields = Object.values(singleItem).some(v => v);
          if (hasFields) {
            mergeExtractedFields(singleItem);
            applyFieldsToForm(singleItem);
          }
        } else {
          const firstItem = normalizeAiItem(data.items[0]);
          setExtractedFields(firstItem);
          applyFieldsToForm(firstItem);
          setPendingItems(data.items.slice(1));
          setCurrentItemIndex(0);
          setTotalItems(data.items.length);
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.message,
        extractedFields: data.extractedFields,
        priceSuggestion: data.priceSuggestion,
        items: data.items,
        status: data.status,
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch {
      setChatMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "申し訳ございません。通信エラーが発生しました。もう一度お試しください。",
      }]);
    } finally {
      setIsAiProcessing(false);
    }
  }, [chatMessages, extractedFields, isAiProcessing, mergeExtractedFields, applyFieldsToForm]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAiProcessing(true);

    const userMsg: ChatMessage = {
      id: `user-file-${Date.now()}`,
      role: "user",
      content: `[ファイルアップロード: ${file.name}]`,
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/ai/extract-text", { method: "POST", body: formData });
      if (!response.ok) throw new Error("抽出に失敗しました");
      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, {
          id: `ai-extract-${Date.now()}`,
          role: "assistant",
          content: `ファイルから以下の情報を読み取りました：\n\n${data.text}\n\nこの情報から荷物を登録しますね。`,
        }]);
        await sendChatMessage(data.text, { skipGuard: true, skipUserMsg: true });
      } else {
        setIsAiProcessing(false);
      }
    } catch {
      toast({ title: "エラー", description: "ファイルからの情報抽出に失敗しました", variant: "destructive" });
      setIsAiProcessing(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [sendChatMessage, toast]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(100);
      setIsRecording(true);
    } catch {
      toast({ title: "エラー", description: "マイクへのアクセスが許可されていません", variant: "destructive" });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recorder.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setIsAiProcessing(true);

        const userMsg: ChatMessage = {
          id: `user-voice-${Date.now()}`,
          role: "user",
          content: "[音声入力中...]",
        };
        setChatMessages(prev => [...prev, userMsg]);

        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const response = await fetch("/api/ai/transcribe", { method: "POST", body: formData });
          if (!response.ok) throw new Error("文字起こしに失敗しました");
          const data = await response.json();
          if (data.text) {
            setChatMessages(prev =>
              prev.map(m => m.id === userMsg.id ? { ...m, content: data.text } : m)
            );
            await sendChatMessage(data.text, { skipGuard: true, skipUserMsg: true });
          } else {
            setIsAiProcessing(false);
          }
        } catch {
          toast({ title: "エラー", description: "音声の文字起こしに失敗しました", variant: "destructive" });
          setIsAiProcessing(false);
        }
        resolve();
      };
      recorder.stop();
    });
  }, [sendChatMessage, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      sendChatMessage(chatInput);
    }
  };

  const filledFieldCount = Object.values(extractedFields).filter(v => v).length;
  const [mobileTab, setMobileTab] = useState<"chat" | "form">("chat");

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="bg-primary px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 shrink-0">
          <Package className="w-5 h-5 text-primary-foreground" />
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-primary-foreground text-shadow-lg truncate" data-testid="text-cargo-form-title">{isEditMode ? "荷物情報の編集" : "AI荷物登録"}</h1>
            <p className="text-[10px] sm:text-xs text-primary-foreground/80 text-shadow">AIアシスタントが登録をサポートします</p>
          </div>
          <div className="flex lg:hidden gap-1">
            <Button
              size="sm"
              variant={mobileTab === "chat" ? "secondary" : "ghost"}
              className="text-xs text-primary-foreground"
              onClick={() => setMobileTab("chat")}
              data-testid="button-mobile-tab-chat"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              チャット
            </Button>
            <Button
              size="sm"
              variant={mobileTab === "form" ? "secondary" : "ghost"}
              className="text-xs text-primary-foreground"
              onClick={() => setMobileTab("form")}
              data-testid="button-mobile-tab-form"
            >
              <FileText className="w-3 h-3 mr-1" />
              フォーム{filledFieldCount > 0 && ` (${filledFieldCount})`}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex flex-col min-w-0 ${mobileTab !== "chat" ? "hidden lg:flex" : ""}`}>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" data-testid="chat-messages">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/60 text-foreground rounded-bl-md"
                      }`}
                      data-testid={`chat-message-${msg.id}`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {msg.priceSuggestion && msg.priceSuggestion.min != null && msg.priceSuggestion.max != null && (
                      <div className="mt-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3.5 py-2.5" data-testid="price-suggestion">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Banknote className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">運賃の提案</span>
                        </div>
                        <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
                          ¥{msg.priceSuggestion.min.toLocaleString()} 〜 ¥{msg.priceSuggestion.max.toLocaleString()}
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{msg.priceSuggestion.reason}</p>
                        <div className="flex gap-1.5 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-amber-300 text-amber-700 dark:text-amber-400"
                            onClick={() => {
                              const mid = Math.round((msg.priceSuggestion!.min + msg.priceSuggestion!.max) / 2);
                              form.setValue("price", String(mid));
                              setExtractedFields(prev => ({ ...prev, price: String(mid) }));
                              toast({ title: "運賃を設定しました", description: `¥${mid.toLocaleString()}` });
                            }}
                            data-testid="button-apply-price-mid"
                          >
                            中間値で設定
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-amber-300 text-amber-700 dark:text-amber-400"
                            onClick={() => {
                              sendChatMessage("もう少し安くしたいんだけど");
                            }}
                            data-testid="button-negotiate-lower"
                          >
                            もう少し安く
                          </Button>
                        </div>
                      </div>
                    )}

                    {msg.extractedFields && Object.keys(msg.extractedFields).filter(k => msg.extractedFields![k]).length > 0 && (
                      <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2" data-testid="extracted-fields-preview">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[11px] font-bold text-primary">抽出した情報</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(msg.extractedFields).filter(([, v]) => v).map(([k, v]) => (
                            <Badge key={k} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                              {FIELD_LABELS[k] || k}: {String(v).length > 15 ? String(v).substring(0, 15) + "..." : v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.items && msg.items.length > 1 && (
                      <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2" data-testid="multi-cargo-detected">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">{msg.items.length}件の荷物を検出</span>
                        </div>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400">1件目をフォームに反映しました。掲載後に次の荷物が自動入力されます。</p>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-foreground/60" />
                    </div>
                  )}
                </div>
              ))}

              {isAiProcessing && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3" data-testid="ai-loading">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">考え中...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-border px-3 py-2.5 bg-background shrink-0" data-testid="chat-input-area">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] text-muted-foreground font-bold">入力方法:</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 cursor-default">テキスト</Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-mode-file"
                >
                  <Upload className="w-3 h-3 mr-0.5" /> ファイル
                </Badge>
                <Badge
                  variant={isRecording ? "destructive" : "outline"}
                  className="text-[10px] px-1.5 cursor-pointer"
                  onClick={isRecording ? stopRecording : startRecording}
                  data-testid="button-mode-voice"
                >
                  {isRecording ? <MicOff className="w-3 h-3 mr-0.5" /> : <Mic className="w-3 h-3 mr-0.5" />}
                  {isRecording ? "録音停止" : "音声"}
                </Badge>
                {isRecording && (
                  <span className="text-[10px] text-destructive font-bold animate-pulse">録音中...</span>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" data-testid="input-file-upload" />
              <div className="flex gap-2">
                <Textarea
                  placeholder="荷物情報を入力、またはデータを貼り付け..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  className="resize-none text-sm flex-1 min-h-[80px]"
                  data-testid="input-chat-text"
                />
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={() => sendChatMessage(chatInput)}
                    disabled={isAiProcessing || !chatInput.trim()}
                    size="icon"
                    data-testid="button-send-chat"
                  >
                    {isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => sendChatMessage("運賃はどれくらいが妥当ですか？")}
                    disabled={isAiProcessing || filledFieldCount < 3}
                    className="text-amber-600"
                    title="運賃の相談"
                    data-testid="button-ask-price"
                  >
                    <Banknote className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className={`border-l border-border bg-background overflow-y-auto w-full lg:w-[420px] ${mobileTab !== "form" ? "hidden lg:block" : ""}`}>
            <div
              className="sticky top-0 bg-background z-10 border-b border-border px-3 py-2 flex items-center justify-between gap-2"
              data-testid="form-panel-header"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">登録フォーム</span>
                {filledFieldCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{filledFieldCount}項目入力済</Badge>
                )}
              </div>
              {!isEditMode && (
                <Button variant="outline" size="sm" onClick={() => setShowCopyDialog(true)} data-testid="button-copy-past-cargo">
                  <Copy className="w-3 h-3 mr-1" />
                  過去案件コピー
                </Button>
              )}
            </div>

            {showCopyDialog && (
              <div className="border-b border-border bg-muted/30 p-3 max-h-[300px] overflow-y-auto">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold">過去の荷物からコピー</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowCopyDialog(false)} data-testid="button-close-copy-dialog">
                    閉じる
                  </Button>
                </div>
                {!myCargoList ? (
                  <div className="text-xs text-muted-foreground text-center py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-1" />読み込み中...</div>
                ) : myCargoList.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">過去の荷物情報がありません</div>
                ) : (
                  <div className="space-y-1">
                    {myCargoList.slice(0, 20).map((cargo) => (
                      <button
                        type="button"
                        key={cargo.id}
                        onClick={() => copyFromCargo(cargo)}
                        className="w-full text-left p-2 rounded-md hover-elevate border border-border text-xs"
                        data-testid={`button-copy-cargo-${cargo.id}`}
                      >
                        <div className="font-medium truncate">{cargo.title || `${cargo.departureArea}→${cargo.arrivalArea}`}</div>
                        <div className="text-muted-foreground mt-0.5">
                          {cargo.departureArea}→{cargo.arrivalArea} {cargo.vehicleType} {cargo.cargoType} {cargo.desiredDate}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">タイトル（任意）</FormLabel>
                        <FormControl><Input placeholder="例: 東京→大阪 食品 10t" {...field} className="h-8 text-xs" data-testid="input-cargo-title" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="transportType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">輸送形態</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-transport-type"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                          <SelectContent>{TRANSPORT_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-bold text-muted-foreground mb-2">発地情報</h3>
                      <div className="space-y-2">
                        <FormField control={form.control} name="departureArea" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">発地（都道府県）</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-departure"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                              <SelectContent>{AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="departureAddress" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">発地（詳細）</FormLabel>
                            <FormControl><Input placeholder="例: 横浜市中区" {...field} value={field.value || ""} className="h-8 text-xs" data-testid="input-departure-address" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-2">
                          <FormField control={form.control} name="desiredDate" render={({ field }) => {
                            const dateValue = field.value ? (() => { try { const p = parse(field.value, "yyyy/MM/dd", new Date()); return isNaN(p.getTime()) ? undefined : p; } catch { return undefined; } })() : undefined;
                            return (
                              <FormItem>
                                <FormLabel className="text-xs">発日</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-8 text-xs", !field.value && "text-muted-foreground")} data-testid="input-desired-date">
                                        <CalendarIcon className="mr-1.5 h-3 w-3" />
                                        {field.value || "日付選択"}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={dateValue} onSelect={(d) => { if (d) field.onChange(format(d, "yyyy/MM/dd")); }} locale={ja} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }} />
                          <FormField control={form.control} name="departureTime" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">発時間</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-departure-time"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                                <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-bold text-muted-foreground mb-2">着地情報</h3>
                      <div className="space-y-2">
                        <FormField control={form.control} name="arrivalArea" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">着地（都道府県）</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-arrival"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                              <SelectContent>{AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="arrivalAddress" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">着地（詳細）</FormLabel>
                            <FormControl><Input placeholder="例: 大阪市北区" {...field} value={field.value || ""} className="h-8 text-xs" data-testid="input-arrival-address" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-2">
                          <FormField control={form.control} name="arrivalDate" render={({ field }) => {
                            const dateValue = field.value ? (() => { try { const p = parse(field.value, "yyyy/MM/dd", new Date()); return isNaN(p.getTime()) ? undefined : p; } catch { return undefined; } })() : undefined;
                            return (
                              <FormItem>
                                <FormLabel className="text-xs">着日</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-8 text-xs", !field.value && "text-muted-foreground")} data-testid="input-arrival-date">
                                        <CalendarIcon className="mr-1.5 h-3 w-3" />
                                        {field.value || "日付選択"}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={dateValue} onSelect={(d) => { if (d) field.onChange(format(d, "yyyy/MM/dd")); }} locale={ja} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }} />
                          <FormField control={form.control} name="arrivalTime" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">着時間</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-arrival-time"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                                <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-bold text-muted-foreground mb-2">荷物情報（すべて任意）</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <FormField control={form.control} name="cargoType" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">荷種</FormLabel>
                              <FormControl><Input placeholder="例: 食品" {...field} className="h-8 text-xs" data-testid="input-cargo-type" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="weight" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">重量</FormLabel>
                              <FormControl><Input placeholder="例: 5t" {...field} className="h-8 text-xs" data-testid="input-weight" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <FormField control={form.control} name="packageCount" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">個数</FormLabel>
                              <FormControl><Input placeholder="例: 20パレット" {...field} value={field.value || ""} className="h-8 text-xs" data-testid="input-package-count" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="truckCount" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">台数</FormLabel>
                              <FormControl><Input placeholder="例: 1台" {...field} value={field.value || ""} className="h-8 text-xs" data-testid="input-truck-count" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="loadingMethod" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">荷姿</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-loading-method"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                                <SelectContent>{LOADING_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="temperatureControl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">温度管理</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-temp-control"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                              <SelectContent>{TEMP_CONTROLS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-bold text-muted-foreground mb-2">車両・作業条件</h3>
                      <div className="space-y-2">
                        <FormField control={form.control} name="vehicleType" render={({ field }) => {
                          const selected = field.value ? field.value.split(",").map(s => s.trim()).filter(Boolean) : [];
                          const toggle = (v: string) => { const next = selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]; field.onChange(next.join(", ")); };
                          return (
                            <FormItem>
                              <FormLabel className="text-xs">希望車種</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal min-h-8 h-auto text-xs", !field.value && "text-muted-foreground")} data-testid="select-vehicle-type">
                                      {selected.length > 0 ? <span className="flex flex-wrap gap-0.5">{selected.map(s => <Badge key={s} variant="secondary" className="text-[10px] px-1">{s}</Badge>)}</span> : "選択"}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2" align="start">
                                  <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                                    {VEHICLE_TYPES.map(v => (
                                      <label key={v} className="flex items-center gap-1 text-xs cursor-pointer hover-elevate rounded px-1 py-0.5">
                                        <input type="checkbox" checked={selected.includes(v)} onChange={() => toggle(v)} className="rounded border-border" data-testid={`checkbox-vehicle-${v}`} />{v}
                                      </label>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          );
                        }} />
                        <FormField control={form.control} name="bodyType" render={({ field }) => {
                          const selected = field.value ? field.value.split(",").map(s => s.trim()).filter(Boolean) : [];
                          const toggle = (v: string) => { const next = selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]; field.onChange(next.join(", ")); };
                          return (
                            <FormItem>
                              <FormLabel className="text-xs">車体タイプ（複数選択）</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal min-h-8 h-auto text-xs", !field.value && "text-muted-foreground")} data-testid="select-body-type">
                                      {selected.length > 0 ? <span className="flex flex-wrap gap-0.5">{selected.map(s => <Badge key={s} variant="secondary" className="text-[10px] px-1">{s}</Badge>)}</span> : "選択"}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-2" align="start">
                                  <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                                    {BODY_TYPES.map(b => (
                                      <label key={b} className="flex items-center gap-1 text-xs cursor-pointer hover-elevate rounded px-1 py-0.5">
                                        <input type="checkbox" checked={selected.includes(b)} onChange={() => toggle(b)} className="rounded border-border" data-testid={`checkbox-body-${b}`} />{b}
                                      </label>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          );
                        }} />
                        <div className="grid grid-cols-3 gap-2">
                          <FormField control={form.control} name="driverWork" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">作業</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-driver-work"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                                <SelectContent>{DRIVER_WORK_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="consolidation" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">積合</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-consolidation"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                                <SelectContent>{CONSOLIDATION_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="highwayFee" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">高速代</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-highway-fee"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                                <SelectContent>{HIGHWAY_FEE_OPTIONS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="equipment" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">必要装備</FormLabel>
                            <FormControl><Input placeholder="りん木、コンパネ、発泡、ラップ、ラッシング等" {...field} value={field.value || ""} className="h-8 text-xs" data-testid="input-equipment" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="vehicleSpec" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">車両指定</FormLabel>
                            <FormControl><Input placeholder="使用できる車両を指定する場合に入力" {...field} value={field.value || ""} className="h-8 text-xs" data-testid="input-vehicle-spec" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-bold text-muted-foreground mb-2">運賃</h3>
                      <div className="space-y-2">
                        <FormField control={form.control} name="price" render={({ field }) => {
                          const isNegotiable = field.value === "要相談";
                          return (
                          <FormItem>
                            <FormLabel className="text-xs">運賃 円(税別)</FormLabel>
                            <FormControl><Input placeholder="金額を入力" {...field} value={isNegotiable ? "" : (field.value || "")} disabled={isNegotiable} className="h-8 text-xs" data-testid="input-price" /></FormControl>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="checkbox"
                                checked={isNegotiable}
                                onChange={(e) => field.onChange(e.target.checked ? "要相談" : "")}
                                className="rounded border-border"
                                data-testid="checkbox-price-negotiable"
                              />
                              <span className="text-xs text-muted-foreground cursor-pointer" onClick={() => field.onChange(isNegotiable ? "" : "要相談")}>要相談</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                          );
                        }} />
                        <div>
                          <div className="text-xs font-medium mb-1">支払サイト</div>
                          <div className="h-8 flex items-center text-xs text-muted-foreground bg-muted/50 rounded-md px-3" data-testid="text-payment-terms">
                            {currentUser?.paymentTerms || currentUser?.closingDay || currentUser?.paymentMonth
                              ? [currentUser.closingDay && `締日: ${currentUser.closingDay}`, currentUser.paymentMonth && `支払月: ${currentUser.paymentMonth}`, currentUser.paymentTerms].filter(Boolean).join(" / ")
                              : "設定画面で支払サイトを登録してください"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <h3 className="text-xs font-bold text-muted-foreground mb-2">その他</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <FormField control={form.control} name="urgency" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">緊急度</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl><SelectTrigger className="h-8 text-xs" data-testid="select-urgency"><SelectValue placeholder="選択" /></SelectTrigger></FormControl>
                                <SelectContent>{URGENCY_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="contactPerson" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">担当者</FormLabel>
                              <FormControl><Input placeholder="担当者名" {...field} value={field.value || ""} className="h-8 text-xs" data-testid="input-contact-person" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <div className="flex items-center gap-4">
                          <FormField control={form.control} name="movingJob" render={({ field }) => (
                            <FormItem className="flex items-center gap-1.5 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value === "引っ越し案件"}
                                  onChange={(e) => field.onChange(e.target.checked ? "引っ越し案件" : "")}
                                  className="rounded border-border"
                                  data-testid="checkbox-moving-job"
                                />
                              </FormControl>
                              <FormLabel className="text-xs cursor-pointer">引っ越し案件</FormLabel>
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">備考</FormLabel>
                            <FormControl>
                              <Textarea placeholder="荷物の詳細や注意事項" className="resize-none min-h-[60px] text-xs" {...field} value={field.value || ""} data-testid="textarea-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {totalItems > 1 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-2 text-xs text-center" data-testid="text-queue-status">
                        {currentItemIndex + 1} / {totalItems} 件目を入力中（残り {pendingItems.length} 件）
                      </div>
                    )}

                    <div className="flex gap-2 sticky bottom-0 bg-background py-2">
                      {totalItems > 1 && pendingItems.length > 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          setPendingItems(prev => prev.slice(1));
                          setCurrentItemIndex(prev => prev + 1);
                          if (pendingItems.length <= 1) { setTotalItems(0); setCurrentItemIndex(0); setPendingItems([]); } else { loadNextPendingItem(); }
                        }} data-testid="button-skip-cargo">
                          スキップ
                        </Button>
                      )}
                      <Button type="submit" className="flex-1 text-sm font-bold" disabled={mutation.isPending} data-testid="button-submit-cargo">
                        {mutation.isPending ? (isEditMode ? "更新中..." : "掲載中...") : isEditMode ? "荷物情報を更新する" : totalItems > 1 ? `掲載する（${currentItemIndex + 1}/${totalItems}）` : "荷物情報を掲載する"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
