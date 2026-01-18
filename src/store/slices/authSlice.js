import { createSlice } from '@reduxjs/toolkit';

const user = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token');

const initialState = {
    user: user,
    isAuthenticated: !!token,
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            // Ensure localStorage is updated
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
