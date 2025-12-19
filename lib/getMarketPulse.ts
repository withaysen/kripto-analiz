// Market Pulse Servisi
// CoinGecko API'den piyasa nabzı verilerini çeker (Server-side)
// 5 dakika cache uygulanır

interface Category {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
}

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price_change_percentage_24h: number;
  current_price: number;
}

interface MarketPulseData {
  topCategories: Array<{
    name: string;
    change24h: number;
  }>;
  btcDominance: number;
  topGainers: Array<{
    symbol: string;
    name: string;
    change24h: number;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    change24h: number;
  }>;
  lastUpdate: number; // Timestamp
}

// Cache için global değişken (server-side)
let cache: MarketPulseData | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function getMarketPulse(): Promise<MarketPulseData> {
  // Cache kontrolü
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_DURATION) {
    return cache;
  }

  try {
    // 1. Sektör Performansı - En büyük 3 kategori
    const categoriesResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/categories',
      { next: { revalidate: 300 } } // 5 dakika cache
    );
    
    let topCategories: Array<{ name: string; change24h: number }> = [];
    if (categoriesResponse.ok) {
      const categories: Category[] = await categoriesResponse.json();
      const sorted = categories
        .filter(cat => cat.market_cap > 0)
        .sort((a, b) => b.market_cap - a.market_cap)
        .slice(0, 3);
      
      topCategories = sorted.map(cat => ({
        name: cat.name,
        change24h: cat.market_cap_change_24h || 0,
      }));
    }

    // 2. BTC Dominance
    const globalResponse = await fetch(
      'https://api.coingecko.com/api/v3/global',
      { next: { revalidate: 300 } }
    );
    
    let btcDominance = 50; // Varsayılan
    if (globalResponse.ok) {
      const globalData = await globalResponse.json();
      btcDominance = globalData.data?.market_cap_percentage?.btc || 50;
    }

    // 3. Kazananlar/Kaybedenler
    const marketsResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250&page=1&order=market_cap_desc',
      { next: { revalidate: 300 } }
    );
    
    let topGainers: Array<{ symbol: string; name: string; change24h: number }> = [];
    let topLosers: Array<{ symbol: string; name: string; change24h: number }> = [];
    
    if (marketsResponse.ok) {
      const coins: Coin[] = await marketsResponse.json();
      
      // 24h değişime göre sırala
      const sorted = coins
        .filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined)
        .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
      
      // En çok artan 3
      topGainers = sorted
        .slice(0, 3)
        .map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          change24h: coin.price_change_percentage_24h || 0,
        }));
      
      // En çok düşen 3
      topLosers = sorted
        .slice(-3)
        .reverse()
        .map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          change24h: coin.price_change_percentage_24h || 0,
        }));
    }

    const data: MarketPulseData = {
      topCategories,
      btcDominance,
      topGainers,
      topLosers,
      lastUpdate: now,
    };

    // Cache'e kaydet
    cache = data;
    cacheTime = now;

    return data;
  } catch (error) {
    console.error("Market Pulse API hatası:", error);
    
    // Hata durumunda cache'i döndür veya varsayılan değerler
    if (cache) {
      return cache;
    }
    
    // Varsayılan değerler
    return {
      topCategories: [],
      btcDominance: 50,
      topGainers: [],
      topLosers: [],
      lastUpdate: now,
    };
  }
}

