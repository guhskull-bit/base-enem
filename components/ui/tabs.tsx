"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  const context = useMemo(() => ({ value, setValue }), [value]);
  return <TabsContext.Provider value={context}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex rounded-xl bg-slate-100 p-1", className)} {...props} />;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition",
        context.value === value && "bg-white text-base-800 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  if (context.value !== value) return null;
  return (
    <div className={cn("outline-none", className)} {...props}>
      {children}
    </div>
  );
}
