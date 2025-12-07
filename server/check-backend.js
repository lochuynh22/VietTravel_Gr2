import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000';

async function checkBackend() {
    console.log('🔍 Checking backend connection...\n');
    
    try {
        const response = await axios.get(`${API_URL}/api/health`, {
            timeout: 5000,
        });
        console.log('✅ Backend is running!');
        console.log('📡 Response:', response.data);
        console.log('\n✅ All good! Backend is ready.');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Backend is NOT running!');
            console.error('💡 Start backend with: cd server && npm run dev');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('❌ Connection timeout!');
            console.error('💡 Check if backend is running on port 4000');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

checkBackend();

