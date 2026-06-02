import { buildAchievements } from "@/lib/calculations";
import { readSessionCookie } from "@/lib/session";
import { demoStore } from "@/lib/seed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Achievement,
  Profile,
  Question,
  Role,
  SessionUser,
  StudentAnswer,
  StudentAttempt,
} from "@/lib/types";
import { redirect } from "next/navigation";

export async function getCurrentUser(): Promise<SessionUser | null> {
  return readSessionCookie();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const session = await getCurrentUser();
  if (!session) return null;

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.from("profiles").select("*").eq("id", session.id).maybeSingle();
    if (data) return data as Profile;
  }

  return demoStore.profiles.find((profile) => profile.id === session.id) ?? null;
}

export async function requireAuth() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== "admin") redirect("/dashboard");
  return session;
}

export async function requireStudent() {
  const session = await requireAuth();
  if (session.role !== "student") redirect("/admin");
  return session;
}

export function updateAchievements(
  profileId: string,
  attempts: StudentAttempt[],
  answers: StudentAnswer[],
  questions: Question[],
  achievements: Achievement[],
) {
  return buildAchievements(profileId, attempts, answers, questions, achievements);
}

export function canManage(role: Role) {
  return role === "admin";
}
