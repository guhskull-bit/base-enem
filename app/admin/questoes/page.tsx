"use client";

import { useDemoStore } from "@/components/demo-store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminQuestionsPage() {
  const { store, toggleQuestionActive } = useDemoStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Questões</h1>
          <p className="text-sm text-slate-500">Banco fictício no estilo ENEM para testes.</p>
        </div>
        <Button asChild>
          <Link href="/admin/questoes/nova">Nova questão</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {store.questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{question.statement}</p>
                <p className="text-sm text-slate-500">
                  {question.knowledge_area} · {question.subject} · {question.topic}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/questoes/${question.id}/editar`}>Editar</Link>
                </Button>
                <Button variant="ghost" onClick={() => toggleQuestionActive(question.id)}>
                  {question.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
