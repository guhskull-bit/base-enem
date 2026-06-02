"use client";

import { QuestionForm } from "@/components/question-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useRouter } from "next/navigation";

export default function NewQuestionPage() {
  const { upsertQuestion } = useDemoStore();
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nova questão</h1>
      <QuestionForm
        onSubmit={(values) => {
          upsertQuestion(values);
          router.push("/admin/questoes");
        }}
      />
    </div>
  );
}
