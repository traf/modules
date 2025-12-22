import { ReactNode } from 'react';

interface DividedListProps {
  children: ReactNode;
  showBorder?: boolean;
}

export default function DividedList({ children, showBorder = true }: DividedListProps) {
  return (
    <div className={`flex flex-col divide-y-2 divide-dashed divide-neutral-800 ${showBorder ? 'border-b' : ''}`}>
      {children}
    </div>
  );
}
