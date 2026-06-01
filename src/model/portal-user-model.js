import mongoose, { Schema } from "mongoose";

const PortalUserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: { type: String, required: true },
    name: { type: String, trim: true },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
);

PortalUserSchema.index({ createdAt: -1 });

export const PortalUserModel =
  mongoose.models.PortalUser ?? mongoose.model("PortalUser", PortalUserSchema);
