// backend/src/controllers/message.controller.js


import { AsyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../middlewares/ApiError.js";



export const listMessages = AsyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 });
  res.json({ success: true, messages });
});

export const sendMessage = AsyncHandler(async (req, res) => {
  const message = await MessageModel.create(req.body);
  res.status(201).json({ success: true, message });
});

export const deleteMessage = AsyncHandler(async (req, res) => {
  const msg = await MessageModel.findByIdAndDelete(req.params.id);
  if (!msg) throw new ApiError(404, "Message not found");
  res.json({ success: true, message: "Message deleted" });
});

