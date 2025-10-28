import mongoose from "mongoose";
const { Schema, model } = mongoose;

const E164_REGEX = /^\+?[1-9]\d{6,14}$/;

const ContactSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "organization", required: true },
    waId: { type: String, required: true, trim: true }, // e.g., '919xxxxxxxx@s.whatsapp.net'
    phone: { type: String, trim: true, match: E164_REGEX },
    profileName: { type: String, trim: true },
    displayName: { type: String, trim: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);

// Unique per org & waId
ContactSchema.index({ organizationId: 1, waId: 1 }, { unique: true });
// Optional search helpers
ContactSchema.index({ organizationId: 1, phone: 1 }, { sparse: true });
ContactSchema.index({ displayName: "text", profileName: "text" });

export const ContactModel = model("contact", ContactSchema);
