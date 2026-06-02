"use client";

import { useDemoStore } from "@/components/demo-store-provider";
import { calculateAreaPerformance, calculateScore } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  const { store } = useDemoStore();
  const finishedAttempts = store.attempts.filter((item) => item.finished_at);
  const percent = calculateScore(
    finishedAttempts.reduce((sum, item) => sum + item.correct_answers, 0),
    finishedAttempts.reduce((sum, item) => sum + item.total_questions, 0),
  );
  const area = calculateAreaPerformance(store.answers, store.questions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-sm text-slate-500">Visão geral de progresso, risco e desempenho.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Acerto médio geral</p>
            <p className="text-3xl font-semibold">{Math.round(percent)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Alunos em atenção</p>
            <p className="text-3xl font-semibold">
              {store.profiles.filter((item) => item.role === "student").length}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="space-y-2">
          {area.map((item) => (
            <div key={item.area} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span>{item.area}</span>
              <span>{Math.round(item.percent)}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
