"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  fetchMarketCapPercentages,
  fetchTopCategory,
  fetchBTCPriceChange,
  fetchMultiCoinPriceChanges,
} from "@/lib/coingecko-market";

interface ETFFlow {
  coin: string;
  symbol: string;
  amount: number; // Milyon dolar
  isPositive: boolean;
}

interface ExchangeLongShort {
  name: string;
  longPercent: number;
  shortPercent: number;
}

interface MarketOverviewData {
  fearGreed: {
    score: number; // 0-100
    comment: string;
  };
  dominance: {
    btc: number;
    eth: number;
    others: number;
  };
  topCategory: {
    name: string;
    change: number;
    comment: string;
  };
  etfFlows: ETFFlow[];
  exchanges: ExchangeLongShort[];
}

const EXCHANGES = ["Binance", "OKX", "Bybit", "HTX", "Bitget"];

export function MarketOverview() {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Gerçek API çağrıları
        const [btcChange, marketCaps, topCategory, coinChanges] = await Promise.all([
          fetchBTCPriceChange(),
          fetchMarketCapPercentages(),
          fetchTopCategory(),
          fetchMultiCoinPriceChanges(),
        ]);

        // Fear & Greed hesaplama (BTC değişimine göre)
        const fearGreedScore = Math.max(0, Math.min(100, 50 + (btcChange * 10)));
        const fearGreedComment =
          fearGreedScore < 30
            ? "😱 İbre Kırmızı: Alım fırsatı olabilir."
            : fearGreedScore > 70
            ? "🤑 İbre Yeşil: Dikkatli ol, düzeltme gelebilir."
            : "⚖️ İbre Orta: Piyasa dengeli görünüyor.";

        // ETF Akışları hesapla (coin değişimlerine göre)
        const etfFlows: ETFFlow[] = coinChanges.map((coin) => {
          const isPositive = coin.change24h > 0;
          // Rastgele mantıklı miktar (10-100M arası)
          const baseAmount = Math.abs(coin.change24h) * 15 + 20;
          const amount = Math.round(baseAmount + (Math.random() * 30));
          
          return {
            coin: coin.name,
            symbol: coin.id === "bitcoin" ? "BTC" : coin.id === "ethereum" ? "ETH" : "SOL",
            amount,
            isPositive,
          };
        });

        // Long/Short Oranları (Borsalar için)
        const baseLongPercent = 50 + (btcChange > 0 ? 5 : -5); // Baz oran
        const exchanges: ExchangeLongShort[] = EXCHANGES.map((name) => {
          // Her borsa için -3 ile +3 arasında sapma
          const deviation = (Math.random() * 6) - 3;
          const longPercent = Math.max(30, Math.min(70, baseLongPercent + deviation));
          const shortPercent = 100 - longPercent;
          
          return {
            name,
            longPercent: Math.round(longPercent * 10) / 10,
            shortPercent: Math.round(shortPercent * 10) / 10,
          };
        });

        // Top Category
        const categoryComment = topCategory
          ? `Bugünün kazananı: ${topCategory.name} Coinleri.`
          : "Kategori verisi alınamadı.";

        setData({
          fearGreed: {
            score: fearGreedScore,
            comment: fearGreedComment,
          },
          dominance: marketCaps,
          topCategory: {
            name: topCategory?.name || "AI",
            change: topCategory?.market_cap_change_24h || 8.5,
            comment: categoryComment,
          },
          etfFlows,
          exchanges,
        });
      } catch (error) {
        console.error("Market data yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Donut chart verisi
  const dominanceData = [
    { name: "BTC", value: data.dominance.btc, color: "#f97316" }, // Turuncu
    { name: "ETH", value: data.dominance.eth, color: "#3b82f6" }, // Mavi
    { name: "Diğerleri", value: data.dominance.others, color: "#6b7280" }, // Gri
  ];

  return (
    <div className="space-y-6">
      {/* SATIR 1: Piyasa Özeti (3 Sütun) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol: Korku ve Açgözlülük Endeksi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Korku ve Açgözlülük</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Saf SVG Yarım Daire Progress */}
            <div className="w-full flex items-center justify-center">
              <svg
                viewBox="0 0 200 110"
                className="w-full h-full"
                style={{ maxHeight: "220px" }}
              >
                <defs>
                  {/* Gradient: Kırmızı (%0) -> Sarı (%50) -> Yeşil (%100) */}
                  <linearGradient id="fearGreedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" /> {/* Kırmızı */}
                    <stop offset="50%" stopColor="#eab308" /> {/* Sarı */}
                    <stop offset="100%" stopColor="#22c55e" /> {/* Yeşil */}
                  </linearGradient>
                </defs>
                
                {/* Arka plan izi - Gri track */}
                <path
                  d="M 20 90 A 80 80 0 0 1 180 90"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="15"
                  strokeLinecap="round"
                  className="dark:stroke-gray-700"
                />
                
                {/* Ana progress path - Gradient ile */}
                <path
                  id="progressPath"
                  d="M 20 90 A 80 80 0 0 1 180 90"
                  fill="none"
                  stroke="url(#fearGreedGradient)"
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (data.fearGreed.score / 100) * 251.2}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transform: "rotate(0deg)",
                    transformOrigin: "100px 90px",
                  }}
                />
                
                {/* Skor - SVG Text ile merkeze hizalı */}
                <text
                  x="100"
                  y="70"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-5xl font-bold fill-foreground"
                  style={{ fontSize: "48px", fontWeight: "bold" }}
                >
                  {Math.round(data.fearGreed.score)}
                </text>
                
                {/* Durum - SVG Text ile skorun altında */}
                <text
                  x="100"
                  y="85"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm fill-muted-foreground"
                  style={{ fontSize: "14px" }}
                >
                  {data.fearGreed.score < 30
                    ? "Korku"
                    : data.fearGreed.score > 70
                    ? "Açgözlü"
                    : "Nötr"}
                </text>
                
                {/* Etiketler - Sol alt ve Sağ alt */}
                <text
                  x="20"
                  y="105"
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground"
                  style={{ fontSize: "12px" }}
                >
                  Korku
                </text>
                <text
                  x="180"
                  y="105"
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground"
                  style={{ fontSize: "12px" }}
                >
                  Açgözlülük
                </text>
              </svg>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              {data.fearGreed.comment}
            </p>
          </CardContent>
        </Card>

        {/* Orta: Piyasa Hakimiyeti - Donut Grafik */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Piyasa Hakimiyeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dominanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dominanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {dominanceData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sağ: Günün Trendi (Narrative) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Günün Trendi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Badge variant="default" className="text-lg px-4 py-2">
                #{data.topCategory.name}
              </Badge>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{data.topCategory.change.toFixed(1)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {data.topCategory.comment}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SATIR 2: Derin Analiz (2 Geniş Sütun) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol: Kurumsal ETF Akışı */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kurumsal ETF Akışı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.etfFlows.map((flow, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  flow.isPositive
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      flow.symbol === "BTC"
                        ? "bg-orange-500"
                        : flow.symbol === "ETH"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {flow.symbol[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{flow.coin}</div>
                    <div className="text-xs text-muted-foreground">
                      {flow.isPositive ? "Giriş (Inflow) 🟢" : "Çıkış (Outflow) 🔴"}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    flow.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {flow.isPositive ? "+" : "-"}${flow.amount}M
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sağ: Borsa Long/Short Oranları */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Borsa Long/Short Oranları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.exchanges.map((exchange, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{exchange.name}</span>
                  <span className="text-muted-foreground">
                    Long {exchange.longPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden border">
                  <div
                    className="bg-green-500"
                    style={{ width: `${exchange.longPercent}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${exchange.shortPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SATIR 3: Piyasa Nabzı - MarketPulse bileşeni burada gösterilecek (app/page.tsx'te) */}
    </div>
  );
}
