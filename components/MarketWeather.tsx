"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sun, CloudRain } from "lucide-react";

interface MarketWeatherProps {
  mode: "sunny" | "stormy";
  label: string;
}

export function MarketWeather({ mode, label }: MarketWeatherProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950/30 dark:to-sky-900/30 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[120px]">
          {mode === "sunny" ? (
            <Sun className="h-16 w-16 text-yellow-500 dark:text-yellow-400" />
          ) : (
            <CloudRain className="h-16 w-16 text-gray-600 dark:text-gray-400" />
          )}
          <div className="text-2xl font-bold text-center">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

