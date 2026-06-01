import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { getArticleByIdQuery, updateArticleQuery, deleteArticleQuery } from '@/queries/article';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getArticleByIdQuery(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching article' }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'পরিবর্তন করার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const result = await updateArticleQuery(id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error updating article' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'মুছে ফেলার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteArticleQuery(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error deleting article' }, { status: 500 });
  }
}
