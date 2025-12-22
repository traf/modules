'use client';

import { useState } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';

interface CopyProps {
  text?: string;
  imageUrl?: string;
  className?: string;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Copy({ 
  text, 
  imageUrl,
  className = '', 
  children,
  size = 'xs',
}: CopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      } else if (text) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="icon"
      className={className}
    >
      {children || (
        <Icon
          name={copied ? "check" : "duplicate"}
          set="pixelart"
          color="white"
          size={size}
          className="group-hover:invert"
        />
      )}
    </Button>
  );
}