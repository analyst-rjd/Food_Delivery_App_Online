const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Restaurant = require('../models/Restaurant');
const Item = require('../models/Item');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery-app';

// Function to extract data from frontend JS files
function extractDataFromFile(filePath, exportName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Create a temporary module to evaluate the JS
    const tempFilePath = path.join(__dirname, 'temp-data.js');
    
    // Convert ES6 export to CommonJS export
    const commonJsContent = content.replace(
      new RegExp(`export const ${exportName} = (.*);`, 's'), 
      `module.exports = $1;`
    );
    
    fs.writeFileSync(tempFilePath, commonJsContent);
    
    // Require the temporary file
    const data = require(tempFilePath);
    
    // Clean up
    fs.unlinkSync(tempFilePath);
    
    return data;
  } catch (error) {
    console.error(`Error extracting data from ${filePath}:`, error);
    return null;
  }
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    await Item.deleteMany({});
    console.log('Cleared existing data');

    // Get paths to frontend data files
    const frontendDir = path.join(__dirname, '../../frontend/src/suby/data');
    const restaurantsFile = path.join(frontendDir, 'restaurants.js');
    const menuDataFile = path.join(frontendDir, 'menuData.js');
    const itemDataFile = path.join(frontendDir, 'itemData.js');

    // Extract data from frontend files
    const restaurantData = extractDataFromFile(restaurantsFile, 'restaurantData');
    const menuData = extractDataFromFile(menuDataFile, 'menuData');
    const itemData = extractDataFromFile(itemDataFile, 'itemData');

    if (!restaurantData || !menuData || !itemData) {
      throw new Error('Failed to extract data from frontend files');
    }

    console.log('Successfully extracted frontend data');

    // Create items first
    const itemsMap = new Map();
    
    // Process items from menuData
    for (const restaurantId in menuData) {
      const restaurant = menuData[restaurantId];
      
      for (const item of restaurant.items) {
        const newItem = new Item({
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || 'https://via.placeholder.com/150',
          category: item.category
        });
        
        const savedItem = await newItem.save();
        
        // Store the item id for reference
        const key = `${restaurantId}_${item.id}`;
        itemsMap.set(key, savedItem._id);
      }
    }
    
    // Add items from itemData if they don't exist already
    for (const item of itemData) {
      const existingItem = await Item.findOne({ name: item.name });
      if (!existingItem) {
        const newItem = new Item({
          name: item.name,
          description: item.description || '',
          price: item.price || 299, // Default price if not specified
          image: item.item_img || 'https://via.placeholder.com/150',
          category: item.category
        });
        await newItem.save();
      }
    }
    
    console.log('Items created');
    
    // Create restaurants
    for (const restaurantId in menuData) {
      const restaurantInfo = menuData[restaurantId];
      
      // Collect item IDs for this restaurant
      const itemIds = restaurantInfo.items.map(item => 
        itemsMap.get(`${restaurantId}_${item.id}`)
      ).filter(id => id); // Filter out undefined
      
      const newRestaurant = new Restaurant({
        name: restaurantInfo.name,
        sustainabilityMetrics: restaurantInfo.sustainabilityMetrics || {},
        categories: restaurantInfo.categories || [],
        items: itemIds
      });
      
      await newRestaurant.save();
    }
    
    console.log('Restaurants created');
    console.log('Database seeded successfully with frontend data');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();