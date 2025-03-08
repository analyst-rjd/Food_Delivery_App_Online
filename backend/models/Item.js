const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String },
    // Legacy ID for frontend compatibility
    legacyId: { type: String },
    // Support both ObjectId and string restaurant references
    restaurant: { 
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String
        ref: 'Restaurant',
        required: false // Make optional for existing data
    },
    isAvailable: { 
        type: Boolean, 
        default: true 
    },
    ingredients: [{ type: String }],
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    specialDiet: {
        isVegetarian: { type: Boolean, default: false },
        isVegan: { type: Boolean, default: false },
        isGlutenFree: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
