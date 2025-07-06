import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export const config = { api: { bodyParser: false } };

export async function POST(req) {
  const data = await req.formData();
  const file = data.get('pdf');
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buffer);
    return NextResponse.json({ text: parsed.text }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
