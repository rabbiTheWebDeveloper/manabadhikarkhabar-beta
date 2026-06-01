import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { getAdsQuery, createAdQuery } from '@/queries/ad';

export async function GET(req: NextRequest) {
  try {
    const result = await getAdsQuery();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching ads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশাধিকার! কাজটির জন্য দয়া করে লগইন করুন।' }, { status: 401 });
    }

    const body = await req.json();
    const { title, imgUrl, linkUrl, position } = body;

    if (!title || !imgUrl || !linkUrl || !position) {
      return NextResponse.json({ error: 'Title, imgUrl, linkUrl, and position are required' }, { status: 452 });
    }

    const result = await createAdQuery(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error creating ad' }, { status: 500 });
  }
}
