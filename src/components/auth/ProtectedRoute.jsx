import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';

const ProtectedRoute = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const token = localStorage.getItem('token');

    // Load user from localStorage if not in Redux
    useEffect(() => {
        if (token && !user) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    dispatch(setUser(JSON.parse(storedUser)));
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, [token, user, dispatch]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
