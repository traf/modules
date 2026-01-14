'use client';

import { ReactNode } from 'react';
import Button from './Button';
import { Icon } from '@modules/icons';

interface DetailSidebarProps {
  isOpen: boolean;
  title: string;
  onClose?: () => void;
  showClose?: boolean;
  children: ReactNode;
}

export default function DetailSidebar({ isOpen, title, onClose, showClose = true, children }: DetailSidebarProps) {
  return (
    <div className={`w-full lg:w-96 flex-shrink-0 h-auto lg:h-full flex flex-col pb-8 border-l overflow-y-auto transition-all ${isOpen ? 'mr-0' : '-mr-96 lg:-mr-96'}`}>
      <div className="w-full flex items-center justify-between sticky top-0 bg-black h-21 flex-shrink-0 z-10 px-6 border-b">
        <h2>{title}</h2>
        {showClose && onClose && (
          <Button onClick={onClose} variant="icon" className="-mr-3">
            <Icon set="lucide" name="x" size="sm" color="white" className="group-hover:invert" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
