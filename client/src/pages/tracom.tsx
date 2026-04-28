import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Star, Share2, MessageSquarePlus, Copy, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import { SiLine } from "react-icons/si";
import { SiX } from "react-icons/si";

type TracomReview = {
  id: string;
  category: string;
  targetName: string | null;
  rating: number;
  title: string;
  body: string;
  tags: string[];
  nickname: string | null;
  experience: string | null;
  prefecture: string | null;
  workStyle: string | null;
  createdAt: string;
};

const CATEGORIES = ["すべて", "荷主企業", "運送会社", "ドライバー", "その他"];

const CATEGORY_COLORS: Record<string, string> = {
  "荷主企業": "bg-blue-100 text-blue-700 border-blue-200",
  "運送会社": "bg-green-100 text-green-700 border-green-200",
  "ドライバー": "bg-orange-100 text-orange-700 border-orange-200",
  "その他": "bg-gray-100 text-gray-700 border-gray-200",
};

const reviewSchema = z.object({
  category: z.string().min(1, "カテゴリを選択してください"),
  targetName: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "タイトルを入力してください").max(100),
  body: z.string().min(10, "10文字以上入力してください").max(1000),
  tagsInput: z.string().optional(),
  nickname: z.string().optional(),
  experience: z.string().optional(),
  prefecture: z.string().optional(),
  workStyle: z.string().optional(),
});

function StarRating({ value, onChange, readonly = false, size = "md" }: { value: number; onChange?: (v: number) => void; readonly?: boolean; size?: "sm" | "md" | "lg" }) {
  const [hover, setHover] = useState(0);
  const sz = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} transition-colors ${!readonly ? "cursor-pointer" : ""} ${(hover || value) >= n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        />
      ))}
    </div>
  );
}

function ShareButtons({ review }: { review: TracomReview }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/tracom` : "";
  const text = `【トラコミ】${review.title} ★${review.rating}`;
  const { toast } = useToast();
  return (
    <div className="flex items-center gap-2">
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="share-x">
        <SiX className="w-4 h-4" />
      </a>
      <a href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-green-600 transition-colors" data-testid="share-line">
        <SiLine className="w-4 h-4" />
      </a>
      <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="share-copy"
        onClick={() => { navigator.clipboard.writeText(`${text} ${url}`); toast({ title: "コピーしました" }); }}>
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function TracomPage() {
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [showDialog, setShowDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: stats } = useQuery<{ avg: number; count: number }>({ queryKey: ["/api/tracom-reviews/stats"] });
  const { data: reviews = [], isLoading } = useQuery<TracomReview[]>({
    queryKey: ["/api/tracom-reviews", activeCategory],
    queryFn: () => fetch(`/api/tracom-reviews${activeCategory !== "すべて" ? `?category=${encodeURIComponent(activeCategory)}` : ""}`).then(r => r.json()),
  });

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { category: "", targetName: "", rating: 0, title: "", body: "", tagsInput: "", nickname: "", experience: "", prefecture: "", workStyle: "" },
  });

  const submitMutation = useMutation({
    mutationFn: (data: z.infer<typeof reviewSchema>) => {
      const tags = (data.tagsInput || "").split(/[,、\s]+/).map(t => t.trim().replace(/^#/, "")).filter(Boolean);
      return apiRequest("POST", "/api/tracom-reviews", { ...data, tags, tagsInput: undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracom-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracom-reviews/stats"] });
      setSubmitted(true);
    },
    onError: () => toast({ title: "送信に失敗しました", variant: "destructive" }),
  });

  const avgStr = stats ? stats.avg.toFixed(1) : "0.0";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-14 px-4 text-center">
        <p className="text-sm font-semibold tracking-widest mb-2 opacity-80">TRA COMI</p>
        <h1 className="text-4xl font-bold mb-3" data-testid="text-page-title">トラコミ（口コミ）</h1>
        <p className="text-base opacity-90 mb-1">運送会社・荷主によるリアルな口コミ・体験談掲示板。</p>
        <p className="text-base opacity-90 mb-6">取引先の実態や働き方など、役立つ情報を共有しましょう。</p>
        {stats && stats.count > 0 && (
          <button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 border border-primary-foreground/40 text-primary-foreground rounded-full px-6 py-2 font-semibold transition-colors" data-testid="button-stats">
            <StarRating value={Math.round(stats.avg)} readonly size="sm" />
            <span>{avgStr}</span>
            <span className="opacity-80">（{stats.count}件の口コミ）</span>
          </button>
        )}
        {(!stats || stats.count === 0) && (
          <Button onClick={() => setShowDialog(true)} variant="outline" className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20" data-testid="button-write-review">
            <MessageSquarePlus className="w-4 h-4 mr-2" />口コミを書く
          </Button>
        )}
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Filter + button */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"}`}
                data-testid={`filter-${cat}`}>
                {cat}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowDialog(true)} size="sm" data-testid="button-write-review-top">
            <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />口コミを書く
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-44 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquarePlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>口コミはまだありません</p>
            <p className="text-sm mt-1">最初の口コミを書いてみましょう</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <Card key={review.id} className="border" data-testid={`card-review-${review.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Share2 className="w-3.5 h-3.5" />シェアする
                    </span>
                    <ShareButtons review={review} />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[review.category] || "bg-gray-100 text-gray-600"}`}>{review.category}</span>
                    {review.targetName && <span className="text-xs text-muted-foreground">対象：{review.targetName}</span>}
                    <StarRating value={review.rating} readonly size="sm" />
                    <span className="text-sm font-bold text-yellow-500">{review.rating}.0</span>
                  </div>
                  <h3 className="font-bold text-primary mb-1.5" data-testid={`text-review-title-${review.id}`}>{review.title}</h3>
                  <p className="text-sm text-foreground leading-relaxed mb-3">{review.body}</p>
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {review.tags.map(tag => <span key={tag} className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded">#{tag}</span>)}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {review.experience && <span><Briefcase className="w-3 h-3 inline mr-0.5" />{review.experience}</span>}
                      {review.prefecture && <span><MapPin className="w-3 h-3 inline mr-0.5" />{review.prefecture}</span>}
                      {review.workStyle && <span>{review.workStyle}</span>}
                    </div>
                    <span>{new Date(review.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {reviews.length > 0 && (
          <div className="text-center mt-10">
            <p className="text-muted-foreground mb-3">あなたの体験を共有しませんか？</p>
            <Button onClick={() => setShowDialog(true)} data-testid="button-write-review-bottom">
              <MessageSquarePlus className="w-4 h-4 mr-2" />口コミを書く
            </Button>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(o) => { setShowDialog(o); if (!o) { setSubmitted(false); form.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>口コミを書く</DialogTitle>
          </DialogHeader>
          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">ありがとうございました！</h3>
              <p className="text-muted-foreground text-sm">口コミを受け付けました。<br />管理者確認後に公開されます。</p>
              <Button className="mt-6" onClick={() => { setShowDialog(false); setSubmitted(false); form.reset(); }}>閉じる</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => submitMutation.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>カテゴリ <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-category"><SelectValue placeholder="選択してください" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["荷主企業", "運送会社", "ドライバー", "その他"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="targetName" render={({ field }) => (
                  <FormItem><FormLabel>対象企業名・会社名（任意）</FormLabel>
                    <FormControl><Input placeholder="例：〇〇運輸" {...field} data-testid="input-target-name" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="rating" render={({ field }) => (
                  <FormItem><FormLabel>評価 <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div data-testid="rating-stars">
                        <StarRating value={field.value} onChange={field.onChange} />
                        {field.value > 0 && <span className="text-sm text-muted-foreground ml-2">{field.value}.0</span>}
                      </div>
                    </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>タイトル <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="例：支払いが安定していて良い" {...field} data-testid="input-title" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="body" render={({ field }) => (
                  <FormItem><FormLabel>本文 <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Textarea rows={4} placeholder="体験談や詳細を入力してください" {...field} data-testid="input-body" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tagsInput" render={({ field }) => (
                  <FormItem><FormLabel>タグ（任意、カンマ区切り）</FormLabel>
                    <FormControl><Input placeholder="例：スポット,関東,大型" {...field} data-testid="input-tags" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem><FormLabel>経歴・立場（任意）</FormLabel>
                      <FormControl><Input placeholder="例：ドライバー歴3年" {...field} data-testid="input-experience" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="prefecture" render={({ field }) => (
                    <FormItem><FormLabel>都道府県（任意）</FormLabel>
                      <FormControl><Input placeholder="例：東京都" {...field} data-testid="input-prefecture" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="nickname" render={({ field }) => (
                  <FormItem><FormLabel>ニックネーム（任意）</FormLabel>
                    <FormControl><Input placeholder="例：関東ドライバー" {...field} data-testid="input-nickname" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">キャンセル</Button>
                  <Button type="submit" className="flex-1" disabled={submitMutation.isPending} data-testid="button-submit-review">
                    {submitMutation.isPending ? "送信中..." : "投稿する"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
