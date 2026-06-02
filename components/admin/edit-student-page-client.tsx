"use client";

import { saveStudentAction } from "@/app/actions/admin";
import { StudentForm } from "@/components/student-form";
import { useDemoStore } from "@/components/demo-store-provider";
import { useState } from "react";

export function EditStudentPageClient({ id }: { id: string }) {
  const { store, upsertProfile } = useDemoStore();
  const [error, setError] = useState("");
  const profile = store.profiles.find((item) => item.id === id);
  const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!profile) {
    return <p>Aluno não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar aluno</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <StudentForm
        classOptions={store.classes.map((item) => ({ id: item.id, name: item.name }))}
        initialValues={{
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          class_id: profile.class_id ?? "",
          role: profile.role,
          active: profile.active,
        }}
        onSubmit={async (values) => {
          setError("");

          if (useSupabase) {
            const formData = new FormData();
            formData.set("id", profile.id);
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
            ...profile,
            full_name: values.full_name,
            email: values.email,
            class_id: values.class_id || null,
            role: values.role,
            active: values.active,
          });
        }}
      />
    </div>
  );
}
