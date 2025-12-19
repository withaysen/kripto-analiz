// Sağlık Skoru Hesaplama Algoritması

import type { CoinData } from "@/lib/coingecko";

export interface SubScores {
  security: number; // 0-100
  liquidity: number; // 0-100
  volatilityScore: number; // 0-100 (ters çevrilmiş)
  volumeScore: number; // 0-100
}

export interface HealthScoreResult {
  baseScore: number; // Ağırlıklı skor (cezalar öncesi)
  finalScore: number; // Cezalar sonrası final skor
  subScores: SubScores;
  penalties: {
    security: number;
    liquidity: number;
    volatility: number;
  };
  reasons: string[];
  biggestRisk: string;
}

// Volume'u 0-100'e normalize et (log scale)
function normalizeVolume(volume: number): number {
  if (volume <= 0) return 0;
  
  // Log scale ile normalize et
  // Maksimum volume referansı: 100B (çok büyük coin'ler için)
  const maxVolume = 100000000000; // 100 milyar
  const minVolume = 1000; // Minimum threshold
  
  // Log hesaplama
  const logVolume = Math.log10(volume);
  const logMax = Math.log10(maxVolume);
  const logMin = Math.log10(minVolume);
  
  // 0-100 arasına sıkıştır
  const normalized = ((logVolume - logMin) / (logMax - logMin)) * 100;
  
  // 0-100 arasında sınırla
  return Math.max(0, Math.min(100, normalized));
}

// Alt skorları normalize et ve hesapla
function calculateSubScores(coinData: CoinData): SubScores {
  const security = coinData.security ?? 50; // Varsayılan 50
  const liquidity = coinData.liquidity ?? 50;
  const volatility = coinData.volatility ?? 50;
  
  // Volatility'yi ters çevir (yüksek volatilite = kötü)
  const volatilityScore = 100 - volatility;
  
  // Volume'u normalize et
  const volumeScore = normalizeVolume(coinData.volume24h ?? 0);
  
  return {
    security: Math.max(0, Math.min(100, security)),
    liquidity: Math.max(0, Math.min(100, liquidity)),
    volatilityScore: Math.max(0, Math.min(100, volatilityScore)),
    volumeScore: Math.max(0, Math.min(100, volumeScore)),
  };
}

// Ağırlıklı skor hesapla
function calculateWeightedScore(subScores: SubScores): number {
  const weights = {
    security: 0.35, // %35
    liquidity: 0.25, // %25
    volume: 0.20, // %20
    volatility: 0.20, // %20
  };
  
  const weightedScore =
    subScores.security * weights.security +
    subScores.liquidity * weights.liquidity +
    subScores.volumeScore * weights.volume +
    subScores.volatilityScore * weights.volatility;
  
  return Math.round(weightedScore);
}

// Kırmızı alarm cezaları
function calculatePenalties(subScores: SubScores): {
  security: number;
  liquidity: number;
  volatility: number;
} {
  const penalties = {
    security: 0,
    liquidity: 0,
    volatility: 0,
  };
  
  // Security < 35 ise -20 puan
  if (subScores.security < 35) {
    penalties.security = -20;
  }
  
  // Liquidity < 30 ise -10 puan
  if (subScores.liquidity < 30) {
    penalties.liquidity = -10;
  }
  
  // Volatility > 80 (volatilityScore < 20) ise -8 puan
  if (subScores.volatilityScore < 20) {
    penalties.volatility = -8;
  }
  
  return penalties;
}

// Final skor hesapla (cezalar sonrası)
function calculateFinalScore(
  baseScore: number,
  penalties: { security: number; liquidity: number; volatility: number }
): number {
  const totalPenalty = penalties.security + penalties.liquidity + penalties.volatility;
  const finalScore = baseScore + totalPenalty;
  
  // 0-100 arasında sınırla
  return Math.max(0, Math.min(100, finalScore));
}

// "3 Maddede Neden?" otomatik üretim
function generateReasons(
  subScores: SubScores,
  weights: { security: number; liquidity: number; volume: number; volatility: number }
): string[] {
  interface Impact {
    metric: string;
    impact: number;
    score: number;
  }
  
  // Her metrik için etki puanı: (subScore - 50) * weight
  const impacts: Impact[] = [
    {
      metric: "security",
      impact: (subScores.security - 50) * weights.security,
      score: subScores.security,
    },
    {
      metric: "liquidity",
      impact: (subScores.liquidity - 50) * weights.liquidity,
      score: subScores.liquidity,
    },
    {
      metric: "volume",
      impact: (subScores.volumeScore - 50) * weights.volume,
      score: subScores.volumeScore,
    },
    {
      metric: "volatility",
      impact: (subScores.volatilityScore - 50) * weights.volatility,
      score: subScores.volatilityScore,
    },
  ];
  
  // En yüksek 3 etkiyi al (mutlak değer)
  const topImpacts = impacts
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);
  
  // Cümleleri oluştur
  const reasons: string[] = topImpacts.map((impact) => {
    const isPositive = impact.impact > 0;
    
    switch (impact.metric) {
      case "security":
        return isPositive
          ? "Güvenlik sinyalleri güçlü"
          : "Güvenlik riski yüksek";
      case "liquidity":
        return isPositive
          ? "Likidite yeterli, al-sat kolay"
          : "Likidite zayıf, al-sat zorlaşabilir";
      case "volume":
        return isPositive
          ? "İşlem hacmi yüksek, piyasa aktif"
          : "İşlem hacmi düşük, fiyat manipülasyona açık";
      case "volatility":
        return isPositive
          ? "Oynaklık kontrol altında"
          : "Oynaklık yüksek, sert dalga riski";
      default:
        return "";
    }
  });
  
  return reasons;
}

// "En Büyük Risk" otomatik üretim
function generateBiggestRisk(
  subScores: SubScores,
  penalties: { security: number; liquidity: number; volatility: number }
): string {
  // En düşük alt skoru bul
  const scores = [
    { name: "security", value: subScores.security },
    { name: "liquidity", value: subScores.liquidity },
    { name: "volatility", value: subScores.volatilityScore },
    { name: "volume", value: subScores.volumeScore },
  ];
  
  const lowestScore = scores.reduce((min, current) =>
    current.value < min.value ? current : min
  );
  
  // Cezaları da kontrol et
  if (penalties.security < 0) {
    return "⚠️ Güvenlik riski yüksek (scam/honeypot ihtimali)";
  }
  
  if (penalties.liquidity < 0) {
    return "⚠️ Likidite zayıf, çıkış yapmak zor olabilir";
  }
  
  if (penalties.volatility < 0) {
    return "⚠️ Volatilite çok yüksek, ani düşüş riski";
  }
  
  // En düşük skora göre risk mesajı
  switch (lowestScore.name) {
    case "security":
      return "⚠️ Güvenlik riski yüksek (scam/honeypot ihtimali)";
    case "liquidity":
      return "⚠️ Likidite zayıf, çıkış yapmak zor olabilir";
    case "volatility":
      return "⚠️ Volatilite çok yüksek, ani düşüş riski";
    case "volume":
      return "⚠️ Hacim düşük, fiyat kolay manipüle olabilir";
    default:
      return "⚠️ Genel risk faktörleri mevcut";
  }
}

// Ana fonksiyon: Sağlık skoru hesapla
export function calculateHealthScore(coinData: CoinData): HealthScoreResult {
  // 1. Alt skorları normalize et
  const subScores = calculateSubScores(coinData);
  
  // 2. Ağırlıklı skor hesapla
  const weights = {
    security: 0.35,
    liquidity: 0.25,
    volume: 0.20,
    volatility: 0.20,
  };
  const baseScore = calculateWeightedScore(subScores);
  
  // 3. Kırmızı alarm cezaları
  const penalties = calculatePenalties(subScores);
  
  // 4. Final skor (cezalar sonrası)
  const finalScore = calculateFinalScore(baseScore, penalties);
  
  // 5. "3 Maddede Neden?" otomatik üretim
  const reasons = generateReasons(subScores, weights);
  
  // 6. "En Büyük Risk" otomatik üretim
  const biggestRisk = generateBiggestRisk(subScores, penalties);
  
  return {
    baseScore,
    finalScore,
    subScores,
    penalties,
    reasons,
    biggestRisk,
  };
}

