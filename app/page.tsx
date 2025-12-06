'use client';

import Image from 'next/image';
import Section from './components/Section';
import SectionIcons from './components/SectionIcons';

export default function Home() {
  return (
    <>
      <Section id="modules" title="Modules" description="Code && UI component repository">
        <div className="w-full pt-28 pb-40 overflow-x-hidden">
          <Image src="/modules.png" width={1920} height={1080} alt="Modules" className="w-full pointer-events-none scale-110" />
        </div>
      </Section>

      <SectionIcons />

      {/* API */}
      {/* <Section id="api" title="api.module" description="Simple API endpoints">

        <div className="flex flex-col gap-1">
          <h2 className="mb-3">ens.module<span>();</span></h2>
          <a href="/ens/traf.eth" target="_blank">↳ modul.es/ens/traf.eth</a>
          <a href="/ens/0x881475210E75b814D5b711090a064942b6f30605" target="_blank" className="truncate block max-w-full">↳ modul.es/ens/0x881475210E75b814D5b711090a064942b6f30605</a>
          <Code url="/ens/0x881475210E75b814D5b711090a064942b6f30605" />
          <p className="text-xs mt-2">60 requests/min | 5m cache</p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="mb-3">price.module<span>();</span></h2>
          <a href="/price/btc" target="_blank">↳ modul.es/price/btc</a>
          <a href="/price/hype" target="_blank">↳ modul.es/price/hype</a>
          <Code url="/price/hype" />
          <p className="text-xs mt-2">50 requests/min | 30s cache</p>
        </div>
      </Section> */}
    </>
  );
}