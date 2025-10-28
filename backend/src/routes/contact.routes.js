import express from "express";
import {
  listContacts,
  getContact,
  updateContact,
} from "../controllers/contact.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/:orgId/contacts", listContacts);
router.route("/:id")
  .get(getContact)
  .put(updateContact);

export default router;
