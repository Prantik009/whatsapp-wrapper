import { AsyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../middlewares/ApiError.js";
import { ContactModel } from "../models/contact.model.js";

export const listContacts = AsyncHandler(async (req, res) => {
  const contacts = await ContactModel.find({ organizationId: req.params.orgId }).sort({ updatedAt: -1 });
  res.json({ success: true, contacts });
});

export const getContact = AsyncHandler(async (req, res) => {
  const contact = await ContactModel.findById(req.params.id);
  if (!contact) throw new ApiError(404, "Contact not found");
  res.json({ success: true, contact });
});

export const updateContact = AsyncHandler(async (req, res) => {
  const contact = await ContactModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!contact) throw new ApiError(404, "Contact not found");
  res.json({ success: true, contact });
});
