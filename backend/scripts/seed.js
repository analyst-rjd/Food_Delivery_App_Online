const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Item = require('../models/Item');
require('dotenv').config();

// Sample restaurants data
// Sample restaurants data
const restaurants = [
  {
    name: 'Paradise Biryani',
    legacyId: '1', // Numeric ID for frontend compatibility
    numericId: '1', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: true,
      recyclablePackaging: true,
      lowWaste: true,
      organicCertified: false,
      waterConservation: true,
      solarPowered: false,
      energyEfficient: true
    },
    categories: ['Biryani', 'North Indian', 'Chinese'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070',
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070',
      'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2070'
    ]
  },
  {
    name: 'Shah Ghouse',
    sustainabilityMetrics: {
      localSourcing: true,
      recyclablePackaging: false,
      lowWaste: true,
      organicCertified: false,
      waterConservation: true,
      solarPowered: true,
      energyEfficient: false
    },
    categories: ['North Indian', 'Chinese', 'Tandoor'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070'
    ]
  },
  {
    name: 'Mehfil Restaurant',
    legacyId: '3', // Numeric ID for frontend compatibility
    numericId: '3', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: false,
      recyclablePackaging: true,
      lowWaste: true,
      organicCertified: true,
      waterConservation: false,
      solarPowered: false,
      energyEfficient: true
    },
    categories: ['Biryani', 'Chinese', 'North Indian'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=2070',
    images: [
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=2069',
      'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?q=80&w=2064'
    ]
  },
  {
    name: 'Fusion Kitchen',
    legacyId: '4', // Numeric ID for frontend compatibility
    numericId: '4', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: true,
      recyclablePackaging: true,
      lowWaste: true,
      organicCertified: true,
      waterConservation: true,
      solarPowered: false,
      energyEfficient: true
    },
    categories: ['Fusion', 'Burgers', 'Pizza'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=2074',
    images: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074',
      'https://images.unsplash.com/photo-1484659619207-9165d119dafe?q=80&w=2070'
    ]
  },
  {
    name: 'Green Earth Cafe',
    legacyId: '5', // Numeric ID for frontend compatibility
    numericId: '5', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: true,
      recyclablePackaging: true,
      lowWaste: true,
      organicCertified: true,
      waterConservation: true,
      solarPowered: true,
      energyEfficient: true
    },
    categories: ['Breakfast', 'Mains', 'Desserts', 'Beverages'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047',
    images: [
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2071',
      'https://images.unsplash.com/photo-1601000595609-9d7938ddb566?q=80&w=2070'
    ]
  },
  {
    name: 'Spice Route',
    legacyId: '6', // Numeric ID for frontend compatibility
    numericId: '6', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: true,
      recyclablePackaging: false,
      lowWaste: true,
      organicCertified: false,
      waterConservation: true,
      solarPowered: false,
      energyEfficient: true
    },
    categories: ['Thai', 'Chinese', 'Korean', 'Japanese'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1532347922424-c652d9b7208e?q=80&w=2042',
    images: [
      'https://images.unsplash.com/photo-1526069631228-723c945bea6b?q=80&w=2070',
      'https://images.unsplash.com/photo-1622732778198-e0300ece57af?q=80&w=2070'
    ]
  },
  {
    name: 'Cream Stone',
    legacyId: '7', // Numeric ID for frontend compatibility
    numericId: '7', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: true,
      recyclablePackaging: true,
      lowWaste: false,
      organicCertified: true,
      waterConservation: true,
      solarPowered: false,
      energyEfficient: true
    },
    categories: ['Ice Cream', 'Desserts', 'Beverages'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=2070',
    images: [
      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=2070',
      'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=2070'
    ]
  },
  {
    name: 'Cafe Bahar',
    legacyId: '8', // Numeric ID for frontend compatibility
    numericId: '8', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: true,
      recyclablePackaging: true,
      lowWaste: true,
      organicCertified: false,
      waterConservation: false,
      solarPowered: false,
      energyEfficient: true
    },
    categories: ['North Indian', 'Chinese', 'Biryani'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2071',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047',
      'https://images.unsplash.com/photo-1559305616-3e6a5ea454e7?q=80&w=2070'
    ]
  },
  {
    name: 'Hotel Shadab',
    legacyId: '9', // Numeric ID for frontend compatibility
    numericId: '9', // Numeric ID for frontend compatibility
    sustainabilityMetrics: {
      localSourcing: false,
      recyclablePackaging: true,
      lowWaste: true,
      organicCertified: true,
      waterConservation: true,
      solarPowered: true,
      energyEfficient: true
    },
    categories: ['Biryani', 'North Indian', 'Chinese'],
    items: [], // Will be populated with item IDs
    mainImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    images: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070'
    ]
  }
];

// Sample items data
const itemsData = [
  // Regular items
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken and special spices',
    price: 299,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=2070',
    category: 'Biryani',
    restaurant: 'Paradise Biryani'
  },
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces',
    price: 349,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=2070',
    category: 'North Indian',
    restaurant: 'Shah Ghouse'
  },
  {
    name: 'Chicken Manchurian',
    description: 'Indo-Chinese style crispy chicken in spicy sauce',
    price: 289,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=2070',
    category: 'Chinese',
    restaurant: 'Mehfil Restaurant'
  },
  
  // Fusion Kitchen Items
  {
    name: 'Paneer Tikka Pizza',
    description: 'Indian-Italian fusion with tandoori paneer on a crispy pizza base',
    price: 399,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070',
    category: 'Fusion',
    restaurant: 'Fusion Kitchen'
  },
  {
    name: 'Curry Pasta',
    description: 'Penne pasta tossed in a spicy Indian curry sauce',
    price: 349,
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2070',
    category: 'Fusion',
    restaurant: 'Fusion Kitchen'
  },
  {
    name: 'Masala Burger',
    description: 'Beef patty infused with Indian spices and topped with mint chutney',
    price: 299,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2070',
    category: 'Burgers',
    restaurant: 'Fusion Kitchen'
  },
  
  // Green Earth Cafe Items
  {
    name: 'Avocado Toast',
    description: 'Sourdough bread topped with smashed avocado, cherry tomatoes, and microgreens',
    price: 249,
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?q=80&w=2070',
    category: 'Breakfast',
    restaurant: 'Green Earth Cafe'
  },
  {
    name: 'Buddha Bowl',
    description: 'Nutritious bowl with quinoa, roasted vegetables, hummus, and tahini dressing',
    price: 329,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070',
    category: 'Mains',
    restaurant: 'Green Earth Cafe'
  },
  {
    name: 'Acai Smoothie Bowl',
    description: 'Thick acai smoothie topped with granola, fresh fruits, and chia seeds',
    price: 279,
    image: 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?q=80&w=2013',
    category: 'Breakfast',
    restaurant: 'Green Earth Cafe'
  },
  
  // Spice Route Items
  {
    name: 'Thai Green Curry',
    description: 'Authentic Thai green curry with bamboo shoots and Thai basil',
    price: 329,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=2070',
    category: 'Thai',
    restaurant: 'Spice Route'
  },
  {
    name: 'Pad Thai',
    description: 'Classic Thai stir-fried noodles with tofu, bean sprouts, and peanuts',
    price: 289,
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=2070',
    category: 'Thai',
    restaurant: 'Spice Route'
  },
  {
    name: 'Korean Bibimbap',
    description: 'Mixed rice bowl with vegetables, beef, and gochujang sauce',
    price: 369,
    image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=2070',
    category: 'Korean',
    restaurant: 'Spice Route'
  }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://rajdas010703:rajdas123@cluster0.cb1ng.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Longer timeout for seeding
    });
    
    console.log('MongoDB connected for seeding');
    
    // Clear existing data with proper error handling
    try {
      console.log('Clearing existing restaurant data...');
      await mongoose.connection.collection('restaurants').deleteMany({});
      console.log('Restaurant data cleared');
      
      console.log('Clearing existing item data...');
      await mongoose.connection.collection('items').deleteMany({});
      console.log('Item data cleared');
    } catch (clearError) {
      console.error('Error clearing existing data:', clearError);
      console.log('Will attempt to continue with seeding...');
    }
    
    // Map to store items by restaurant
    const restaurantItemsMap = {};
    
    // Create all items first
    console.log('Creating menu items...');
    for (const itemData of itemsData) {
      try {
        const { restaurant: restaurantName, ...itemDetails } = itemData;
        
        // Create the item
        const item = new Item(itemDetails);
        const savedItem = await item.save();
        console.log(`Created item: ${itemDetails.name}`);
        
        // Initialize array for this restaurant if it doesn't exist
        if (!restaurantItemsMap[restaurantName]) {
          restaurantItemsMap[restaurantName] = [];
        }
        
        // Add the item ID to the restaurant's items array
        restaurantItemsMap[restaurantName].push(savedItem._id);
      } catch (itemError) {
        console.error(`Error creating item ${itemData.name}:`, itemError);
        // Continue with next item
      }
    }
    
    // Create restaurants with their items
    console.log('Creating restaurants...');
    for (const restaurantData of restaurants) {
      try {
        const restaurant = new Restaurant({
          ...restaurantData,
          items: restaurantItemsMap[restaurantData.name] || []
        });
        
        await restaurant.save();
        console.log(`Created restaurant: ${restaurantData.name} with ${restaurantItemsMap[restaurantData.name]?.length || 0} items`);
      } catch (restaurantError) {
        console.error(`Error creating restaurant ${restaurantData.name}:`, restaurantError);
        // Continue with next restaurant
      }
    }
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();