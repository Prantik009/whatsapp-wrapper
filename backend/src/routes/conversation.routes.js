import express from "express";
import {
  listConversations,
  getConversation,
  updateConversation,
  getChatPreview,
} from "../controllers/conversation.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/:orgId/conversations", listConversations);
router.get("/chat/:orgId/:contactId", getChatPreview);
router.route("/:id")
  .get(getConversation)
  .put(updateConversation);

export default router;
