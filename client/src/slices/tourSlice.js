import { createSlice } from '@reduxjs/toolkit';
import {
    fetchTours,
    fetchTourDetail,
    createTour,
    updateTour,
    deleteTour,
} from '../apis/tourApi.js';

const initialState = {
    tours: [],
    currentTour: null,
    isLoading: false,
    isError: false,
    errorMessage: '',
};

export const tourSlice = createSlice({
    name: 'tour',
    initialState,
    reducers: {
        clearCurrentTour: (state) => {
            state.currentTour = null;
        },
        clearError: (state) => {
            state.isError = false;
            state.errorMessage = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTours.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchTours.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tours = action.payload;
            })
            .addCase(fetchTours.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            })
            .addCase(fetchTourDetail.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchTourDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentTour = action.payload;
            })
            .addCase(fetchTourDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            })
            .addCase(createTour.fulfilled, (state, action) => {
                state.tours.push(action.payload);
            })
            .addCase(updateTour.fulfilled, (state, action) => {
                const index = state.tours.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.tours[index] = action.payload;
                }
                if (state.currentTour?.id === action.payload.id) {
                    state.currentTour = action.payload;
                }
            })
            .addCase(deleteTour.fulfilled, (state, action) => {
                state.tours = state.tours.filter((t) => t.id !== action.payload);
                if (state.currentTour?.id === action.payload) {
                    state.currentTour = null;
                }
            });
    },
});

export const { clearCurrentTour, clearError } = tourSlice.actions;
export default tourSlice.reducer;

