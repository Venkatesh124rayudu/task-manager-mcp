require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes'); // NEW

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

// Start server after connecting to DB
connectDB().then(() => {
  // Render requires binding to 0.0.0.0 and uses PORT environment variable
  const PORT = process.env.PORT || 10000; // Default to 10000 instead of 5000
  const HOST = '0.0.0.0'; // Bind to all interfaces, not just localhost
  
  app.listen(PORT, HOST, () => {
    console.log(`Server running on host ${HOST} and port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  console.error('Database connection failed:', error);
  process.exit(1);
});