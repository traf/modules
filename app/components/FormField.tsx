import { ReactNode } from 'react';

interface FormFieldProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function FormField({ title, subtitle, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-white">{title}</p>
        {subtitle && <p className="text-grey">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
