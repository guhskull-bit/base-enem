"use client";

import { ExamForm } from "@/components/exam-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useRouter } from "next/navigation";

export default function NewExamPage() {
  const { upsertExam } = useDemoStore();
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Novo simulado</h1>
      <ExamForm
        onSubmit={(values) => {
          upsertExam({
            id: values.id ?? `exam-${Date.now()}`,
            title: values.title,
            description: values.description,
            knowledge_area: values.knowledge_area,
            exam_year: values.exam_year,
            time_limit_minutes: values.time_limit_minutes,
            active: values.active,
            created_at: new Date().toISOString(),
          });
          router.push("/admin/simulados");
        }}
      />
    </div>
  );
}
