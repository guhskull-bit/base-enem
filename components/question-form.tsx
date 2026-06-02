"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/lib/types";
import { Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export type QuestionFormValues = {
  id?: string;
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_option: Question["correct_option"];
  explanation: string;
  exam_year: number;
  knowledge_area: string;
  subject: string;
  topic: string;
  difficulty: Question["difficulty"];
  active: boolean;
  imageFile: File | null;
  removeImage: boolean;
  image_url?: string | null;
  image_alt?: string | null;
};

export function QuestionForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: Partial<Question>;
  onSubmit: (values: QuestionFormValues) => void | Promise<void>;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageAlt, setImageAlt] = useState(initialValues?.image_alt ?? "");

  const [currentImage, setCurrentImage] = useState(initialValues?.image_url ?? "");

  useEffect(() => {
    if (removeImage) {
      setCurrentImage("");
      return;
    }

    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setCurrentImage(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setCurrentImage(initialValues?.image_url ?? "");
    return undefined;
  }, [imageFile, initialValues?.image_url, removeImage]);

  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          id: initialValues?.id,
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
          imageFile,
          removeImage,
          image_url: initialValues?.image_url ?? null,
          image_alt: imageAlt,
        });
      }}
    >
      <div>
        <Label>Enunciado</Label>
        <Textarea value={statement} onChange={(event) => setStatement(event.target.value)} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Imagem da questão (opcional)</Label>
          {currentImage ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setImageFile(null);
                setRemoveImage(true);
                setImageAlt("");
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover imagem
            </Button>
          ) : null}
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Label htmlFor="question-image">Upload de imagem</Label>
              <Input
                id="question-image"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setRemoveImage(false);
                  setImageFile(file);
                }}
              />
              <p className="text-xs text-slate-500">Formatos aceitos: JPG, PNG e WEBP. Máximo de 5MB.</p>
            </div>
            <div className="flex-1">
              <Label>Texto alternativo</Label>
              <Input
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                placeholder="Descrição curta da imagem"
              />
            </div>
          </div>
          {currentImage ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={currentImage}
                alt={imageAlt || "Imagem da questão"}
                className="h-auto w-full max-h-64 object-contain"
              />
            </div>
          ) : null}
        </div>
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
            <Input
              value={value as string}
              onChange={(event) => (setter as (value: string) => void)(event.target.value)}
            />
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
            onChange={(event) => setDifficulty(event.target.value as Question["difficulty"]) }
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

      <Button type="submit">
        <Upload className="mr-2 h-4 w-4" />
        Salvar questão
      </Button>
    </form>
  );
}
