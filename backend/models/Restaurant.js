const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Legacy ID field for numeric IDs from frontend data
    legacyId: { type: String },
    // Numeric ID for frontend compatibility
    numericId: { type: String },
    sustainabilityMetrics: { type: Object, default: {} },
    categories: { type: [String], default: [] },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: [] }],
    vendor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vendor',
        required: false // Make optional for existing data
    },
    address: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zipCode: { type: String, required: false },
        country: { type: String, default: 'India' }
    },
    phone: { type: String, required: false },
    email: { type: String },
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    images: [{ type: String }],
    mainImage: { type: String, default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074' },
    deliveryRadius: { type: Number, default: 5 }, // in km
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
