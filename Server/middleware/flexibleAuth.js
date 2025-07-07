// middleware/flexibleAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiKeyAuth = require('./apiKeyMiddleware');

// Flexible authentication middleware that supports both JWT and API keys
const flexibleAuth = async (req, res, next) => {
  // Check for API key first
  const apiKey = req.header('X-API-Key');
  if (apiKey) {
    return apiKeyAuth(req, res, next);
  }

  // Fall back to JWT authentication
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token or API key provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = flexibleAuth;