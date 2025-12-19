"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Copy, Check, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Referans coin'lerin market cap değerleri (yaklaşık)
const REFERENCE_COINS = {
  SOLANA: {
    name: "Solana",
    symbol: "SOL",
    marketCap: 85000000000, // 85 milyar dolar
  },
  ETHEREUM: {
    name: "Ethereum",
    symbol: "ETH",
    marketCap: 450000000000, // 450 milyar dolar
  },
  BITCOIN: {
    name: "Bitcoin",
    symbol: "BTC",
    marketCap: 890000000000, // 890 milyar dolar
  },
};

interface ProfitSimulatorProps {
  currentMarketCap: number;
  currentCoinName: string;
}

export function ProfitSimulator({
  currentMarketCap,
  currentCoinName,
}: ProfitSimulatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [selectedReference, setSelectedReference] = useState<keyof typeof REFERENCE_COINS | null>(null);
  const [useFDV, setUseFDV] = useState(false);
  const [copied, setCopied] = useState(false);

  // Kar hesaplama
  const calculateProfit = (): {
    finalAmount: number;
    multiplier: number;
    message: string;
    isUnrealistic: boolean;
    isShrinking: boolean;
  } | null => {
    if (!selectedReference) return null;

    const targetMarketCap = REFERENCE_COINS[selectedReference].marketCap;
    const multiplier = targetMarketCap / currentMarketCap;
    const finalAmount = multiplier * investmentAmount;
    const isShrinking = multiplier < 1;
    const isUnrealistic = multiplier > 1000;

    // Gerçekçi mesaj kontrolü
    if (multiplier < 1.5 && multiplier >= 1) {
      return {
        finalAmount,
        multiplier,
        message: "Zaten tepedesiniz, paranız sadece çok az artabilir",
        isUnrealistic: false,
        isShrinking: false,
      };
    }

    if (isUnrealistic) {
      return {
        finalAmount,
        multiplier,
        message: "Bu çok büyük bir hayal, gerçekçi olmayabilir",
        isUnrealistic: true,
        isShrinking: false,
      };
    }

    return {
      finalAmount,
      multiplier,
      message: "",
      isUnrealistic: false,
      isShrinking,
    };
  };

  const result = calculateProfit();

  // Format number
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatMultiplier = (mult: number, isUnrealistic: boolean): string => {
    if (isUnrealistic) return ">1000x (çok gerçekçi değil)";
    if (mult >= 1000) return `${(mult / 1000).toFixed(1)}Kx`;
    if (mult >= 100) return `${mult.toFixed(1)}x`;
    if (mult >= 10) return `${mult.toFixed(2)}x`;
    if (mult >= 1) return `${mult.toFixed(2)}x`;
    return `${mult.toFixed(3)}x`;
  };

  // Paylaşılabilir cümle oluştur
  const generateShareableText = (): string => {
    if (!result || !selectedReference) return "";
    
    const refCoin = REFERENCE_COINS[selectedReference];
    const multiplierText = formatMultiplier(result.multiplier, result.isUnrealistic);
    
    return `${currentCoinName}, ${refCoin.name} market cap seviyesine (${
      formatNumber(refCoin.marketCap)
    }) gelirse: ${multiplierText}`;
  };

  // Kopyalama fonksiyonu
  const handleCopy = async () => {
    const text = generateShareableText();
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Hayaller vs. Gerçekler
        </CardTitle>
        <CardDescription>
          {currentCoinName} seçilen coin seviyesine gelirse ne olur?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Yatırım Miktarı */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Yatırım Miktarı
          </label>
          <Input
            type="number"
            value={investmentAmount === 0 ? "" : investmentAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || value === "0") {
                setInvestmentAmount(0);
                return;
              }
              const numValue = parseFloat(value);
              if (!isNaN(numValue) && numValue >= 0) {
                setInvestmentAmount(numValue);
              }
            }}
            onBlur={(e) => {
              if (e.target.value === "" || parseFloat(e.target.value) === 0) {
                setInvestmentAmount(1000);
              }
            }}
            placeholder="1000"
            className="text-lg"
            min="0"
            step="1"
          />
        </div>

        {/* Circulating vs FDV Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Market Cap Tipi</label>
            <p className="text-xs text-muted-foreground">
              {useFDV ? "Fully Diluted (FDV)" : "Circulating"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Circulating</span>
            <Switch checked={useFDV} onCheckedChange={setUseFDV} />
            <span className="text-sm text-muted-foreground">FDV</span>
          </div>
        </div>

        <Separator />

        {/* Kıyaslama Seçenekleri */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Piyasa Değeri Karşılaştırması
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(REFERENCE_COINS).map(([key, coin]) => (
              <Button
                key={key}
                variant={selectedReference === key ? "default" : "outline"}
                onClick={() => setSelectedReference(key as keyof typeof REFERENCE_COINS)}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <span className="font-semibold">{coin.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(coin.marketCap)}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sonuç Gösterimi */}
        {result && selectedReference && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="text-center space-y-2 p-6 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground mb-2">
                  {currentCoinName} {REFERENCE_COINS[selectedReference].name} seviyesine gelirse:
                </div>
                {result.isUnrealistic ? (
                  <>
                    <div className="text-4xl font-bold text-primary">
                      {formatMultiplier(result.multiplier, true)}
                    </div>
                    <div className="text-lg text-muted-foreground mt-2">
                      Final tutar hesaplanamaz (çok gerçekçi değil)
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-primary">
                      {formatNumber(result.finalAmount)}
                    </div>
                    <div className="text-xl text-muted-foreground">
                      ({formatMultiplier(result.multiplier, false)})
                    </div>
                  </>
                )}
                {result.message && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {result.message}
                    </Badge>
                  </div>
                )}
                {result.isUnrealistic && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-help">
                          <Info className="h-3 w-3" />
                          <span>Neden gerçekçi değil?</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Likidite eksikliği, arz artışı (unlock riski) ve market cap kıyası 
                          bu kadar büyük bir büyümeyi desteklemez. FDV vs Circulating farkı 
                          da önemli bir faktördür.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Kopyalama Butonu */}
              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full"
                disabled={!result}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Sonucu Kopyala
                  </>
                )}
              </Button>

              {/* Detay Bilgisi */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Mevcut Market Cap:</span>
                  <span className="font-medium">{formatNumber(currentMarketCap)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hedef Market Cap:</span>
                  <span className="font-medium">
                    {formatNumber(REFERENCE_COINS[selectedReference].marketCap)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Çarpan:</span>
                  <span className="font-medium">
                    {formatMultiplier(result.multiplier, result.isUnrealistic)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {!selectedReference && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Yukarıdan bir referans coin seçin
          </div>
        )}

        {/* Disclaimer */}
        <Separator />
        <p className="text-xs text-muted-foreground text-center">
          Bu hesap circulating market cap varsayımıyla yaklaşık bir simülasyondur. 
          Arz değişebilir, FDV vs circulating farkı vardır.
        </p>
      </CardContent>
    </Card>
  );
}
