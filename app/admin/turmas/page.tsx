"use client";

import { ClassForm } from "@/components/class-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminClassesPage() {
  const { store, upsertClass, toggleClassActive } = useDemoStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Turmas</h1>
        <p className="text-sm text-slate-500">Gestão de turmas e visão de desempenho médio.</p>
      </div>
      <ClassForm
        onSubmit={(values) => {
          upsertClass({
            id: values.id ?? `class-${Date.now()}`,
            name: values.name,
            year: values.year,
            active: values.active,
            created_at: new Date().toISOString(),
          });
        }}
      />
      <div className="grid gap-4">
        {store.classes.map((classGroup) => (
          <Card key={classGroup.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{classGroup.name}</p>
                <p className="text-sm text-slate-500">Ano {classGroup.year}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/turmas/${classGroup.id}`}>Editar</Link>
                </Button>
                <Button variant="outline" onClick={() => toggleClassActive(classGroup.id)}>
                  {classGroup.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
