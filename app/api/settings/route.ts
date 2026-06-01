import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import {
  getSettings,
  updateSettings,
  addBreakingNews,
  removeBreakingNews,
  toggleBreakingNews,
  PortalSettings,
} from '@/lib/settings-store';

// GET — public, returns settings for frontend
export async function GET() {
  try {
    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      let doc = await db.collection('settings').findOne({ _key: 'portal' });
      if (!doc) {
        const defaults = getSettings();
        await db.collection('settings').insertOne({ _key: 'portal', ...defaults });
        doc = await db.collection('settings').findOne({ _key: 'portal' });
      }
      const { _id, _key, ...settings } = doc as any;
      return NextResponse.json({ success: true, settings, source: 'mongodb' });
    }

    return NextResponse.json({ success: true, settings: getSettings(), source: 'local' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — admin only, update settings
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    const { db, isUsingFallback } = await getDb();

    // Handle special breaking news actions
    if (action === 'add_breaking') {
      const item = addBreakingNews(data.text);
      if (!isUsingFallback && db) {
        const current = getSettings();
        await db.collection('settings').updateOne(
          { _key: 'portal' },
          { $set: { breakingNews: current.breakingNews } },
          { upsert: true }
        );
      }
      return NextResponse.json({ success: true, item });
    }

    if (action === 'remove_breaking') {
      removeBreakingNews(data.id);
      if (!isUsingFallback && db) {
        const current = getSettings();
        await db.collection('settings').updateOne(
          { _key: 'portal' },
          { $set: { breakingNews: current.breakingNews } },
          { upsert: true }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_breaking') {
      const item = toggleBreakingNews(data.id);
      if (!isUsingFallback && db) {
        const current = getSettings();
        await db.collection('settings').updateOne(
          { _key: 'portal' },
          { $set: { breakingNews: current.breakingNews } },
          { upsert: true }
        );
      }
      return NextResponse.json({ success: true, item });
    }

    // General settings update (categories, siteName, etc.)
    const updates: Partial<PortalSettings> = {};
    if (data.categories) updates.categories = data.categories;
    if (data.breakingNews) updates.breakingNews = data.breakingNews;
    if (data.siteName) updates.siteName = data.siteName;
    if (data.siteDescription) updates.siteDescription = data.siteDescription;

    const updated = updateSettings(updates);

    if (!isUsingFallback && db) {
      await db.collection('settings').updateOne(
        { _key: 'portal' },
        { $set: updates },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
