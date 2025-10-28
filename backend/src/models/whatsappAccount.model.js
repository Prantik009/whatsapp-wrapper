import mongoose from "mongoose";
const { Schema, model } = mongoose;

const E164_REGEX = /^\+?[1-9]\d{6,14}$/;

const WhatsAppAccountSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "organization", required: true },
    number: { type: String, required: true, trim: true, match: E164_REGEX },
    type: { type: String, enum: ["primary", "secondary"], default: "secondary" },
    isConnected: { type: Boolean, default: false },
    sessionData: { type: Schema.Types.Mixed },
    lastConnectedAt: { type: Date },
    lastDisconnectedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Prevent duplicate numbers inside an org
WhatsAppAccountSchema.index({ organizationId: 1, number: 1 }, { unique: true });
// Exactly one primary per org
WhatsAppAccountSchema.index(
  { organizationId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "primary" } }
);

export const WhatsAppAccountModel = model("whatsappAccount", WhatsAppAccountSchema);
