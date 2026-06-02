"use client";

import { ClassForm } from "@/components/class-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { Card, CardContent } from "@/components/ui/card";

export default function EditClassPage({ params }: { params: { id: string } }) {
  const { store, upsertClass } = useDemoStore();
  const classGroup = store.classes.find((item) => item.id === params.id);

  if (!classGroup) {
    return <p>Turma não encontrada.</p>;
  }

  const students = store.profiles.filter((profile) => profile.class_id === classGroup.id);
  const attempts = store.attempts.filter((attempt) =>
    students.some((student) => student.id === attempt.student_id),
  );
  const totalQuestions = attempts.reduce((sum, attempt) => sum + attempt.total_questions, 0);
  const average = totalQuestions
    ? Math.round((attempts.reduce((sum, attempt) => sum + attempt.correct_answers, 0) / totalQuestions) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar turma</h1>
      <ClassForm
        initialValues={{
          id: classGroup.id,
          name: classGroup.name,
          year: classGroup.year,
          active: classGroup.active,
        }}
        onSubmit={(values) =>
          upsertClass({
            id: classGroup.id,
            name: values.name,
            year: values.year,
            active: values.active,
            created_at: classGroup.created_at,
          })
        }
      />
      <Card>
        <CardContent className="space-y-3">
          <p className="font-semibold">Alunos da turma</p>
          <p className="text-sm text-slate-500">Média atual: {average}%</p>
          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                {student.full_name} - {student.email}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
