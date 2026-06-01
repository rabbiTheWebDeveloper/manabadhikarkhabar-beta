import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { deleteEPaperQuery } from '@/queries/epaper';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify administrative session
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশাধিকার! দয়া করে আগে লগইন করুন।' }, { status: 401 });
    }

    const result = await deleteEPaperQuery(id);
    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.message === 'ই-পেপার পাওয়া যায়নি' ? 404 : 500;
    return NextResponse.json({ error: error.message || 'Fatal error deleting epaper' }, { status });
  }
}
