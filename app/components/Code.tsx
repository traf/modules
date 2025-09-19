'use client';

import { useEffect, useState } from 'react';

interface CodeProps {
  url: string;
}

export default function Code({ url }: CodeProps) {
  const [data, setData] = useState<string>('{ "Loading": "True" }');

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(json => setData(JSON.stringify(json, null, 2)))
      .catch(() => setData('{ "404": "Not Found" }'));
  }, [url]);

  return (
    <pre className="border border-neutral-800 border-dashed bg-white/5 w-fit mt-4 mb-2 px-4 py-3 overflow-x-auto max-w-full min-w-xs">
      <code className="font !text-xs">
        {data}
      </code>
    </pre>
  );
}
