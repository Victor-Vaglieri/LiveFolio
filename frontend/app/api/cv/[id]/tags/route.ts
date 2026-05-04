import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { skillIds, secret } = await req.json();

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!Array.isArray(skillIds)) {
      return NextResponse.json({ error: 'skillIds deve ser um array' }, { status: 400 });
    }

    await db.query('DELETE FROM cv_skills WHERE cv_id = $1', [params.id]);

    for (const skillId of skillIds) {
      await db.query(
        'INSERT INTO cv_skills (cv_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [params.id, skillId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
