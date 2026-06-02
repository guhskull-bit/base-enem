"use client";

import { saveExamAction } from "@/app/actions/admin";
import { ExamForm } from "@/components/exam-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewExamPage() {
  const { store, upsertExam, upsertExamQuestions } = useDemoStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Novo simulado</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ExamForm
        questions={store.questions}
        initialValues={{ active: false, title: "", description: "", knowledge_area: "", exam_year: 2025, time_limit_minutes: 60 }}
        onSubmit={async (values) => {
          setError("");
          let savedId = values.id ?? `exam-${Date.now()}`;

          if (useSupabase) {
            const formData = new FormData();
            formData.set("id", values.id ?? "");
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
            if (result.id) savedId = result.id;
          }

          upsertExam({
            id: savedId,
            title: values.title,
            description: values.description,
            knowledge_area: values.knowledge_area,
            exam_year: values.exam_year,
            time_limit_minutes: values.time_limit_minutes,
            active: values.active,
            created_at: new Date().toISOString(),
          });
          upsertExamQuestions(
            savedId,
            values.selectedQuestionIds.map((questionId, index) => ({
              id: `eq-${savedId}-${index + 1}`,
              exam_id: savedId,
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
