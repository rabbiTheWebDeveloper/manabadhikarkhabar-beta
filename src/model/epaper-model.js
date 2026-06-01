import mongoose, { Schema } from "mongoose";

const EPaperSchema = new Schema(
  {
    _id: { type: String, required: true }, // Custom string ID (date based)
    monthName: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    pages: [
      {
        pageNumber: { type: Number, required: true },
        title: { type: String, trim: true },
        imgUrl: { type: String, trim: true }
      }
    ],
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
);

EPaperSchema.index({ year: -1, month: -1 });

export const EPaperModel =
  mongoose.models.EPaper ?? mongoose.model("EPaper", EPaperSchema);
