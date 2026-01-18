import { useDispatch, useSelector } from 'react-redux';

// Pre-typed hooks for better TypeScript support and convenience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for specific slices
export const useAuth = () => useAppSelector((state) => state.auth);
export const usePlayer = () => useAppSelector((state) => state.player);
export const usePreferences = () => useAppSelector((state) => state.preferences);
