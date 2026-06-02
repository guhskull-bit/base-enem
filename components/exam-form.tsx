"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Question } from "@/lib/types";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { useMemo, useState } from "react";

export type ExamFormValues = {
  id?: string;
  title: string;
  description: string;
  knowledge_area: string;
  exam_year: number;
  time_limit_minutes: number;
  active: boolean;
  selectedQuestionIds: string[];
};

export function ExamForm({
  initialValues,
  questions = [],
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
    selectedQuestionIds?: string[];
  };
  questions?: Question[];
  onSubmit: (values: ExamFormValues) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [knowledgeArea, setKnowledgeArea] = useState(initialValues?.knowledge_area ?? "");
  const [examYear, setExamYear] = useState(String(initialValues?.exam_year ?? 2025));
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    String(initialValues?.time_limit_minutes ?? 60),
  );
  const [active, setActive] = useState(initialValues?.active ?? false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    initialValues?.selectedQuestionIds ?? [],
  );
  const [areaFilter, setAreaFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const options = useMemo(() => {
    const areas = Array.from(new Set(questions.map((item) => item.knowledge_area)));
    const subjects = Array.from(new Set(questions.map((item) => item.subject)));
    const topics = Array.from(new Set(questions.map((item) => item.topic)));
    const years = Array.from(new Set(questions.map((item) => String(item.exam_year ?? ""))))
      .filter(Boolean)
      .sort((a, b) => Number(b) - Number(a));
    return { areas, subjects, topics, years };
  }, [questions]);

  const filteredQuestions = questions.filter((question) => {
    if (areaFilter && question.knowledge_area !== areaFilter) return false;
    if (subjectFilter && question.subject !== subjectFilter) return false;
    if (topicFilter && question.topic !== topicFilter) return false;
    if (yearFilter && String(question.exam_year ?? "") !== yearFilter) return false;
    if (difficultyFilter && question.difficulty !== difficultyFilter) return false;
    return true;
  });

  const selectedQuestions = selectedQuestionIds
    .map((questionId) => questions.find((item) => item.id === questionId))
    .filter(Boolean) as Question[];

  const moveQuestion = (questionId: string, direction: -1 | 1) => {
    setSelectedQuestionIds((current) => {
      const index = current.indexOf(questionId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          id: initialValues?.id,
          title,
          description,
          knowledge_area: knowledgeArea,
          exam_year: Number(examYear),
          time_limit_minutes: Number(timeLimitMinutes),
          active,
          selectedQuestionIds,
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
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
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-base-800"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Visível para alunos
      </label>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Questões vinculadas</p>
            <p className="text-xs text-slate-500">Selecione as questões e ajuste a ordem antes de salvar.</p>
          </div>
          <p className="text-sm font-medium text-gold-700">{selectedQuestionIds.length} selecionadas</p>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <div>
            <Label>Área</Label>
            <select
              value={areaFilter}
              onChange={(event) => setAreaFilter(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="">Todas</option>
              {options.areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Disciplina</Label>
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="">Todas</option>
              {options.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Assunto</Label>
            <select
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="">Todos</option>
              {options.topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Ano</Label>
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="">Todos</option>
              {options.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Dificuldade</Label>
            <select
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="">Todas</option>
              <option value="facil">Fácil</option>
              <option value="media">Média</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {filteredQuestions.map((question) => {
            const checked = selectedQuestionIds.includes(question.id);
            return (
              <label
                key={question.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const isChecked = event.target.checked;
                    setSelectedQuestionIds((current) =>
                      isChecked
                        ? current.includes(question.id)
                          ? current
                          : [...current, question.id]
                        : current.filter((item) => item !== question.id),
                    );
                  }}
                  className="mt-1 h-4 w-4"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{question.statement}</p>
                  <p className="text-xs text-slate-500">
                    {question.knowledge_area} · {question.subject} · {question.topic} · {question.exam_year ?? "-"}
                  </p>
                </div>
                {checked ? <Check className="mt-1 h-4 w-4 text-emerald-600" /> : null}
              </label>
            );
          })}
        </div>

        {selectedQuestions.length ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Ordem do simulado</p>
            <div className="space-y-2">
              {selectedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {index + 1}. {question.statement}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveQuestion(question.id, -1)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveQuestion(question.id, 1)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setSelectedQuestionIds((current) => current.filter((item) => item !== question.id))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Button type="submit" className="w-full md:w-auto">
        Salvar simulado
      </Button>
    </form>
  );
}
