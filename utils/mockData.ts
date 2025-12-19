// Mock Data - Test senaryoları için sabit veriler

// Yardımcı fonksiyon: Gelecekteki tarih hesapla
function getDateInFuture(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD formatında
}

export interface MockCoinData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  security: number; // 0-100 güvenlik puanı
  volatility: number; // 0-100 volatilite seviyesi
  liquidity: number; // 0-100 likidite seviyesi
  volume24h: number;
  nextUnlockDate: string | null; // Kilit açılım tarihi (YYYY-MM-DD formatında)
  unlockAmount: number; // Kilit açılacak miktar ($)
  unlockPercent: number; // Dolaşımdaki arza oranı (%)
}

// Senaryo 1: Bitcoin - Güvenli Liman
export const mockBitcoin: MockCoinData = {
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "BTC",
  price: 45230.50,
  change24h: 2.15, // %+2.15 pozitif
  marketCap: 890000000000, // 890 milyar dolar
  security: 95, // Çok yüksek güvenlik
  volatility: 25, // Düşük volatilite
  liquidity: 98, // Mükemmel likidite
  volume24h: 25000000000, // 25 milyar dolar
  nextUnlockDate: null, // Kilit yok, güvenli
  unlockAmount: 0,
  unlockPercent: 0,
};

// Senaryo 2: Pepe - Hype/Riskli
export const mockPepe: MockCoinData = {
  id: "pepe",
  name: "Pepe",
  symbol: "PEPE",
  price: 0.0000125, // Çok düşük fiyat
  change24h: 30.5, // %+30.5 (uçuyor)
  marketCap: 5200000000, // 5.2 milyar dolar
  security: 45, // Orta güvenlik
  volatility: 85, // Çok yüksek volatilite
  liquidity: 60, // Orta likidite
  volume24h: 850000000, // 850 milyon dolar
  nextUnlockDate: getDateInFuture(60), // 2 ay sonra
  unlockAmount: 5200000, // 5.2 milyon dolar (%0.1)
  unlockPercent: 0.1, // Önemsiz risk
};

// Senaryo 3: ScamCoin - Tehlikeli
export const mockScamCoin: MockCoinData = {
  id: "scamcoin",
  name: "ScamCoin",
  symbol: "SCAM",
  price: 0.0000001, // Çok düşük fiyat
  change24h: -50.25, // %-50.25 (çakılmış)
  marketCap: 500000, // Sadece 500 bin dolar
  security: 10, // Çok düşük güvenlik
  volatility: 95, // Aşırı volatilite
  liquidity: 5, // Neredeyse hiç likidite yok
  volume24h: 50000, // Çok düşük hacim
  nextUnlockDate: getDateInFuture(3), // 3 gün sonra - KRİTİK!
  unlockAmount: 200000, // 200 bin dolar (toplam arzın %40'ı)
  unlockPercent: 40, // Toplam arzın %40'ı açılacak - KIRMIZI ALARM
};

// Tüm mock coin'leri birleştir
export const mockCoins: Record<string, MockCoinData> = {
  bitcoin: mockBitcoin,
  btc: mockBitcoin,
  pepe: mockPepe,
  scamcoin: mockScamCoin,
  scam: mockScamCoin,
};

// Coin ID'yi normalize et (küçük harfe çevir, boşlukları temizle)
export function normalizeCoinId(input: string): string {
  return input.trim().toLowerCase();
}

// Mock data'dan coin getir
export function getMockCoin(coinId: string): MockCoinData | null {
  const normalized = normalizeCoinId(coinId);
  return mockCoins[normalized] || null;
}

