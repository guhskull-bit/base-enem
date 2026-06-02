import { Badge } from "@/components/ui/badge";
import { statusFromScore } from "@/lib/calculations";

export function StudentStatusBadge({ score }: { score: number }) {
  const status = statusFromScore(score);
  const tone =
    status === "Em dia"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Desenvolvimento"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";
  return <Badge className={tone}>{status}</Badge>;
}
