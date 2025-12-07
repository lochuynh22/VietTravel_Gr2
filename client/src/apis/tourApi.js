import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Frontend chỉ gọi API - không xử lý logic
export const fetchTours = createAsyncThunk(
    'tour/fetchTours',
    async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.destination) params.append('destination', filters.destination);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.duration) params.append('duration', filters.duration);
        if (filters.search) params.append('search', filters.search);

        const { data } = await axios.get(`${API_URL}/api/tours?${params.toString()}`);
        return data;
    }
);

export const fetchTourDetail = createAsyncThunk(
    'tour/fetchTourDetail',
    async (id) => {
        const { data } = await axios.get(`${API_URL}/api/tours/${id}`);
        return data;
    }
);

export const createTour = createAsyncThunk('tour/createTour', async (tourData) => {
    const { data } = await axios.post(`${API_URL}/api/tours`, tourData);
    return data;
});

export const updateTour = createAsyncThunk(
    'tour/updateTour',
    async ({ id, ...tourData }) => {
        const { data } = await axios.patch(`${API_URL}/api/tours/${id}`, tourData);
        return data;
    }
);

export const deleteTour = createAsyncThunk('tour/deleteTour', async (id) => {
    await axios.delete(`${API_URL}/api/tours/${id}`);
    return id;
});

