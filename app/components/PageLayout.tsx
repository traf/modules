import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="w-full h-fit lg:h-full flex flex-col lg:flex-row items-start justify-start overflow-y-auto lg:overflow-hidden">
      {children}
    </div>
  );
}
