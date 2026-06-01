import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    _key: { type: String, default: "portal", unique: true, index: true },
    categories: [{ type: String }],
    breakingNews: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        createdAt: { type: String, default: () => new Date().toISOString() }
      }
    ],
    siteName: { type: String },
    siteDescription: { type: String }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
);

export const SettingsModel =
  mongoose.models.Settings ?? mongoose.model("Settings", SettingsSchema);
