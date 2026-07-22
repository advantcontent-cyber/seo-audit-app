import SeoSubTabs from "@/components/SeoSubTabs";

export default function SeoLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  return (
    <div>
      <SeoSubTabs projectId={params.id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
