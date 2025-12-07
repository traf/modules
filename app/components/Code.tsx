'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';

interface CodeProps {
  url?: string;
  children?: string;
  copy?: boolean;
  filename?: string;
}

export default function Code({ url, children, copy = true, filename = "page.tsx" }: CodeProps) {
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

  const highlightPunctuation = (code: string) => {
    return code.replace(/([{}()[\];,.<>=!&|+\-*/])/g, '<span class="text-grey">$1</span>');
  };

  const renderCodeWithLineNumbers = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="flex leading-loose">
        <span className="text-grey select-none pr-8 text-right">
          {index + 1}
        </span>
        <span
          className="text-white"
          dangerouslySetInnerHTML={{ __html: highlightPunctuation(line) }}
        />
      </div>
    ));
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

  const codeContent = children ? formatCode(children) : data;

  return (
    <div className="border bg-black w-fit my-1 overflow-x-auto max-w-full">

      {/* Titlebar */}
      <div className="border-b p-1 flex items-center justify-between">
        <span className="text-grey ml-4">{filename}</span>
        {copy && (
          <Button
            onClick={handleCopy}
            variant="icon"
            className="ml-4"
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
      </div>

      {/* Code */}
      <pre className="p-5 overflow-x-auto">
        <code className="font text-white">
          {renderCodeWithLineNumbers(codeContent)}
        </code>
      </pre>

    </div>
  );
}
