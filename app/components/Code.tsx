'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';

interface CodeProps {
  url?: string;
  children?: string;
  copy?: boolean;
}

export default function Code({ url, children, copy = true }: CodeProps) {
  const [data, setData] = useState<string>('{ "Loading": "True" }');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (url) {
    fetch(url)
      .then(res => res.json())
      .then(json => setData(JSON.stringify(json, null, 2)))
      .catch(() => setData('{ "404": "Not Found" }'));
    }
  }, [url]);

  const formatCode = (code: string) => {
    return code.trim();
  };

  const handleCopy = async () => {
    const textToCopy = children ? formatCode(children) : data;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail
    }
  };

  return (
    <pre className="border rounded-sm bg-white/5 w-fit my-1 p-6 overflow-x-auto max-w-full relative">
      <code className="font !text-sm">
        {children ? formatCode(children) : data}
      </code>
      {copy && (
        <Button
          onClick={handleCopy}
          variant="icon"
          className="absolute top-4 right-4"
        >
          <Icon
            name={copied ? "tick-02" : "copy-01"}
            style="sharp"
            color="white"
            stroke="2"
            className="w-4 group-hover:invert"
          />
        </Button>
      )}
    </pre>
  );
}
