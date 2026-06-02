"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/lib/types";
import { useState } from "react";

export function QuestionForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: Partial<Question>;
  onSubmit: (values: Question) => void;
}) {
  const [statement, setStatement] = useState(initialValues?.statement ?? "");
  const [optionA, setOptionA] = useState(initialValues?.option_a ?? "");
  const [optionB, setOptionB] = useState(initialValues?.option_b ?? "");
  const [optionC, setOptionC] = useState(initialValues?.option_c ?? "");
  const [optionD, setOptionD] = useState(initialValues?.option_d ?? "");
  const [optionE, setOptionE] = useState(initialValues?.option_e ?? "");
  const [correctOption, setCorrectOption] = useState<Question["correct_option"]>(
    initialValues?.correct_option ?? "A",
  );
  const [explanation, setExplanation] = useState(initialValues?.explanation ?? "");
  const [examYear, setExamYear] = useState(String(initialValues?.exam_year ?? 2024));
  const [knowledgeArea, setKnowledgeArea] = useState(initialValues?.knowledge_area ?? "Linguagens");
  const [subject, setSubject] = useState(initialValues?.subject ?? "Português");
  const [topic, setTopic] = useState(initialValues?.topic ?? "Leitura");
  const [difficulty, setDifficulty] = useState<Question["difficulty"]>(
    initialValues?.difficulty ?? "media",
  );
  const [active, setActive] = useState(initialValues?.active ?? true);

  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          id: initialValues?.id ?? `question-${Date.now()}`,
          statement,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          option_e: optionE,
          correct_option: correctOption,
          explanation,
          exam_year: Number(examYear),
          knowledge_area: knowledgeArea,
          subject,
          topic,
          difficulty,
          active,
          created_at: initialValues?.created_at ?? new Date().toISOString(),
        });
      }}
    >
      <div>
        <Label>Enunciado</Label>
        <Textarea value={statement} onChange={(event) => setStatement(event.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["A", optionA, setOptionA],
          ["B", optionB, setOptionB],
          ["C", optionC, setOptionC],
          ["D", optionD, setOptionD],
          ["E", optionE, setOptionE],
        ].map(([label, value, setter]) => (
          <div key={label as string}>
            <Label>Alternativa {label as string}</Label>
            <Input value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Resposta correta</Label>
          <select
            value={correctOption}
            onChange={(event) => setCorrectOption(event.target.value as Question["correct_option"])}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
          >
            {["A", "B", "C", "D", "E"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Ano do ENEM</Label>
          <Input value={examYear} onChange={(event) => setExamYear(event.target.value)} />
        </div>
        <div>
          <Label>Dificuldade</Label>
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Question["difficulty"])}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
          >
            <option value="facil">fácil</option>
            <option value="media">média</option>
            <option value="dificil">difícil</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Área do conhecimento</Label>
          <Input value={knowledgeArea} onChange={(event) => setKnowledgeArea(event.target.value)} />
        </div>
        <div>
          <Label>Disciplina</Label>
          <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
        </div>
        <div>
          <Label>Assunto</Label>
          <Input value={topic} onChange={(event) => setTopic(event.target.value)} />
        </div>
      </div>
      <div>
        <Label>Explicação</Label>
        <Textarea value={explanation} onChange={(event) => setExplanation(event.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Ativa
      </label>
      <Button type="submit">Salvar questão</Button>
    </form>
  );
}
