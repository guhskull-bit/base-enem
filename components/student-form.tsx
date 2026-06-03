"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isInstitutionalEmail } from "@/lib/utils";
import { useMemo, useState } from "react";

export function StudentForm({
  initialValues,
  classOptions = [],
  onSubmit,
}: {
  initialValues?: {
    id?: string;
    full_name: string;
    email: string;
    class_id: string;
    role: "student" | "admin";
    active: boolean;
  };
  classOptions?: Array<{ id: string; name: string; year?: string }>;
  onSubmit: (values: {
    id?: string;
    full_name: string;
    email: string;
    class_id: string;
    role: "student" | "admin";
    active: boolean;
    password: string;
  }) => void;
}) {
  const [fullName, setFullName] = useState(initialValues?.full_name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [classId, setClassId] = useState(initialValues?.class_id ?? "");
  const [role, setRole] = useState<"student" | "admin">(initialValues?.role ?? "student");
  const [active, setActive] = useState(initialValues?.active ?? true);
  const [password, setPassword] = useState("");
  const emailError = useMemo(
    () => (email && !isInstitutionalEmail(email) ? "Use um e-mail @santamarcelina.edu.br." : ""),
    [email],
  );

  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (emailError) return;
        onSubmit({
          id: initialValues?.id,
          full_name: fullName,
          email,
          class_id: classId,
          role,
          active,
          password,
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nome completo</Label>
          <Input name="full_name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </div>
        <div>
          <Label>E-mail institucional</Label>
          <Input name="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
        </div>
        <div>
          <Label>Turma</Label>
          {classOptions.length ? (
            <select
              name="class_id"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="">Selecione uma turma</option>
              {classOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.year ? ` · ${option.year}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <select
              name="class_id"
              disabled
              value=""
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500"
            >
              <option value="">Nenhuma turma disponível</option>
            </select>
          )}
        </div>
        <div>
          <Label>Role</Label>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as "student" | "admin")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
          >
            <option value="student">student</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <Label>Senha inicial</Label>
          <Input
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha inicial ou convite"
          />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            Ativo
          </label>
        </div>
      </div>
      <Button type="submit">Salvar aluno</Button>
    </form>
  );
}
