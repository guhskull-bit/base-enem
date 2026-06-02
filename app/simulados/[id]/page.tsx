import { ExamRunner } from "@/components/exam-runner";

export default function SimuladoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <ExamRunner examId={id} />;
}
