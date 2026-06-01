import { dbConnect } from "@/service/mongo";
import { ArticleModel } from "@/model/article-model";
import { memoryArticles, addArticle, updateArticle, deleteArticle } from "@/app/api/articles/store";
import mongoose from "mongoose";

// Helper to determine if we can connect to the MongoDB instance
async function isDbConnected() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.warn("⚠️ Database connection failed. Operating in JSON fallback memory mode.", error.message);
    return false;
  }
}

/**
 * Fetch all articles, seeding the database with fallbacks if empty
 */
export async function getArticlesQuery() {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      let articles = await ArticleModel.find({}).sort({ createdAt: -1 }).lean();
      
      // If database is empty, seed it initially from initial memory records
      if (articles.length === 0) {
        const seedDocs = memoryArticles.map(({ _id, ...rest }) => ({ ...rest }));
        await ArticleModel.insertMany(seedDocs);
        articles = await ArticleModel.find({}).sort({ createdAt: -1 }).lean();
      }

      return {
        articles: articles.map(a => ({ ...a, _id: a._id.toString() })),
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to query Mongoose, returning fallback store", err);
    }
  }

  // Fallback local memory storage
  return {
    articles: memoryArticles,
    source: 'local_fallback_db'
  };
}

/**
 * Create a new article
 */
export async function createArticleQuery(data) {
  const hasDb = await isDbConnected();
  const { title, content, category, imgUrl, author, isLead, isSub, publishDate } = data;

  const newArticleSeed = {
    title,
    content,
    category,
    imgUrl: imgUrl || 'https://picsum.photos/seed/default/600/400',
    time: 'সদ্য প্রকাশিত',
    author: author || 'নিজস্ব প্রতিবেদক',
    isLead: !!isLead,
    isSub: !!isSub,
    publishDate: publishDate || new Date().toISOString()
  };

  if (hasDb) {
    try {
      // If we are setting this as a lead story, reset other lead stories
      if (isLead) {
        await ArticleModel.updateMany({ isLead: true }, { $set: { isLead: false } });
      }

      const doc = new ArticleModel(newArticleSeed);
      const res = await doc.save();
      
      return {
        success: true,
        article: { ...res.toObject(), _id: res._id.toString() },
        source: 'mongodb'
      };
    } catch (err) {
      console.error("Failed to create article in Mongoose, creating in fallback", err);
    }
  }

  // Fallback local memory storage
  if (isLead) {
    memoryArticles.forEach(a => a.isLead = false);
  }
  const createdLocal = addArticle(newArticleSeed);
  return { success: true, article: createdLocal, source: 'local_fallback_db' };
}

/**
 * Fetch a single article by ID
 */
export async function getArticleByIdQuery(id) {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isValidObjectId ? { _id: id } : { _id: id }; // MongoDB handles string id if not object id format
      
      const article = await ArticleModel.findOne(query).lean();
      if (article) {
        return {
          success: true,
          article: { ...article, _id: article._id.toString() },
          source: 'mongodb'
        };
      }
    } catch (err) {
      console.error("Failed to query article in Mongoose, looking up in fallback", err);
    }
  }

  // Fallback local memory storage
  const localArticle = memoryArticles.find(a => a._id === id);
  if (!localArticle) {
    throw new Error('এই খবরটি খুঁজে পাওয়া যায়নি।');
  }

  return {
    success: true,
    article: localArticle,
    source: 'local_fallback_db'
  };
}

/**
 * Update an article by ID
 */
export async function updateArticleQuery(id, updatedData) {
  const hasDb = await isDbConnected();
  const cleanUpdates = {};
  
  if (updatedData.title !== undefined) cleanUpdates.title = updatedData.title;
  if (updatedData.content !== undefined) cleanUpdates.content = updatedData.content;
  if (updatedData.category !== undefined) cleanUpdates.category = updatedData.category;
  if (updatedData.imgUrl !== undefined) cleanUpdates.imgUrl = updatedData.imgUrl;
  if (updatedData.author !== undefined) cleanUpdates.author = updatedData.author;
  if (updatedData.isLead !== undefined) cleanUpdates.isLead = !!updatedData.isLead;
  if (updatedData.isSub !== undefined) cleanUpdates.isSub = !!updatedData.isSub;
  if (updatedData.publishDate !== undefined) cleanUpdates.publishDate = updatedData.publishDate;

  if (hasDb) {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      if (isValidObjectId) {
        if (cleanUpdates.isLead) {
          await ArticleModel.updateMany({ _id: { $ne: id } }, { $set: { isLead: false } });
        }

        const res = await ArticleModel.findByIdAndUpdate(
          id,
          { $set: cleanUpdates },
          { new: true }
        ).lean();

        if (res) {
          return {
            success: true,
            article: { ...res, _id: res._id.toString() },
            source: 'mongodb'
          };
        }
      }
    } catch (err) {
      console.error("Failed to update article in Mongoose, updating in fallback", err);
    }
  }

  // Fallback local memory storage
  const resLocal = updateArticle(id, cleanUpdates);
  if (!resLocal) {
    throw new Error('Article not found');
  }
  return { success: true, article: resLocal, source: 'local_fallback_db' };
}

/**
 * Delete an article by ID
 */
export async function deleteArticleQuery(id) {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      if (isValidObjectId) {
        const res = await ArticleModel.findByIdAndDelete(id);
        if (res) {
          return { success: true, id, source: 'mongodb' };
        }
      }
    } catch (err) {
      console.error("Failed to delete article in Mongoose, deleting in fallback", err);
    }
  }

  // Fallback local memory storage
  const resLocal = deleteArticle(id);
  if (!resLocal) {
    throw new Error('Article not found');
  }
  return { success: true, id, source: 'local_fallback_db' };
}
