"use client";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/components/demo-store-provider";
import Link from "next/link";

export default function SimuladosPage() {
  const { store } = useDemoStore();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Simulados</h1>
          <p className="text-sm text-slate-500">Escolha uma avaliação para iniciar sua sessão de estudo.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {store.exams
            .filter((item) => item.active)
            .map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle>{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">{exam.description}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {exam.exam_year} · {exam.time_limit_minutes} min
                  </p>
                  <Button asChild>
                    <Link href={`/simulados/${exam.id}`}>Iniciar simulado</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
