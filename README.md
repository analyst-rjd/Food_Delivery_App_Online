# Food Delivery App

A full-stack food delivery application with a React frontend and Express/MongoDB backend.

## Features

### Customer Features
- Browse restaurants and menu items
- Search for restaurants and dishes
- View restaurant details and menus
- Track orders

### Vendor Features
- Vendor authentication (signup/login)
- Restaurant management (create, update, delete)
- Menu management (add, edit, delete items)
- Upload images for restaurants and menu items

## Project Structure

- `frontend/` - React application built with Vite
- `backend/` - Express API server with MongoDB

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. Seed the database with sample data (recommended):
   ```
   npm run seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```
   
   Or for production:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. For production build:
   ```
   npm run build
   ```

## Accessing Vendor Features

1. Register as a vendor at `/vendor/register`
2. Login with your credentials at `/vendor/login`
3. Use the dashboard to manage restaurants and menu items
4. Add new restaurants, upload images, and create menu items

## API Endpoints

### Authentication Endpoints
- POST `/api/vendors/register` - Register a new vendor
- POST `/api/vendors/login` - Login a vendor
- GET `/api/vendors/me` - Get current vendor profile (protected)
- PUT `/api/vendors/profile` - Update vendor profile (protected)
- PUT `/api/vendors/profile-image` - Upload vendor profile image (protected)
- POST `/api/vendors/logout` - Logout vendor (protected)

### Restaurants
- GET `/api/restaurants` - Get all restaurants
- GET `/api/restaurants/:id` - Get restaurant by ID
- GET `/api/restaurants/vendor/me` - Get restaurants owned by current vendor (protected)
- POST `/api/restaurants` - Create a new restaurant (protected)
- PUT `/api/restaurants/:id` - Update a restaurant (protected)
- DELETE `/api/restaurants/:id` - Delete a restaurant (protected)
- POST `/api/restaurants/:id/images` - Upload restaurant gallery images (protected)

### Items
- GET `/api/items` - Get all items
- GET `/api/items/restaurant/:restaurantId` - Get items by restaurant ID
- GET `/api/items/:id` - Get item by ID
- POST `/api/items` - Create a new item (protected)
- PUT `/api/items/:id` - Update an item (protected)
- DELETE `/api/items/:id` - Delete an item (protected)

## Technology Stack

- **Frontend**: React, React Router, Vite, Context API
- **Backend**: Express, Node.js, MongoDB, Mongoose, JWT, Multer
- **Deployment**: Vercel (frontend), Render (backend)

## Deployment Guide

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas account
- Vercel account for frontend deployment
- Render account for backend deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Sign up/login to [Render](https://render.com)
   - Click "New" > "Web Service"
   - Connect your GitHub repository or upload code directly
   - Select the backend directory

2. **Configure the Web Service**
   - **Name**: food-delivery-app-backend (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or paid for production)

3. **Set Environment Variables**
   - Click on "Environment" tab
   - Add the following variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secure_jwt_secret
     CORS_ORIGIN=https://your-frontend-url.vercel.app
     ```

4. **Deploy the Service**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

### Frontend Deployment (Vercel)

1. **Create a new Project on Vercel**
   - Sign up/login to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository or upload code directly
   - Select the frontend directory

2. **Configure the Project**
   - **Framework Preset**: Vite
   - **Root Directory**: frontend (if deploying from monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

3. **Set Environment Variables**
   - Go to "Settings" > "Environment Variables"
   - Add the following variable:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

4. **Deploy the Project**
   - Click "Deploy"
   - Wait for the build and deployment to complete

### MongoDB Setup

1. **Create a MongoDB Atlas Cluster**
   - Sign up/login to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier works for development)
   - Set up database access with a username and password
   - Configure network access (allow access from anywhere for Render)

2. **Get Your Connection String**
   - Go to "Database" > "Connect" > "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Add your database name: `mongodb+srv://username:password@cluster.mongodb.net/food_delivery_app_prod?retryWrites=true&w=majority`

## Troubleshooting

### Common Issues

1. **CORS Issues**: Make sure the CORS_ORIGIN environment variable in your backend exactly matches your frontend URL

2. **Images not loading**: The application includes fallback placeholders for missing images.

3. **No data appears**: Try running the seed script (`npm run seed` in the backend directory) to populate the database with sample restaurants and menu items.

4. **Connection issues**: Ensure both frontend and backend servers are running. The frontend automatically detects if it's running locally and uses the appropriate API URL.

5. **API errors**: Check the browser console for specific error messages. Verify your MongoDB connection is working properly.

6. **Authentication problems**: Make sure the JWT_SECRET is set in your .env file. Check that the token is being properly stored in localStorage..