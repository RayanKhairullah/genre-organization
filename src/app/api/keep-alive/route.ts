import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Pastikan route ini tidak di-cache oleh Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Keep-Alive endpoint untuk mencegah Supabase auto-pause
 * Dipanggil otomatis oleh Vercel Cron setiap hari
 */
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Lakukan query ringan ke tabel struktur_jabatan (tabel yang selalu ada)
    const { data, error } = await supabase
      .from('struktur_jabatan')
      .select('id')
      .limit(1);

    const duration = Date.now() - startTime;

    if (error) {
      console.error('[Keep-Alive] Database query failed:', error);
      return NextResponse.json(
        { 
          status: 'error', 
          message: error.message,
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }

    console.log(`[Keep-Alive] Database pinged successfully in ${duration}ms`);

    return NextResponse.json({ 
      status: 'alive', 
      message: 'Database connection healthy',
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      data_found: data && data.length > 0
    });

  } catch (error) {
    console.error('[Keep-Alive] Unexpected error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
