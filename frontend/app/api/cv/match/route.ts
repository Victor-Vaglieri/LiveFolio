import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { skillIds, secret } = await req.json();

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json({ error: 'Forneça um array de skillIds' }, { status: 400 });
    }

    const result = await db.query(`
      SELECT 
        d.id, 
        d.title, 
        d.file_name,
        COUNT(cs.skill_id)::int as match_count,
        json_agg(s.name) as matched_skills
      FROM cv_documents d
      JOIN cv_skills cs ON d.id = cs.cv_id
      JOIN skills_dictionary s ON cs.skill_id = s.id
      WHERE cs.skill_id = ANY($1::uuid[])
      GROUP BY d.id
      ORDER BY match_count DESC
      LIMIT 5
    `, [skillIds]);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('[CV MATCH ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
