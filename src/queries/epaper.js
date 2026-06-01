import { dbConnect } from "@/service/mongo";
import { EPaperModel } from "@/model/epaper-model";
import { memoryEPapers, saveOrUpdateEPaper, deleteEPaper } from "@/app/api/epaper/store";

// Helper to determine if we can connect to the MongoDB instance
async function isDbConnected() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.warn("⚠️ Database connection failed. Operating in fallback local store mode for E-Papers.", error.message);
    return false;
  }
}

/**
 * Fetch all epapers, seeding the database with defaults if empty
 */
export async function getEPapersQuery() {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      let list = await EPaperModel.find({}).sort({ _id: -1 }).lean();
      
      // Seed if empty
      if (list.length === 0) {
        const seedDocs = memoryEPapers.map(e => ({ ...e }));
        await EPaperModel.insertMany(seedDocs);
        list = await EPaperModel.find({}).sort({ _id: -1 }).lean();
      }

      return {
        collections: list,
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to query Mongoose E-Papers, returning fallback memory list", err);
    }
  }

  // Fallback local list
  return {
    collections: memoryEPapers,
    source: 'local_fallback_db'
  };
}

/**
 * Create or Update an E-Paper
 */
export async function saveOrUpdateEPaperQuery(id, data) {
  const hasDb = await isDbConnected();
  const { monthName, year, month, pages } = data;

  const normalizedPages = (pages || []).map((p) => ({
    pageNumber: Number(p.pageNumber) || 1,
    title: String(p.title || ''),
    imgUrl: String(p.imgUrl || ''),
  })).sort((a, b) => a.pageNumber - b.pageNumber);

  const collectionData = {
    monthName,
    year: Number(year),
    month: Number(month),
    pages: normalizedPages,
    updatedAt: new Date().toISOString()
  };

  if (hasDb) {
    try {
      await EPaperModel.updateOne(
        { _id: id },
        { $set: collectionData },
        { upsert: true }
      );
      
      const savedDoc = { ...collectionData, _id: id };
      return {
        success: true,
        collection: savedDoc,
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Error upserting E-Paper to MongoDB, falling back", err);
    }
  }

  // Fallback local save
  const savedLocal = saveOrUpdateEPaper(id, collectionData);
  return {
    success: true,
    collection: savedLocal,
    source: 'local_fallback_db'
  };
}

/**
 * Delete an E-Paper by ID
 */
export async function deleteEPaperQuery(id) {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const result = await EPaperModel.deleteOne({ _id: id });
      if (result.deletedCount > 0) {
        return {
          success: true,
          message: 'ই-পেপার সফলভাবে ডিলিট করা হয়েছে',
          source: 'mongodb'
        };
      }
      throw new Error('ই-পেপার পাওয়া যায়নি');
    } catch (err) {
      if (err.message === 'ই-পেপার পাওয়া যায়নি') {
        throw err;
      }
      console.error("Error deleting E-Paper from MongoDB, falling back", err);
    }
  }

  // Fallback local delete
  const deleted = deleteEPaper(id);
  if (deleted) {
    return {
      success: true,
      message: 'ই-পেপার সফলভাবে ডিলিট করা হয়েছে',
      source: 'local_fallback_db'
    };
  }
  
  throw new Error('ই-পেপার পাওয়া যায়নি');
}
