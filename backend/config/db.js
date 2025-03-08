const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        // Use environment variable or fallback to a default connection string
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://rajdas010703:rajdas123@cluster0.cb1ng.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        
        // Use more reliable connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };
        
        await mongoose.connect(mongoUri, options);
        console.log('MongoDB connected successfully');
        
        // Test the connection with a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`Connected to database with ${collections.length} collections`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.error('Please check your MongoDB connection string and ensure the database server is running');
        
        // Don't exit the process, allow the application to continue with local data
        console.log('Application will continue with local data only');
    }
};

module.exports = connectDB;;