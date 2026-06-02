"use client";

import { logoutAction } from "@/app/actions/auth";
import { AppLayout } from "@/components/app-layout";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDemoStore } from "@/components/demo-store-provider";
import { calculateScore } from "@/lib/calculations";

export default function PerfilPage() {
  const { store, currentUserId } = useDemoStore();
  const profile = store.profiles.find((item) => item.id === currentUserId);
  const attempts = store.attempts.filter((item) => item.student_id === profile?.id);
  const score = calculateScore(
    attempts.reduce((sum, item) => sum + item.correct_answers, 0),
    attempts.reduce((sum, item) => sum + item.total_questions, 0),
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Perfil</h1>
          <p className="text-sm text-slate-500">Dados institucionais e resumo da evolução.</p>
        </div>
        <Card>
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold">{profile?.full_name}</p>
            <p className="text-sm text-slate-600">{profile?.email}</p>
            <StudentStatusBadge score={score} />
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Sair
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
