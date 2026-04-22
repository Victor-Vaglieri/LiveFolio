import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const { key, value, secret } = await req.json();
  const adminSecret = process.env.ADMIN_SECRET || 'projeto_livefolio_secret_123'; // TODO - usar variável de ambiente e não hardcoded

  if (secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
    [key, value]
  );

  return NextResponse.json({ success: true });
}
