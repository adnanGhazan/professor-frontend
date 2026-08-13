import { generateSeoMetadata } from "@/src/lib/seo";

export async function generateMetadata() {
  return generateSeoMetadata({ title: "Research", path: "/research" });
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
