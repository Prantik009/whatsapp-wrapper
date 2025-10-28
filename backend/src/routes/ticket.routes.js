import express from "express";
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller.js";

const router = express.Router({ mergeParams: true });

router.route("/:orgId/tickets")
  .get(listTickets)
  .post(createTicket);

router.route("/:id")
  .get(getTicket)
  .put(updateTicket)
  .delete(deleteTicket);

export default router;
