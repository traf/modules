export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-mono uppercase p-8">
      <h1 className="mb-10">API_MODULES</h1>
      
      <section className="flex flex-col gap-2 mb-10">
        <h2>ENS API</h2>
        <a href="/ens/vitalik.eth">GET /ENS/VITALIK.ETH</a>
        <a href="/ens/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045">GET /ENS/0XD8DA6BF26964AF9D7EED9E03E53415D37AA96045</a>
        <p>RATE LIMIT: 60/MIN • CACHE: 5MIN</p>
      </section>
      
      <section className="flex flex-col gap-2 mb-10">
        <h2>PRICE API</h2>
        <a href="/price/eth">GET /PRICE/ETH</a>
        <a href="/price/btc">GET /PRICE/BTC</a>
        <p>COMING SOON</p>
      </section>
    </main>
  );
}