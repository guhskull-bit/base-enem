"use client";

import { saveStudentAction } from "@/app/actions/admin";
import { StudentForm } from "@/components/student-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateScore, statusFromScore } from "@/lib/calculations";
import { isInstitutionalEmail } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function AdminStudentsPage() {
  const { store, upsertProfile, toggleProfileActive } = useDemoStore();
  const [error, setError] = useState("");
  const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Alunos</h1>
        <p className="text-sm text-slate-500">Cadastro, vínculo de turma e controle de acesso.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <StudentForm
        classOptions={store.classes.map((item) => ({ id: item.id, name: item.name }))}
        onSubmit={async (values) => {
          if (!isInstitutionalEmail(values.email)) {
            setError("Use um e-mail institucional @santamarcelina.edu.br.");
            return;
          }

          setError("");
          if (useSupabase) {
            const formData = new FormData();
            if (values.id) formData.set("id", values.id);
            formData.set("full_name", values.full_name);
            formData.set("email", values.email);
            formData.set("class_id", values.class_id);
            formData.set("role", values.role);
            formData.set("active", values.active ? "1" : "0");
            formData.set("password", values.password);

            const result = await saveStudentAction(formData);
            if (result.error) {
              setError(result.error);
              return;
            }
          }

          upsertProfile({
            id: values.id ?? `student-${Date.now()}`,
            email: values.email,
            full_name: values.full_name,
            role: values.role,
            class_id: values.class_id || null,
            active: values.active,
            created_at: new Date().toISOString(),
          });
        }}
      />

      <div className="grid gap-4">
        {store.profiles.map((student) => (
          <Card key={student.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{student.full_name}</p>
                <p className="text-sm text-slate-500">{student.email}</p>
                <Badge className="mt-2">{student.role}</Badge>
                {student.role === "student" ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Status:{" "}
                    {statusFromScore(
                      calculateScore(
                        store.attempts
                          .filter((attempt) => attempt.student_id === student.id)
                          .reduce((sum, attempt) => sum + attempt.correct_answers, 0),
                        store.attempts
                          .filter((attempt) => attempt.student_id === student.id)
                          .reduce((sum, attempt) => sum + attempt.total_questions, 0),
                      ),
                    )}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/alunos/${student.id}`}>Editar</Link>
                </Button>
                <Button variant="outline" onClick={() => toggleProfileActive(student.id)}>
                  {student.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
