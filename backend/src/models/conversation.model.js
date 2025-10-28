import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ConversationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "organization", required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "whatsappAccount", required: true },
    contactId: { type: Schema.Types.ObjectId, ref: "contact", required: true },

    lastMessageAt: { type: Date },
    lastMessageText: { type: String, trim: true },
    unreadCount: { type: Number, default: 0, min: 0 },
    assignedUserId: { type: Schema.Types.ObjectId, ref: "OrgUser" },
    status: { type: String, enum: ["open", "closed", "snoozed"], default: "open" },
  },
  { timestamps: true, versionKey: false }
);

// One conversation per (org, account, contact)
ConversationSchema.index(
  { organizationId: 1, accountId: 1, contactId: 1 },
  { unique: true }
);

// Inbox views
ConversationSchema.index({ organizationId: 1, status: 1, lastMessageAt: -1 });
ConversationSchema.index({ organizationId: 1, assignedUserId: 1, lastMessageAt: -1 });

export const ConversationModel = model("conversation", ConversationSchema);
