import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Frontend chỉ gọi API - không xử lý logic
export const createSchedule = createAsyncThunk(
    'schedule/createSchedule',
    async ({ tourId, date, seatsTotal }) => {
        const { data } = await axios.post(`${API_URL}/api/schedules`, {
            tourId,
            date,
            seatsTotal,
        });
        return data;
    }
);

export const updateSchedule = createAsyncThunk(
    'schedule/updateSchedule',
    async ({ id, ...scheduleData }) => {
        const { data } = await axios.patch(`${API_URL}/api/schedules/${id}`, scheduleData);
        return data;
    }
);

export const deleteSchedule = createAsyncThunk(
    'schedule/deleteSchedule',
    async (id) => {
        await axios.delete(`${API_URL}/api/schedules/${id}`);
        return id;
    }
);

