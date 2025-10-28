import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MediaSchema = new Schema(
  {
    url: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    fileName: { type: String, trim: true },
    fileSize: { type: Number, min: 0 },
    caption: { type: String, trim: true }
  },
  { _id: false }
);

const StatusesSchema = new Schema(
  {
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String, trim: true }
  },
  { _id: false }
);

const MessageSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "organization", required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "conversation", required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "whatsappAccount", required: true },
    contactId: { type: Schema.Types.ObjectId, ref: "contact", required: true },

    waMessageId: { type: String, trim: true }, // may be null for drafts/system
    direction: { type: String, enum: ["in", "out"], required: true },
    from: { type: String, trim: true },
    to: { type: String, trim: true },

    type: {
      type: String,
      enum: [
        "text", "image", "video", "audio", "document",
        "sticker", "location", "contacts", "button", "template", "unknown"
      ],
      default: "text"
    },
    text: { type: String, trim: true },
    media: { type: MediaSchema },
    quotedMessageId: { type: Schema.Types.ObjectId, ref: "message" },
    metadata: { type: Schema.Types.Mixed },

    statuses: { type: StatusesSchema, default: {} },

    ticketId: { type: Schema.Types.ObjectId, ref: "ticket" },
  },
  { timestamps: true, versionKey: false }
);

// Order messages inside a conversation
MessageSchema.index({ conversationId: 1, createdAt: 1 });

// De-dup per WhatsApp message id within org (sparse for null/undefined)
MessageSchema.index({ organizationId: 1, waMessageId: 1 }, { unique: true, sparse: true });

// Ticket message queries
MessageSchema.index({ organizationId: 1, ticketId: 1, createdAt: 1 });


/* ---------- Hooks to sync Conversation ---------- */
MessageSchema.post("save", async function (doc) {
  await ConversationModel.findByIdAndUpdate(doc.conversationId, {
    lastMessageAt: doc.createdAt,
    lastMessageText: doc.text || `[${doc.type}]`,
    $inc: doc.direction === "in" ? { unreadCount: 1 } : {},
  });
});

MessageSchema.post("findOneAndUpdate", async function (doc) {
  if (doc?.direction === "in" && doc.statuses?.readAt) {
    await ConversationModel.findByIdAndUpdate(doc.conversationId, { unreadCount: 0 });
  }
});

export const MessageModel = model("message", MessageSchema);
