import { Card, CardContent } from "@/components/ui/card";

export function FeedbackBox({
  correct,
  answer,
  explanation,
}: {
  correct: boolean;
  answer: string;
  explanation: string;
}) {
  return (
    <Card className={correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
      <CardContent className="space-y-2">
        <p className="text-sm font-semibold">{correct ? "Resposta correta" : "Resposta incorreta"}</p>
        <p className="text-sm text-slate-700">{answer}</p>
        <p className="text-sm text-slate-600">{explanation}</p>
      </CardContent>
    </Card>
  );
}
