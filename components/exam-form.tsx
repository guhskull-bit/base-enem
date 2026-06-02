"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function ExamForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: {
    id?: string;
    title: string;
    description: string;
    knowledge_area: string;
    exam_year: number;
    time_limit_minutes: number;
    active: boolean;
  };
  onSubmit: (values: {
    id?: string;
    title: string;
    description: string;
    knowledge_area: string;
    exam_year: number;
    time_limit_minutes: number;
    active: boolean;
  }) => void;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [knowledgeArea, setKnowledgeArea] = useState(initialValues?.knowledge_area ?? "");
  const [examYear, setExamYear] = useState(String(initialValues?.exam_year ?? 2025));
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(String(initialValues?.time_limit_minutes ?? 60));
  const [active, setActive] = useState(initialValues?.active ?? true);

  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          id: initialValues?.id,
          title,
          description,
          knowledge_area: knowledgeArea,
          exam_year: Number(examYear),
          time_limit_minutes: Number(timeLimitMinutes),
          active,
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Título</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <Label>Área</Label>
          <Input value={knowledgeArea} onChange={(event) => setKnowledgeArea(event.target.value)} />
        </div>
        <div>
          <Label>Ano</Label>
          <Input value={examYear} onChange={(event) => setExamYear(event.target.value)} />
        </div>
        <div>
          <Label>Tempo limite (min)</Label>
          <Input value={timeLimitMinutes} onChange={(event) => setTimeLimitMinutes(event.target.value)} />
        </div>
      </div>
      <div>
        <Label>Descrição</Label>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Ativo
      </label>
      <Button type="submit">Salvar simulado</Button>
    </form>
  );
}
