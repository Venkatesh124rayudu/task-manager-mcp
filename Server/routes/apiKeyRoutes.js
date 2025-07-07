const express = require('express');
const router = express.Router();
const { createApiKey, getApiKeys, deleteApiKey, updateApiKey } = require('../controllers/apiKeyController');
const auth = require('../middleware/authMiddleware'); // JWT middleware

// @route   POST /api/keys
// @desc    Create a new API key
router.post('/', auth, createApiKey);

// @route   GET /api/keys
// @desc    Get all API keys for user
router.get('/', auth, getApiKeys);

// @route   PUT /api/keys/:id
// @desc    Update API key
router.put('/:id', auth, updateApiKey);

// @route   DELETE /api/keys/:id
// @desc    Delete API key
router.delete('/:id', auth, deleteApiKey);

module.exports = router;