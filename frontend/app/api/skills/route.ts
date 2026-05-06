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

    const result = await db.query('SELECT id, name, search_terms, color FROM skills_dictionary ORDER BY name ASC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, search_terms, color, secret } = await req.json();

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query(
      'INSERT INTO skills_dictionary (name, search_terms, color) VALUES ($1, $2, $3) RETURNING *',
      [name, JSON.stringify(search_terms), color || '#3b82f6']
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, search_terms, color, secret } = await req.json();

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query(
      'UPDATE skills_dictionary SET name = $1, search_terms = $2, color = $3 WHERE id = $4 RETURNING *',
      [name, JSON.stringify(search_terms), color, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
