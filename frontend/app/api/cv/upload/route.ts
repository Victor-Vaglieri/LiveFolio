import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PDFParse } from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const secret = formData.get('secret') as string;

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const extractedText = pdfData.text.toLowerCase();

    const cvResult = await db.query(
      'INSERT INTO cv_documents (title, file_name, pdf_data) VALUES ($1, $2, $3) RETURNING id',
      [title || file.name, file.name, buffer]
    );
    const cvId = cvResult.rows[0].id;

    const skillsDict = await db.query('SELECT id, name, search_terms FROM skills_dictionary');
    
    const detectedSkillIds: string[] = [];
    const detectedSkillNames: string[] = [];

    for (const skill of skillsDict.rows) {
      const terms = skill.search_terms as string[];
      const hasMatch = terms.some(term => extractedText.includes(term.toLowerCase()));
      
      if (hasMatch) {
        detectedSkillIds.push(skill.id);
        detectedSkillNames.push(skill.name);
      }
    }

    if (detectedSkillIds.length > 0) {
      for (const skillId of detectedSkillIds) {
        await db.query(
          'INSERT INTO cv_skills (cv_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [cvId, skillId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      cvId,
      fileName: file.name,
      detectedSkills: detectedSkillNames
    });

  } catch (error: any) {
    console.error('[CV UPLOAD ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
