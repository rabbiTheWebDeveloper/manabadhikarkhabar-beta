import mongoose, { Schema } from "mongoose";

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true, index: true },
    imgUrl: { type: String, default: "https://picsum.photos/seed/default/600/400" },
    time: { type: String, default: "সদ্য প্রকাশিত" },
    author: { type: String, default: "নিজস্ব প্রতিবেদক" },
    isLead: { type: Boolean, default: false, index: true },
    isSub: { type: Boolean, default: false, index: true },
    publishDate: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
);

// Compound and single field indexes for optimized page search
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ isLead: 1, createdAt: -1 });
ArticleSchema.index({ category: 1, createdAt: -1 });

export const ArticleModel =
  mongoose.models.Article ?? mongoose.model("Article", ArticleSchema);
