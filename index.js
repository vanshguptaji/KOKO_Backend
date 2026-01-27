/**
 * Veterinary Chatbot SDK - Backend Server
 * 
 * An AI-powered chatbot backend for veterinary Q&A and appointment booking.
 * Built with Node.js, Express, MongoDB, and Google Gemini AI.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Database and AI configuration
const { connectDB } = require('./src/config/database');
const { initializeGemini } = require('./src/config/gemini');

// Routes
const routes = require('./src/routes');

// Middleware
const { errorHandler, requestLogger } = require('./src/middleware');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// Security Middleware
// ======================

// Helmet for security headers (with CSP adjustments for inline scripts)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "*"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for SDK accessibility
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ======================
// Body Parsing
// ======================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// Logging (Development)
// ======================

if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// ======================
// Static Files (SDK)
// ======================

// Serve chatbot SDK and demo files
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // Set CORS headers for SDK files
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Set proper content type for JavaScript files
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  },
}));

// ======================
// API Routes
// ======================

app.use('/api', routes);

// ======================
// Root Routes
// ======================

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Veterinary Chatbot SDK API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      chat: {
        init: 'POST /api/chat/init',
        message: 'POST /api/chat/message',
        history: 'GET /api/chat/history/:sessionId',
        reset: 'DELETE /api/chat/session/:sessionId',
      },
      appointments: {
        list: 'GET /api/appointments',
        stats: 'GET /api/appointments/stats',
        byId: 'GET /api/appointments/:id',
        bySession: 'GET /api/appointments/session/:sessionId',
        updateStatus: 'PATCH /api/appointments/:id/status',
      },
    },
    sdk: {
      script: '/chatbot.js',
      demo: '/index.html',
    },
  });
});

// ======================
// Error Handling
// ======================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

// ======================
// Server Startup
// ======================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize Gemini AI
    initializeGemini();
    
    // Start server
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════');
      console.log('  🐾 Veterinary Chatbot SDK Backend');
      console.log('═══════════════════════════════════════════════');
      console.log(`  🚀 Server running on: http://localhost:${PORT}`);
      console.log(`  📖 API Docs: http://localhost:${PORT}/`);
      console.log(`  🎮 Demo: http://localhost:${PORT}/index.html`);
      console.log(`  📦 SDK: http://localhost:${PORT}/chatbot.js`);
      console.log('═══════════════════════════════════════════════');
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('═══════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  const { disconnectDB } = require('./src/config/database');
  await disconnectDB();
  process.exit(0);
});

// Start the server
startServer();

