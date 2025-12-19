"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProDataCardsProps {
  priceChange24h: number;
  totalVolume: number;
  marketCap: number;
  healthScore: number;
}

export function ProDataCards({
  priceChange24h,
  totalVolume,
  marketCap,
  healthScore,
}: ProDataCardsProps) {
  // Kart A: Open Interest (OI) Sinyali
  const volumeRatio = marketCap > 0 ? totalVolume / marketCap : 0;
  const isOIBullish = priceChange24h > 0 && volumeRatio > 0.05;
  const oiSignal = isOIBullish ? "Yükseliyor ↗" : "Zayıflıyor ↘";
  const oiColor = isOIBullish
    ? "text-green-600 dark:text-green-400"
    : "text-muted-foreground";

  // Kart B: Funding Rate (Tahmini)
  let fundingRate: string;
  let fundingColor: string;
  if (healthScore > 60) {
    fundingRate = "+%0.0100";
    fundingColor = "text-green-600 dark:text-green-400";
  } else if (healthScore < 40) {
    fundingRate = "-%0.0045";
    fundingColor = "text-red-600 dark:text-red-400";
  } else {
    fundingRate = "Nötr";
    fundingColor = "text-muted-foreground";
  }

  // Kart C: Volume Turnover (Hacim Çevrimi)
  const volumeTurnover = marketCap > 0 ? (totalVolume / marketCap) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Kart A: Open Interest Sinyali */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Open Interest Sinyali</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {isOIBullish ? (
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={`text-lg font-semibold ${oiColor}`}>{oiSignal}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Hacimli yükseliş, trend onayı.
          </p>
        </CardContent>
      </Card>

      {/* Kart B: Funding Rate */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Funding Rate (Tahmini)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {fundingRate !== "Nötr" ? (
              fundingRate.startsWith("+") ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )
            ) : (
              <Minus className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={`text-lg font-semibold ${fundingColor}`}>
              {fundingRate}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Long pozisyon maliyeti.
          </p>
        </CardContent>
      </Card>

      {/* Kart C: Volume Turnover */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Volume Turnover</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {volumeTurnover.toFixed(2)}%
              </span>
            </div>
            <Progress value={Math.min(volumeTurnover, 100)} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            Piyasa tahtası ne kadar aktif?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

