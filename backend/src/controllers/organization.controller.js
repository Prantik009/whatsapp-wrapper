import mongoose from "mongoose";

import { OrganizationModel } from "../models/organization.model.js";
import { OrgUserModel } from "../models/orgUser.model.js";

import { ApiError } from "../middlewares/ApiError.js";
import { AsyncHandler } from "../middlewares/asyncHandler.js";

/**
 * Body: { name, email, contactName }
 * - Uses req.adminUser injected by requireVerifiedOrgAdmin
 * - Writes contactName into OrgUser.name
 * - Creates Organization with adminUserId
 * - Links admin.organizationId to org._id
 */
export const createOrganizationByVerifiedAdmin = AsyncHandler(async (req, res) => {
  const { name, email: rawEmail, contactName } = req.body;

  // Basic validation
  if (!name || !rawEmail || !contactName) {
    throw new ApiError(400, "Organization name, email, and contactName are required.");
  }

  const email = String(rawEmail).trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) throw new ApiError(400, "Invalid email format.");

  // Middleware should have attached a verified org-admin
  const admin = req.adminUser;
  if (!admin) {
    // Safety net in case middleware was not applied
    throw new ApiError(500, "Verified admin context missing. Ensure middleware is applied.");
  }

  // Optional: ensure the admin we resolved matches the email provided
  if (admin.email !== email) {
    // If you want strict match between caller and email in body:
    // throw new ApiError(403, "Email does not match the verified admin user.");
    // Or just proceed — pick your policy. For safety, we enforce:
    throw new ApiError(403, "Email does not match the verified admin user.");
  }

  // Optional: prevent duplicate orgs per admin or per email
  const alreadyOwned = await OrganizationModel.findOne({ adminUserId: admin._id });
  if (alreadyOwned) {
    throw new ApiError(409, "An organization already exists for this admin.");
  }
  const orgWithSameEmail = await OrganizationModel.findOne({ email });
  if (orgWithSameEmail) {
    throw new ApiError(409, "An organization already exists with this email.");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Create the organization (no contactName on org)
    const [org] = await OrganizationModel.create(
      [
        {
          name: name.trim(),
          email,
          adminUserId: admin._id, // REQUIRED by your schema
        },
      ],
      { session }
    );

    // Update the admin with contactName + link to org
    admin.name = contactName.trim();
    admin.organizationId = org._id;
    admin.status = "active";
    await admin.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: {
        organization: {
          id: org._id,
          name: org.name,
          email: org.email,
        },
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name, // contactName reflected here
          role: admin.role,
          emailVerified: admin.emailVerified,
        },
      }
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err?.code === 11000) {
      // unique key conflicts
      throw new ApiError(409, "Organization already exists with the provided unique field(s).");
    }
    throw new ApiError(500, err.message || "Failed to create organization.");
  }
});

export const listOrganizations = AsyncHandler(async (req, res) => {
  const orgs = await OrganizationModel.find().sort({ createdAt: -1 });
  res.json({ success: true, orgs });
});

export const getOrganization = AsyncHandler(async (req, res) => {
  const org = await OrganizationModel.findById(req.params.id);
  if (!org) throw new ApiError(404, "Organization not found");
  res.json({ success: true, data:org });
});

export const updateOrganization = AsyncHandler(async (req, res) => {
  const org = await OrganizationModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!org) throw new ApiError(404, "Organization not found");
  res.json({ success: true, org });
});

export const deleteOrganization = AsyncHandler(async (req, res) => {
  const org = await OrganizationModel.findByIdAndDelete(req.params.id);
  if (!org) throw new ApiError(404, "Organization not found");
  res.json({ success: true, message: "Organization deleted" });
});
