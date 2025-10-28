import express from "express";

import organizationRoutes from "./organization.routes.js";
import orgUserRoutes from "./orgUser.routes.js";
import whatsappAccountRoutes from "./whatsappAccount.routes.js";
import contactRoutes from "./contact.routes.js";
import conversationRoutes from "./conversation.routes.js";
import messageRoutes from "./message.routes.js";
import ticketRoutes from "./ticket.routes.js";

const router = express.Router();

// ✅ Mount all subroutes
router.use("/organizations", organizationRoutes);
router.use("/org-users", orgUserRoutes);
router.use("/whatsapp", whatsappAccountRoutes);
router.use("/contacts", contactRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/tickets", ticketRoutes);

export default router;
