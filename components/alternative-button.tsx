import { cn } from "@/lib/utils";

export function AlternativeButton({
  letter,
  text,
  selected,
  correct,
  wrong,
  onClick,
  disabled,
}: {
  letter: "A" | "B" | "C" | "D" | "E";
  text: string;
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left transition",
        selected && !correct && !wrong && "border-base-800 ring-1 ring-base-800",
        correct && "border-emerald-500 bg-emerald-50",
        wrong && "border-red-500 bg-red-50",
        !selected && "border-slate-200 hover:border-base-300 hover:bg-slate-50",
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-base-800 text-sm font-semibold text-white">
        {letter}
      </span>
      <span className="text-sm leading-6 text-slate-700">{text}</span>
    </button>
  );
}
