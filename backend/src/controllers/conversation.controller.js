// backend/src/controllers/conversation.controller.js

import { AsyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../middlewares/ApiError.js";
import { ConversationModel } from "../models/conversation.model.js";

export const listConversations = AsyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const conversations = await ConversationModel.find({ organizationId: orgId })
    .populate("contactId", "displayName profileName phone")
    .populate("assignedUserId", "name role")
    .sort({ lastMessageAt: -1 });
  res.json({ success: true, conversations });
});

export const getConversation = AsyncHandler(async (req, res) => {
  const convo = await ConversationModel.findById(req.params.id)
    .populate("contactId assignedUserId");
  if (!convo) throw new ApiError(404, "Conversation not found");
  res.json({ success: true, convo });
});

export const updateConversation = AsyncHandler(async (req, res) => {
  const convo = await ConversationModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!convo) throw new ApiError(404, "Conversation not found");
  res.json({ success: true, convo });
});

export const getChatPreview = AsyncHandler(async (req, res) => {
  const { orgId, contactId } = req.params;

  const contact = await ContactModel.findById(contactId);
  if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

  const tempKey = `temp:msgs:${orgId}:${contact.waId}`;
  const tempMsgs = (await getJSON(tempKey)) || [];

  const savedMsgs = await MessageModel.find({ contactId }).sort({ createdAt: -1 }).limit(20);

  res.json({
    success: true,
    contact: { displayName: contact.displayName, waId: contact.waId },
    messages: [...tempMsgs, ...savedMsgs],
  });
});


