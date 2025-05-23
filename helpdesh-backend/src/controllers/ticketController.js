const Ticket = require('../models/Ticket');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For file system operations

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create the uploads directory if it doesn't exist
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
    // You can add more specific file type validation here if needed
    // For example, cb(new Error('Only images are allowed!'), false);
    cb(null, true);
  },
});

// --- Controller Functions ---

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (should be protected by auth middleware)
const createTicket = async (req, res, next) => {
  try {
    const { fullName, email, type, priority, subject, description }
      = req.body;
    const userId = req.user ? req.user.id : null; // Get user ID from auth middleware

    // Validate request body (basic validation here, detailed validation can be done with Joi/express-validator)
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
    const attachments = req.files ? req.files.map((file) => ({
      filename: file.originalname,
      path: file.path, // This is the path on the server
      mimetype: file.mimetype,
      size: file.size,
    })) : [];

    const newTicket = new Ticket({
      fullName,
      email,
      type,
      priority,
      subject,
      description,
      attachments,
      userId,
    });

    const createdTicket = await newTicket.save();
    console.log('Created ticket:', createdTicket);

    res.status(201).json({
      message: 'Ticket created successfully!',
      ticket: createdTicket,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    // Handle Multer errors specifically
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Max 10MB per file.' });
      }
      // Other Multer errors can be handled here
    }
    next(error); // Pass to general error handling middleware
  }
};


// @desc    Get all tickets for a user (or all tickets if no userId in query)
// @route   GET /api/tickets
// @access  Private (should be protected by auth middleware)
const getTickets = async (req, res, next) => {
  try {
    // In a real app, you might want to fetch tickets specific to the logged-in user:
    const userId = req.user ? req.user.id : null; // Get user ID from auth middleware

    let query = {};
    if (userId) {
      query.userId = userId; // Filter by user ID if authenticated
    }

    // Fetch tickets from the database, sort by creation date (newest first)
    // .populate('userId', 'fullName email') // If you have a User model and want to populate user details
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
     console.log('tickets:', tickets);
     
    res.status(200).json({
      message: 'Tickets fetched successfully!',
      tickets: tickets,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    next(error);
  }
};

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private (should be protected by auth middleware and ownership check)
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null; // Get user ID from auth middleware

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Optional: Ensure the fetched ticket belongs to the authenticated user
    if (userId && ticket.userId && ticket.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this ticket.' });
    }

    res.status(200).json({
      message: 'Ticket fetched successfully!',
      ticket: ticket,
    });
  } catch (error) {
    console.error('Error fetching single ticket:', error);
    // Handle Mongoose CastError (e.g., invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ticket ID format.' });
    }
    next(error);
  }
};


// You can add other controller functions like:
// - updateTicket
// - deleteTicket




module.exports = {
  createTicket,
  getTickets,
  getTicketById, // Export the new function
  upload, // Export multer upload middleware
};