// Mock Data API servisi
// Gerçek API yerine sabit test verileri kullanıyor

import { getMockCoin, type MockCoinData } from "@/utils/mockData";

// CoinGecko API Helper
const BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Reusable CoinGecko API fetch helper
 * Uses Next.js fetch caching (5 minutes)
 * Throws on non-OK responses
 */
export async function fetchFromCoingecko(endpoint: string) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      next: { revalidate: 300 }, // 5 minutes cache
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`CoinGecko fetch error (${endpoint}):`, error);
    throw error;
  }
}

export interface CoinData {
  id: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  security?: number;
  volatility?: number;
  liquidity?: number;
  volume24h?: number;
  nextUnlockDate?: string | null;
  unlockAmount?: number;
  unlockPercent?: number;
}

// Mock data'dan coin verilerini getir
export async function fetchCoinData(coinId: string): Promise<CoinData | null> {
  try {
    // Kısa bir delay ekle (gerçek API gibi hissettirmek için)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockCoin = getMockCoin(coinId);
    
    if (!mockCoin) {
      throw new Error(
        `Coin bulunamadı. Lütfen şunlardan birini deneyin: BTC, PEPE, SCAM`
      );
    }
    
    // MockCoinData'yı CoinData formatına dönüştür
    return {
      id: mockCoin.id,
      name: mockCoin.name,
      price: mockCoin.price,
      change24h: mockCoin.change24h,
      marketCap: mockCoin.marketCap,
      security: mockCoin.security,
      volatility: mockCoin.volatility,
      liquidity: mockCoin.liquidity,
      volume24h: mockCoin.volume24h,
      nextUnlockDate: mockCoin.nextUnlockDate,
      unlockAmount: mockCoin.unlockAmount,
      unlockPercent: mockCoin.unlockPercent,
    };
  } catch (error) {
    console.error("Mock data hatası:", error);
    throw error;
  }
}

