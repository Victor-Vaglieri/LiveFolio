import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return new Response('Unauthorized', { status: 401 });
    }

    const result = await db.query(
      'SELECT pdf_data, file_name FROM cv_documents WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return new Response('Arquivo não encontrado', { status: 404 });
    }

    const doc = result.rows[0];
    
    return new Response(doc.pdf_data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${doc.file_name}"`,
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
