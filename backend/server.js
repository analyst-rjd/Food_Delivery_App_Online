const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const { cors, corsOptions, allowedOrigins } = require('./corsConfig');
const itemRoutes = require('./routes/items');
const restaurantRoutes = require('./routes/restaurants');
const vendorRoutes = require('./routes/vendors');
const dotenv = require('dotenv');

dotenv.config();

// Connect to database but continue even if it fails
connectDB().catch(err => {
  console.error('Database connection failed but server will continue:', err.message);
});

const app = express();

// Apply CORS middleware first, before any other middleware or routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Additional CORS headers middleware as a backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Increase JSON payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/items', itemRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/vendors', vendorRoutes);

// Basic health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Food Delivery API is running' });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is working!',
    origin: req.headers.origin || 'No origin'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});