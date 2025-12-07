import { createSlice } from '@reduxjs/toolkit';
import { registerAccount, loginAccount } from '../apis/authApi.js';

const initialState = {
    user: JSON.parse(localStorage.getItem('currentAccount')) || null,
    isLoading: false,
    isError: false,
    errorMessage: '',
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            localStorage.removeItem('currentAccount');
        },
        clearError: (state) => {
            state.isError = false;
            state.errorMessage = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerAccount.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = '';
            })
            .addCase(registerAccount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.user = action.payload.user;
            })
            .addCase(registerAccount.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload || action.error?.message || 'Đăng ký thất bại';
            })
            .addCase(loginAccount.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = '';
            })
            .addCase(loginAccount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.user = action.payload.user;
            })
            .addCase(loginAccount.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload || action.error?.message || 'Đăng nhập thất bại';
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

