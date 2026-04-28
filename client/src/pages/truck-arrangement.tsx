import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Truck, Building2, Package, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import SeoHead from "@/components/seo/seo-head";

const formSchema = z.object({
  serviceType: z.enum(["スポット便", "定期便"], { required_error: "選択してください" }),
  pickupAddress: z.string().min(1, "積込先を入力してください"),
  pickupDate: z.string().optional(),
  pickupContact: z.string().optional(),
  deliveryAddress: z.string().min(1, "配送先を入力してください"),
  deliveryDate: z.string().optional(),
  deliveryContact: z.string().optional(),
  vehicleSize: z.string().optional(),
  vehicleCount: z.string().optional(),
  cargoDetails: z.string().optional(),
  additionalWork: z.string().optional(),
  desiredFare: z.string().optional(),
  highwayFee: z.string().optional(),
  paymentDate: z.string().optional(),
  remarks: z.string().optional(),
  companyName: z.string().min(1, "会社名を入力してください"),
  contactName: z.string().min(1, "担当者名を入力してください"),
  phone: z.string().min(1, "電話番号を入力してください"),
  fax: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-primary border-b border-primary/30 pb-2 mb-4">
      {icon}{children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      {children}
    </div>
  );
}

export default function TruckArrangement() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { serviceType: "スポット便" },
  });

  const serviceType = watch("serviceType");

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/truck-arrangement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("送信に失敗しました");
      return res.json();
    },
    onSuccess: () => setSubmitted(true),
    onError: () => toast({ title: "送信に失敗しました。時間をおいて再度お試しください。", variant: "destructive" }),
  });

  if (submitted) {
    return (
      <>
        <SeoHead title="トラック手配依頼 | TRA MATCH" description="TRA MATCHのトラック手配フォームです。スポット便・定期便のご依頼を承ります。" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">お問い合わせを受け付けました</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              内容を確認の上、担当者よりご連絡いたします。<br />
              通常1営業日以内にご返答いたします。
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">新しい依頼を送る</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead title="トラック手配依頼 | TRA MATCH" description="スポット便・定期便のトラック手配はTRA MATCHへ。全国対応、最短即日手配。まずはお気軽にお問い合わせください。" />
      <div>
        <section className="bg-primary text-primary-foreground py-12 px-4 text-center">
          <p className="text-sm font-semibold tracking-widest mb-2 opacity-80">TRUCK ARRANGEMENT</p>
          <h1 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3" data-testid="text-page-title">
            <Truck className="w-8 h-8" />荷主専用 トラック手配フォーム
          </h1>
          <p className="text-base opacity-90 max-w-xl mx-auto">
            スポット便・定期便のトラック手配を承ります。<br />
            全国対応・最短即日手配。まずはお気軽にご相談ください。
          </p>
        </section>

        <div className="max-w-2xl mx-auto px-4 py-10">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-8">

            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionTitle icon={<Package className="w-4 h-4" />}>注文内容</SectionTitle>

                <div className="space-y-5">
                  <Field label="便種" required>
                    <RadioGroup
                      value={serviceType}
                      onValueChange={v => setValue("serviceType", v as any)}
                      className="flex gap-6 pt-1"
                      data-testid="radio-service-type"
                    >
                      {["スポット便", "定期便"].map(t => (
                        <div key={t} className="flex items-center gap-2">
                          <RadioGroupItem value={t} id={`service-${t}`} data-testid={`radio-${t}`} />
                          <Label htmlFor={`service-${t}`} className="cursor-pointer font-normal">{t}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.serviceType && <p className="text-destructive text-xs">{errors.serviceType.message}</p>}
                  </Field>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">■ 積み込み</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="積込先" required>
                        <Input placeholder="住所・社名" data-testid="input-pickup-address" {...register("pickupAddress")} />
                        {errors.pickupAddress && <p className="text-destructive text-xs">{errors.pickupAddress.message}</p>}
                      </Field>
                      <Field label="集荷日">
                        <Input type="date" data-testid="input-pickup-date" {...register("pickupDate")} />
                      </Field>
                    </div>
                    <Field label="連絡先（積込先）">
                      <Input placeholder="担当者名・電話番号" data-testid="input-pickup-contact" {...register("pickupContact")} />
                    </Field>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">■ 配送</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="配送先" required>
                        <Input placeholder="住所・社名" data-testid="input-delivery-address" {...register("deliveryAddress")} />
                        {errors.deliveryAddress && <p className="text-destructive text-xs">{errors.deliveryAddress.message}</p>}
                      </Field>
                      <Field label="納品日">
                        <Input type="date" data-testid="input-delivery-date" {...register("deliveryDate")} />
                      </Field>
                    </div>
                    <Field label="連絡先（配送先）">
                      <Input placeholder="担当者名・電話番号" data-testid="input-delivery-contact" {...register("deliveryContact")} />
                    </Field>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">■ 車両・荷物</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="車格">
                        <Input placeholder="例：4t, 10t, 軽" data-testid="input-vehicle-size" {...register("vehicleSize")} />
                      </Field>
                      <Field label="台数">
                        <Input placeholder="例：2台" data-testid="input-vehicle-count" {...register("vehicleCount")} />
                      </Field>
                      <Field label="付帯作業有無">
                        <Input placeholder="有り：内容 / 無し" data-testid="input-additional-work" {...register("additionalWork")} />
                      </Field>
                    </div>
                    <Field label="物量・荷姿">
                      <Textarea
                        placeholder="例：パレット10枚、段ボール50箱、精密機器など"
                        className="min-h-[80px]"
                        data-testid="textarea-cargo-details"
                        {...register("cargoDetails")}
                      />
                    </Field>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">■ 費用・支払い</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="希望運賃（税別）">
                        <Input placeholder="例：50,000円" data-testid="input-desired-fare" {...register("desiredFare")} />
                      </Field>
                      <Field label="高速代有無">
                        <Input placeholder="有り / 無し / 要相談" data-testid="input-highway-fee" {...register("highwayFee")} />
                      </Field>
                      <Field label="お支払い日">
                        <Input placeholder="例：月末締め翌月末払い" data-testid="input-payment-date" {...register("paymentDate")} />
                      </Field>
                    </div>
                  </div>

                  <Field label="備考">
                    <Textarea
                      placeholder="その他ご要望・注意事項など"
                      className="min-h-[80px]"
                      data-testid="textarea-remarks"
                      {...register("remarks")}
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionTitle icon={<Building2 className="w-4 h-4" />}>お客様情報</SectionTitle>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="会社名" required>
                      <Input placeholder="株式会社〇〇" data-testid="input-company-name" {...register("companyName")} />
                      {errors.companyName && <p className="text-destructive text-xs">{errors.companyName.message}</p>}
                    </Field>
                    <Field label="担当者名" required>
                      <Input placeholder="山田 太郎" data-testid="input-contact-name" {...register("contactName")} />
                      {errors.contactName && <p className="text-destructive text-xs">{errors.contactName.message}</p>}
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="電話番号" required>
                      <Input type="tel" placeholder="03-0000-0000" data-testid="input-phone" {...register("phone")} />
                      {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                    </Field>
                    <Field label="FAX番号">
                      <Input type="tel" placeholder="03-0000-0001" data-testid="input-fax" {...register("fax")} />
                    </Field>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12 text-base" disabled={mutation.isPending} data-testid="button-submit">
              {mutation.isPending ? "送信中..." : (
                <><Truck className="w-5 h-5 mr-2" />この内容で依頼する<ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              送信後、担当者より1営業日以内にご連絡いたします
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
