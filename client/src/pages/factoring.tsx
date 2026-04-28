import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Banknote, CheckCircle2, Building2, User, Phone, Mail, Wallet, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  companyName: z.string().min(1, "会社名を入力してください"),
  contactName: z.string().min(1, "担当者名を入力してください"),
  phone: z.string().min(1, "電話番号を入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  receivableAmount: z.string().optional(),
  desiredTiming: z.string().optional(),
  message: z.string().min(1, "お問い合わせ内容を入力してください"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FactoringPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      phone: "",
      email: "",
      receivableAmount: "",
      desiredTiming: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("POST", "/api/factoring-inquiry", data),
    onSuccess: () => setSubmitted(true),
    onError: () => toast({ title: "送信に失敗しました", description: "しばらく経ってから再度お試しください。", variant: "destructive" }),
  });

  if (submitted) {
    return (
      <div className="min-h-screen">
        <section className="bg-primary text-primary-foreground py-14 px-4 text-center">
          <p className="text-sm font-semibold tracking-widest mb-2 opacity-80">FACTORING SERVICE</p>
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <Banknote className="w-9 h-9" />ファクタリングサービス
          </h1>
        </section>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3" data-testid="text-submitted">お問い合わせを受け付けました</h2>
          <p className="text-muted-foreground leading-relaxed">
            内容を確認のうえ、担当者よりご連絡いたします。<br />
            しばらくお待ちください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground py-14 px-4 text-center">
        <p className="text-sm font-semibold tracking-widest mb-2 opacity-80">FACTORING SERVICE</p>
        <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3" data-testid="text-page-title">
          <Banknote className="w-9 h-9" />ファクタリングサービス
        </h1>
        <p className="text-base opacity-90">売掛金を早期資金化。運送会社のキャッシュフローを改善します。</p>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground mb-8">
          ファクタリングサービスのご利用・ご相談はこちらからお問い合わせください。<br />
          担当者より折り返しご連絡いたします。
        </p>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">

                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Building2 className="w-4 h-4" />会社名 <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="株式会社〇〇運輸" data-testid="input-company-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" />担当者名 <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="山田 太郎" data-testid="input-contact-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4" />電話番号 <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="03-0000-0000" data-testid="input-phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" />メールアドレス <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@example.com" data-testid="input-email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="receivableAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Wallet className="w-4 h-4" />売掛金額（概算）</FormLabel>
                      <FormControl>
                        <Input placeholder="例：500万円" data-testid="input-receivable-amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="desiredTiming" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4" />ご利用希望時期</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-desired-timing">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">すぐにでも</SelectItem>
                          <SelectItem value="within_month">1ヶ月以内</SelectItem>
                          <SelectItem value="within_3months">3ヶ月以内</SelectItem>
                          <SelectItem value="consulting">まずは相談したい</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />お問い合わせ内容 <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ご質問・ご要望などをご記入ください"
                        className="min-h-[120px]"
                        data-testid="textarea-message"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "送信中..." : "お問い合わせを送信する"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
