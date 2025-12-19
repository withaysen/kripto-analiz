// Piyasa Hava Durumu Mock Data
// Genel kripto piyasası durumunu simüle eder

export interface MarketWeather {
  mode: "sunny" | "stormy"; // Piyasa modu
  label: string; // GÜNEŞLİ veya FIRTINALI
}

export interface MarketSentiment {
  score: number; // 0-100 (0=Korku, 100=Açgözlü)
  label: string; // "Açgözlü" veya "Korku"
}

export interface TrendingCoin {
  symbol: string;
  change: number; // % değişim
  emoji: string; // 🚀, 🔥, 🟢, vb.
}

export interface MarketData {
  weather: MarketWeather;
  sentiment: MarketSentiment;
  trending: TrendingCoin[];
}

// Piyasa durumu mock data
export const marketMockData: MarketData = {
  weather: {
    mode: "sunny",
    label: "GÜNEŞLİ"
  },
  sentiment: {
    score: 75, // 0-100 arası (75 = Açgözlü tarafında)
    label: "Açgözlü"
  },
  trending: [
    { symbol: "BTC", change: 5.2, emoji: "🚀" },
    { symbol: "PEPE", change: 12.4, emoji: "🔥" },
    { symbol: "SOL", change: 2.1, emoji: "🟢" }
  ]
};

