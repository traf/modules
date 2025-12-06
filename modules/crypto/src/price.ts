async function getTokenNameFromCoinGecko(symbol: string): Promise<string | null> {
  try {
    const lowerSymbol = symbol.toLowerCase();
    
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json() as { coins?: { symbol?: string; id: string; name: string }[] };
    
    const coin = data.coins?.find((c: { symbol?: string; id: string; name: string }) => 
      c.symbol?.toLowerCase() === lowerSymbol
    );
    
    return coin?.name || null;
  } catch {
    return null;
  }
}

export async function fetchCryptoPrice(symbol: string) {
  try {
    const upperSymbol = symbol.toUpperCase();
    
    const fetchURL = `https://api.g.alchemy.com/prices/v1/${process.env.ALCHEMY_API_KEY}/tokens/by-symbol`;
    
    const params = new URLSearchParams();
    params.append('symbols', upperSymbol);
    
    const urlWithParams = `${fetchURL}?${params.toString()}`;
    
    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Alchemy API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as { data?: any[] };
    
    if (!data.data || data.data.length === 0) {
      throw new Error('Token not found');
    }
    
    const tokenData = data.data[0];
    
    if (tokenData.error) {
      throw new Error(`Token error: ${tokenData.error}`);
    }
    
    const priceValue = tokenData.prices?.[0]?.value;
    
    if (priceValue === undefined || priceValue === null) {
      throw new Error('Price not available');
    }
    
    const price = parseFloat(priceValue);
    
    const tokenName = await getTokenNameFromCoinGecko(upperSymbol);
    
    return {
      name: tokenName || upperSymbol,
      symbol: upperSymbol,
      price: price < 1 ? price.toString() : price.toFixed(2)
    };
  } catch (error) {
    throw new Error(`Failed to fetch crypto price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}