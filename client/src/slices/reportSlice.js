import { createSlice } from '@reduxjs/toolkit';
import { fetchReportSummary, fetchTopTours } from '../apis/reportApi.js';

const initialState = {
    summary: {},
    topTours: [],
    isLoading: false,
    isError: false,
    errorMessage: '',
};

export const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        clearError: (state) => {
            state.isError = false;
            state.errorMessage = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReportSummary.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchReportSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.summary = action.payload;
            })
            .addCase(fetchReportSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            })
            .addCase(fetchTopTours.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchTopTours.fulfilled, (state, action) => {
                state.isLoading = false;
                state.topTours = action.payload;
            })
            .addCase(fetchTopTours.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.error.message;
            });
    },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;

