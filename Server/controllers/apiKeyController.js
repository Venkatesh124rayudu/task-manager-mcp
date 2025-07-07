const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

// Generate a secure random string
const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// @desc    Create a new API key
// @route   POST /api/keys
// @access  Private (JWT required)
exports.createApiKey = async (req, res) => {
  try {
    const { name, permissions, expiresInDays } = req.body;

    // Generate key ID and secret
    const keyId = 'ak_' + generateSecureString(16);
    const keySecret = generateSecureString(32);

    // Calculate expiration date
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const apiKey = new ApiKey({
      name: name || 'Default API Key',
      keyId,
      keySecret,
      user: req.user.id,
      permissions: permissions || ['all'],
      expiresAt
    });

    await apiKey.save();

    // Return the full API key (keyId:keySecret) - only shown once
    res.status(201).json({
      id: apiKey._id,
      name: apiKey.name,
      keyId: apiKey.keyId,
      apiKey: `${keyId}:${keySecret}`, // Full key for client use
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      warning: 'Store this API key securely. It will not be shown again.'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all API keys for user
// @route   GET /api/keys
// @access  Private (JWT required)
exports.getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ user: req.user.id })
      .select('-keySecret') // Never return the secret
      .sort({ createdAt: -1 });

    res.json(apiKeys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an API key
// @route   DELETE /api/keys/:id
// @access  Private (JWT required)
exports.deleteApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    await ApiKey.findByIdAndDelete(req.params.id);
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update API key (activate/deactivate)
// @route   PUT /api/keys/:id
// @access  Private (JWT required)
exports.updateApiKey = async (req, res) => {
  try {
    const { isActive, name } = req.body;

    const apiKey = await ApiKey.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    if (isActive !== undefined) apiKey.isActive = isActive;
    if (name !== undefined) apiKey.name = name;

    await apiKey.save();

    res.json({
      id: apiKey._id,
      name: apiKey.name,
      keyId: apiKey.keyId,
      isActive: apiKey.isActive,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      lastUsed: apiKey.lastUsed,
      updatedAt: apiKey.updatedAt
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};