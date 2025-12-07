import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Frontend chỉ gọi API - logic tính toán có thể chuyển sang backend sau
export const fetchReportSummary = createAsyncThunk(
    'report/fetchReportSummary',
    async (period = 'monthly') => {
        const { data: bookings } = await axios.get(`${API_URL}/api/bookings`);

        const stats = {};
        const filtered = bookings.filter((b) => b.status !== 'cancelled');

        filtered.forEach((booking) => {
            const date = new Date(booking.startDate);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;

            const key = period === 'quarterly' ? quarter : month;
            stats[key] = stats[key] || { revenue: 0, bookings: 0 };
            stats[key].revenue += booking.totalAmount || 0;
            stats[key].bookings += 1;
        });

        return stats;
    }
);

export const fetchTopTours = createAsyncThunk('report/fetchTopTours', async () => {
    const { data: bookings } = await axios.get(`${API_URL}/api/bookings`);
    const { data: tours } = await axios.get(`${API_URL}/api/tours`);

    const ranking = tours.map((tour) => {
        const tourBookings = bookings.filter(
            (b) => String(b.tourId) === String(tour.id || tour._id) && b.status !== 'cancelled'
        );
        const seatsSold = tourBookings.reduce((sum, b) => sum + (b.travelers || 0), 0);
        const revenue = tourBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return {
            tourId: tour.id || tour._id,
            name: tour.name,
            seatsSold,
            revenue,
        };
    });

    return ranking.sort((a, b) => b.revenue - a.revenue);
});

