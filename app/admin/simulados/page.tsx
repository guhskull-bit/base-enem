"use client";

import { useDemoStore } from "@/components/demo-store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminExamsPage() {
  const { store, toggleExamActive } = useDemoStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Simulados</h1>
          <p className="text-sm text-slate-500">Criação e gestão de avaliações.</p>
        </div>
        <Button asChild>
          <Link href="/admin/simulados/novo">Novo simulado</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {store.exams.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{exam.title}</p>
                <p className="text-sm text-slate-500">{exam.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/simulados/${exam.id}/editar`}>Editar</Link>
                </Button>
                <Button variant="ghost" onClick={() => toggleExamActive(exam.id)}>
                  {exam.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
