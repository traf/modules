import Code from './components/Code';

export default function Home() {
  return (
    <main className="w-full p-8 !pb-20 divide-y divide-neutral-800 divide-dashed">

      <div className="flex flex-col pb-8">
        <h1>Modul.es</h1>
        <p>Simple API endpoints</p>
      </div>

      <div className="flex flex-col py-8">
        <h2>ens.module();</h2>
        <div className="flex flex-col pl-6 mt-6 border-l border-neutral-800 border-dashed">
          <a href="/ens/traf.eth" target="_blank">↳ modul.es/ens/traf.eth</a>
          <a href="/ens/0x881475210E75b814D5b711090a064942b6f30605" target="_blank" className="truncate block max-w-full">↳ modul.es/ens/0x881475210E75b814D5b711090a064942b6f30605</a>
          <Code url="/ens/0x881475210E75b814D5b711090a064942b6f30605" />
          <p className="text-xs">60 requests/min | 5m cache</p>
        </div>
      </div>

      <div className="flex flex-col py-8">
        <h2>price.module();</h2>
        <div className="flex flex-col pl-6 mt-6 border-l border-neutral-800 border-dashed">
          <a href="/price/btc" target="_blank">↳ modul.es/price/btc</a>
          <a href="/price/eth" target="_blank">↳ modul.es/price/eth</a>
          <a href="/price/hype" target="_blank">↳ modul.es/price/hype</a>
          <Code url="/price/hype" />
          <p className="text-xs">100 requests/min | 10s cache</p>
        </div>
      </div>

    </main>
  );
}