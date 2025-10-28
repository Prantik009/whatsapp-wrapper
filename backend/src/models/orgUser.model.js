// models/orgUser.model.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const OrgUserSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "organization", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    emailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["org-admin", "manager", "agent", "viewer"], required: true },
    accessScope: { type: String, enum: ["all-chats", "specific-chats"], default: "all-chats" },
    allowedContactIds: [{ type: Schema.Types.ObjectId, ref: "contact" }],
    status: { type: String, enum: ["active", "disabled"], default: "active" },

    // 🔽 NEW: OTP fields (for email verification)
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

OrgUserSchema.index({ organizationId: 1, email: 1 }, { unique: true });
OrgUserSchema.index({ organizationId: 1, status: 1, role: 1 });
OrgUserSchema.index(
  { organizationId: 1, role: 1 },
  { unique: true, partialFilterExpression: { role: "org-admin" } }
);

export const OrgUserModel = model("OrgUser", OrgUserSchema);
