import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isInstitutionalEmail } from "@/lib/utils";
import { demoCredentials, demoStore } from "@/lib/seed";
import type { Profile, Role, SessionUser } from "@/lib/types";

export function findProfileByEmail(email: string): Profile | undefined {
  return demoStore.profiles.find((profile) => profile.email === email);
}

export async function signInInstitutional(email: string, password: string) {
  if (!isInstitutionalEmail(email)) {
    return { error: "Use seu e-mail institucional @santamarcelina.edu.br para acessar." };
  }

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      console.error("[Base ENEM] login failed", {
        email,
        reason: error?.message ?? "missing_user",
      });
      return { error: "Credenciais inválidas. Confirme seu e-mail institucional e senha." };
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    const profile = (profileData as Profile | null) ?? null;
    if (!profile) {
      console.error("[Base ENEM] profile missing after auth", {
        userId: data.user.id,
        email,
      });
      return { error: "Perfil não encontrado. Procure a administração." };
    }

    if (!profile.active) {
      console.error("[Base ENEM] inactive profile blocked", {
        userId: data.user.id,
        email,
      });
      return { error: "Usuário inativo. Procure a administração." };
    }

    return {
      user: {
        id: data.user.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        class_id: profile.class_id,
      } satisfies SessionUser,
    };
  }

  const credential = demoCredentials.find((item) => item.email === email);
  if (!credential || credential.password !== password) {
    return { error: "Credenciais inválidas. Confirme seu e-mail institucional e senha." };
  }

  const profile = findProfileByEmail(email);
  if (!profile || !profile.active) {
    return { error: "Seu acesso ainda não foi liberado pela administração." };
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      class_id: profile.class_id,
    } satisfies SessionUser,
  };
}

export function requireRole(role: Role, sessionUser: SessionUser | null) {
  return !!sessionUser && sessionUser.role === role;
}
