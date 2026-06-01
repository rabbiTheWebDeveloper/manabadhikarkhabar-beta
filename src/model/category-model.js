import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    value: { type: String, required: true, unique: true, trim: true, index: true },
    label: { type: String, required: true, unique: true, trim: true, index: true },
    order: { type: Number, default: 10 },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
);

CategorySchema.index({ order: 1 });

export const CategoryModel =
  mongoose.models.Category ?? mongoose.model("Category", CategorySchema);
