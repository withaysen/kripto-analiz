import { NextResponse } from "next/server";
import { fetchFromCoingecko } from "@/lib/coingecko";

interface Category {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
}

interface GlobalData {
  data: {
    market_cap_percentage: {
      btc: number;
    };
  };
}

interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

interface MarketPulseResponse {
  topCategories: Array<{
    name: string;
    change24h: number;
  }>;
  btcDominance: number;
  topGainers: Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
  }>;
  topLosers: Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
  }>;
  updatedAt: string;
}

export async function GET() {
  try {
    // Parallel fetching with Promise.all
    const [categoriesData, globalData, marketsData] = await Promise.all([
      fetchFromCoingecko("/coins/categories"),
      fetchFromCoingecko("/global"),
      fetchFromCoingecko(
        "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1"
      ),
    ]);

    // 1. BTC Dominance
    const btcDominance =
      (globalData as GlobalData).data?.market_cap_percentage?.btc || 0;

    // 2. Top Categories (top 3 by market_cap)
    const categories = (categoriesData as Category[])
      .filter((cat) => cat.market_cap > 0)
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, 3)
      .map((cat) => ({
        name: cat.name,
        change24h: cat.market_cap_change_24h || 0,
      }));

    // 3. Top Gainers and Losers with quality filter
    const coins = (marketsData as MarketCoin[]).filter(
      (coin) =>
        coin.market_cap >= 50_000_000 && coin.total_volume >= 5_000_000
    );

    // Sort by price_change_percentage_24h
    const sorted = coins.sort(
      (a, b) =>
        (b.price_change_percentage_24h || 0) -
        (a.price_change_percentage_24h || 0)
    );

    // Top 3 gainers (highest)
    const topGainers = sorted.slice(0, 3).map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap,
    }));

    // Top 3 losers (lowest)
    const topLosers = sorted
      .slice(-3)
      .reverse()
      .map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        market_cap: coin.market_cap,
      }));

    const response: MarketPulseResponse = {
      topCategories: categories,
      btcDominance,
      topGainers,
      topLosers,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Market Pulse API route error:", error);
    return NextResponse.json(
      { error: "CoinGecko API temporarily unavailable." },
      { status: 500 }
    );
  }
}

// Cache için revalidate
export const revalidate = 300; // 5 dakika

