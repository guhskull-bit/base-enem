import Link from "next/link";
import { Home, Layers3, Trophy, UserRound } from "lucide-react";

export function StudentBottomNav() {
  const items = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/simulados", label: "Simulados", icon: Layers3 },
    { href: "/ranking", label: "Progresso", icon: Trophy },
    { href: "/perfil", label: "Perfil", icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-slate-600"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
