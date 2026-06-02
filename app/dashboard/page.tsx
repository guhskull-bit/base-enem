"use client";

import { AppLayout } from "@/components/app-layout";
import { AchievementBadge } from "@/components/achievement-badge";
import { AreaPerformanceCard } from "@/components/area-performance-card";
import { MetricCard } from "@/components/metric-card";
import { RankingTable } from "@/components/ranking-table";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildAchievements,
  calculateAreaPerformance,
  calculateRanking,
  calculateScore,
} from "@/lib/calculations";
import { useDemoStore } from "@/components/demo-store-provider";
import { BarChart3, CheckCircle2, Layers3, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { store, currentUserId } = useDemoStore();
  const profile = store.profiles.find((item) => item.id === currentUserId);
  const attempts = store.attempts.filter((item) => item.student_id === profile?.id);
  const answers = store.answers.filter((item) => item.student_id === profile?.id);
  const lastAttempt = attempts[0];
  const totalQuestions = attempts.reduce((sum, item) => sum + item.total_questions, 0);
  const totalCorrect = attempts.reduce((sum, item) => sum + item.correct_answers, 0);
  const percent = calculateScore(totalCorrect, totalQuestions);
  const ranking = calculateRanking(store.profiles, store.attempts, profile?.class_id);
  const rankPosition = ranking.findIndex((row) => row.profile.id === profile?.id) + 1;
  const areaPerformance = calculateAreaPerformance(answers, store.questions);
  const achievements = useMemo(
    () =>
      buildAchievements(
        profile?.id ?? "",
        store.attempts,
        store.answers,
        store.questions,
        store.achievements,
      ),
    [profile?.id, store.attempts, store.answers, store.questions, store.achievements],
  );

  if (!profile) {
    return <AppLayout>Carregando...</AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">Bom dia, {profile.full_name}</h1>
            <Badge className="bg-gold-50 text-gold-700">7 dias seguidos</Badge>
          </div>
          <p className="text-sm text-slate-500">Sua trilha de estudos personalizada está pronta.</p>
        </section>

        <Tabs defaultValue="resumo">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Questões respondidas" value={String(totalQuestions)} icon={Layers3} />
              <MetricCard
                label="Percentual de acerto"
                value={`${Math.round(percent)}%`}
                icon={CheckCircle2}
                tone="gold"
              />
              <MetricCard label="Simulados realizados" value={String(attempts.length)} icon={BarChart3} />
              <MetricCard
                label="Posição no ranking"
                value={rankPosition > 0 ? `#${rankPosition}` : "-"}
                icon={Trophy}
              />
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
              <Card>
                <CardContent className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Último simulado realizado</p>
                  {lastAttempt ? (
                    <>
                      <p className="text-sm text-slate-600">
                        {store.exams.find((exam) => exam.id === lastAttempt.exam_id)?.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        {lastAttempt.correct_answers}/{lastAttempt.total_questions} acertos
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Você ainda não concluiu um simulado.</p>
                  )}
                  <Button asChild>
                    <Link href="/simulados">Iniciar novo simulado</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Status atual</p>
                  <StudentStatusBadge score={percent} />
                  <p className="text-sm text-slate-600">
                    {percent >= 70 ? "Excelente ritmo de estudos." : "Há espaço para ganhar consistência."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="mt-6">
            <RankingTable
              currentUserId={profile.id}
              rows={ranking.map((row) => ({
                id: row.profile.id,
                name: row.profile.full_name,
                className:
                  store.classes.find((item) => item.id === row.profile.class_id)?.name ?? "Sem turma",
                percent: row.percent,
                totalQuestions: row.totalQuestions,
              }))}
            />
          </TabsContent>

          <TabsContent value="conquistas" className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                name={achievement.name}
                description={achievement.description}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
