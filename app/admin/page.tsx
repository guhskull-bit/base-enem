"use client";

import { AdminMetricCard } from "@/components/admin-metric-card";
import { useDemoStore } from "@/components/demo-store-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateAreaPerformance, calculateScore, statusFromScore } from "@/lib/calculations";
import { BarChart3, GraduationCap, UsersRound, Waves } from "lucide-react";

export default function AdminDashboardPage() {
  const { store } = useDemoStore();
  const activeStudents = store.profiles.filter((item) => item.role === "student" && item.active);
  const finishedAttempts = store.attempts.filter((item) => item.finished_at);
  const overallPercent = calculateScore(
    finishedAttempts.reduce((sum, item) => sum + item.correct_answers, 0),
    finishedAttempts.reduce((sum, item) => sum + item.total_questions, 0),
  );
  const areaPerformance = calculateAreaPerformance(store.answers, store.questions);
  const naturePercent = areaPerformance.find((item) => item.area === "Ciências da Natureza")?.percent ?? 0;
  const mathPercent = areaPerformance.find((item) => item.area === "Matemática")?.percent ?? 0;
  const alert = naturePercent < 60 || mathPercent < 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Painel geral</h1>
          <p className="text-sm text-slate-500">Ano letivo 2026 · Atualizado agora</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Alunos ativos" value={String(activeStudents.length)} icon={UsersRound} />
        <AdminMetricCard label="Simulados realizados" value={String(finishedAttempts.length)} icon={BarChart3} />
        <AdminMetricCard label="Acerto médio" value={`${Math.round(overallPercent)}%`} icon={GraduationCap} tone="gold" />
        <AdminMetricCard label="Simulados ativos" value={String(store.exams.filter((item) => item.active).length)} icon={Waves} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            area: "Linguagens",
            percent: areaPerformance.find((item) => item.area === "Linguagens")?.percent ?? 0,
          },
          {
            area: "Humanas",
            percent: areaPerformance.find((item) => item.area === "Ciências Humanas")?.percent ?? 0,
          },
          { area: "Natureza", percent: naturePercent },
          { area: "Matemática", percent: mathPercent },
        ].map((item) => (
          <Card key={item.area}>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">{item.area}</p>
              <p className="text-2xl font-semibold">{Math.round(item.percent)}%</p>
              <Badge className={item.percent < 60 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}>
                {item.percent < 60 ? "Atenção" : "Em dia"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {alert ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Atenção: Natureza e Matemática abaixo da meta de 60%.
        </p>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Questões</TableHead>
                <TableHead>Acerto</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {store.profiles
                .filter((item) => item.role === "student")
                .map((student) => {
                  const attempts = store.attempts.filter((item) => item.student_id === student.id);
                  const totalQuestions = attempts.reduce((sum, item) => sum + item.total_questions, 0);
                  const percent = calculateScore(
                    attempts.reduce((sum, item) => sum + item.correct_answers, 0),
                    totalQuestions,
                  );

                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{store.classes.find((item) => item.id === student.class_id)?.name ?? "-"}</TableCell>
                      <TableCell>{totalQuestions}</TableCell>
                      <TableCell>{Math.round(percent)}%</TableCell>
                      <TableCell>{statusFromScore(percent)}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
