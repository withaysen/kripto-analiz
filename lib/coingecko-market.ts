// CoinGecko Market Data API Servisi
// Gerçek piyasa verilerini çeker

export interface BTCGlobalData {
  btcDominance: number; // BTC market cap percentage
}

export interface CoinCategory {
  id: string;
  name: string;
  market_cap_change_24h: number;
}

// Market cap percentage verilerini çek (BTC, ETH, Diğerleri)
export interface MarketCapPercentages {
  btc: number;
  eth: number;
  others: number;
}

export async function fetchMarketCapPercentages(): Promise<MarketCapPercentages> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    const percentages = data.data.market_cap_percentage || {};
    const btc = percentages.btc || 50;
    const eth = percentages.eth || 20;
    const others = 100 - btc - eth;
    
    return { btc, eth, others: Math.max(0, others) };
  } catch (error) {
    console.error("Market Cap Percentages API hatası:", error);
    // Fallback: Mock data
    return { btc: 52.5, eth: 18.5, others: 29 };
  }
}

// BTC Dominance verisini çek (gerçek API) - Backward compatibility
export async function fetchBTCDominance(): Promise<number> {
  const data = await fetchMarketCapPercentages();
  return data.btc;
}

// En çok artan kategoriyi çek (gerçek API)
export async function fetchTopCategory(): Promise<CoinCategory | null> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/categories');
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    // En çok artan kategoriyi bul
    const sorted = data
      .filter((cat: any) => cat.market_cap_change_24h > 0)
      .sort((a: any, b: any) => b.market_cap_change_24h - a.market_cap_change_24h);
    
    if (sorted.length > 0) {
      return {
        id: sorted[0].id,
        name: sorted[0].name,
        market_cap_change_24h: sorted[0].market_cap_change_24h,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Category API hatası:", error);
    // Fallback: Mock data
    return {
      id: "artificial-intelligence",
      name: "AI",
      market_cap_change_24h: 8.5,
    };
  }
}

// BTC fiyat değişimini çek (Fear & Greed hesaplaması için)
export async function fetchBTCPriceChange(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
    );
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return data.bitcoin?.usd_24h_change || 0;
  } catch (error) {
    console.error("BTC Price Change API hatası:", error);
    return 2.5; // Fallback
  }
}

// Multi-coin fiyat değişimlerini çek (ETF Akışı için)
export interface CoinPriceChange {
  id: string;
  name: string;
  change24h: number;
}

export async function fetchMultiCoinPriceChanges(): Promise<CoinPriceChange[]> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
    );
    
    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return [
      {
        id: "bitcoin",
        name: "Bitcoin",
        change24h: data.bitcoin?.usd_24h_change || 0,
      },
      {
        id: "ethereum",
        name: "Ethereum",
        change24h: data.ethereum?.usd_24h_change || 0,
      },
      {
        id: "solana",
        name: "Solana",
        change24h: data.solana?.usd_24h_change || 0,
      },
    ];
  } catch (error) {
    console.error("Multi-coin Price Change API hatası:", error);
    // Fallback
    return [
      { id: "bitcoin", name: "Bitcoin", change24h: 2.5 },
      { id: "ethereum", name: "Ethereum", change24h: 1.8 },
      { id: "solana", name: "Solana", change24h: 3.2 },
    ];
  }
}

