import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { getAdByIdQuery, updateAdQuery, deleteAdQuery } from '@/queries/ad';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getAdByIdQuery(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching ad' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'পরিবর্তন করার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const result = await updateAdQuery(id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error updating ad' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'মুছে ফেলার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteAdQuery(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error deleting ad' }, { status: 500 });
  }
}
