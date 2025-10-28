import express from "express";
import {
  createWhatsAppAccount,
  listWhatsAppAccounts,
  updateConnectionStatus,
} from "../controllers/whatsappAccount.controller.js";

const router = express.Router({ mergeParams: true });

router.route("/:orgId/accounts")
  .get(listWhatsAppAccounts)
  .post(createWhatsAppAccount);

router.put("/:id", updateConnectionStatus);

export default router;
