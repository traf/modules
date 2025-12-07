'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@modules/icons';

interface DropdownItem {
  id: string;
  label: string;
}

interface DropdownProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Dropdown({ items, value, onChange, placeholder = 'Select' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = items.find(item => item.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full h-14 px-4 text-left bg-transparent border border-neutral-800 text-white focus:outline-none cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={selectedItem ? 'text-white' : 'text-neutral-500'}>
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <Icon 
            name="arrow-down-01" 
            set="huge"
            color="white"
            style="sharp"
            className={`${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 -mt-0.5 bg-black border border-neutral-800 z-50">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`w-full px-4 py-2 text-left hover:bg-neutral-900 transition-colors ${
                value === item.id ? 'bg-neutral-900 text-white' : 'text-neutral-300'
              }`}
              onClick={() => {
                onChange(item.id);
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}