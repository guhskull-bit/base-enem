import { SidebarAdmin } from "@/components/sidebar-admin";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <SidebarAdmin />
      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Colégio Santa Marcelina · RJ</p>
              <h1 className="text-lg font-semibold">Painel administrativo</h1>
            </div>
            <Link href="/admin/simulados/novo" className="rounded-xl bg-base-800 px-4 py-2 text-sm font-medium text-white">
              + Novo simulado
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
