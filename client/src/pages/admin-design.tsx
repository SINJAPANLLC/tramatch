import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Target, BarChart3, ListChecks, CheckSquare, StickyNote, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";

const STORAGE_KEY = "tra-match-design-data";

type TodoItem = { id: string; text: string; done: boolean; priority: "high" | "medium" | "low" };
type KGIItem = { id: string; goal: string; metric: string; target: string; current: string };
type KPIItem = { id: string; name: string; metric: string; target: string; current: string; linkedKgi: string };
type KTFItem = { id: string; factor: string; description: string; status: "not_started" | "in_progress" | "done" };

type DesignData = {
  designThinking: {
    purpose: string;
    customerProblem: string;
    solution: string;
    alternatives: string;
    numbers: string;
    team: string;
    afterExecution: string;
    operationLoop: string;
  };
  kgiItems: KGIItem[];
  kpiItems: KPIItem[];
  ktfItems: KTFItem[];
  todoItems: TodoItem[];
  memo: string;
};

const defaultData: DesignData = {
  designThinking: { purpose: "", customerProblem: "", solution: "", alternatives: "", numbers: "", team: "", afterExecution: "", operationLoop: "" },
  kgiItems: [],
  kpiItems: [],
  ktfItems: [],
  todoItems: [],
  memo: "",
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function AdminDesign() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("design-thinking");
  const [data, setData] = useState<DesignData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch {
      return defaultData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast({ title: "保存しました" });
  }

  function updateDesignThinking(field: keyof DesignData["designThinking"], value: string) {
    setData(prev => ({ ...prev, designThinking: { ...prev.designThinking, [field]: value } }));
  }

  function addKGI() {
    setData(prev => ({ ...prev, kgiItems: [...prev.kgiItems, { id: genId(), goal: "", metric: "", target: "", current: "" }] }));
  }
  function updateKGI(id: string, field: keyof KGIItem, value: string) {
    setData(prev => ({ ...prev, kgiItems: prev.kgiItems.map(k => k.id === id ? { ...k, [field]: value } : k) }));
  }
  function removeKGI(id: string) {
    setData(prev => ({ ...prev, kgiItems: prev.kgiItems.filter(k => k.id !== id) }));
  }

  function addKPI() {
    setData(prev => ({ ...prev, kpiItems: [...prev.kpiItems, { id: genId(), name: "", metric: "", target: "", current: "", linkedKgi: "" }] }));
  }
  function updateKPI(id: string, field: keyof KPIItem, value: string) {
    setData(prev => ({ ...prev, kpiItems: prev.kpiItems.map(k => k.id === id ? { ...k, [field]: value } : k) }));
  }
  function removeKPI(id: string) {
    setData(prev => ({ ...prev, kpiItems: prev.kpiItems.filter(k => k.id !== id) }));
  }

  function addKTF() {
    setData(prev => ({ ...prev, ktfItems: [...prev.ktfItems, { id: genId(), factor: "", description: "", status: "not_started" as const }] }));
  }
  function updateKTF(id: string, field: keyof KTFItem, value: string) {
    setData(prev => ({ ...prev, ktfItems: prev.ktfItems.map(k => k.id === id ? { ...k, [field]: value } : k) }));
  }
  function removeKTF(id: string) {
    setData(prev => ({ ...prev, ktfItems: prev.ktfItems.filter(k => k.id !== id) }));
  }

  function addTodo() {
    setData(prev => ({ ...prev, todoItems: [...prev.todoItems, { id: genId(), text: "", done: false, priority: "medium" as const }] }));
  }
  function updateTodo(id: string, field: keyof TodoItem, value: string | boolean) {
    setData(prev => ({ ...prev, todoItems: prev.todoItems.map(t => t.id === id ? { ...t, [field]: value } : t) }));
  }
  function removeTodo(id: string) {
    setData(prev => ({ ...prev, todoItems: prev.todoItems.filter(t => t.id !== id) }));
  }

  const dtSteps = [
    { key: "purpose" as const, label: "目的", desc: "なぜやるか", color: "bg-rose-50 border-rose-200", placeholder: "このプロジェクト・施策をなぜやるのか？\n背景・動機・ビジョンを記載..." },
    { key: "customerProblem" as const, label: "顧客課題", desc: "困りごと", color: "bg-amber-50 border-amber-200", placeholder: "顧客が抱えている課題・困りごとは何か？\nペインポイント・未充足ニーズを整理..." },
    { key: "solution" as const, label: "解決策", desc: "差別化/戦略/マーケ/どう解くか", color: "bg-emerald-50 border-emerald-200", placeholder: "どう解決するか？\n差別化ポイント・戦略・マーケティング方針・具体的な解き方..." },
    { key: "alternatives" as const, label: "代替案と却下理由", desc: "他案/なぜ捨てるか", color: "bg-teal-50 border-teal-200", placeholder: "検討した他の案は？\nなぜその案を採用しなかったか（却下理由）..." },
    { key: "numbers" as const, label: "数字", desc: "モデル・KGI逆算・コスト・利益・リスク・拡大・CF", color: "bg-sky-50 border-sky-200", placeholder: "ビジネスモデル・収益構造...\nKGIからの逆算...\nコスト・利益試算...\nリスク分析...\nスケール計画...\nキャッシュフロー..." },
    { key: "team" as const, label: "責任者/チーム/セル生産/割り振り", desc: "役割設計", color: "bg-indigo-50 border-indigo-200", placeholder: "責任者は誰か？\nチーム構成・役割分担...\nセル生産体制...\nタスクの割り振り..." },
    { key: "afterExecution" as const, label: "実行後の世界", desc: "成功/失敗の線引き", color: "bg-violet-50 border-violet-200", placeholder: "成功した場合の世界像...\n失敗した場合の撤退ライン...\n成功/失敗の判断基準（数値・期限）..." },
    { key: "operationLoop" as const, label: "到達思考→行動→継続→改善", desc: "運用ループ・逆説", color: "bg-fuchsia-50 border-fuchsia-200", placeholder: "ゴールから逆算した行動計画...\n継続の仕組み...\n改善サイクル（PDCA）...\n逆説的に考えると何が見えるか..." },
  ];

  const priorityColors = { high: "destructive", medium: "default", low: "secondary" } as const;
  const priorityLabels = { high: "高", medium: "中", low: "低" };
  const ktfStatusLabels = { not_started: "未着手", in_progress: "進行中", done: "完了" };
  const ktfStatusColors = { not_started: "secondary", in_progress: "default", done: "outline" } as const;

  const todoCompleted = data.todoItems.filter(t => t.done).length;
  const todoTotal = data.todoItems.length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6" data-testid="admin-design-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Lightbulb className="w-6 h-6 text-primary" />
              設計ページ
            </h1>
            <p className="text-sm text-muted-foreground mt-1">プロジェクトの設計思考・目標・タスクを管理します</p>
          </div>
          <Button onClick={handleSave} data-testid="button-save-all">
            <Save className="w-4 h-4 mr-1" />保存
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1" data-testid="tabs-design">
            <TabsTrigger value="design-thinking" data-testid="tab-design-thinking">
              <Lightbulb className="w-4 h-4 mr-1" />設計思考
            </TabsTrigger>
            <TabsTrigger value="kgi" data-testid="tab-kgi">
              <Target className="w-4 h-4 mr-1" />KGI
            </TabsTrigger>
            <TabsTrigger value="kpi" data-testid="tab-kpi">
              <BarChart3 className="w-4 h-4 mr-1" />KPI
            </TabsTrigger>
            <TabsTrigger value="ktf" data-testid="tab-ktf">
              <ListChecks className="w-4 h-4 mr-1" />KTF
            </TabsTrigger>
            <TabsTrigger value="todo" data-testid="tab-todo">
              <CheckSquare className="w-4 h-4 mr-1" />Todo {todoTotal > 0 && `(${todoCompleted}/${todoTotal})`}
            </TabsTrigger>
            <TabsTrigger value="memo" data-testid="tab-memo">
              <StickyNote className="w-4 h-4 mr-1" />MEMO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design-thinking" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">デザイン思考の5つのステップに沿って、プロジェクトの設計を整理します。</p>
            <div className="space-y-4">
              {dtSteps.map((step, i) => (
                <Card key={step.key} className={`border ${step.color}`} data-testid={`card-dt-${step.key}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-foreground">{i + 1}.</span>
                      <span className="text-sm font-bold text-foreground">{step.label}</span>
                      <span className="text-xs text-muted-foreground ml-1">— {step.desc}</span>
                    </div>
                    <Textarea
                      className="min-h-[120px] text-sm bg-white/80"
                      value={data.designThinking[step.key]}
                      onChange={(e) => updateDesignThinking(step.key, e.target.value)}
                      placeholder={step.placeholder}
                      data-testid={`input-dt-${step.key}`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kgi" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">KGI（重要目標達成指標）</p>
                <p className="text-xs text-muted-foreground">Key Goal Indicator — 最終的に達成すべきゴールを設定します</p>
              </div>
              <Button size="sm" onClick={addKGI} data-testid="button-add-kgi">
                <Plus className="w-4 h-4 mr-1" />追加
              </Button>
            </div>
            {data.kgiItems.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">KGIが設定されていません。「追加」ボタンから目標を設定してください。</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {data.kgiItems.map((item) => (
                  <Card key={item.id} data-testid={`card-kgi-${item.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-foreground">目標</label>
                            <Input className="mt-1 text-sm" value={item.goal} onChange={(e) => updateKGI(item.id, "goal", e.target.value)} placeholder="例: 月間売上1億円" data-testid={`input-kgi-goal-${item.id}`} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">指標</label>
                            <Input className="mt-1 text-sm" value={item.metric} onChange={(e) => updateKGI(item.id, "metric", e.target.value)} placeholder="例: 月間売上額" data-testid={`input-kgi-metric-${item.id}`} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">目標値</label>
                            <Input className="mt-1 text-sm" value={item.target} onChange={(e) => updateKGI(item.id, "target", e.target.value)} placeholder="例: 1億円" data-testid={`input-kgi-target-${item.id}`} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">現在値</label>
                            <Input className="mt-1 text-sm" value={item.current} onChange={(e) => updateKGI(item.id, "current", e.target.value)} placeholder="例: 3,000万円" data-testid={`input-kgi-current-${item.id}`} />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0 mt-4" onClick={() => removeKGI(item.id)} data-testid={`button-remove-kgi-${item.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {item.target && item.current && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (parseFloat(item.current.replace(/[^0-9.]/g, "")) / parseFloat(item.target.replace(/[^0-9.]/g, "")) * 100) || 0)}%` }} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kpi" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">KPI（重要業績評価指標）</p>
                <p className="text-xs text-muted-foreground">Key Performance Indicator — KGI達成に向けた中間指標を設定します</p>
              </div>
              <Button size="sm" onClick={addKPI} data-testid="button-add-kpi">
                <Plus className="w-4 h-4 mr-1" />追加
              </Button>
            </div>
            {data.kpiItems.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">KPIが設定されていません。「追加」ボタンから指標を設定してください。</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {data.kpiItems.map((item) => (
                  <Card key={item.id} data-testid={`card-kpi-${item.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-foreground">KPI名</label>
                            <Input className="mt-1 text-sm" value={item.name} onChange={(e) => updateKPI(item.id, "name", e.target.value)} placeholder="例: 新規登録ユーザー数" data-testid={`input-kpi-name-${item.id}`} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">指標</label>
                            <Input className="mt-1 text-sm" value={item.metric} onChange={(e) => updateKPI(item.id, "metric", e.target.value)} placeholder="例: 月間登録数" data-testid={`input-kpi-metric-${item.id}`} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">関連KGI</label>
                            <Input className="mt-1 text-sm" value={item.linkedKgi} onChange={(e) => updateKPI(item.id, "linkedKgi", e.target.value)} placeholder="例: 月間売上1億円" data-testid={`input-kpi-linked-${item.id}`} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">目標値</label>
                            <Input className="mt-1 text-sm" value={item.target} onChange={(e) => updateKPI(item.id, "target", e.target.value)} placeholder="例: 500人/月" data-testid={`input-kpi-target-${item.id}`} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">現在値</label>
                            <Input className="mt-1 text-sm" value={item.current} onChange={(e) => updateKPI(item.id, "current", e.target.value)} placeholder="例: 120人/月" data-testid={`input-kpi-current-${item.id}`} />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0 mt-4" onClick={() => removeKPI(item.id)} data-testid={`button-remove-kpi-${item.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {item.target && item.current && (
                        <div className="w-full bg-muted rounded-full h-2 mt-3">
                          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (parseFloat(item.current.replace(/[^0-9.]/g, "")) / parseFloat(item.target.replace(/[^0-9.]/g, "")) * 100) || 0)}%` }} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ktf" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">KTF（重要成功要因）</p>
                <p className="text-xs text-muted-foreground">Key Task Factor — 目標達成に必要な重要な施策・要因を管理します</p>
              </div>
              <Button size="sm" onClick={addKTF} data-testid="button-add-ktf">
                <Plus className="w-4 h-4 mr-1" />追加
              </Button>
            </div>
            {data.ktfItems.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">KTFが設定されていません。「追加」ボタンから成功要因を設定してください。</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {data.ktfItems.map((item) => (
                  <Card key={item.id} data-testid={`card-ktf-${item.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-bold text-foreground">成功要因</label>
                              <Input className="mt-1 text-sm" value={item.factor} onChange={(e) => updateKTF(item.id, "factor", e.target.value)} placeholder="例: SNSマーケティング強化" data-testid={`input-ktf-factor-${item.id}`} />
                            </div>
                            <div className="shrink-0">
                              <label className="text-xs font-bold text-foreground">ステータス</label>
                              <div className="flex gap-1 mt-1">
                                {(["not_started", "in_progress", "done"] as const).map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => updateKTF(item.id, "status", s)}
                                    className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-colors ${
                                      item.status === s ? "border-primary bg-primary/10 text-foreground font-medium" : "border-border text-muted-foreground hover:border-primary/40"
                                    }`}
                                    data-testid={`ktf-status-${item.id}-${s}`}
                                  >
                                    {ktfStatusLabels[s]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-foreground">詳細</label>
                            <Textarea className="mt-1 text-sm min-h-[60px]" value={item.description} onChange={(e) => updateKTF(item.id, "description", e.target.value)} placeholder="具体的な内容・アクションプランを記載..." data-testid={`input-ktf-desc-${item.id}`} />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0 mt-4" onClick={() => removeKTF(item.id)} data-testid={`button-remove-ktf-${item.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="todo" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Todoリスト</p>
                <p className="text-xs text-muted-foreground">
                  タスクの進捗を管理します
                  {todoTotal > 0 && ` — ${todoCompleted}/${todoTotal} 完了 (${Math.round(todoCompleted / todoTotal * 100)}%)`}
                </p>
              </div>
              <Button size="sm" onClick={addTodo} data-testid="button-add-todo">
                <Plus className="w-4 h-4 mr-1" />追加
              </Button>
            </div>
            {todoTotal > 0 && (
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary rounded-full h-2.5 transition-all" style={{ width: `${todoTotal > 0 ? (todoCompleted / todoTotal * 100) : 0}%` }} />
              </div>
            )}
            {data.todoItems.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Todoがありません。「追加」ボタンからタスクを追加してください。</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {data.todoItems.map((item) => (
                  <Card key={item.id} className={item.done ? "opacity-60" : ""} data-testid={`card-todo-${item.id}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateTodo(item.id, "done", !item.done)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          item.done ? "bg-primary border-primary text-white" : "border-muted-foreground/30 hover:border-primary"
                        }`}
                        data-testid={`checkbox-todo-${item.id}`}
                      >
                        {item.done && <CheckSquare className="w-3 h-3" />}
                      </button>
                      <Input
                        className={`flex-1 text-sm border-0 shadow-none focus-visible:ring-0 px-0 ${item.done ? "line-through text-muted-foreground" : ""}`}
                        value={item.text}
                        onChange={(e) => updateTodo(item.id, "text", e.target.value)}
                        placeholder="タスクを入力..."
                        data-testid={`input-todo-${item.id}`}
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        {(["high", "medium", "low"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => updateTodo(item.id, "priority", p)}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                              item.priority === p
                                ? p === "high" ? "bg-red-100 text-red-700 font-medium" : p === "medium" ? "bg-amber-100 text-amber-700 font-medium" : "bg-slate-100 text-slate-600 font-medium"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                            data-testid={`todo-priority-${item.id}-${p}`}
                          >
                            {priorityLabels[p]}
                          </button>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0 h-7 w-7 p-0" onClick={() => removeTodo(item.id)} data-testid={`button-remove-todo-${item.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="memo" className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-bold text-foreground">メモ</p>
              <p className="text-xs text-muted-foreground">自由にメモを記録できます。アイデア、議事録、備考などに活用してください。</p>
            </div>
            <Card>
              <CardContent className="p-4">
                <Textarea
                  className="min-h-[500px] text-sm"
                  value={data.memo}
                  onChange={(e) => setData(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder={"自由にメモを記入してください...\n\n例:\n・次回ミーティングのアジェンダ\n・改善アイデア\n・参考URL\n・議事録"}
                  data-testid="input-memo"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
