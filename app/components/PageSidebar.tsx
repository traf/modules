'use client';

import { ReactNode, useState } from 'react';
import { Icon } from '@modules/icons';

interface PageSidebarProps {
  children: ReactNode;
  footer?: ReactNode;
  footerTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'lg:w-80',
  md: 'lg:w-96',
  lg: 'lg:w-[440px]'
};

export default function PageSidebar({ children, footer, footerTitle = 'Installation', size = 'md', className = '' }: PageSidebarProps) {
  const [isFooterOpen, setIsFooterOpen] = useState(false);

  return (
    <div className={`w-full ${sizeClasses[size]} flex-shrink-0 h-auto lg:h-full flex flex-col border-b lg:border-r-2 lg:!border-b-0 overflow-hidden ${className}`}>
      <div className="flex flex-col gap-8 flex-1 overflow-y-auto px-6 pt-8 pb-12">
        {children}
      </div>
      {footer && (
        <div className="w-full bg-black border-t flex flex-col">
          <button
            onClick={() => setIsFooterOpen(!isFooterOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 flex-shrink-0"
          >
            <span className="text-white font-medium">{footerTitle}</span>
            <Icon
              name={isFooterOpen ? 'arrow-down-01' : 'arrow-up-01'}
              set="huge"
              color="neutral-500"
              style="sharp"
            />
          </button>

          <div
            className={`transition-all duration-200 ${isFooterOpen ? 'max-h-[50vh] overflow-y-auto' : 'max-h-0 overflow-hidden'}`}
          >
            <div className="p-6 flex flex-col gap-6">
              {footer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
