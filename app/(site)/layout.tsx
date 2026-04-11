import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}
