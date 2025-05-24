const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  upload,
} = require('../controllers/ticketController');


router.get('/test', (req, res) => {
  res.json({ message: 'Ticket API test working ✅' });
});

router.post(
  '/',
  upload.array('attachments', 5),
  createTicket
);

router.get('/', getTickets);


router.get('/:id', getTicketById);

// ------------------------

module.exports = router;
