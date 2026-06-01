import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { getUsersQuery } from '@/queries/auth';

export async function GET() {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value || cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const result = await getUsersQuery();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
