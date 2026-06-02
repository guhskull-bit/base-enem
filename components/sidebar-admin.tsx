import Link from "next/link";
import { BarChart3, GraduationCap, LayoutDashboard, ListChecks, School, UsersRound } from "lucide-react";

export function SidebarAdmin() {
  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/alunos", label: "Alunos", icon: UsersRound },
    { href: "/admin/questoes", label: "Questões", icon: ListChecks },
    { href: "/admin/simulados", label: "Simulados", icon: BarChart3 },
    { href: "/admin/turmas", label: "Turmas", icon: School },
    { href: "/admin/relatorios", label: "Relatórios", icon: GraduationCap },
  ];

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-5 py-6 md:block">
      <div className="mb-8">
        <p className="text-sm font-semibold text-base-800">Base ENEM</p>
        <p className="text-xs text-slate-500">Painel administrativo</p>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-base-800"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
