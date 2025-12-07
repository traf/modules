'use client';

import { useState } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';

interface CopyProps {
  text: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
  children?: React.ReactNode;
  iconSize?: string;
}

export default function Copy({ 
  text, 
  className = '', 
  variant = 'icon', 
  children,
  iconSize = 'w-4'
}: CopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      className={className}
    >
      {children || (
        <Icon
          name={copied ? "tick-02" : "copy-01"}
          set="huge"
          color="white"
          style="sharp"
          className={`${iconSize} group-hover:invert`}
        />
      )}
    </Button>
  );
}