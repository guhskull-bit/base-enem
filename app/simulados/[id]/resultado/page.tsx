import { ExamResultPageClient } from "@/components/student/exam-result-page-client";

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExamResultPageClient id={id} />;
}
