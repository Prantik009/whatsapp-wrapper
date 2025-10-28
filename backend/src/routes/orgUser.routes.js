import express from "express";
import {
  createOrgUser,
  listOrgUsers,
  getOrgUser,
  updateOrgUser,
  deleteOrgUser,
  sendOtp,
  verifyOtp,
  verifyEmailAndCreateAdmin,
} from "../controllers/orgUser.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/verify-email", verifyEmailAndCreateAdmin);


router.route("/:orgId/users")
  .get(listOrgUsers)
  .post(createOrgUser);

router.route("/:id")
  .get(getOrgUser)
  .put(updateOrgUser)
  .delete(deleteOrgUser);

export default router;
