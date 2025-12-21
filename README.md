# CryptoWeather

**Kripto Hava Durumu** - Karmaşık kripto verilerini "Sağlık Skoru + Trafik Işığı" ile Grandma-proof özetleyen modern dashboard uygulaması.

##İçindekiler

- [Amaç](#amaç)
- [Tech Stack](#tech-stack)
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Notları](#api-notları)
- [Klasör Yapısı](#klasör-yapısı)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [Lisans](#lisans)

## Amaç

CryptoWeather, teknik analiz bilmeyen kullanıcıların bile anlayabileceği şekilde kripto varlıkların sağlık durumunu özetler. Karmaşık verileri tek bir **Sağlık Skoru (0-100)** ve basit bir **Trafik Işığı (🟢/🟠/🔴)** ile sunar.

 **Önemli:** Bu uygulama yatırım tavsiyesi vermez. Sadece risk/sağlık/uyarı dili kullanır.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **İkonlar:** lucide-react
- **Grafikler:** Recharts (Donut Chart)
- **Custom SVG:** Fear & Greed gauge (yarım daire progress)

## Özellikler

### Ana Dashboard

- **Coin Arama:** Mock data ile BTC, PEPE, SCAM test senaryoları
- **Sağlık Skoru (0-100):** Çok faktörlü algoritma
  - Security (%35)
  - Liquidity (%25)
  - Volume (%20)
  - Volatility (%20, ters çevrilmiş)
  - Kırmızı alarm cezaları (eşik aşımlarında otomatik düşüş)
- **Trafik Işığı:** 🟢 Düşük Risk (70+), 🟠 Orta Risk (40-69), 🔴 Yüksek Risk (0-39)
- **3 Maddede Neden:** Otomatik üretim (en yüksek etki puanlarına göre)
- **En Büyük Risk:** Otomatik tespit (en düşük alt skor veya tetiklenen ceza)
- **Veri Tazeliği + Skor Güveni:** Yüksek/Orta/Düşük

### Modlar

- **Basit Mod:** Büyük skor, geleneksel layout
- **Uzman Modu:** Küçük skor, ProDataCards (Open Interest, Funding Rate, Volume Turnover)

### Ek Modüller

- **Token Unlock:** Kilit açılım uyarıları
  - 🟢 Güvenli (kilit yok)
  - 🟠 Normal (küçük miktar)
  - 🔴 Kritik (büyük miktar, geri sayım)
- **Kar Simülatörü:** Market cap karşılaştırması
  - Circulating / Fully Diluted (FDV) toggle
  - Referans coinler: Solana, Ethereum, Bitcoin
  - Sonuç kopyalama
  - Aşırı çarpanlar için görsel guardrail
- **Market Overview:** 3 satırlı master dashboard
  - **Satır 1:** Fear & Greed (SVG yarım daire), Market Dominance (Donut), Günün Trendi
  - **Satır 2:** ETF Akışları (BTC, ETH, SOL), Borsa Long/Short Oranları (5 borsa)
  - **Satır 3:** Market Pulse (Sektör Performansı, Altcoin Mevsimi, Kazananlar/Kaybedenler)

### Backend & API

- **Server-side API:** `/api/marketpulse` (5 dakika cache)
- **Reusable Helper:** `fetchFromCoingecko()` (tüm CoinGecko çağrıları için)
- **Quality Filters:** Market cap ≥ 50M, Volume ≥ 5M (junk coin filtreleme)
- **Error Handling:** Türkçe hata mesajları
- **Loading States:** shadcn Skeleton bileşenleri

## Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
   ```bash
   git clone <repo-url>
   cd crypto-health-dashboard
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Development server'ı başlatın:**
   ```bash
   npm run dev
   ```

4. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
npm run build
npm start
```

## 📖 Kullanım

### Coin Arama

Şu anda mock data kullanılıyor. Test için şu coinleri deneyin:

- **BTC** - Güvenli Liman (Yüksek skor)
- **PEPE** - Hype/Riskli (Orta skor)
- **SCAM** - Tehlikeli (Düşük skor, kırmızı alarm)

### Market Overview

Ana sayfada coin aramadan Market Overview ve Market Pulse bölümleri görünür. Bu bölümler gerçek CoinGecko API'sinden veri çeker.

## API Notları

### CoinGecko API

- **Rate Limit:** Ücretsiz plan: 10-50 çağrı/dakika
- **Cache Stratejisi:** Next.js `revalidate: 300` (5 dakika)
- **Server-side Fetching:** Tüm CoinGecko çağrıları server-side yapılır
- **Error Handling:** API başarısız olursa kullanıcıya Türkçe mesaj gösterilir

### Endpoint'ler

- `/api/marketpulse` - Market Pulse verileri (kategoriler, dominance, gainers/losers)
- Coin arama şu anda mock data kullanıyor (gerçek API entegrasyonu roadmap'te)

## Klasör Yapısı

```
crypto-health-dashboard/
├── app/
│   ├── api/
│   │   └── marketpulse/      # Server-side API route
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Ana dashboard
├── components/
│   ├── ui/                    # shadcn/ui bileşenleri
│   ├── MarketOverview.tsx     # Master dashboard
│   ├── MarketPulse.tsx        # Piyasa nabzı
│   ├── ProfitSimulator.tsx    # Kar simülatörü
│   ├── TokenUnlock.tsx        # Kilit açılım uyarıları
│   ├── ProDataCards.tsx       # Uzman mod verileri
│   └── traffic-light.tsx      # Trafik ışığı komponenti
├── lib/
│   ├── coingecko.ts           # CoinGecko helper + mock data
│   ├── coingecko-market.ts    # Market verileri
│   └── utils.ts               # Utility fonksiyonlar
├── utils/
│   ├── healthScore.ts         # Sağlık skoru algoritması
│   ├── mockData.ts            # Test verileri
│   └── marketMock.ts          # Market mock verileri
└── package.json
```

## Roadmap

### Kısa Vadeli (v0.2)

1. **Deploy:** Vercel/Netlify'a production deploy
2. **Coin Search:** 
   - Autocomplete özelliği
   - Gerçek CoinGecko coin search endpoint'i
   - Büyük/küçük harf duyarsız arama
   - Kısaltma desteği (BTC → Bitcoin)

### Orta Vadeli (v0.3)

3. **TokenSniffer/LunarCrush Entegrasyonu:**
   - Güvenlik skorları için TokenSniffer API
   - Sosyal sentiment için LunarCrush API

### Uzun Vadeli (v0.4+)

4. **Alerts & Watchlist:**
   - Kullanıcı coin takip listesi
   - Skor değişimlerinde bildirim
   - Email/push notification

## Troubleshooting

### Rate Limit Hatası

**Sorun:** CoinGecko API rate limit aşıldı

**Çözüm:**
- 5 dakika bekleyin (cache süresi)
- API çağrılarını azaltın
- CoinGecko Pro plan düşünün

### API Başarısız

**Sorun:** "CoinGecko API temporarily unavailable" hatası

**Çözüm:**
- CoinGecko status sayfasını kontrol edin
- Network bağlantınızı kontrol edin
- Birkaç dakika sonra tekrar deneyin

### Boş State

**Sorun:** Market Pulse veya Market Overview boş görünüyor

**Çözüm:**
- Browser console'da hata var mı kontrol edin
- API route'un çalıştığını doğrulayın: `http://localhost:3000/api/marketpulse`
- CoinGecko API'nin erişilebilir olduğunu kontrol edin

### Mock Data Çalışmıyor

**Sorun:** Coin araması sonuç vermiyor

**Çözüm:**
- Sadece **BTC**, **PEPE**, **SCAM** destekleniyor (büyük/küçük harf duyarsız)
- Diğer coinler için gerçek API entegrasyonu gerekli (roadmap'te)

##  Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

**Not:** Bu proje eğitim amaçlıdır ve yatırım tavsiyesi vermez. Kripto yatırımları risklidir, kendi araştırmanızı yapın.

