import { NextResponse } from 'next/server';
import { getMarketPulse } from '@/lib/getMarketPulse';

export async function GET() {
  try {
    const data = await getMarketPulse();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Market Pulse API route hatası:', error);
    return NextResponse.json(
      { error: 'Veri yüklenemedi' },
      { status: 500 }
    );
  }
}

// Cache için revalidate
export const revalidate = 300; // 5 dakika

