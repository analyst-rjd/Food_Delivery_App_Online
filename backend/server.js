const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
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

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});