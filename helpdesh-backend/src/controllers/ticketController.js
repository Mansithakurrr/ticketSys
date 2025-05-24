const Ticket = require('../models/Ticket');
const multer = require('multer');
const fs = require('fs'); // For file system operations

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// --- Controller Functions ---

// @desc    Create a new ticket
// @route   POST /api/tickets
const createTicket = async (req, res, next) => {
  try {
    const { fullName, email, type, priority, subject, description } = req.body;

    // Basic validation
    if (!fullName || !email || !type || !priority || !subject || !description) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (subject.length > 100) {
      return res.status(400).json({ message: 'Subject cannot exceed 100 characters.' });
    }
    if (description.length < 50) {
      return res.status(400).json({ message: 'Description must be at least 50 characters.' });
    }

    // Process attachments
    const attachments = req.files
      ? req.files.map(file => ({
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        }))
      : [];

    const newTicket = new Ticket({
      fullName,
      email,
      type,
      priority,
      subject,
      description,
      attachments,
      userId: null, // no user ID for now
    });

    const createdTicket = await newTicket.save();
    console.log('Created ticket:', createdTicket);

    res.status(201).json({
      message: 'Ticket created successfully!',
      ticket: createdTicket,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Max 10MB per file.' });
    }
    next(error);
  }
};





// @desc    Get all tickets (auth skipped)
// @route   GET /api/tickets
const getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    console.log('Fetched tickets:', tickets);

    res.status(200).json({
      message: 'Tickets fetched successfully!',
      tickets,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    next(error);
  }
};

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    res.status(200).json({
      message: 'Ticket fetched successfully!',
      ticket,
    });
  } catch (error) {
    console.error('Error fetching ticket by ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ticket ID format.' });
    }
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  upload,
};
