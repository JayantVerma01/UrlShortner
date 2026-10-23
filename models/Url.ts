import mongoose, { type InferSchemaType, type Model } from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    // unique: true creates a unique index; this is what guarantees no two
    // documents share a code, even under concurrent requests.
    shortCode: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type UrlDoc = InferSchemaType<typeof urlSchema>;

export const Url: Model<UrlDoc> =
  (mongoose.models.Url as Model<UrlDoc>) ?? mongoose.model<UrlDoc>("Url", urlSchema);
