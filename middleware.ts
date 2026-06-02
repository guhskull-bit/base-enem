import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/simulados", "/ranking", "/conquistas", "/perfil", "/admin"];

function readSessionFromCookie(cookieValue?: string) {
  if (!cookieValue) return null;

  try {
    const decoded = atob(decodeURIComponent(cookieValue));
    return JSON.parse(decoded) as { role?: string; email?: string };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("base_enem_session")?.value;
  const session = readSessionFromCookie(sessionCookie);

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/simulados/:path*", "/ranking/:path*", "/conquistas/:path*", "/perfil/:path*", "/admin/:path*"],
};
