import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Mail } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";

export default function Partners() {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/partners/invite", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "招待メールを送信しました" });
      setInviteEmail("");
    },
    onError: (error: Error) => {
      toast({ title: "招待に失敗しました", description: error.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">取引先招待</h1>
          <p className="text-sm text-muted-foreground mt-1">メールで取引先をトラマッチに招待できます</p>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-8 text-center">
            <UserPlus className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2" data-testid="text-invite-heading">取引先を招待</h2>
            <p className="text-sm text-muted-foreground mb-6">メールアドレスを入力して取引先をトラマッチに招待しましょう</p>
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="メールアドレスを入力..."
                    className="pl-9 text-sm"
                    data-testid="input-invite-email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inviteEmail.trim()) {
                        inviteMutation.mutate(inviteEmail);
                      }
                    }}
                  />
                </div>
                <Button
                  data-testid="button-send-invite"
                  onClick={() => inviteMutation.mutate(inviteEmail)}
                  disabled={inviteMutation.isPending || !inviteEmail.trim()}
                >
                  {inviteMutation.isPending ? "送信中..." : "招待する"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
