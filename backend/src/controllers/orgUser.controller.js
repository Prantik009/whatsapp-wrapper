import mongoose from "mongoose";
import nodemailer from "nodemailer";


import { OrgUserModel } from "../models/orgUser.model.js";

import { ApiError } from "../middlewares/ApiError.js";
import { AsyncHandler } from "../middlewares/asyncHandler.js";


/* ----------------------------------------------
   Simple OTP email template
---------------------------------------------- */
const otpEmailTemplate = (otp) => ({
  subject: "Your Verification Code",
  text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <p style="font-size:22px;font-weight:bold;letter-spacing:3px">${otp}</p>
      <p>This code will expire in <strong>5 minutes</strong>.</p>
    </div>
  `,
});

/* ----------------------------------------------
   Nodemailer transporter (Gmail)
---------------------------------------------- */
const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 5,
  });

/* ----------------------------------------------
   1) SEND OTP
   @route  POST /api/org-users/send-otp
   @body   { email }
   Logic:
     - Find or create a "pre-org admin" OrgUser doc for this email
     - Set OTP + expiry
     - Email it
---------------------------------------------- */
export const sendOtp = AsyncHandler(async (req, res) => {
  const emailRaw = req.body?.email;
  if (!emailRaw) throw new ApiError(400, "Email is required");

  const email = String(emailRaw).trim().toLowerCase();

  // Try to find an existing org-admin record by email (any orgId)
  let admin = await OrgUserModel.findOne({ email, role: "org-admin" });

  // If not found, create a "pre-org" admin record with placeholders
  if (!admin) {
    admin = await OrgUserModel.create({
      organizationId: new mongoose.Types.ObjectId(), // placeholder; will be replaced after org creation
      name: "Admin User", // placeholder; will be replaced with Contact Name on org creation page
      email,
      emailVerified: false,
      role: "org-admin",
      accessScope: "all-chats",
      status: "active",
    });
  }

  // If already verified, short-circuit
  if (admin.emailVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
    });
  }

  // Generate 6-digit OTP and save with expiry (5 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  admin.otp = otp;
  admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  await admin.save();

  // Send email
  const { subject, text, html } = otpEmailTemplate(otp);
  const transporter = getTransporter();

  await transporter.sendMail({
    from: {
      name: process.env.MAIL_FROM_NAME || "Your App",
      address: process.env.GMAIL_USER,
    },
    to: email,
    subject,
    text,
    html,
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent to email",
  });
});

/* ----------------------------------------------
   2) VERIFY OTP
   @route  POST /api/org-users/verify-otp
   @body   { email, otp }
   Logic:
     - Check admin record for email
     - Validate OTP + not expired
     - Mark emailVerified = true, clear OTP fields
---------------------------------------------- */
export const verifyOtp = AsyncHandler(async (req, res) => {
  const emailRaw = req.body?.email;
  const otp = req.body?.otp;

  if (!emailRaw || !otp) throw new ApiError(400, "Email and OTP are required");

  const email = String(emailRaw).trim().toLowerCase();

  const admin = await OrgUserModel.findOne({ email, role: "org-admin" });
  if (!admin) throw new ApiError(404, "Admin record not found. Please request OTP first.");

  if (admin.emailVerified) {
    // Already verified
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();
    return res.status(200).json({
      success: true,
      message: "Email already verified",
      user: {
        id: admin._id,
        email: admin.email,
        emailVerified: admin.emailVerified,
        role: admin.role,
      },
    });
  }

  const now = Date.now();
  if (!admin.otp || !admin.otpExpiry || admin.otp !== otp || now > admin.otpExpiry.getTime()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Mark verified and clear OTP fields
  admin.emailVerified = true;
  admin.otp = null;
  admin.otpExpiry = null;
  await admin.save();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
    user: {
      id: admin._id,
      email: admin.email,
      emailVerified: admin.emailVerified,
      role: admin.role,
    },
  });
});

/* ----------------------------------------------
   3) VERIFY EMAIL & REGISTER ADMIN (post-OTP)
   @route  POST /api/org-users/verify-email
   @body   { email }
   Logic:
     - Confirm that this email has an org-admin record and is verified
     - If the admin record exists but not verified → error
     - If not found → require send-otp first (we don't auto-create here)
---------------------------------------------- */
export const verifyEmailAndCreateAdmin = AsyncHandler(async (req, res) => {
  const emailRaw = req.body?.email;
  if (!emailRaw) throw new ApiError(400, "Email is required");

  const email = String(emailRaw).trim().toLowerCase();

  const admin = await OrgUserModel.findOne({ email, role: "org-admin" });
  if (!admin) {
    throw new ApiError(404, "No admin record found. Please send OTP first.");
  }

  if (!admin.emailVerified) {
    throw new ApiError(400, "Email not verified yet. Please verify OTP first.");
  }

  // Admin exists & verified → return idempotently
  return res.status(200).json({
    success: true,
    message: "Admin email verification confirmed",
    user: {
      id: admin._id,
      email: admin.email,
      emailVerified: admin.emailVerified,
      role: admin.role,
    },
  });
});



// for other user like - member agenst or viewer
export const createOrgUser = AsyncHandler(async (req, res, next) => {
  const { organizationId, name, email, role, accessScope, allowedContactIds } = req.body;

  // Step 1️⃣: Validate input7
  if (!organizationId || !name || !email || !role) {
    throw new ApiError(400, "organizationId, name, email, and role are required.");
  }

  // Step 2️⃣: Check if organization exists
  const organization = await OrganizationModel.findById(organizationId);
  if (!organization) throw new ApiError(404, "Organization not found.");

  // Step 3️⃣: Prevent duplicate email in same org
  const existingUser = await OrgUserModel.findOne({ organizationId, email });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists in this organization.");
  }

  // Step 4️⃣: Handle org-admin uniqueness
  if (role === "org-admin") {
    const existingAdmin = await OrgUserModel.findOne({ organizationId, role: "org-admin" });
    if (existingAdmin) {
      throw new ApiError(409, "This organization already has an admin.");
    }
  }

  // Step 5️⃣: Create the user
  const newUser = await OrgUserModel.create({
    organizationId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    emailVerified: role === "org-admin", // Admins start verified by default
    role,
    accessScope: accessScope || "all-chats",
    allowedContactIds: allowedContactIds || [],
    status: "active",
  });

  // Step 6️⃣: Link to organization if admin
  if (role === "org-admin") {
    organization.adminUserId = newUser._id;
    organization.emailVerified = true;
    await organization.save();
  }

  // Step 7️⃣: Respond
  return res.status(201).json({
    success: true,
    message: `User created successfully as ${role}`,
    data: newUser,
  });
});


export const listOrgUsers = AsyncHandler(async (req, res) => {
  const users = await OrgUserModel.find({ organizationId: req.params.orgId });
  res.json({ success: true, users });
});

export const getOrgUser = AsyncHandler(async (req, res) => {
  const user = await OrgUserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data:user });
});

export const updateOrgUser = AsyncHandler(async (req, res) => {
  const user = await OrgUserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});

export const deleteOrgUser = AsyncHandler(async (req, res) => {
  const user = await OrgUserModel.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, message: "User deleted" });
});
