'use client';

import { useEffect, useState } from 'react';
import Copy from './Copy';

interface CodeProps {
  url?: string;
  children?: string | React.ReactNode;
  filename?: string;
  type?: 'code' | 'terminal';
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function Code({ url, children, filename = "page.tsx", type, title, subtitle, className }: CodeProps) {
  const [data, setData] = useState<string>('{ "Loading": "True" }');

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
        <span className="text-grey select-none pr-5 text-right text-sm">
          {type === 'terminal' ? '%' : index + 1}
        </span>
        <span
          className="text-white text-sm"
          dangerouslySetInnerHTML={{ __html: highlightPunctuation(line) }}
        />
      </div>
    ));
  };


  const codeContent = typeof children === 'string' ? formatCode(children) : data;
  const hasStringContent = typeof children === 'string' || url;
  const showCopy = hasStringContent;
  const displayTitle = title || (type === 'terminal' ? 'Terminal' : filename);
  const textToCopy = typeof children === 'string' ? formatCode(children) : data;

  return (
    <div className={`bg-black w-full h-fit ${className || ''}`}>

      {/* Titlebar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-white">{displayTitle}</p>
        <div className="flex items-center gap-4">
          {subtitle && <p className="text-grey">{subtitle}</p>}
          {showCopy && (
            <Copy
              text={textToCopy}
              className="-m-2"
            />
          )}
        </div>
      </div>

      {/* Content */}
      {hasStringContent ? (
        <pre className="p-4 overflow-x-auto scrollbar-hide border">
          <code className="font text-white relative">
            {renderCodeWithLineNumbers(codeContent)}
          </code>
        </pre>
      ) : (
        <div className="p-2.5 border">
          {children}
        </div>
      )}

    </div>
  );
}
