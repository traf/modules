'use client';

import Button from './Button';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ items, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`w-full h-14 border flex items-center ${className}`}>
      {items.map(item => (
        <Button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          variant={activeTab === item.id ? 'primary' : 'ghost'}
          className="w-full h-full [&>span]:w-full [&>span]:h-full [&>span]:flex [&>span]:items-center [&>span]:justify-center [&>span]:px-2"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}