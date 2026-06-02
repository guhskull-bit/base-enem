"use client";

import { AppLayout } from "@/components/app-layout";
import { AreaPerformanceCard } from "@/components/area-performance-card";
import { MetricCard } from "@/components/metric-card";
import { useDemoStore } from "@/components/demo-store-provider";
import {
  calculateAttemptTime,
  calculateAreaPerformance,
  calculateScore,
  calculateSubjectPerformance,
  calculateTopicDifficulties,
} from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, CheckCircle2, Clock3, Target, XCircle } from "lucide-react";
import { useMemo } from "react";

export function ExamResultPageClient({ id }: { id: string }) {
  const { store, currentUserId } = useDemoStore();
  const profile = store.profiles.find((item) => item.id === currentUserId);
  const attempts = store.attempts.filter((item) => item.student_id === profile?.id);
  const lastAttempt = attempts[0];
  const answers = store.answers.filter((item) => item.attempt_id === lastAttempt?.id);

  const areaPerformance = calculateAreaPerformance(answers, store.questions);
  const subjectPerformance = calculateSubjectPerformance(answers, store.questions);
  const topicDifficulties = useMemo(
    () => calculateTopicDifficulties(answers, store.questions).slice(0, 5),
    [answers, store.questions],
  );
  const score = lastAttempt ? calculateScore(lastAttempt.correct_answers, lastAttempt.total_questions) : 0;

  if (!profile || !lastAttempt) {
    return (
      <AppLayout>
        <p className="text-sm text-slate-500">Nenhum resultado disponível.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Resultado do simulado</h1>
          <p className="text-sm text-slate-500">Resumo da sua performance e pontos de atenção.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Total de questões" value={String(lastAttempt.total_questions)} icon={Target} />
          <MetricCard
            label="Total de acertos"
            value={String(lastAttempt.correct_answers)}
            icon={CheckCircle2}
            tone="gold"
          />
          <MetricCard
            label="Total de erros"
            value={String(lastAttempt.total_questions - lastAttempt.correct_answers)}
            icon={XCircle}
          />
          <MetricCard label="Percentual de acerto" value={`${Math.round(score)}%`} icon={BarChart3} />
          <MetricCard label="Tempo total" value={`${Math.round(lastAttempt.total_time_seconds / 60)} min`} icon={Clock3} />
          <MetricCard label="Tempo médio" value={`${Math.round(calculateAttemptTime(lastAttempt))}s`} icon={Clock3} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              area: "Linguagens",
              percent: areaPerformance.find((item) => item.area === "Linguagens")?.percent ?? 0,
              total: areaPerformance.find((item) => item.area === "Linguagens")?.total ?? 0,
            },
            {
              area: "Ciências Humanas",
              percent: areaPerformance.find((item) => item.area === "Ciências Humanas")?.percent ?? 0,
              total: areaPerformance.find((item) => item.area === "Ciências Humanas")?.total ?? 0,
            },
            {
              area: "Ciências da Natureza",
              percent: areaPerformance.find((item) => item.area === "Ciências da Natureza")?.percent ?? 0,
              total: areaPerformance.find((item) => item.area === "Ciências da Natureza")?.total ?? 0,
            },
            {
              area: "Matemática",
              percent: areaPerformance.find((item) => item.area === "Matemática")?.percent ?? 0,
              total: areaPerformance.find((item) => item.area === "Matemática")?.total ?? 0,
            },
          ].map((item) => (
            <AreaPerformanceCard key={item.area} area={item.area} percent={item.percent} total={item.total} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Desempenho por disciplina</h2>
            <div className="mt-4 space-y-3">
              {subjectPerformance.map((item) => (
                <div key={item.subject} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-medium">{item.subject}</p>
                  <p className="text-xs text-slate-500">
                    {item.area} · {Math.round(item.percent)}% · {item.total} questões
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Desempenho por assunto</h2>
            <div className="mt-4 space-y-3">
              {topicDifficulties.map((item) => (
                <div key={item.topic} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-medium">{item.topic}</p>
                  <p className="text-xs text-slate-500">
                    {item.subject} · {item.area} · {Math.round(item.percent)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Principais dificuldades</h2>
            <div className="mt-4 space-y-3">
              {topicDifficulties.map((item) => (
                <div key={item.topic} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-medium">{item.topic}</p>
                  <p className="text-xs text-slate-500">
                    {item.subject} · {item.area} · {Math.round(item.percent)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Sugestão simples de estudo</h2>
            <p className="mt-3 text-sm text-slate-600">
              Revise os tópicos com menor desempenho, refaça questões do mesmo padrão e reserve mais tempo para treinar Matemática e Natureza.
            </p>
            <Button asChild className="mt-4">
              <Link href="/simulados">Voltar aos simulados</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
