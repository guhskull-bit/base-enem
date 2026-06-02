"use client";

import { saveQuestionAction } from "@/app/actions/admin";
import { QuestionForm } from "@/components/question-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditQuestionPageClient({ id }: { id: string }) {
  const { store, upsertQuestion } = useDemoStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const question = store.questions.find((item) => item.id === id);
  const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!question) {
    return <p>Questão não encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar questão</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <QuestionForm
        initialValues={question}
        onSubmit={async (values) => {
          setError("");

          if (useSupabase) {
            const formData = new FormData();
            formData.set("id", question.id);
            formData.set("statement", values.statement);
            formData.set("option_a", values.option_a);
            formData.set("option_b", values.option_b);
            formData.set("option_c", values.option_c);
            formData.set("option_d", values.option_d);
            formData.set("option_e", values.option_e);
            formData.set("correct_option", values.correct_option);
            formData.set("explanation", values.explanation);
            formData.set("exam_year", String(values.exam_year));
            formData.set("knowledge_area", values.knowledge_area);
            formData.set("subject", values.subject);
            formData.set("topic", values.topic);
            formData.set("difficulty", values.difficulty);
            formData.set("active", values.active ? "1" : "0");
            formData.set("remove_image", values.removeImage ? "1" : "0");
            formData.set("existing_image_url", question.image_url ?? "");
            formData.set("existing_image_alt", question.image_alt ?? "");
            if (values.imageFile) formData.set("image", values.imageFile);

            const result = await saveQuestionAction(formData);
            if (result.error) {
              setError(result.error);
              return;
            }
          }

          upsertQuestion({
            ...question,
            statement: values.statement,
            image_url: values.removeImage
              ? null
              : values.imageFile
                ? URL.createObjectURL(values.imageFile)
                : values.image_url ?? question.image_url ?? null,
            image_alt: values.removeImage ? null : values.image_alt ?? question.image_alt ?? null,
            option_a: values.option_a,
            option_b: values.option_b,
            option_c: values.option_c,
            option_d: values.option_d,
            option_e: values.option_e,
            correct_option: values.correct_option,
            explanation: values.explanation,
            exam_year: values.exam_year,
            knowledge_area: values.knowledge_area,
            subject: values.subject,
            topic: values.topic,
            difficulty: values.difficulty,
            active: values.active,
          });

          router.push("/admin/questoes");
        }}
      />
    </div>
  );
}
