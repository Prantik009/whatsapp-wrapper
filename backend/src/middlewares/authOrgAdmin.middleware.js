// src/middlewares/authOrgAdmin.middleware.js
import mongoose from "mongoose";


import { OrgUserModel } from "../models/orgUser.model.js";
import { AsyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";

/**
 * Allows only a verified org-admin to proceed.
 * Tries to resolve admin from:
 *   1) req.user.id (preferred if you have auth),
 *   2) req.body.email (fallback to your current flow).
 * Attaches the admin doc to req.adminUser for downstream use.
 */
export const requireVerifiedOrgAdmin = AsyncHandler(async (req, res, next) => {
  let admin = null;

  // Preferred: authenticated user id (e.g., set by your auth middleware)
  if (req.user?.id && mongoose.isValidObjectId(req.user.id)) {
    admin = await OrgUserModel.findById(req.user.id);
  }

  // Fallback: email in body (your current create-org flow)
  if (!admin && req.body?.email) {
    admin = await OrgUserModel.findOne({
      email: String(req.body.email).trim().toLowerCase(),
      role: "org-admin",
    });
  }

  if (!admin) {
    throw new ApiError(403, "Only a verified org-admin can perform this action.");
  }

  if (admin.role !== "org-admin") {
    throw new ApiError(403, "Insufficient role. org-admin required.");
  }

  if (!admin.emailVerified) {
    throw new ApiError(403, "Email not verified. Please verify before proceeding.");
  }

  // All good — pass admin down the chain
  req.adminUser = admin;
  next();
});