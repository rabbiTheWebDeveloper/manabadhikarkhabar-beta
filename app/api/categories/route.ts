import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { ObjectId } from 'mongodb';

const DEFAULT_CATEGORIES = [
  { value: 'বিশেষ সংবাদ', label: 'বিশেষ সংবাদ', order: 1 },
  { value: 'রাজনীতি', label: 'রাজনীতি', order: 2 },
  { value: 'বাংলাদেশ', label: 'বাংলাদেশ', order: 3 },
  { value: 'অপরাধ', label: 'অপরাধ', order: 4 },
  { value: 'বিশ্ব', label: 'বিশ্ব', order: 5 },
  { value: 'বাণিজ্য', label: 'বাণিজ্য', order: 6 },
  { value: 'মতামত', label: 'মতামত', order: 7 },
  { value: 'খেলা', label: 'খেলা', order: 8 },
  { value: 'বিনোদন', label: 'বিনোদন', order: 9 }
];

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
    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      // Find all categories
      let list = await db.collection('categories').find({}).sort({ order: 1 }).toArray();

      // Auto-seed if collection is completely empty
      if (list.length === 0) {
        const seedData = DEFAULT_CATEGORIES.map(c => ({
          ...c,
          createdAt: new Date().toISOString()
        }));
        await db.collection('categories').insertMany(seedData);
        list = await db.collection('categories').find({}).sort({ order: 1 }).toArray();
      }

      return NextResponse.json({ success: true, categories: list, source: 'mongodb' });
    }

    // Fallback if DB is disconnected
    const fallbackList = DEFAULT_CATEGORIES.map((c, i) => ({
      _id: `fallback-${i}`,
      ...c,
      createdAt: new Date().toISOString()
    }));
    return NextResponse.json({ success: true, categories: fallbackList, source: 'fallback' });
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

    const { db, isUsingFallback } = await getDb();
    if (isUsingFallback || !db) {
      return NextResponse.json({ error: 'Database connection offline' }, { status: 503 });
    }

    const { value, label, order } = await req.json();

    if (!value || !label) {
      return NextResponse.json({ error: 'Value and Label are required' }, { status: 400 });
    }

    const trimmedValue = value.trim();
    const trimmedLabel = label.trim();
    const parsedOrder = parseInt(order) || 10;

    // Check for duplicates
    const existing = await db.collection('categories').findOne({
      $or: [{ value: trimmedValue }, { label: trimmedLabel }]
    });

    if (existing) {
      return NextResponse.json({ error: 'ক্যাটেগরি বা স্ল্যাগটি ইতিমধ্যে সংরক্ষিত আছে' }, { status: 400 });
    }

    const newCategory = {
      value: trimmedValue,
      label: trimmedLabel,
      order: parsedOrder,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('categories').insertOne(newCategory);
    
    return NextResponse.json({ 
      success: true, 
      category: { _id: result.insertedId, ...newCategory } 
    });
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

    const { db, isUsingFallback } = await getDb();
    if (isUsingFallback || !db) {
      return NextResponse.json({ error: 'Database connection offline' }, { status: 503 });
    }

    const { id, value, label, order } = await req.json();

    if (!id || !value || !label) {
      return NextResponse.json({ error: 'ID, Value, and Label are required' }, { status: 400 });
    }

    const trimmedValue = value.trim();
    const trimmedLabel = label.trim();
    const parsedOrder = parseInt(order) || 10;

    // Verify correct object ID format
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // Check for duplicate slug/display name in other categories
    const duplicate = await db.collection('categories').findOne({
      _id: { $ne: objectId },
      $or: [{ value: trimmedValue }, { label: trimmedLabel }]
    });

    if (duplicate) {
      return NextResponse.json({ error: 'অন্য একটি ক্যাটেগরিতে এই নাম বা স্ল্যাগ ব্যবহার করা হয়েছে' }, { status: 400 });
    }

    const result = await db.collection('categories').updateOne(
      { _id: objectId },
      { 
        $set: { 
          value: trimmedValue, 
          label: trimmedLabel, 
          order: parsedOrder 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      category: { _id: id, value: trimmedValue, label: trimmedLabel, order: parsedOrder } 
    });
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

    const { db, isUsingFallback } = await getDb();
    if (isUsingFallback || !db) {
      return NextResponse.json({ error: 'Database connection offline' }, { status: 503 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const result = await db.collection('categories').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
