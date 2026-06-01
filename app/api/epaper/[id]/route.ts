import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { deleteEPaper } from '../store';

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

    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      const result = await db.collection('epapers').deleteOne({ _id: id as any });
      if (result.deletedCount > 0) {
        return NextResponse.json({ success: true, message: 'ই-পেপার সফলভাবে ডিলিট করা হয়েছে', source: 'mongodb' });
      }
      return NextResponse.json({ error: 'ই-পেপার পাওয়া যায়নি' }, { status: 404 });
    }

    const deleted = deleteEPaper(id);
    if (deleted) {
      return NextResponse.json({ success: true, message: 'ই-পেপার সফলভাবে ডিলিট করা হয়েছে', source: 'local_fallback_db' });
    }
    return NextResponse.json({ error: 'ই-পেপার পাওয়া যায়নি' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error deleting epaper' }, { status: 500 });
  }
}
