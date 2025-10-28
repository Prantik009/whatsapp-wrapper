import express from "express";
import {
  listMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/:conversationId/messages", listMessages);
router.post("/send", sendMessage);
router.delete("/:id", deleteMessage);

export default router;
