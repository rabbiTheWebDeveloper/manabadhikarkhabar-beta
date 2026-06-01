import { NextRequest, NextResponse } from 'next/server';
import { scrapeLatestNews, lastScrapeStatus, scrapeManabadhikarNews, manabadhikarScrapeStatus } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: {
      prothomAlo: lastScrapeStatus,
      manabadhikar: manabadhikarScrapeStatus
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    // Run both scrapers concurrently for maximum speed
    const [prothomResult, manabadhikarResult] = await Promise.all([
      scrapeLatestNews(),
      scrapeManabadhikarNews()
    ]);
    
    return NextResponse.json({
      success: prothomResult.success || manabadhikarResult.success,
      prothomAlo: prothomResult,
      manabadhikar: manabadhikarResult,
      totalSaved: prothomResult.count + manabadhikarResult.count
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      count: 0, 
      message: error.message || 'Fatal error triggering scrapers'
    }, { status: 500 });
  }
}
