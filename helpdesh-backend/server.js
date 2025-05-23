require('dotenv').config(); // Load environment variables first
const app = require('./src/app');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db'); // Import your database connection function

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});