import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AreaPerformanceCard({
  area,
  percent,
  total,
}: {
  area: string;
  percent: number;
  total: number;
}) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900">{area}</p>
          <p className="text-sm font-semibold text-base-800">{Math.round(percent)}%</p>
        </div>
        <Progress value={percent} />
        <p className="text-xs text-slate-500">{total} questões respondidas</p>
      </CardContent>
    </Card>
  );
}
