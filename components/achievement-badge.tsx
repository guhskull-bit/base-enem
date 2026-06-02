import { Card, CardContent } from "@/components/ui/card";

export function AchievementBadge({
  name,
  description,
}: {
  name: string;
  description: string | null;
}) {
  return (
    <Card className="border-gold-100 bg-gold-50">
      <CardContent>
        <p className="text-sm font-semibold text-gold-700">{name}</p>
        <p className="mt-1 text-xs text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
