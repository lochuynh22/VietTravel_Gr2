import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Frontend chỉ gọi API - không xử lý logic
export const registerAccount = createAsyncThunk(
    'auth/register',
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/register`, {
                name,
                email,
                password,
            });

            if (data.ER === 0 && data.user) {
                localStorage.setItem('currentAccount', JSON.stringify(data.user));
            }

            if (data.ER === 1) {
                return rejectWithValue(data.EM);
            }

            return data;
        } catch (error) {
            // Handle axios errors (401, 400, 500, etc.)
            const errorMessage = error.response?.data?.EM || error.message || 'Đăng ký thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const loginAccount = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });

            if (data.ER === 0 && data.user) {
                localStorage.setItem('currentAccount', JSON.stringify(data.user));
            }

            if (data.ER === 1) {
                return rejectWithValue(data.EM);
            }

            return data;
        } catch (error) {
            // Handle axios errors (401, 400, 500, etc.)
            const errorMessage = error.response?.data?.EM || error.message || 'Đăng nhập thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

