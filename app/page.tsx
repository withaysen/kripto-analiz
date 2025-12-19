"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, Activity, Database, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrafficLight } from "@/components/traffic-light";
import { ProfitSimulator } from "@/components/ProfitSimulator";
import { TokenUnlock } from "@/components/TokenUnlock";
import { MarketOverview } from "@/components/MarketOverview";
import { MarketPulse } from "@/components/MarketPulse";
import { ProDataCards } from "@/components/ProDataCards";
import { Switch } from "@/components/ui/switch";
import { fetchCoinData, type CoinData } from "@/lib/coingecko";
import { calculateHealthScore } from "@/utils/healthScore";

// Veri tipi
interface DashboardData {
  coin: string;
  healthScore: number;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  reasons: string[];
  biggestRisk: string;
  lastUpdate: string;
  confidence: string;
  nextUnlockDate?: string | null;
  unlockAmount?: number;
  unlockPercent?: number;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isProMode, setIsProMode] = useState(false);

  // localStorage'dan Pro Mode tercihini yükle
  useEffect(() => {
    const savedProMode = localStorage.getItem("isProMode");
    if (savedProMode !== null) {
      setIsProMode(savedProMode === "true");
    }
  }, []);

  // Pro Mode değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("isProMode", String(isProMode));
  }, [isProMode]);

  // Veri tazeliği hesapla
  const getLastUpdate = (): string => {
    return "Az önce";
  };

  // Güven seviyesi belirle (skor güveni)
  const getConfidence = (finalScore: number): string => {
    // Skor yüksekse güven yüksek, düşükse güven düşük
    if (finalScore >= 70) return "Yüksek";
    if (finalScore >= 40) return "Orta";
    return "Düşük";
  };

  // API çağrısı yap
  const handleSearch = async () => {
    try {
      console.log("handleSearch çağrıldı, searchQuery:", searchQuery);
      
      if (!searchQuery.trim()) {
        setError("Lütfen bir coin adı girin");
        return;
      }

      setLoading(true);
      setError(null);

      console.log("fetchCoinData çağrılıyor:", searchQuery.trim().toLowerCase());
      const coinData = await fetchCoinData(searchQuery.trim().toLowerCase());
      
      console.log("coinData alındı:", coinData);
      
      if (!coinData) {
        setError("Coin bulunamadı. Lütfen geçerli bir coin ID girin (örn: BTC, PEPE, SCAM)");
        setLoading(false);
        return;
      }

      // Yeni algoritma ile sağlık skoru hesapla
      console.log("calculateHealthScore çağrılıyor");
      let healthResult;
      try {
        healthResult = calculateHealthScore(coinData);
        console.log("healthResult:", healthResult);
      } catch (healthError) {
        console.error("calculateHealthScore hatası:", healthError);
        throw new Error("Sağlık skoru hesaplanırken hata oluştu: " + (healthError instanceof Error ? healthError.message : String(healthError)));
      }

      const confidence = getConfidence(healthResult.finalScore);

      console.log("Data set ediliyor:", {
        coin: coinData.name,
        healthScore: healthResult.finalScore,
      });

      setData({
        coin: coinData.name,
        healthScore: healthResult.finalScore,
        price: coinData.price,
        change24h: coinData.change24h,
        marketCap: coinData.marketCap,
        volume24h: coinData.volume24h || coinData.marketCap * 0.1,
        reasons: healthResult.reasons,
        biggestRisk: healthResult.biggestRisk,
        lastUpdate: getLastUpdate(),
        confidence,
        nextUnlockDate: coinData.nextUnlockDate,
        unlockAmount: coinData.unlockAmount,
        unlockPercent: coinData.unlockPercent,
      });
      
      console.log("Data başarıyla set edildi");
    } catch (err) {
      console.error("Hata oluştu:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enter tuşu ile arama
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("Key pressed:", e.key, "loading:", loading);
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Enter basıldı, arama başlatılıyor:", searchQuery);
      handleSearch();
    }
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    if (confidence === "Yüksek") return "default";
    if (confidence === "Orta") return "secondary";
    return "outline";
  };

  // Format number
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Kripto Sağlık Skoru</h1>
            <p className="text-muted-foreground mt-1">
              Kripto varlıklarınızın sağlık durumunu tek bakışta görün
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Coin Arama - Full Width */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="BTC, PEPE, SCAM yazın"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="pl-11 h-12 text-base"
                  />
                  {loading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="h-12 px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Aranıyor...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Ara
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Market Overview - Piyasanın Hikayesi */}
          {!data && !loading && (
            <>
              <MarketOverview />
              <MarketPulse />
            </>
          )}

          {/* Veri gösterimi - sadece data varsa */}
          {data && (
            <>
              {/* Sağlık Skoru - Basit Mod veya Uzman Mod */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">Sağlık Skoru</CardTitle>
                      {isProMode && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Skor:</span>
                          <span className="text-2xl font-bold">{data.healthScore}/100</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {!isProMode && <TrafficLight score={data.healthScore} />}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="pro-mode"
                          className="text-sm font-medium cursor-pointer"
                          onClick={() => setIsProMode(!isProMode)}
                        >
                          Uzman Modu
                        </label>
                        <Switch
                          id="pro-mode"
                          checked={isProMode}
                          onCheckedChange={setIsProMode}
                        />
                      </div>
                    </div>
                  </div>
                  <CardDescription>{data.coin} için güncel sağlık durumu</CardDescription>
                </CardHeader>
                <CardContent>
                  {isProMode ? (
                    // Uzman Mod: Küçük skor + trafik ışığı üst satırda
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold">{data.healthScore}/100</span>
                          <TrafficLight score={data.healthScore} />
                        </div>
                      </div>
                      {/* Pro Veri Kartları */}
                      <ProDataCards
                        priceChange24h={data.change24h}
                        totalVolume={data.volume24h}
                        marketCap={data.marketCap}
                        healthScore={data.healthScore}
                      />
                    </div>
                  ) : (
                    // Basit Mod: Büyük skor, ortada (Grandma-proof)
                    <div className="space-y-6">
                      {/* Büyük Skor */}
                      <div className="text-center space-y-2">
                        <div className="text-6xl font-bold tracking-tight">
                          {data.healthScore}
                          <span className="text-3xl text-muted-foreground">/100</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <Progress 
                          value={data.healthScore} 
                          className="h-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>

                      {/* Fiyat ve Değişim Bilgisi */}
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Fiyat</span>
                          <span className="text-lg font-semibold">{formatNumber(data.price)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">24s Değişim</span>
                          <Badge 
                            variant={data.change24h >= 0 ? "default" : "destructive"}
                            className="text-sm"
                          >
                            {data.change24h >= 0 ? "+" : ""}{data.change24h.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Piyasa Değeri</span>
                          <span className="text-sm font-medium">{formatNumber(data.marketCap)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2 Kolon Layout - Sadece Basit Mod'da */}
              {!isProMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sağ Kolon: Veri Bilgileri (Kompakt) */}
                  <Card className="md:col-span-1">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Veri Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Veri Tazeliği</span>
                      </div>
                      <span className="text-sm font-medium">{data.lastUpdate}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Skor Güveni</span>
                      <Badge variant={getConfidenceBadgeVariant(data.confidence) as any}>
                        {data.confidence}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                </div>
              )}

              {/* 3 Maddede Neden - İkonlu ve Modern */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    3 Maddede Neden?
                  </CardTitle>
                  <CardDescription>
                    Bu skorun verilmesinin ana sebepleri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.reasons.map((reason, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{index + 1}</span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed flex-1">{reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* En Büyük Risk - Daha Net */}
              <Alert variant="destructive" className="border-2">
                <ShieldAlert className="h-5 w-5" />
                <AlertTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  En Büyük Risk
                </AlertTitle>
                <AlertDescription className="mt-2 text-base">
                  {data.biggestRisk}
                </AlertDescription>
              </Alert>

              {/* Token Unlock Uyarısı */}
              <TokenUnlock
                nextUnlockDate={data.nextUnlockDate}
                unlockAmount={data.unlockAmount}
                unlockPercent={data.unlockPercent}
                coinName={data.coin}
              />

              {/* Kar Simülatörü */}
              <ProfitSimulator
                currentMarketCap={data.marketCap}
                currentCoinName={data.coin}
              />
            </>
          )}

          {/* İlk açılış mesajı */}
          {!data && !loading && !error && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Test senaryoları için mock data kullanılıyor
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge variant="outline">BTC - Güvenli Liman</Badge>
                  <Badge variant="outline">PEPE - Hype/Riskli</Badge>
                  <Badge variant="outline">SCAM - Tehlikeli</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
