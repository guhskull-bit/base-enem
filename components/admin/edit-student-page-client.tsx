"use client";

import { StudentForm } from "@/components/student-form";
import { useDemoStore } from "@/components/demo-store-provider";

export function EditStudentPageClient({ id }: { id: string }) {
  const { store, upsertProfile } = useDemoStore();
  const profile = store.profiles.find((item) => item.id === id);

  if (!profile) {
    return <p>Aluno não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar aluno</h1>
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
        onSubmit={(values) =>
          upsertProfile({
            ...profile,
            id: profile.id,
            full_name: values.full_name,
            email: values.email,
            class_id: values.class_id,
            role: values.role,
            active: values.active,
          })
        }
      />
    </div>
  );
}
