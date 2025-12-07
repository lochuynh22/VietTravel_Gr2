import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vietravel';
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        console.error('💡 Make sure MongoDB is running: mongod');
        console.error('💡 Or check MONGODB_URI in .env file');
        // Don't exit immediately - let server start but API calls will fail
        // process.exit(1);
    }
};

export default connectDB;

