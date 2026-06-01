import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { getDb, INITIAL_AUTHORS } from '@/lib/db';

export async function GET() {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      try {
        const users = await db.collection('users')
          .find({}, { projection: { password: 0 } })
          .sort({ createdAt: -1 })
          .toArray();

        return NextResponse.json({
          users: users.map(u => ({
            _id: u._id.toString(),
            username: u.username,
            email: u.email,
            name: u.name,
            createdAt: u.createdAt
          }))
        });
      } catch (err) {
        console.error('Error fetching users from MongoDB:', err);
      }
    }

    // Fallback: return seeded admin user
    return NextResponse.json({
      users: [
        {
          _id: 'seed-admin-1',
          username: 'admin',
          email: 'admin@kachuaprotidin.com',
          name: 'কচুয়া প্রতিদিন এডমিন',
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
