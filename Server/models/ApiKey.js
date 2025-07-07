const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  keyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  keySecret: {
    type: String,
    required: true,
    select: false // Don't return in queries by default
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'all'],
    default: 'all'
  }],
  lastUsed: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null // null means no expiration
  }
}, {
  timestamps: true
});

// Index for efficient lookups
apiKeySchema.index({ keyId: 1, isActive: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);