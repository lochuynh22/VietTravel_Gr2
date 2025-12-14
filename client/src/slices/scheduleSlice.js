import { createSlice } from '@reduxjs/toolkit';
import {
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
} from '../apis/scheduleApi.js';

const initialState = {
    schedules: [],
    isLoading: false,
    isError: false,
    errorMessage: '',
};

export const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        clearError: (state) => {
            state.isError = false;
            state.errorMessage = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchedules.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchSchedules.fulfilled, (state, action) => {
                state.isLoading = false;
                state.schedules = action.payload;
            })
            .addCase(fetchSchedules.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            })
            .addCase(createSchedule.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(createSchedule.fulfilled, (state, action) => {
                state.isLoading = false;
                state.schedules.push(action.payload);
            })
            .addCase(createSchedule.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload || action.error?.message || 'Không thể tạo lịch';
            })
            .addCase(updateSchedule.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(updateSchedule.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.schedules.findIndex((s) => s.id === action.payload.id || s._id === action.payload.id);
                if (index !== -1) {
                    state.schedules[index] = action.payload;
                }
            })
            .addCase(updateSchedule.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload || action.error?.message || 'Không thể cập nhật lịch';
            })
            .addCase(deleteSchedule.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(deleteSchedule.fulfilled, (state, action) => {
                state.isLoading = false;
                state.schedules = state.schedules.filter((s) => s.id !== action.payload && s._id !== action.payload);
            })
            .addCase(deleteSchedule.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload || action.error?.message || 'Không thể xóa lịch';
            });
    },
});

export const { clearError } = scheduleSlice.actions;
export default scheduleSlice.reducer;

