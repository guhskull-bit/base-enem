"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function ClassForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: { id?: string; name: string; year: string; active: boolean };
  onSubmit: (values: { id?: string; name: string; year: string; active: boolean }) => void;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [year, setYear] = useState(initialValues?.year ?? "2026");
  const [active, setActive] = useState(initialValues?.active ?? true);

  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ id: initialValues?.id, name, year, active });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <Label>Ano letivo</Label>
          <Input value={year} onChange={(event) => setYear(event.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Ativa
      </label>
      <Button type="submit">Salvar turma</Button>
    </form>
  );
}
