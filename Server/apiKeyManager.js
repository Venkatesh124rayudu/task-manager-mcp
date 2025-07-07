// ===================================================================
// API Key Management Script (apiKeyManager.js)
const mongoose = require('mongoose');
const User = require('./models/User');
const ApiKey = require('./models/ApiKey');
const crypto = require('crypto');
require('dotenv').config();

class ApiKeyManager {
  constructor() {
    this.connectDB();
  }

  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  }

  generateSecureString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  async createApiKeyForUser(email, keyName = 'Default API Key', expiresInDays = null) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      // Generate key ID and secret
      const keyId = 'ak_' + this.generateSecureString(16);
      const keySecret = this.generateSecureString(32);

      // Calculate expiration date
      let expiresAt = null;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      const apiKey = new ApiKey({
        name: keyName,
        keyId,
        keySecret,
        user: user._id,
        permissions: ['all'],
        expiresAt
      });

      await apiKey.save();

      const fullApiKey = `${keyId}:${keySecret}`;
      
      console.log('✅ API Key created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('User:', user.email);
      console.log('Key Name:', keyName);
      console.log('API Key:', fullApiKey);
      console.log('Key ID:', keyId);
      console.log('Expires:', expiresAt ? expiresAt.toDateString() : 'Never');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANT: Store this API key securely. It will not be shown again!');
      console.log('');

      return {
        id: apiKey._id,
        name: apiKey.name,
        keyId: apiKey.keyId,
        apiKey: fullApiKey,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt
      };
    } catch (error) {
      console.error('Error creating API key:', error.message);
      throw error;
    }
  }

  async listApiKeysForUser(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const apiKeys = await ApiKey.find({ user: user._id })
        .select('-keySecret')
        .sort({ createdAt: -1 });

      console.log(`\n📋 API Keys for ${email}:`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (apiKeys.length === 0) {
        console.log('No API keys found for this user.');
      } else {
        apiKeys.forEach((key, index) => {
          console.log(`${index + 1}. ${key.name}`);
          console.log(`   Key ID: ${key.keyId}`);
          console.log(`   Status: ${key.isActive ? '🟢 Active' : '🔴 Inactive'}`);
          console.log(`   Created: ${key.createdAt.toDateString()}`);
          console.log(`   Last Used: ${key.lastUsed ? key.lastUsed.toDateString() : 'Never'}`);
          console.log(`   Expires: ${key.expiresAt ? key.expiresAt.toDateString() : 'Never'}`);
          console.log('');
        });
      }
      
      return apiKeys;
    } catch (error) {
      console.error('Error listing API keys:', error.message);
      throw error;
    }
  }

  async deleteApiKey(keyId) {
    try {
      const apiKey = await ApiKey.findOne({ keyId });
      if (!apiKey) {
        throw new Error('API key not found');
      }

      await ApiKey.findByIdAndDelete(apiKey._id);
      console.log(`✅ API key ${keyId} deleted successfully`);
      
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error.message);
      throw error;
    }
  }

  async close() {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const manager = new ApiKeyManager();

  const showHelp = () => {
    console.log(`
📚 API Key Manager Usage:

Create API Key:
  node apiKeyManager.js create <email> [keyName] [expiresInDays]
  
List API Keys:
  node apiKeyManager.js list <email>
  
Delete API Key:
  node apiKeyManager.js delete <keyId>

Examples:
  node apiKeyManager.js create user@example.com "My API Key" 30
  node apiKeyManager.js list user@example.com
  node apiKeyManager.js delete ak_1234567890abcdef
`);
  };

  const run = async () => {
    try {
      const command = args[0];
      
      switch (command) {
        case 'create':
          const email = args[1];
          const keyName = args[2] || 'Default API Key';
          const expiresInDays = args[3] ? parseInt(args[3]) : null;
          
          if (!email) {
            console.error('❌ Email is required');
            showHelp();
            return;
          }
          
          await manager.createApiKeyForUser(email, keyName, expiresInDays);
          break;
          
        case 'list':
          const listEmail = args[1];
          if (!listEmail) {
            console.error('❌ Email is required');
            showHelp();
            return;
          }
          
          await manager.listApiKeysForUser(listEmail);
          break;
          
        case 'delete':
          const keyId = args[1];
          if (!keyId) {
            console.error('❌ Key ID is required');
            showHelp();
            return;
          }
          
          await manager.deleteApiKey(keyId);
          break;
          
        default:
          showHelp();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      await manager.close();
    }
  };

  run();
}

module.exports = ApiKeyManager;