"use client";

import { AppLayout } from "@/components/app-layout";
import { AchievementBadge } from "@/components/achievement-badge";
import { useDemoStore } from "@/components/demo-store-provider";
import { buildAchievements } from "@/lib/calculations";

export default function ConquistasPage() {
  const { store, currentUserId } = useDemoStore();
  const profile = store.profiles.find((item) => item.id === currentUserId);
  const unlocked = buildAchievements(
    profile?.id ?? "",
    store.attempts,
    store.answers,
    store.questions,
    store.achievements,
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Conquistas</h1>
          <p className="text-sm text-slate-500">Badges automáticos que registram sua evolução.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {unlocked.map((item) => (
            <AchievementBadge key={item.id} name={item.name} description={item.description} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
