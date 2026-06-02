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
      return { error: "Credenciais inválidas. Confirme seu e-mail institucional e senha." };
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    const profile = (profileData as Profile | null) ?? findProfileByEmail(email);
    if (!profile || !profile.active) {
      return { error: "Seu acesso ainda não foi liberado pela administração." };
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
