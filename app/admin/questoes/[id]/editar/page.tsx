"use client";

import { QuestionForm } from "@/components/question-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useRouter } from "next/navigation";

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const { store, upsertQuestion } = useDemoStore();
  const router = useRouter();
  const question = store.questions.find((item) => item.id === params.id);

  if (!question) {
    return <p>Questão não encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar questão</h1>
      <QuestionForm
        initialValues={question}
        onSubmit={(values) => {
          upsertQuestion({ ...values, id: question.id, created_at: question.created_at });
          router.push("/admin/questoes");
        }}
      />
    </div>
  );
}
