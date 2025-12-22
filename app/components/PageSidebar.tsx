'use client';

import { ReactNode } from 'react';

interface PageSidebarProps {
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'lg:w-80',
  md: 'lg:w-96',
  lg: 'lg:w-[440px]'
};

export default function PageSidebar({ children, footer, size = 'md', className = '' }: PageSidebarProps) {
  return (
    <div className={`w-full ${sizeClasses[size]} flex-shrink-0 h-auto lg:h-full flex flex-col border-b lg:border-r-2 lg:!border-b-0 overflow-hidden ${className}`}>
      <div className="flex flex-col gap-8 flex-1 overflow-y-auto px-6 pt-8 pb-12">
        {children}
      </div>
      {footer}
    </div>
  );
}
