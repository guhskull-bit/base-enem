import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-base-50 px-3 py-1 text-xs font-medium text-base-800",
        className,
      )}
      {...props}
    />
  );
}
