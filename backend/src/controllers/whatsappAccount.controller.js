// backend/src/controllers/whatsappAccount.controller.js


import { AsyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../middlewares/ApiError.js";
import { WhatsAppAccountModel } from "../models/whatsappAccount.model.js";
import { setJSON, getJSON } from "../lib/redis.js";
import { MessageModel } from "../models/message.model.js";

export const createWhatsAppAccount = AsyncHandler(async (req, res) => {
  const account = await WhatsAppAccountModel.create(req.body);
  res.status(201).json({ success: true, account });
});

export const listWhatsAppAccounts = AsyncHandler(async (req, res) => {
  const accounts = await WhatsAppAccountModel.find({ organizationId: req.params.orgId });
  res.json({ success: true, accounts });
});

export const updateConnectionStatus = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const account = await WhatsAppAccountModel.findByIdAndUpdate(id, req.body, { new: true });
  if (!account) throw new ApiError(404, "Account not found");
  res.json({ success: true, account });
});

export const handleIncomingMessage = async (message) => {
  const { organizationId, contactWaId, waMessageId, text, direction } = message;

  // 1. Check if contact has a ticket open
  const linkedMsg = await MessageModel.findOne({ waMessageId });
  if (linkedMsg) return; // already saved

  const tempKey = `temp:msgs:${organizationId}:${contactWaId}`;
  const cached = (await getJSON(tempKey)) || [];

  cached.push({
    waMessageId,
    text,
    direction,
    createdAt: new Date(),
  });

  // 2. Save in Redis for 1 day
  await setJSON(tempKey, cached, 86400); // 24h TTL
};