const cors = require('cors');

const allowedOrigins = [
  'https://food-delivery-app-online.vercel.app',
  'https://food-delivery-app-online-git-main-analyst-rjds-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Basic CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = { cors, corsOptions, allowedOrigins };