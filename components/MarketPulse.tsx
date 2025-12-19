"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, AlertCircle, Clock } from "lucide-react";

interface MarketPulseData {
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

export function MarketPulse() {
  const [data, setData] = useState<MarketPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/marketpulse');
        
        if (!response.ok) {
          throw new Error('Veri yüklenemedi');
        }
        
        const pulseData = await response.json();
        setData(pulseData);
      } catch (err) {
        console.error("Market Pulse yükleme hatası:", err);
        setError("Piyasa verileri şu an alınamıyor. Biraz sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Zaman hesaplama - ayrı useEffect
  useEffect(() => {
    if (!data) return;

    const updateTimeAgo = () => {
      if (data.updatedAt) {
        const diff = Date.now() - new Date(data.updatedAt).getTime();
        const minutes = Math.floor(diff / 60000);
        setTimeAgo(minutes === 0 ? "Az önce" : `${minutes} dk önce`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Her dakika güncelle

    return () => clearInterval(interval);
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Piyasa Nabzı</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1: Sektör Performansı */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sektör Performansı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topCategories.length > 0 ? (
              <div className="space-y-3">
                {data.topCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span
                      className={`text-sm font-semibold ${
                        category.change24h >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {category.change24h >= 0 ? "+" : ""}
                      {category.change24h.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Veri bulunamadı</p>
            )}
            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>Kaynak: CoinGecko</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2: Altcoin Mevsimi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Altcoin Mevsimi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">BTC Dominance</span>
                <span className="text-2xl font-bold">{data.btcDominance.toFixed(1)}%</span>
              </div>
              <Progress value={data.btcDominance} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              {data.btcDominance > 50
                ? "Bitcoin domine ediyor"
                : "Altcoinler hareketli"}
            </p>
            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>Kaynak: CoinGecko</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Widget 3: Kazananlar/Kaybedenler */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kazananlar / Kaybedenler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Kazananlar */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  Kazananlar
                </div>
                {data.topGainers.length > 0 ? (
                  <div className="space-y-1">
                    {data.topGainers.map((coin) => (
                      <div
                        key={coin.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-green-50 dark:bg-green-950/20"
                      >
                        <span className="font-medium">{coin.symbol}</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          +{coin.price_change_percentage_24h.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Veri yok</p>
                )}
              </div>

              {/* Kaybedenler */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                  <TrendingDown className="h-4 w-4" />
                  Kaybedenler
                </div>
                {data.topLosers.length > 0 ? (
                  <div className="space-y-1">
                    {data.topLosers.map((coin) => (
                      <div
                        key={coin.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-red-50 dark:bg-red-950/20"
                      >
                        <span className="font-medium">{coin.symbol}</span>
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {coin.price_change_percentage_24h.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Veri yok</p>
                )}
              </div>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>Kaynak: CoinGecko</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

