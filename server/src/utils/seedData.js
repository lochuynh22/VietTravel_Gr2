import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Tour from '../models/Tour.js';
import Schedule from '../models/Schedule.js';
import Booking from '../models/Booking.js';
import connectDB from './db.js';

dotenv.config();

// Sample data from db.json structure
const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Tour.deleteMany({});
        await Schedule.deleteMany({});
        await Booking.deleteMany({});

        console.log('Cleared existing data');

        // Hash passwords
        const hashedUserPassword = await bcrypt.hash('123456', 10);
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);

        // Seed Users
        const users = await User.insertMany([
            {
                name: 'Linh Tran',
                email: 'linh@demo.com',
                password: hashedUserPassword,
                role: 'customer',
            },
            {
                name: 'Admin Vietravel Asia',
                email: 'admin@vietravelasia.com',
                password: hashedAdminPassword,
                role: 'admin',
            },
        ]);

        console.log('Seeded users');

        // Create a map for user IDs
        const userMap = {};
        users.forEach((user, index) => {
            if (index === 0) userMap['u-traveler'] = user._id;
            if (index === 1) userMap['u-admin'] = user._id;
        });

        // Seed Tours
        const tours = await Tour.insertMany([
            {
                name: 'Sapa Heritage Retreat 4N3Đ',
                slug: 'sapa-heritage-retreat',
                destination: 'Sa Pa',
                region: 'Tây Bắc',
                price: 8200000,
                salePrice: 7590000,
                durationDays: 4,
                thumbnail:
                    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80',
                images: [
                    'https://images.unsplash.com/photo-1474980468805-645cb11c4830?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
                ],
                highlights: [
                    'Chinh phục Fansipan Legend bằng cáp treo',
                    "Check-in bản Cát Cát, trải nghiệm văn hóa H'Mông",
                    'Lưu trú resort 4* với view núi mây',
                ],
                itinerary: [
                    {
                        day: 1,
                        title: 'Hà Nội - Lào Cai - Sapa',
                        description:
                            'Đón khách tại Hà Nội, di chuyển cao tốc đến Lào Cai. Thăm bản Cát Cát và thưởng thức đặc sản địa phương.',
                    },
                    {
                        day: 2,
                        title: 'Fansipan Legend - Núi Hàm Rồng',
                        description:
                            'Chinh phục "nóc nhà Đông Dương" bằng tuyến cáp treo. Buổi chiều tham quan núi Hàm Rồng, săn mây tại Sân Mây.',
                    },
                    {
                        day: 3,
                        title: 'Y Tý săn mây - Thung lũng Mường Hoa',
                        description:
                            'Khởi hành đi Y Tý săn mây, trải nghiệm ruộng bậc thang ở Mường Hoa. Thưởng thức thắng cố và rượu táo mèo.',
                    },
                    {
                        day: 4,
                        title: 'Sapa - Hà Nội',
                        description:
                            'Tự do mua sắm chợ phiên Sapa, trả phòng và xe đưa đoàn về lại Hà Nội.',
                    },
                ],
                policies: {
                    deposit: 'Đặt cọc 50% giá tour khi xác nhận',
                    cancellation:
                        'Hoàn 80% trước 15 ngày, 50% trước 7 ngày, sau 3 ngày không hoàn',
                    notes: 'Giá đã bao gồm vé cáp treo Fansipan, bảo hiểm du lịch 100 triệu',
                },
            },
        ]);

        console.log('Seeded tours');

        // Create a map for tour IDs
        const tourMap = {};
        tours.forEach((tour, index) => {
            if (index === 0) tourMap['t-sapa-heritage'] = tour._id;
        });

        // Seed Schedules
        const schedules = await Schedule.insertMany([
            {
                tourId: tourMap['t-sapa-heritage'],
                date: new Date('2025-11-24'),
                seatsTotal: 30,
            },
            {
                tourId: tourMap['t-sapa-heritage'],
                date: new Date('2025-12-09'),
                seatsTotal: 25,
            },
            {
                tourId: tourMap['t-sapa-heritage'],
                date: new Date('2025-12-24'),
                seatsTotal: 30,
            },
        ]);

        console.log('Seeded schedules');
        console.log('Seed data completed successfully!');
        console.log('\nYou can now start the server with: npm start');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

// Run if called directly
seedData();

export default seedData;

