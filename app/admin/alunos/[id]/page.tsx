import { EditStudentPageClient } from "@/components/admin/edit-student-page-client";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditStudentPageClient id={id} />;
}
