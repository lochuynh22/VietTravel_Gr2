import app from './app.js';
import connectDB from './utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Start server first (non-blocking)
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n  Connecting to MongoDB...`);
});

// Connect to MongoDB (async, won't block server start)
connectDB().catch((err) => {
    console.error('\n MongoDB connection failed!');
    console.error(' Server is still running, but API calls will fail');
    console.error(' To fix: Install and start MongoDB (see MONGODB_SETUP.md)');
});

