"use client";

import { saveExamAction } from "@/app/actions/admin";
import { ExamForm } from "@/components/exam-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditExamPageClient({ id }: { id: string }) {
  const { store, upsertExam, upsertExamQuestions } = useDemoStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const exam = store.exams.find((item) => item.id === id);
  const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!exam) {
    return <p>Simulado não encontrado.</p>;
  }

  const selectedQuestionIds = store.examQuestions
    .filter((item) => item.exam_id === id)
    .sort((a, b) => a.position - b.position)
    .map((item) => item.question_id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar simulado</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ExamForm
        questions={store.questions}
        initialValues={{
          id: exam.id,
          title: exam.title,
          description: exam.description ?? "",
          knowledge_area: exam.knowledge_area ?? "",
          exam_year: exam.exam_year ?? 2025,
          time_limit_minutes: exam.time_limit_minutes,
          active: exam.active,
          selectedQuestionIds,
        }}
        onSubmit={async (values) => {
          setError("");

          if (useSupabase) {
            const formData = new FormData();
            formData.set("id", exam.id);
            formData.set("title", values.title);
            formData.set("description", values.description);
            formData.set("knowledge_area", values.knowledge_area);
            formData.set("exam_year", String(values.exam_year));
            formData.set("time_limit_minutes", String(values.time_limit_minutes));
            formData.set("active", values.active ? "1" : "0");
            values.selectedQuestionIds.forEach((questionId) => formData.append("question_ids", questionId));

            const result = await saveExamAction(formData);
            if (result.error) {
              setError(result.error);
              return;
            }
          }

          upsertExam({
            ...exam,
            title: values.title,
            description: values.description,
            knowledge_area: values.knowledge_area,
            exam_year: values.exam_year,
            time_limit_minutes: values.time_limit_minutes,
            active: values.active,
          });
          upsertExamQuestions(
            exam.id,
            values.selectedQuestionIds.map((questionId, index) => ({
              id: `eq-${exam.id}-${index + 1}`,
              exam_id: exam.id,
              question_id: questionId,
              position: index + 1,
            })),
          );
          router.push("/admin/simulados");
        }}
      />
    </div>
  );
}
