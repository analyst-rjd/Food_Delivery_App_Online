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

## Troubleshooting

### Common Issues

1. **Images not loading**: The application includes fallback placeholders for missing images.

2. **No data appears**: Try running the seed script (`npm run seed` in the backend directory) to populate the database with sample restaurants and menu items.

3. **Connection issues**: Ensure both frontend and backend servers are running. The frontend automatically detects if it's running locally and uses the appropriate API URL.

4. **API errors**: Check the browser console for specific error messages. Verify your MongoDB connection is working properly.

5. **Authentication problems**: Make sure the JWT_SECRET is set in your .env file. Check that the token is being properly stored in localStorage.