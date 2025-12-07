import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Frontend chỉ gọi API - không xử lý logic
export const fetchBookings = createAsyncThunk(
    'booking/fetchBookings',
    async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.userId) params.append('userId', filters.userId);
        if (filters.status) params.append('status', filters.status);

        const { data } = await axios.get(
            `${API_URL}/api/bookings?${params.toString()}`
        );
        return data;
    }
);

export const createBooking = createAsyncThunk(
    'booking/createBooking',
    async ({ tourId, scheduleId, userId, travelers, contact }, { rejectWithValue }) => {
        try {
            // Backend sẽ xử lý tất cả validation và tính toán
            const { data } = await axios.post(`${API_URL}/api/bookings`, {
                tourId,
                scheduleId,
                userId,
                travelers,
                contact,
            });
            return data;
        } catch (error) {
            // Handle axios errors (400, 401, 500, etc.)
            const errorMessage = error.response?.data?.EM || error.message || 'Không thể đặt tour';
            return rejectWithValue(errorMessage);
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'booking/cancelBooking',
    async ({ id, note }) => {
        // Backend sẽ xử lý logic trả ghế
        const { data } = await axios.patch(`${API_URL}/api/bookings/${id}/cancel`, {
            note,
        });
        return data;
    }
);

export const updateBookingStatus = createAsyncThunk(
    'booking/updateBookingStatus',
    async ({ id, status, note }) => {
        // Backend sẽ xử lý logic trừ/trả ghế
        const { data } = await axios.patch(`${API_URL}/api/bookings/${id}/status`, {
            status,
            note,
        });
        return data;
    }
);

