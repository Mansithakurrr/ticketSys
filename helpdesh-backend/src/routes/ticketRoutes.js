const express = require('express');
const router = express.Router();
const { createTicket,getTickets, getTicketById, upload } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/tickets - Create a new ticket (with optional file uploads)
router.post(
  '/',
  upload.array('attachments', 5), // 'attachments' is the field name for files, 5 is the max count
  createTicket
);

// GET /api/tickets - Get all tickets
router.get('/', getTickets);

// GET /api/tickets/:id - Get a single ticket by ID
router.get('/:id', getTicketById);

module.exports = router;