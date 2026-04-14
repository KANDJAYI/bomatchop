import { SiteChrome } from "@/components/site-chrome";
import { SiteProviders } from "@/components/site-providers";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProviders>
      <SiteChrome>{children}</SiteChrome>
    </SiteProviders>
  );
}
