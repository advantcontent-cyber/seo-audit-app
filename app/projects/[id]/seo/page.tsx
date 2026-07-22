import { redirect } from "next/navigation";

export default function SeoRoot({ params }: { params: { id: string } }) {
  redirect(`/projects/${params.id}/seo/audit`);
}
