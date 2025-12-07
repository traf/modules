interface SectionProps {
  id: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Section({ id, title, description, className, children }: SectionProps) {
  return (
    <section id={id} className="relative flex flex-col border-b">
      <div className="w-full sticky top-0 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between z-10 bg-gradient-to-b from-black via-black/80 to-transparent">
        <h3>{title}<span>();</span></h3>
        <p>{description}</p>
      </div>
      <div className={`space-y-6 p-6 overflow-hidden ${className}`}>
        {children}
      </div>
    </section>
  );
}