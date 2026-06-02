import { EditClassPageClient } from "@/components/admin/edit-class-page-client";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditClassPageClient id={id} />;
}
