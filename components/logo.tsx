import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
};

/** Marque BOMA TCHOP — image `public/logobomatchop-removebg-preview.png` (fond transparent). */
export function Logo({ className = "", href = "/" }: LogoProps) {
  const content = (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      <Image
        src="/logobomatchop-removebg-preview.png"
        alt="BOMA TCHOP"
        width={440}
        height={158}
        className="h-[3.35rem] w-auto object-contain object-left sm:h-[3.65rem] md:h-[3.9rem]"
        sizes="(max-width: 640px) 260px, (max-width: 1024px) 320px, 400px"
        priority
      />
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }
  return content;
}
