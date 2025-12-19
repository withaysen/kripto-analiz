"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface TokenUnlockProps {
  nextUnlockDate: string | null | undefined;
  unlockAmount: number | undefined;
  unlockPercent: number | undefined;
  coinName: string;
}

export function TokenUnlock({
  nextUnlockDate,
  unlockAmount = 0,
  unlockPercent = 0,
  coinName,
}: TokenUnlockProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isCritical, setIsCritical] = useState(false);

  // Kritik durum kontrolü: %20'den fazla veya 7 günden az
  useEffect(() => {
    if (!nextUnlockDate) {
      setIsCritical(false);
      return;
    }

    const unlockDate = new Date(nextUnlockDate);
    const now = new Date();
    const daysUntilUnlock = Math.ceil(
      (unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    setIsCritical(unlockPercent >= 20 || daysUntilUnlock <= 7);

    // Geri sayım hesaplama
    const updateCountdown = () => {
      const now = new Date();
      const diff = unlockDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Kilit açıldı!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days} Gün`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} Saat ${minutes} Dakika`);
      } else {
        setTimeRemaining(`${minutes} Dakika`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Her dakika güncelle

    return () => clearInterval(interval);
  }, [nextUnlockDate, unlockPercent]);

  // Format number
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Kilit yoksa - Güvenli durum
  if (!nextUnlockDate) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                ✅ Arz yapısı güvenli. Gizli enflasyon riski yok.
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {coinName} için yakın zamanda token unlock planlanmamış.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Kritik durum - Kırmızı alarm
  if (isCritical) {
    return (
      <Alert
        variant="destructive"
        className="border-2 border-red-500 animate-pulse"
      >
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-base font-bold flex items-center gap-2">
          <span className="animate-pulse">⚠️</span>
          KRİTİK UYARI: Satış Baskısı Bekleniyor!
        </AlertTitle>
        <AlertDescription className="mt-3 space-y-2">
          <p className="text-base font-semibold">
            {timeRemaining && (
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Kalan Süre: <span className="text-red-600 dark:text-red-400">{timeRemaining}</span>
              </span>
            )}
          </p>
          <p className="text-base">
            {timeRemaining ? `${timeRemaining} içinde` : "Yakında"} piyasaya{" "}
            <span className="font-bold text-red-600 dark:text-red-400">
              {formatNumber(unlockAmount)}
            </span>{" "}
            değerinde coin girecek.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="destructive" className="text-xs">
              Toplam arzın %{unlockPercent.toFixed(1)}'i
            </Badge>
            <span className="text-sm text-muted-foreground">
              Fiyat sert düşebilir!
            </span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Normal durum - Orta risk
  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Token Unlock Uyarısı
        </CardTitle>
        <CardDescription>
          Yaklaşan kilit açılımı bilgisi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Kalan Süre:</span>
          <Badge variant="outline" className="text-sm">
            {timeRemaining}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Unlock Miktarı:</span>
          <span className="text-sm font-medium">{formatNumber(unlockAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Arz Oranı:</span>
          <Badge variant="secondary" className="text-xs">
            %{unlockPercent.toFixed(2)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Bu miktar piyasaya girdiğinde fiyat etkilenebilir.
        </p>
      </CardContent>
    </Card>
  );
}

