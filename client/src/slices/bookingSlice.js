import { createSlice } from '@reduxjs/toolkit';
import {
    fetchBookings,
    createBooking,
    cancelBooking,
    updateBookingStatus,
} from '../apis/bookingApi.js';
import { logout } from './authSlice.js';

const initialState = {
    bookings: [],
    isLoading: false,
    isError: false,
    errorMessage: '',
};

export const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        clearError: (state) => {
            state.isError = false;
            state.errorMessage = '';
        },
        clearBookings: (state) => {
            state.bookings = [];
            state.isError = false;
            state.errorMessage = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            })
            .addCase(createBooking.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bookings.push(action.payload);
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload || action.error?.message || 'Không thể đặt tour';
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                const index = state.bookings.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                const index = state.bookings.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
            })
            // Clear bookings khi user logout
            .addCase(logout, (state) => {
                state.bookings = [];
                state.isError = false;
                state.errorMessage = '';
            });
    },
});

export const { clearError, clearBookings } = bookingSlice.actions;
export default bookingSlice.reducer;

