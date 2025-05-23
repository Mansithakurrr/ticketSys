const express = require('express');
const cors = require('cors');
const ticketRoutes = require('./routes/ticketRoutes'); // Import ticket routes
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Serve static files (for uploaded attachments)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/tickets', ticketRoutes);

// Basic error handling middleware (you can expand this)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong!',
    errors: err.errors // For validation errors from Joi/Express-validator
  });
});

module.exports = app;