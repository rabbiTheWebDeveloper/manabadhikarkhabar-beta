import { dbConnect } from "@/service/mongo";
import { ArticleModel } from "@/model/article-model";
import mongoose from "mongoose";

// Helper to determine if we can connect to the MongoDB instance
async function ensureDbConnected() {
  await dbConnect();
}

/**
 * Fetch all articles
 */
export async function getArticlesQuery(onlyPublished = false) {
  await ensureDbConnected();
  const filter = onlyPublished ? { isPublished: { $ne: false } } : {};
  const articles = await ArticleModel.find(filter).sort({ createdAt: -1 }).lean();
  
  return {
    articles: articles.map(a => ({ ...a, _id: a._id.toString() })),
    source: 'mongodb'
  };
}

/**
 * Create a new article
 */
export async function createArticleQuery(data) {
  await ensureDbConnected();
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
    isPublished: data.isPublished !== false,
    publishDate: publishDate || new Date().toISOString()
  };

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
}

/**
 * Fetch a single article by ID
 */
export async function getArticleByIdQuery(id) {
  await ensureDbConnected();

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isValidObjectId ? { _id: id } : { _id: id };
  
  const article = await ArticleModel.findOne(query).lean();
  if (!article) {
    throw new Error('এই খবরটি খুঁজে পাওয়া যায়নি।');
  }

  return {
    success: true,
    article: { ...article, _id: article._id.toString() },
    source: 'mongodb'
  };
}

/**
 * Update an article by ID
 */
export async function updateArticleQuery(id, updatedData) {
  await ensureDbConnected();
  const cleanUpdates = {};
  
  if (updatedData.title !== undefined) cleanUpdates.title = updatedData.title;
  if (updatedData.content !== undefined) cleanUpdates.content = updatedData.content;
  if (updatedData.category !== undefined) cleanUpdates.category = updatedData.category;
  if (updatedData.imgUrl !== undefined) cleanUpdates.imgUrl = updatedData.imgUrl;
  if (updatedData.author !== undefined) cleanUpdates.author = updatedData.author;
  if (updatedData.isLead !== undefined) cleanUpdates.isLead = !!updatedData.isLead;
  if (updatedData.isSub !== undefined) cleanUpdates.isSub = !!updatedData.isSub;
  if (updatedData.isPublished !== undefined) cleanUpdates.isPublished = !!updatedData.isPublished;
  if (updatedData.publishDate !== undefined) cleanUpdates.publishDate = updatedData.publishDate;

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) throw new Error("Invalid Object ID");

  if (cleanUpdates.isLead) {
    await ArticleModel.updateMany({ _id: { $ne: id } }, { $set: { isLead: false } });
  }

  const res = await ArticleModel.findByIdAndUpdate(
    id,
    { $set: cleanUpdates },
    { new: true }
  ).lean();

  if (!res) throw new Error('Article not found');

  return {
    success: true,
    article: { ...res, _id: res._id.toString() },
    source: 'mongodb'
  };
}

/**
 * Delete an article by ID
 */
export async function deleteArticleQuery(id) {
  await ensureDbConnected();

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) throw new Error("Invalid Object ID");

  const res = await ArticleModel.findByIdAndDelete(id);
  if (!res) throw new Error('Article not found');

  return { success: true, id, source: 'mongodb' };
}
