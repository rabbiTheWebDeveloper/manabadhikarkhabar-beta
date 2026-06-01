import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { getEPapersQuery, saveOrUpdateEPaperQuery } from '@/queries/epaper';

export async function GET(req: NextRequest) {
  try {
    const result = await getEPapersQuery();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching epapers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify administrative session
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশাধিকার! দয়া করে আগে লগইন করুন।' }, { status: 401 });
    }

    const body = await req.json();
    const { id, monthName, year, month } = body;

    if (!id || !monthName || !year || !month) {
      return NextResponse.json({ error: 'ID, Month Name, Year and Month number are required' }, { status: 400 });
    }

    const result = await saveOrUpdateEPaperQuery(id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error saving epaper' }, { status: 500 });
  }
}
