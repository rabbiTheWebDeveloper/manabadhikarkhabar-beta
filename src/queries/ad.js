import { dbConnect } from "@/service/mongo";
import { AdModel } from "@/model/ad-model";
import mongoose from "mongoose";

// Helper to determine if we can connect to the MongoDB instance
async function ensureDbConnected() {
  await dbConnect();
}

/**
 * Fetch all ads
 */
export async function getAdsQuery() {
  await ensureDbConnected();

  const ads = await AdModel.find({}).sort({ createdAt: -1 }).lean();

  return {
    ads: ads.map(a => ({ ...a, _id: a._id.toString() })),
    source: 'mongodb'
  };
}

/**
 * Create a new ad
 */
export async function createAdQuery(data) {
  await ensureDbConnected();
  const { title, imgUrl, linkUrl, position, isActive } = data;

  const newAdSeed = {
    title,
    imgUrl,
    linkUrl,
    position,
    isActive: isActive !== false,
    createdAt: new Date().toISOString()
  };

  const doc = new AdModel(newAdSeed);
  const res = await doc.save();
  
  return {
    success: true,
    ad: { ...res.toObject(), _id: res._id.toString() },
    source: 'mongodb'
  };
}

/**
 * Fetch a single ad by ID
 */
export async function getAdByIdQuery(id) {
  await ensureDbConnected();

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isValidObjectId ? { _id: id } : { _id: id };
  
  const ad = await AdModel.findOne(query).lean();
  if (!ad) {
    throw new Error('বিজ্ঞাপনটি খুঁজে পাওয়া যায়নি।');
  }

  return {
    success: true,
    ad: { ...ad, _id: ad._id.toString() },
    source: 'mongodb'
  };
}

/**
 * Update an ad by ID
 */
export async function updateAdQuery(id, updatedData) {
  await ensureDbConnected();
  const cleanUpdates = {};
  
  if (updatedData.title !== undefined) cleanUpdates.title = updatedData.title;
  if (updatedData.imgUrl !== undefined) cleanUpdates.imgUrl = updatedData.imgUrl;
  if (updatedData.linkUrl !== undefined) cleanUpdates.linkUrl = updatedData.linkUrl;
  if (updatedData.position !== undefined) cleanUpdates.position = updatedData.position;
  if (updatedData.isActive !== undefined) cleanUpdates.isActive = !!updatedData.isActive;

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) throw new Error("Invalid Object ID");

  const res = await AdModel.findByIdAndUpdate(
    id,
    { $set: cleanUpdates },
    { new: true }
  ).lean();

  if (!res) throw new Error('Ad not found');

  return {
    success: true,
    ad: { ...res, _id: res._id.toString() },
    source: 'mongodb'
  };
}

/**
 * Delete an ad by ID
 */
export async function deleteAdQuery(id) {
  await ensureDbConnected();

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) throw new Error("Invalid Object ID");

  const res = await AdModel.findByIdAndDelete(id);
  if (!res) throw new Error('Ad not found');

  return { success: true, id, source: 'mongodb' };
}
