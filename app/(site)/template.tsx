export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in flex flex-1 flex-col">{children}</div>;
}
