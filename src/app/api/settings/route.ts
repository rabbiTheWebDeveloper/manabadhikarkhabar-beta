import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import {
  getSettingsQuery,
  updateSettingsQuery,
  addBreakingNewsQuery,
  removeBreakingNewsQuery,
  toggleBreakingNewsQuery
} from '@/queries/settings';

// GET — public, returns settings for frontend
export async function GET() {
  try {
    const result = await getSettingsQuery();
    return NextResponse.json(result);
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

    // Handle special breaking news actions
    if (action === 'add_breaking') {
      const result = await addBreakingNewsQuery(data.text);
      return NextResponse.json(result);
    }

    if (action === 'remove_breaking') {
      const result = await removeBreakingNewsQuery(data.id);
      return NextResponse.json(result);
    }

    if (action === 'toggle_breaking') {
      const result = await toggleBreakingNewsQuery(data.id);
      return NextResponse.json(result);
    }

    // General settings update
    const result = await updateSettingsQuery(data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
