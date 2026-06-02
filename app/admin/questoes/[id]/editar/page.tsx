import { EditQuestionPageClient } from "@/components/admin/edit-question-page-client";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditQuestionPageClient id={id} />;
}
