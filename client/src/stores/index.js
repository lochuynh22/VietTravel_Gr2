import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice.js';
import tourReducer from '../slices/tourSlice.js';
import bookingReducer from '../slices/bookingSlice.js';
import reportReducer from '../slices/reportSlice.js';
import scheduleReducer from '../slices/scheduleSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tour: tourReducer,
        booking: bookingReducer,
        report: reportReducer,
        schedule: scheduleReducer,
    },
});

export default store;

