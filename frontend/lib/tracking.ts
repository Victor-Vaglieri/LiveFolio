import { db } from '@/lib/db';
import { initTrackingTable } from '@/lib/init-db';
import { headers } from 'next/headers';

export async function trackVisit(source: string | null) {
  try {
    await initTrackingTable();

    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown'; 
    const xForwardedFor = headersList.get('x-forwarded-for');
    const ip = xForwardedFor ? xForwardedFor.split(',')[0] : '127.0.0.1'; // TODO - usar variável de ambiente e não hardcoded

    await db.query(
      'INSERT INTO visits (source, ip, user_agent, path) VALUES ($1, $2, $3, $4)',
      [source || 'direct', ip, userAgent, '/']
    );
  } catch (err) {
    console.error('[TRACKING ERROR]', err);
  }
}
