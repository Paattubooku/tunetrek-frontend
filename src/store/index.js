import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import playerReducer from './slices/playerSlice';
import preferencesReducer from './slices/preferencesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        player: playerReducer,
        preferences: preferencesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serialization checks
                ignoredActions: ['player/setCurrentTrack'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['player.currentTrack.audio'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
