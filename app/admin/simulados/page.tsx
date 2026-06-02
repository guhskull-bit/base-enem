"use client";

import { useDemoStore } from "@/components/demo-store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
              <div className="space-y-1">
                <p className="font-semibold">{exam.title}</p>
                <p className="text-sm text-slate-500">{exam.description}</p>
                <Badge className={exam.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                  {exam.active ? "Visível" : "Oculto"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/simulados/${exam.id}/editar`}>Editar</Link>
                </Button>
                <Button variant="ghost" onClick={() => toggleExamActive(exam.id)}>
                  {exam.active ? "Ocultar" : "Tornar visível"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
