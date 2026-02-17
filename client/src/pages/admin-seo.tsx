import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Sparkles, FileText, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

export default function AdminSeo() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">SEO記事生成</h1>
          <p className="text-sm text-muted-foreground mt-1">AIによるSEO対策記事の自動生成</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI記事生成
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="seo-topic">記事テーマ</Label>
                  <Input
                    id="seo-topic"
                    placeholder="例: 求荷求車サービスのメリット"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1"
                    data-testid="input-seo-topic"
                  />
                </div>
                <div>
                  <Label htmlFor="seo-keywords">キーワード（カンマ区切り）</Label>
                  <Input id="seo-keywords" placeholder="例: 求荷求車, マッチング, 運送" className="mt-1" data-testid="input-seo-keywords" />
                </div>
                <div>
                  <Label htmlFor="seo-notes">備考・指示</Label>
                  <Textarea id="seo-notes" placeholder="記事の方向性や含めたい情報など..." className="mt-1 min-h-[80px]" data-testid="input-seo-notes" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => toast({ title: "記事を生成中です...", description: "AI機能は準備中です" })}
                  data-testid="button-generate-article"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  AIで記事を生成
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                生成された記事
              </h2>
              <div className="text-center py-6">
                <PenTool className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground" data-testid="text-empty-state">生成された記事はありません</p>
                <p className="text-xs text-muted-foreground mt-1">テーマとキーワードを入力してAIで記事を生成できます</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
