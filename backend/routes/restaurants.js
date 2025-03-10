const express = require('express');
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Item = require('../models/Item');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isValidObjectId, createIdQuery } = require('../utils/idUtils');

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        // Find all restaurants without populate to avoid potential errors
        const restaurants = await Restaurant.find();
        
        // Add default images if missing and process data
        const processedRestaurants = restaurants.map(restaurant => {
            const restaurantObj = restaurant.toObject();
            
            // Ensure mainImage exists
            if (!restaurantObj.mainImage) {
                restaurantObj.mainImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074';
            }
            
            // Ensure categories exists
            if (!restaurantObj.categories || !Array.isArray(restaurantObj.categories)) {
                restaurantObj.categories = [];
            }
            
            // Ensure items exists as an array
            if (!restaurantObj.items || !Array.isArray(restaurantObj.items)) {
                restaurantObj.items = [];
            }
            
            return restaurantObj;
        });
        
        res.status(200).json(processedRestaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a restaurant by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // First try to find by numeric ID in case it's from the frontend static data
        let restaurant;
        
        // Try to find by numeric ID first (for frontend compatibility)
        if (!isValidObjectId(id) && !isNaN(id)) {
            // Try to find the restaurant by numeric ID from the frontend data
            // First check if we have any restaurant with legacyId field matching the ID
            restaurant = await Restaurant.findOne({ legacyId: id });
            
            // If not found by legacyId, try to find by numeric string ID in the frontend data
            if (!restaurant) {
                // For local development with hardcoded data
                const menuData = {
                    "1": "Paradise Biryani",
                    "2": "Shah Ghouse",
                    "3": "Mehfil Restaurant",
                    "4": "Bawarchi",
                    "5": "Pista House",
                    "6": "Kritunga Restaurant",
                    "7": "Cream Stone",
                    "8": "Cafe Bahar",
                    "9": "Hotel Shadab"
                };
                
                // If this is a known ID from the frontend data
                if (menuData[id]) {
                    restaurant = await Restaurant.findOne({ name: menuData[id] });
                }
            }
        }
        
        // If not found by numeric ID, try by ObjectId
        if (!restaurant && isValidObjectId(id)) {
            restaurant = await Restaurant.findById(id);
        }
        
        if (!restaurant) {
            console.error(`Restaurant not found with ID: ${id}`);
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        // Get items separately to avoid populate errors
        // Try to find items by both ObjectId and string ID
        const items = await Item.find({ 
            $or: [
                { restaurant: restaurant._id },
                { restaurant: id.toString() }
            ]
        });
        
        // Create a processed response with items included
        const restaurantObj = restaurant.toObject();
        
        // Add the numeric ID for frontend reference
        restaurantObj.numericId = id;
        
        // Ensure mainImage exists
        if (!restaurantObj.mainImage) {
            restaurantObj.mainImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074';
        }
        
        // Ensure categories exists
        if (!restaurantObj.categories || !Array.isArray(restaurantObj.categories)) {
            restaurantObj.categories = [];
        }
        
        // Add the items to the response
        restaurantObj.items = items;
        
        res.status(200).json(restaurantObj);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get restaurants by vendor ID (for vendor dashboard)
router.get('/vendor/me', protect, async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ vendor: req.vendor.id });
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new restaurant (protected - only for logged in vendors)
router.post('/', protect, upload.single('mainImage'), async (req, res) => {
    try {
        const restaurantData = {
            ...req.body,
            vendor: req.vendor.id,
        };

        // Handle image upload
        if (req.file) {
            restaurantData.mainImage = `/uploads/${req.file.filename}`;
        }

        // Parse categories if sent as JSON string
        if (req.body.categories && typeof req.body.categories === 'string') {
            try {
                restaurantData.categories = JSON.parse(req.body.categories);
            } catch (err) {
                restaurantData.categories = req.body.categories.split(',');
            }
        }

        // Parse opening hours if sent as JSON string
        if (req.body.openingHours && typeof req.body.openingHours === 'string') {
            try {
                restaurantData.openingHours = JSON.parse(req.body.openingHours);
            } catch (err) {
                console.error('Failed to parse opening hours', err);
            }
        }

        // Parse address if sent as JSON string
        if (req.body.address && typeof req.body.address === 'string') {
            try {
                restaurantData.address = JSON.parse(req.body.address);
            } catch (err) {
                console.error('Failed to parse address', err);
            }
        }

        const restaurant = new Restaurant(restaurantData);
        const savedRestaurant = await restaurant.save();
        res.status(201).json(savedRestaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a restaurant (protected - only for the owner)
router.put('/:id', protect, upload.single('mainImage'), async (req, res) => {
    try {
        const id = req.params.id;
        let restaurant;
        
        // Handle both ObjectId and numeric ID formats
        if (isValidObjectId(id)) {
            restaurant = await Restaurant.findById(id);
        } else if (!isNaN(id)) {
            // Try to find by numeric ID
            restaurant = await Restaurant.findOne({ 
                $or: [
                    { legacyId: id },
                    { numericId: id }
                ]
            });
            
            // If not found by numeric ID, try by name using the menuData mapping
            if (!restaurant) {
                const menuData = {
                    "1": "Paradise Biryani",
                    "2": "Shah Ghouse",
                    "3": "Mehfil Restaurant",
                    "4": "Bawarchi",
                    "5": "Pista House",
                    "6": "Kritunga Restaurant",
                    "7": "Cream Stone",
                    "8": "Cafe Bahar",
                    "9": "Hotel Shadab"
                };
                
                if (menuData[id]) {
                    restaurant = await Restaurant.findOne({ name: menuData[id] });
                }
            }
        }
        
        // Check if restaurant exists
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        // Check if vendor owns this restaurant
        if (restaurant.vendor && restaurant.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized to update this restaurant' });
        }

        // Handle image upload
        if (req.file) {
            req.body.mainImage = `/uploads/${req.file.filename}`;
        }

        // Parse categories if sent as JSON string
        if (req.body.categories && typeof req.body.categories === 'string') {
            try {
                req.body.categories = JSON.parse(req.body.categories);
            } catch (err) {
                req.body.categories = req.body.categories.split(',');
            }
        }

        // Update the restaurant
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurant._id,
            { $set: req.body },
            { new: true }
        );

        res.status(200).json(updatedRestaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a restaurant (protected - only for the owner)
router.delete('/:id', protect, async (req, res) => {
    try {
        const id = req.params.id;
        let restaurant;
        
        // Handle both ObjectId and numeric ID formats
        if (isValidObjectId(id)) {
            restaurant = await Restaurant.findById(id);
        } else if (!isNaN(id)) {
            // Try to find by numeric ID
            restaurant = await Restaurant.findOne({ 
                $or: [
                    { legacyId: id },
                    { numericId: id }
                ]
            });
            
            // If not found by numeric ID, try by name using the menuData mapping
            if (!restaurant) {
                const menuData = {
                    "1": "Paradise Biryani",
                    "2": "Shah Ghouse",
                    "3": "Mehfil Restaurant",
                    "4": "Bawarchi",
                    "5": "Pista House",
                    "6": "Kritunga Restaurant",
                    "7": "Cream Stone",
                    "8": "Cafe Bahar",
                    "9": "Hotel Shadab"
                };
                
                if (menuData[id]) {
                    restaurant = await Restaurant.findOne({ name: menuData[id] });
                }
            }
        }
        
        // Check if restaurant exists
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        // Check if vendor owns this restaurant
        if (restaurant.vendor && restaurant.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized to delete this restaurant' });
        }

        await Restaurant.findByIdAndDelete(restaurant._id);
        
        res.status(200).json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload restaurant gallery images
router.post('/:id/images', protect, upload.array('images', 5), async (req, res) => {
    try {
        const id = req.params.id;
        let restaurant;
        
        // Handle both ObjectId and numeric ID formats
        if (isValidObjectId(id)) {
            restaurant = await Restaurant.findById(id);
        } else if (!isNaN(id)) {
            // Try to find by numeric ID
            restaurant = await Restaurant.findOne({ 
                $or: [
                    { legacyId: id },
                    { numericId: id }
                ]
            });
            
            // If not found by numeric ID, try by name using the menuData mapping
            if (!restaurant) {
                const menuData = {
                    "1": "Paradise Biryani",
                    "2": "Shah Ghouse",
                    "3": "Mehfil Restaurant",
                    "4": "Bawarchi",
                    "5": "Pista House",
                    "6": "Kritunga Restaurant",
                    "7": "Cream Stone",
                    "8": "Cafe Bahar",
                    "9": "Hotel Shadab"
                };
                
                if (menuData[id]) {
                    restaurant = await Restaurant.findOne({ name: menuData[id] });
                }
            }
        }
        
        // Check if restaurant exists
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        // Check if vendor owns this restaurant
        if (restaurant.vendor && restaurant.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized to update this restaurant' });
        }

        // Process uploaded images
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        
        // Update the restaurant with new gallery images
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurant._id,
            { $push: { images: { $each: imageUrls } } },
            { new: true }
        );
        
        res.status(200).json(updatedRestaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;