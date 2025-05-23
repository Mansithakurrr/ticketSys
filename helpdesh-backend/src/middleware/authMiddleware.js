const protect = (req, res, next) => {
  // For now, we'll just attach a dummy userId.
  // In a real app, you'd decode a JWT or check session for user ID.
  req.user = { id: '60c72b2f9f1b2c001c8e4d5f' }; // Replace with a valid ObjectId from your DB or a dummy ID
  next();
};

module.exports = { protect };