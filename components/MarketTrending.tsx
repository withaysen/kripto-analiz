"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TrendingCoin {
  symbol: string;
  change: number;
  emoji: string;
}

interface MarketTrendingProps {
  trending: TrendingCoin[];
}

export function MarketTrending({ trending }: MarketTrendingProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Günün Yıldızları
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trending.map((coin, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{coin.emoji}</span>
                <span className="font-medium">{coin.symbol}</span>
              </div>
              <span
                className={`font-semibold ${
                  coin.change >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {coin.change >= 0 ? "+" : ""}
                {coin.change.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

