"use client";

import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isInstitutionalEmail } from "@/lib/utils";
import { useActionState, useMemo, useState } from "react";

const initialState = { error: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("");
  const error = state?.error ?? "";
  const emailError =
    email && !isInstitutionalEmail(email)
      ? "Use seu e-mail institucional @santamarcelina.edu.br para acessar."
      : "";
  const helper = useMemo(
    () => "Acesso exclusivo para alunos e equipe com e-mail institucional @santamarcelina.edu.br",
    [],
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center rounded-[1.5rem] bg-base-900 p-8 text-white shadow-soft">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-2xl font-bold text-white">
            B
          </div>
          <p className="text-sm uppercase tracking-widest text-gold-200">COLÉGIO SANTA MARCELINA · RJ</p>
          <h1 className="mt-4 text-4xl font-semibold">Base ENEM</h1>
          <p className="mt-3 text-lg text-slate-100">Ferramenta de estudos para o ENEM</p>
          <p className="mt-2 text-base text-slate-200">Construa sua base, conquiste sua vaga.</p>
          <p className="mt-6 max-w-xl text-sm leading-6 text-slate-300">
            Acesse e monte a sua trilha de estudos personalizada com simulados, ranking,
            conquistas e gestão institucional.
          </p>
        </section>

        <Card className="self-center shadow-soft">
          <CardContent className="space-y-6 p-8">
            <div>
              <p className="text-sm font-semibold text-base-800">Base ENEM</p>
              <p className="text-xs uppercase tracking-widest text-slate-500">Ferramenta de estudos para o ENEM</p>
            </div>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">E-mail institucional</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="aluno@santamarcelina.edu.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
                <Input name="password" type="password" placeholder="Sua senha" />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              <p className="text-sm text-slate-600">{helper}</p>
              <Button type="submit" className="w-full" disabled={pending || !!emailError}>
                {pending ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-xs leading-5 text-slate-500">
                Ao entrar, você concorda com os Termos de uso do Base ENEM.
              </p>
            </form>
            <p className="text-xs text-slate-500">
              Se o e-mail estiver fora do domínio institucional, a entrada será bloqueada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
