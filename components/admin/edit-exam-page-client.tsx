"use client";

import { ExamForm } from "@/components/exam-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useRouter } from "next/navigation";

export function EditExamPageClient({ id }: { id: string }) {
  const { store, upsertExam } = useDemoStore();
  const router = useRouter();
  const exam = store.exams.find((item) => item.id === id);

  if (!exam) {
    return <p>Simulado não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar simulado</h1>
      <ExamForm
        initialValues={{
          id: exam.id,
          title: exam.title,
          description: exam.description ?? "",
          knowledge_area: exam.knowledge_area ?? "",
          exam_year: exam.exam_year ?? 2025,
          time_limit_minutes: exam.time_limit_minutes,
          active: exam.active,
        }}
        onSubmit={(values) => {
          upsertExam({ ...exam, ...values, created_at: exam.created_at });
          router.push("/admin/simulados");
        }}
      />
    </div>
  );
}
