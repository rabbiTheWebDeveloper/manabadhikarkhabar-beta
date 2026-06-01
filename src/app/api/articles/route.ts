import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { scrapeLatestNews, lastScrapeStatus } from '@/lib/scraper';
import { getArticlesQuery, createArticleQuery } from '@/queries/article';

export async function GET(req: NextRequest) {
  try {
    // Autotrigger news scraper if 30 minutes elapsed (non-blocking)
    const THIRTY_MIN_MS = 30 * 60 * 1000;
    if (Date.now() - lastScrapeStatus.lastRun > THIRTY_MIN_MS && !lastScrapeStatus.isRunning) {
      console.log('30-minute news crawl interval reached. Booting latest background scraper...');
      scrapeLatestNews().catch(err => {
        console.error('Automated background news scraping failed:', err);
      });
    }

    const result = await getArticlesQuery();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Audit check: Verify active admin session to block publication from unauthorized endpoints
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশাধিকার! এই কাজটি সম্পন্ন করার জন্য দয়া করে আগে লগইন করুন।' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Title, content and category are required' }, { status: 400 });
    }

    const result = await createArticleQuery(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error creating article' }, { status: 500 });
  }
}
