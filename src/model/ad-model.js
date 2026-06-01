import mongoose, { Schema } from "mongoose";

const AdSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    imgUrl: { type: String, required: true },
    linkUrl: { type: String, required: true },
    position: {
      type: String,
      enum: ["sidebar", "top_banner"],
      default: "sidebar",
      index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
);

// Optimize ad fetching by active status and position order
AdSchema.index({ isActive: 1, position: 1, createdAt: -1 });

export const AdModel =
  mongoose.models.Ad ?? mongoose.model("Ad", AdSchema);
