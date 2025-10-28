import { AsyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../middlewares/ApiError.js";
import { TicketModel } from "../models/ticket.model.js";
import { getJSON, delKey } from "../lib/redis.js";
import { MessageModel } from "../models/message.model.js";

export const listTickets = AsyncHandler(async (req, res) => {
  const tickets = await TicketModel.find({ organizationId: req.params.orgId })
    .populate("contactId", "displayName phone")
    .populate("assigneeIds", "name role")
    .sort({ updatedAt: -1 });
  res.json({ success: true, tickets });
});

export const getTicket = AsyncHandler(async (req, res) => {
  const ticket = await TicketModel.findById(req.params.id)
    .populate("contactId assigneeIds createdBy");
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ success: true, ticket });
});

export const createTicket = AsyncHandler(async (req, res) => {
  const ticket = await TicketModel.create(req.body);
  const { organizationId, contactId } = ticket;

  // get waId from ContactModel
  const contact = await ContactModel.findById(contactId);
  const tempKey = `temp:msgs:${organizationId}:${contact.waId}`;

  // fetch temporary messages
  const cached = await getJSON(tempKey);
  if (cached?.length) {
    const docs = cached.map((m) => ({
      organizationId,
      conversationId: ticket.conversationId, // optional
      contactId,
      waMessageId: m.waMessageId,
      direction: m.direction,
      text: m.text,
      ticketId: ticket._id,
    }));

    // bulk insert into MongoDB
    await MessageModel.insertMany(docs);

    // delete cache
    await delKey(tempKey);
  }

  res.status(201).json({ success: true, ticket });
});

export const updateTicket = AsyncHandler(async (req, res) => {
  const ticket = await TicketModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ success: true, ticket });
});

export const deleteTicket = AsyncHandler(async (req, res) => {
  const ticket = await TicketModel.findByIdAndDelete(req.params.id);
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json({ success: true, message: "Ticket deleted" });
});
