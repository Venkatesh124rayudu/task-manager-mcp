const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const crypto = require('crypto');

const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({ message: 'API key required' });
    }

    // Parse the API key (format: keyId:keySecret)
    const [keyId, keySecret] = apiKey.split(':');
    
    if (!keyId || !keySecret) {
      return res.status(401).json({ message: 'Invalid API key format' });
    }

    // Find the API key record
    const apiKeyRecord = await ApiKey.findOne({ 
      keyId, 
      isActive: true 
    }).select('+keySecret').populate('user');

    if (!apiKeyRecord) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Check if expired
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return res.status(401).json({ message: 'API key expired' });
    }

    // Verify the secret
    const isValid = crypto.timingSafeEqual(
      Buffer.from(keySecret),
      Buffer.from(apiKeyRecord.keySecret)
    );

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Update last used timestamp
    apiKeyRecord.lastUsed = new Date();
    await apiKeyRecord.save();

    // Set user in request
    req.user = apiKeyRecord.user;
    req.apiKey = apiKeyRecord;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error during API key validation' });
  }
};

module.exports = apiKeyAuth;