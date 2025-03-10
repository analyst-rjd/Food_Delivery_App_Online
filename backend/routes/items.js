const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Restaurant = require('../models/Restaurant');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isValidObjectId, createIdQuery } = require('../utils/idUtils');

// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        
        // Process items to ensure they have all required fields
        const processedItems = items.map(item => {
            const itemObj = item.toObject();
            
            // Ensure image field exists
            if (!itemObj.image) {
                itemObj.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080';
            }
            
            // Ensure category exists
            if (!itemObj.category) {
                itemObj.category = 'Other';
            }
            
            // Ensure description exists
            if (!itemObj.description) {
                itemObj.description = 'A delicious dish prepared with the finest ingredients.';
            }
            
            return itemObj;
        });
        
        res.status(200).json(processedItems);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get items by restaurant ID
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;
        
        // Build a query that can handle both ObjectId and numeric ID
        let query;
        
        if (isValidObjectId(restaurantId)) {
            // If it's a valid ObjectId, use it directly
            query = { restaurant: mongoose.Types.ObjectId(restaurantId) };
        } else {
            // If it's a numeric ID, try to find items by matching the restaurant field
            // with either the ObjectId or the string value
            query = {
                $or: [
                    { restaurant: restaurantId },
                    { 'restaurant.legacyId': restaurantId },
                    { 'restaurant.numericId': restaurantId }
                ]
            };
            
            // Try to find the actual restaurant first to get its ObjectId
            try {
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
                if (menuData[restaurantId]) {
                    const restaurant = await Restaurant.findOne({ 
                        $or: [
                            { name: menuData[restaurantId] },
                            { legacyId: restaurantId },
                            { numericId: restaurantId }
                        ]
                    });
                    
                    if (restaurant) {
                        // Add the restaurant's ObjectId to the query
                        query.$or.push({ restaurant: restaurant._id });
                    }
                }
            } catch (err) {
                console.error('Error finding restaurant by name:', err);
            }
        }
        
        console.log('Restaurant items query:', JSON.stringify(query));
        const items = await Item.find(query);
        
        // Process items to ensure they have all required fields
        const processedItems = items.map(item => {
            const itemObj = item.toObject();
            
            // Ensure image field exists
            if (!itemObj.image) {
                itemObj.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080';
            }
            
            // Ensure category exists
            if (!itemObj.category) {
                itemObj.category = 'Other';
            }
            
            // Ensure description exists
            if (!itemObj.description) {
                itemObj.description = 'A delicious dish prepared with the finest ingredients.';
            }
            
            return itemObj;
        });
        
        res.status(200).json(processedItems);
    } catch (error) {
        console.error('Error fetching items by restaurant:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a specific item
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let item;
        
        if (isValidObjectId(id)) {
            // If it's a valid ObjectId, use findById
            item = await Item.findById(id);
        } else {
            // If it's not a valid ObjectId, try to find by legacyId
            item = await Item.findOne({ legacyId: id });
        }
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Process item to ensure it has all required fields
        const itemObj = item.toObject();
        
        // Ensure image field exists
        if (!itemObj.image) {
            itemObj.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080';
        }
        
        // Ensure category exists
        if (!itemObj.category) {
            itemObj.category = 'Other';
        }
        
        // Ensure description exists
        if (!itemObj.description) {
            itemObj.description = 'A delicious dish prepared with the finest ingredients.';
        }
        
        res.status(200).json(itemObj);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new item (protected - only for logged in vendors who own the restaurant)
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        // Verify restaurant ownership
        const restaurant = await Restaurant.findById(req.body.restaurant);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        if (restaurant.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized to add items to this restaurant' });
        }

        const itemData = { ...req.body };
        
        // Handle image upload
        if (req.file) {
            itemData.image = `/uploads/${req.file.filename}`;
        }

        // Parse ingredients if sent as JSON string
        if (req.body.ingredients && typeof req.body.ingredients === 'string') {
            try {
                itemData.ingredients = JSON.parse(req.body.ingredients);
            } catch (err) {
                itemData.ingredients = req.body.ingredients.split(',');
            }
        }

        // Parse nutritionalInfo if sent as JSON string
        if (req.body.nutritionalInfo && typeof req.body.nutritionalInfo === 'string') {
            try {
                itemData.nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
            } catch (err) {
                console.error('Failed to parse nutritional info', err);
            }
        }

        // Parse specialDiet if sent as JSON string
        if (req.body.specialDiet && typeof req.body.specialDiet === 'string') {
            try {
                itemData.specialDiet = JSON.parse(req.body.specialDiet);
            } catch (err) {
                console.error('Failed to parse special diet', err);
            }
        }

        const item = new Item(itemData);
        const savedItem = await item.save();
        
        // Add item to restaurant's items array
        restaurant.items.push(savedItem._id);
        
        // Add category to restaurant's categories array if it doesn't exist already
        if (savedItem.category && !restaurant.categories.includes(savedItem.category)) {
            restaurant.categories.push(savedItem.category);
        }
        
        await restaurant.save();
        
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an item (protected - only for the restaurant owner)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Verify restaurant ownership
        const restaurant = await Restaurant.findById(item.restaurant);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        if (restaurant.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized to update items in this restaurant' });
        }

        const itemData = { ...req.body };
        
        // Handle image upload
        if (req.file) {
            itemData.image = `/uploads/${req.file.filename}`;
        }

        // Parse ingredients if sent as JSON string
        if (req.body.ingredients && typeof req.body.ingredients === 'string') {
            try {
                itemData.ingredients = JSON.parse(req.body.ingredients);
            } catch (err) {
                itemData.ingredients = req.body.ingredients.split(',');
            }
        }

        // Parse nutritionalInfo if sent as JSON string
        if (req.body.nutritionalInfo && typeof req.body.nutritionalInfo === 'string') {
            try {
                itemData.nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
            } catch (err) {
                console.error('Failed to parse nutritional info', err);
            }
        }

        // Parse specialDiet if sent as JSON string
        if (req.body.specialDiet && typeof req.body.specialDiet === 'string') {
            try {
                itemData.specialDiet = JSON.parse(req.body.specialDiet);
            } catch (err) {
                console.error('Failed to parse special diet', err);
            }
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            itemData,
            { new: true, runValidators: true }
        );
        
        // If category changed, update restaurant categories
        if (item.category !== updatedItem.category) {
            // Check if any other items use the old category
            const itemsWithOldCategory = await Item.countDocuments({
                restaurant: restaurant._id,
                category: item.category,
                _id: { $ne: item._id }
            });
            
            // If no other items use the old category, remove it from restaurant
            if (itemsWithOldCategory === 0 && restaurant.categories.includes(item.category)) {
                restaurant.categories = restaurant.categories.filter(c => c !== item.category);
            }
            
            // Add new category if it doesn't exist
            if (!restaurant.categories.includes(updatedItem.category)) {
                restaurant.categories.push(updatedItem.category);
            }
            
            await restaurant.save();
        }
        
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an item (protected - only for the restaurant owner)
router.delete('/:id', protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Verify restaurant ownership
        const restaurant = await Restaurant.findById(item.restaurant);
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        
        if (restaurant.vendor.toString() !== req.vendor.id) {
            return res.status(401).json({ message: 'Not authorized to delete items from this restaurant' });
        }

        await Item.findByIdAndDelete(req.params.id);
        
        // Remove item from restaurant's items array
        restaurant.items = restaurant.items.filter(i => i.toString() !== req.params.id);
        
        // Check if any other items use the same category
        const itemsWithSameCategory = await Item.countDocuments({
            restaurant: restaurant._id,
            category: item.category,
            _id: { $ne: item._id }
        });
        
        // If no other items use the category, remove it from restaurant
        if (itemsWithSameCategory === 0 && restaurant.categories.includes(item.category)) {
            restaurant.categories = restaurant.categories.filter(c => c !== item.category);
        }
        
        await restaurant.save();
        
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
