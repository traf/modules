import { ReactNode } from 'react';

interface SectionProps {
  label?: string;
  children: ReactNode;
}

export default function Section({ label, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {label && <p className="text-white">{label}</p>}
      {children}
    </div>
  );
}
