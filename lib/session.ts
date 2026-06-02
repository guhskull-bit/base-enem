import type { SessionUser } from "@/lib/types";
import { cookies } from "next/headers";

const cookieName = "base_enem_session";

export async function readSessionCookie(): Promise<SessionUser | null> {
  const cookieStore = await Promise.resolve(cookies());
  const raw = cookieStore.get(cookieName)?.value;
  if (!raw) return null;

  try {
    const decoded = Buffer.from(decodeURIComponent(raw), "base64").toString("utf8");
    return JSON.parse(decoded) as SessionUser;
  } catch {
    return null;
  }
}

export function writeSessionCookie(user: SessionUser) {
  return encodeURIComponent(Buffer.from(JSON.stringify(user)).toString("base64"));
}

export { cookieName };
