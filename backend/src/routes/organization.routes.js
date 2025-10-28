import express from "express";
import {
  createOrganizationByVerifiedAdmin,
  listOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organization.controller.js";
import { requireVerifiedOrgAdmin } from "../middlewares/authOrgAdmin.middleware.js";

const router = express.Router();

router.route("/")
  .get(listOrganizations)
  .post(requireVerifiedOrgAdmin, createOrganizationByVerifiedAdmin);

router.route("/:id")
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);

export default router;
