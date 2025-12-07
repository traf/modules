'use client';

import Image from 'next/image';

export default function Home() {
  return (
    <div className="h-full flex items-center justify-center overflow-hidden">
      <Image src="/modules.png" width={1920} height={1080} alt="Modules" className="w-full scale-110 select-none pointer-events-none" priority />
    </div>
  );
}