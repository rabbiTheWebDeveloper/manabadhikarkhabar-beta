import { dbConnect } from "@/service/mongo";
import { CategoryModel } from "@/model/category-model";
import mongoose from "mongoose";

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

// Helper to determine if we can connect to the MongoDB instance
async function isDbConnected() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.warn("⚠️ Database connection failed. Operating in read-only fallback mode for Categories.", error.message);
    return false;
  }
}

/**
 * Fetch all categories, seeding the database with defaults if empty
 */
export async function getCategoriesQuery() {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      let list = await CategoryModel.find({}).sort({ order: 1 }).lean();
      
      // Seed if empty
      if (list.length === 0) {
        const seedDocs = DEFAULT_CATEGORIES.map(c => ({
          ...c,
          createdAt: new Date().toISOString()
        }));
        await CategoryModel.insertMany(seedDocs);
        list = await CategoryModel.find({}).sort({ order: 1 }).lean();
      }

      return {
        success: true,
        categories: list.map(c => ({ ...c, _id: c._id.toString() })),
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to query Mongoose Categories, returning fallback list", err);
    }
  }

  // Fallback read-only categories list
  const fallbackList = DEFAULT_CATEGORIES.map((c, i) => ({
    _id: `fallback-${i}`,
    ...c,
    createdAt: new Date().toISOString()
  }));
  return {
    success: true,
    categories: fallbackList,
    source: 'fallback'
  };
}

/**
 * Create a new category
 */
export async function createCategoryQuery(data) {
  const hasDb = await isDbConnected();
  if (!hasDb) {
    throw new Error('Database connection offline');
  }

  const { value, label, order } = data;
  const trimmedValue = value.trim();
  const trimmedLabel = label.trim();
  const parsedOrder = parseInt(order) || 10;

  // Check for duplicates
  const existing = await CategoryModel.findOne({
    $or: [{ value: trimmedValue }, { label: trimmedLabel }]
  }).lean();

  if (existing) {
    throw new Error('ক্যাটেগরি বা স্ল্যাগটি ইতিমধ্যে সংরক্ষিত আছে');
  }

  const doc = new CategoryModel({
    value: trimmedValue,
    label: trimmedLabel,
    order: parsedOrder,
    createdAt: new Date().toISOString()
  });

  const res = await doc.save();
  return {
    success: true,
    category: { ...res.toObject(), _id: res._id.toString() }
  };
}

/**
 * Update a category by ID
 */
export async function updateCategoryQuery(id, updatedData) {
  const hasDb = await isDbConnected();
  if (!hasDb) {
    throw new Error('Database connection offline');
  }

  const { value, label, order } = updatedData;
  const trimmedValue = value.trim();
  const trimmedLabel = label.trim();
  const parsedOrder = parseInt(order) || 10;

  // Verify correct object ID format
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) {
    throw new Error('Invalid ID format');
  }

  // Check for duplicate slug/display name in other categories
  const duplicate = await CategoryModel.findOne({
    _id: { $ne: id },
    $or: [{ value: trimmedValue }, { label: trimmedLabel }]
  }).lean();

  if (duplicate) {
    throw new Error('অন্য একটি ক্যাটেগরিতে এই নাম বা স্ল্যাগ ব্যবহার করা হয়েছে');
  }

  const res = await CategoryModel.findByIdAndUpdate(
    id,
    {
      $set: {
        value: trimmedValue,
        label: trimmedLabel,
        order: parsedOrder
      }
    },
    { new: true }
  ).lean();

  if (!res) {
    throw new Error('Category not found');
  }

  return {
    success: true,
    category: { ...res, _id: res._id.toString() }
  };
}

/**
 * Delete a category by ID
 */
export async function deleteCategoryQuery(id) {
  const hasDb = await isDbConnected();
  if (!hasDb) {
    throw new Error('Database connection offline');
  }

  // Verify correct object ID format
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) {
    throw new Error('Invalid ID format');
  }

  const res = await CategoryModel.findByIdAndDelete(id);
  if (!res) {
    throw new Error('Category not found');
  }

  return {
    success: true,
    message: 'Category deleted successfully'
  };
}
