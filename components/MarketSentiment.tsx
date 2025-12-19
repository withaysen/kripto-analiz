"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketSentimentProps {
  score: number; // 0-100 (0=Korku, 100=Açgözlü)
  label: string;
}

export function MarketSentiment({ score, label }: MarketSentimentProps) {
  // Renk belirleme
  const getColor = () => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Korku ve Açgözlülük</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[120px]">
          {/* Büyük skor */}
          <div className={`text-5xl font-bold ${getTextColor()}`}>
            {score}
          </div>
          {/* Label */}
          <div className={`text-lg font-semibold ${getTextColor()}`}>
            {label}
          </div>
          {/* Progress bar gösterge */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Korku</span>
              <span>Açgözlü</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getColor()} transition-all duration-300`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

