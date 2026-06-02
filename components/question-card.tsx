import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question } from "@/lib/types";
import { AlternativeButton } from "@/components/alternative-button";

export function QuestionCard({
  question,
  selected,
  onSelect,
  revealed,
  correctOption,
}: {
  question: Question;
  selected: Question["correct_option"] | null;
  onSelect: (option: Question["correct_option"]) => void;
  revealed: boolean;
  correctOption: Question["correct_option"];
}) {
  const options = [
    ["A", question.option_a],
    ["B", question.option_b],
    ["C", question.option_c],
    ["D", question.option_d],
    ["E", question.option_e],
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base leading-6">{question.statement}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map(([letter, text]) => (
          <AlternativeButton
            key={letter}
            letter={letter}
            text={text}
            selected={selected === letter}
            correct={revealed && correctOption === letter}
            wrong={revealed && selected === letter && correctOption !== letter}
            onClick={() => onSelect(letter)}
            disabled={revealed}
          />
        ))}
      </CardContent>
    </Card>
  );
}
