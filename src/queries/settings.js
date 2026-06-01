import { dbConnect } from "@/service/mongo";
import { SettingsModel } from "@/model/settings-model";
import {
  getSettings,
  updateSettings,
  addBreakingNews,
  removeBreakingNews,
  toggleBreakingNews
} from "@/lib/settings-store";

// Helper to determine if we can connect to the MongoDB instance
async function isDbConnected() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.warn("⚠️ Database connection failed. Operating in fallback local store mode for Settings.", error.message);
    return false;
  }
}

/**
 * Fetch settings, seeding the defaults if not present
 */
export async function getSettingsQuery() {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      let doc = await SettingsModel.findOne({ _key: 'portal' }).lean();
      if (!doc) {
        const defaults = getSettings();
        const newSettings = new SettingsModel({ _key: 'portal', ...defaults });
        await newSettings.save();
        doc = await SettingsModel.findOne({ _key: 'portal' }).lean();
      }
      const { _id, _key, ...settings } = doc;
      return {
        success: true,
        settings,
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to query Mongoose Settings, returning fallback settings", err);
    }
  }

  return {
    success: true,
    settings: getSettings(),
    source: 'local'
  };
}

/**
 * Update general portal settings
 */
export async function updateSettingsQuery(updates) {
  const hasDb = await isDbConnected();

  // General settings update (categories, siteName, etc.)
  const fields = {};
  if (updates.categories) fields.categories = updates.categories;
  if (updates.breakingNews) fields.breakingNews = updates.breakingNews;
  if (updates.siteName) fields.siteName = updates.siteName;
  if (updates.siteDescription) fields.siteDescription = updates.siteDescription;

  const updated = updateSettings(fields);

  if (hasDb) {
    try {
      await SettingsModel.updateOne(
        { _key: 'portal' },
        { $set: fields },
        { upsert: true }
      );
      return {
        success: true,
        settings: updated,
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to update Mongoose Settings, falling back to local memory store", err);
    }
  }

  return {
    success: true,
    settings: updated,
    source: 'local'
  };
}

/**
 * Add a breaking news item
 */
export async function addBreakingNewsQuery(text) {
  const item = addBreakingNews(text);
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const current = getSettings();
      await SettingsModel.updateOne(
        { _key: 'portal' },
        { $set: { breakingNews: current.breakingNews } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to push breaking news to MongoDB settings", err);
    }
  }

  return {
    success: true,
    item
  };
}

/**
 * Remove a breaking news item
 */
export async function removeBreakingNewsQuery(id) {
  removeBreakingNews(id);
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const current = getSettings();
      await SettingsModel.updateOne(
        { _key: 'portal' },
        { $set: { breakingNews: current.breakingNews } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to remove breaking news from MongoDB settings", err);
    }
  }

  return {
    success: true
  };
}

/**
 * Toggle a breaking news item active status
 */
export async function toggleBreakingNewsQuery(id) {
  const item = toggleBreakingNews(id);
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const current = getSettings();
      await SettingsModel.updateOne(
        { _key: 'portal' },
        { $set: { breakingNews: current.breakingNews } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to toggle breaking news active status in MongoDB settings", err);
    }
  }

  return {
    success: true,
    item
  };
}
