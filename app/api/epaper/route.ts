import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { memoryEPapers, saveOrUpdateEPaper } from './store';

export async function GET(req: NextRequest) {
  try {
    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      const collections = await db.collection('epapers').find({}).sort({ _id: -1 }).toArray();
      
      // If db is empty, seed it initially
      if (collections.length === 0) {
        const mongoDocs = memoryEPapers.map(col => ({ ...col }));
        await db.collection('epapers').insertMany(mongoDocs as any);
        const seeded = await db.collection('epapers').find({}).sort({ _id: -1 }).toArray();
        return NextResponse.json({
          collections: seeded,
          source: 'mongodb'
        });
      }
      return NextResponse.json({
        collections,
        source: 'mongodb'
      });
    }

    return NextResponse.json({
      collections: memoryEPapers,
      source: 'local_fallback_db'
    });
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
    const { id, monthName, year, month, pages } = body;

    if (!id || !monthName || !year || !month) {
      return NextResponse.json({ error: 'ID, Month Name, Year and Month number are required' }, { status: 400 });
    }

    // Assure pages array structure is normalized
    const normalizedPages = (pages || []).map((p: any) => ({
      pageNumber: Number(p.pageNumber) || 1,
      title: String(p.title || ''),
      imgUrl: String(p.imgUrl || ''),
    })).sort((a: any, b: any) => a.pageNumber - b.pageNumber);

    const { db, isUsingFallback } = await getDb();

    const collectionData = {
      monthName,
      year: Number(year),
      month: Number(month),
      pages: normalizedPages,
      updatedAt: new Date().toISOString()
    };

    if (!isUsingFallback && db) {
      await db.collection('epapers').updateOne(
        { _id: id as any },
        { $set: collectionData },
        { upsert: true }
      );
      
      const savedDoc = { ...collectionData, _id: id };
      return NextResponse.json({ success: true, collection: savedDoc, source: 'mongodb' });
    }

    const savedLocal = saveOrUpdateEPaper(id, collectionData);
    return NextResponse.json({ success: true, collection: savedLocal, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error saving epaper' }, { status: 500 });
  }
}
