import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query(`
      SELECT 
        d.id, 
        d.title, 
        d.file_name, 
        d.created_at,
        COALESCE(json_agg(s.name) FILTER (WHERE s.name IS NOT NULL), '[]') as skills
      FROM cv_documents d
      LEFT JOIN cv_skills cs ON d.id = cs.cv_id
      LEFT JOIN skills_dictionary s ON cs.skill_id = s.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
