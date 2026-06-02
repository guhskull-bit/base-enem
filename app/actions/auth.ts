"use server";

import { signInInstitutional } from "@/lib/auth";
import { cookieName, writeSessionCookie } from "@/lib/session";
import { isInstitutionalEmail } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isInstitutionalEmail(email)) {
    return { error: "Use seu e-mail institucional @santamarcelina.edu.br para acessar." };
  }

  const result = await signInInstitutional(email, password);
  if ("error" in result) return { error: result.error };

  const cookieStore = await Promise.resolve(cookies());
  cookieStore.set(cookieName, writeSessionCookie(result.user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(result.user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  const cookieStore = await Promise.resolve(cookies());
  cookieStore.set(cookieName, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/login");
}
