import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import {
  getCategoriesQuery,
  createCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery
} from '@/queries/category';

// Auth check helper
async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    return !!(token && verifyToken(token));
  } catch {
    return false;
  }
}

// GET - Returns all categories, sorted by order ascending
export async function GET() {
  try {
    const result = await getCategoriesQuery();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create a new category (Admin only)
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { value, label } = body;

    if (!value || !label) {
      return NextResponse.json({ error: 'Value and Label are required' }, { status: 400 });
    }

    const result = await createCategoryQuery(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update an existing category (Admin only)
export async function PUT(req: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, value, label } = body;

    if (!id || !value || !label) {
      return NextResponse.json({ error: 'ID, Value, and Label are required' }, { status: 400 });
    }

    const result = await updateCategoryQuery(id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a category (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await deleteCategoryQuery(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
