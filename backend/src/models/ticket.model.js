import mongoose from "mongoose";
const { Schema, model } = mongoose;

const TicketNoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "OrgUser", required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const TicketSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "organization", required: true },
    subject: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["open", "in-progress", "resolved", "closed"], default: "open" },

    messageId: { type: Schema.Types.ObjectId, ref: "message" }, // opener/anchor
    contactId: { type: Schema.Types.ObjectId, ref: "contact", required: true },

    assigneeIds: [{ type: Schema.Types.ObjectId, ref: "OrgUser", default: undefined }],
    notes: { type: [TicketNoteSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "OrgUser" },
  },
  { timestamps: true, versionKey: false }
);

// Board & filters
TicketSchema.index({ organizationId: 1, status: 1, priority: 1, updatedAt: -1 });
TicketSchema.index({ organizationId: 1, contactId: 1, updatedAt: -1 });
TicketSchema.index({ organizationId: 1, assigneeIds: 1, updatedAt: -1 });
// Optional uniqueness for anchor message
TicketSchema.index({ organizationId: 1, messageId: 1 }, { unique: true, sparse: true });

export const TicketModel = model("ticket", TicketSchema);
