import { StudentBottomNav } from "@/components/student-bottom-nav";
import Link from "next/link";
import type { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-base-800 text-lg font-bold text-gold-400">
              B
            </div>
            <div>
              <p className="font-semibold">Base ENEM</p>
              <p className="text-xs text-slate-500">Colégio Santa Marcelina · RJ</p>
            </div>
          </Link>
          <Link href="/perfil" className="text-sm font-medium text-base-700">
            Perfil
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-8">{children}</main>
      <StudentBottomNav />
    </div>
  );
}
