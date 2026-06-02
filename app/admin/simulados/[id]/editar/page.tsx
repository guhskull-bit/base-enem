import { EditExamPageClient } from "@/components/admin/edit-exam-page-client";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditExamPageClient id={id} />;
}
