'use client';

import { useState } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';

interface CopyProps {
  text: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
  children?: React.ReactNode;
}

export default function Copy({ 
  text, 
  className = '', 
  variant = 'icon', 
  children,
}: CopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
          size="xs"
          className="group-hover:invert"
        />
      )}
    </Button>
  );
}