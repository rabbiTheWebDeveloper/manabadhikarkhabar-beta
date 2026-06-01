import { dbConnect } from "@/service/mongo";
import { AdModel } from "@/model/ad-model";
import { memoryAds, addAd, updateAd, deleteAd, INITIAL_ADS } from "@/app/api/ads/store";
import mongoose from "mongoose";

// Helper to determine if we can connect to the MongoDB instance
async function isDbConnected() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.warn("⚠️ Database connection failed. Operating in JSON fallback memory mode for Ads.", error.message);
    return false;
  }
}

/**
 * Fetch all ads, seeding the database with defaults if empty
 */
export async function getAdsQuery() {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      let ads = await AdModel.find({}).sort({ createdAt: -1 }).lean();
      
      // Seed if empty
      if (ads.length === 0) {
        const seedDocs = INITIAL_ADS.map(({ _id, ...rest }) => ({ ...rest }));
        await AdModel.insertMany(seedDocs);
        ads = await AdModel.find({}).sort({ createdAt: -1 }).lean();
      }

      return {
        ads: ads.map(a => ({ ...a, _id: a._id.toString() })),
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to query Mongoose Ads, returning fallback store", err);
    }
  }

  // Fallback local memory storage
  return {
    ads: memoryAds,
    source: 'local_fallback_db'
  };
}

/**
 * Create a new ad
 */
export async function createAdQuery(data) {
  const hasDb = await isDbConnected();
  const { title, imgUrl, linkUrl, position, isActive } = data;

  const newAdSeed = {
    title,
    imgUrl,
    linkUrl,
    position,
    isActive: isActive !== false,
    createdAt: new Date().toISOString()
  };

  if (hasDb) {
    try {
      const doc = new AdModel(newAdSeed);
      const res = await doc.save();
      
      return {
        success: true,
        ad: { ...res.toObject(), _id: res._id.toString() },
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to create ad in Mongoose, creating in fallback", err);
    }
  }

  // Fallback local memory storage
  const createdLocal = addAd(newAdSeed);
  return { success: true, ad: createdLocal, source: 'local_fallback_db' };
}

/**
 * Fetch a single ad by ID
 */
export async function getAdByIdQuery(id) {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isValidObjectId ? { _id: id } : { _id: id };
      
      const ad = await AdModel.findOne(query).lean();
      if (ad) {
        return {
          success: true,
          ad: { ...ad, _id: ad._id.toString() },
          source: 'mongodb'
        };
      }
    } catch (err) {
      console.error("Failed to query ad in Mongoose, looking up in fallback", err);
    }
  }

  // Fallback local memory storage
  const localAd = memoryAds.find(a => a._id === id);
  if (!localAd) {
    throw new Error('বিজ্ঞাপনটি খুঁজে পাওয়া যায়নি।');
  }

  return {
    success: true,
    ad: localAd,
    source: 'local_fallback_db'
  };
}

/**
 * Update an ad by ID
 */
export async function updateAdQuery(id, updatedData) {
  const hasDb = await isDbConnected();
  const cleanUpdates = {};
  
  if (updatedData.title !== undefined) cleanUpdates.title = updatedData.title;
  if (updatedData.imgUrl !== undefined) cleanUpdates.imgUrl = updatedData.imgUrl;
  if (updatedData.linkUrl !== undefined) cleanUpdates.linkUrl = updatedData.linkUrl;
  if (updatedData.position !== undefined) cleanUpdates.position = updatedData.position;
  if (updatedData.isActive !== undefined) cleanUpdates.isActive = !!updatedData.isActive;

  if (hasDb) {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      if (isValidObjectId) {
        const res = await AdModel.findByIdAndUpdate(
          id,
          { $set: cleanUpdates },
          { new: true }
        ).lean();

        if (res) {
          return {
            success: true,
            ad: { ...res, _id: res._id.toString() },
            source: 'mongodb'
          };
        }
      }
    } catch (err) {
      console.error("Failed to update ad in Mongoose, updating in fallback", err);
    }
  }

  // Fallback local memory storage
  const resLocal = updateAd(id, cleanUpdates);
  if (!resLocal) {
    throw new Error('Ad not found');
  }
  return { success: true, ad: resLocal, source: 'local_fallback_db' };
}

/**
 * Delete an ad by ID
 */
export async function deleteAdQuery(id) {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      if (isValidObjectId) {
        const res = await AdModel.findByIdAndDelete(id);
        if (res) {
          return { success: true, id, source: 'mongodb' };
        }
      }
    } catch (err) {
      console.error("Failed to delete ad in Mongoose, deleting in fallback", err);
    }
  }

  // Fallback local memory storage
  const resLocal = deleteAd(id);
  if (!resLocal) {
    throw new Error('Ad not found');
  }
  return { success: true, id, source: 'local_fallback_db' };
}
