"use client";

import { AppLayout } from "@/components/app-layout";
import { RankingTable } from "@/components/ranking-table";
import { useDemoStore } from "@/components/demo-store-provider";
import { calculateRanking } from "@/lib/calculations";

export default function RankingPage() {
  const { store, currentUserId } = useDemoStore();
  const profile = store.profiles.find((item) => item.id === currentUserId);
  const ranking = calculateRanking(store.profiles, store.attempts, profile?.class_id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Ranking da turma</h1>
          <p className="text-sm text-slate-500">Ordenado por percentual de acerto e número de questões respondidas.</p>
        </div>
        <RankingTable
          currentUserId={profile?.id}
          rows={ranking.map((row) => ({
            id: row.profile.id,
            name: row.profile.full_name,
            className: store.classes.find((item) => item.id === row.profile.class_id)?.name ?? "Sem turma",
            percent: row.percent,
            totalQuestions: row.totalQuestions,
          }))}
        />
      </div>
    </AppLayout>
  );
}
