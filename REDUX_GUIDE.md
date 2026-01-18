# Redux State Management - TuneTrek

## Overview
This application uses **Redux Toolkit** for production-grade global state management. Redux Toolkit is the official, recommended way to write Redux logic and provides excellent developer experience with minimal boilerplate.

## Architecture

### Store Structure
```
src/store/
├── index.js              # Store configuration
├── hooks.js              # Custom typed hooks
└── slices/
    ├── authSlice.js      # Authentication state
    ├── playerSlice.js    # Music player state
    └── preferencesSlice.js # User preferences
```

## State Slices

### 1. Authentication Slice (`authSlice.js`)
Manages user authentication and session state.

**State:**
- `user`: Current user object (null when logged out)
- `isAuthenticated`: Boolean flag for auth status
- `loading`: Loading state for auth operations

**Actions:**
- `setUser(user)`: Set current user and mark as authenticated
- `logout()`: Clear user data and remove from localStorage
- `setLoading(boolean)`: Set loading state

**Usage:**
```javascript
import { useAuth } from '../store/hooks';
import { setUser, logout } from '../store/slices/authSlice';

function MyComponent() {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAuth();
    
    // Login
    dispatch(setUser({ name: 'John', email: 'john@example.com' }));
    
    // Logout
    dispatch(logout());
}
```

### 2. Player Slice (`playerSlice.js`)
Manages music playback, queue, and player controls.

**State:**
- `currentTrack`: Currently playing track object
- `queue`: Array of tracks in play queue
- `isPlaying`: Boolean for play/pause state
- `volume`: Volume level (0-1)
- `currentTime`: Current playback position
- `duration`: Track duration
- `repeat`: Repeat mode ('off', 'one', 'all')
- `shuffle`: Boolean for shuffle mode

**Actions:**
- `setCurrentTrack(track)`: Set and play a track
- `togglePlayPause()`: Toggle play/pause
- `setPlaying(boolean)`: Explicitly set play state
- `setQueue(tracks[])`: Set the entire queue
- `addToQueue(track)`: Add track to end of queue
- `removeFromQueue(index)`: Remove track at index
- `setVolume(level)`: Set volume (0-1)
- `setCurrentTime(seconds)`: Update playback position
- `setDuration(seconds)`: Set track duration
- `nextTrack()`: Skip to next track (respects repeat mode)
- `previousTrack()`: Go to previous track
- `toggleRepeat()`: Cycle through repeat modes
- `toggleShuffle()`: Toggle shuffle on/off

**Usage:**
```javascript
import { usePlayer } from '../store/hooks';
import { setCurrentTrack, togglePlayPause, addToQueue } from '../store/slices/playerSlice';

function MusicPlayer() {
    const dispatch = useAppDispatch();
    const { currentTrack, isPlaying, queue } = usePlayer();
    
    // Play a track
    dispatch(setCurrentTrack({
        id: '123',
        title: 'Song Name',
        artist: 'Artist Name',
        url: 'https://...'
    }));
    
    // Toggle play/pause
    dispatch(togglePlayPause());
    
    // Add to queue
    dispatch(addToQueue(track));
}
```

### 3. Preferences Slice (`preferencesSlice.js`)
Manages user preferences and settings.

**State:**
- `selectedLanguages`: Array of selected language codes
- `theme`: Current theme ('light' or 'dark')

**Actions:**
- `setSelectedLanguages(languages[])`: Update language preferences
- `toggleTheme()`: Switch between light/dark
- `setTheme(theme)`: Set specific theme
- `loadPreferences()`: Load saved preferences from localStorage

**Usage:**
```javascript
import { usePreferences } from '../store/hooks';
import { setSelectedLanguages, toggleTheme } from '../store/slices/preferencesSlice';

function Settings() {
    const dispatch = useAppDispatch();
    const { selectedLanguages, theme } = usePreferences();
    
    // Update languages
    dispatch(setSelectedLanguages(['tamil', 'english', 'hindi']));
    
    // Toggle theme
    dispatch(toggleTheme());
}
```

## Custom Hooks

### `useAppDispatch()`
Type-safe dispatch hook.

### `useAppSelector(selector)`
Type-safe selector hook.

### `useAuth()`
Shorthand for accessing auth state.
```javascript
const { user, isAuthenticated, loading } = useAuth();
```

### `usePlayer()`
Shorthand for accessing player state.
```javascript
const { currentTrack, isPlaying, queue, volume } = usePlayer();
```

### `usePreferences()`
Shorthand for accessing preferences state.
```javascript
const { selectedLanguages, theme } = usePreferences();
```

## Best Practices

### 1. Always Use Custom Hooks
```javascript
// ✅ Good
import { useAuth, useAppDispatch } from '../store/hooks';

// ❌ Avoid
import { useSelector, useDispatch } from 'react-redux';
```

### 2. Dispatch Actions, Don't Mutate State
```javascript
// ✅ Good
dispatch(setVolume(0.5));

// ❌ Never do this
state.player.volume = 0.5;
```

### 3. Keep Business Logic in Slices
Complex state updates should be in slice reducers, not components.

### 4. Use Selectors for Derived State
```javascript
// If you need computed values, create selectors
const selectIsQueueEmpty = (state) => state.player.queue.length === 0;
```

### 5. Persist Important State
Critical state (auth, preferences) is automatically persisted to localStorage.

## DevTools

Redux DevTools are enabled in development mode. Install the browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

Features:
- Time-travel debugging
- Action history
- State diff viewer
- Action replay

## Migration Guide

### From Props to Redux

**Before:**
```javascript
function Parent() {
    const [languages, setLanguages] = useState(['tamil']);
    return <Child languages={languages} setLanguages={setLanguages} />;
}

function Child({ languages, setLanguages }) {
    return <button onClick={() => setLanguages(['hindi'])}>Change</button>;
}
```

**After:**
```javascript
function Parent() {
    return <Child />;
}

function Child() {
    const dispatch = useAppDispatch();
    const { selectedLanguages } = usePreferences();
    
    return (
        <button onClick={() => dispatch(setSelectedLanguages(['hindi']))}>
            Change
        </button>
    );
}
```

## Performance Considerations

1. **Selector Optimization**: Use specific selectors to prevent unnecessary re-renders
   ```javascript
   // ✅ Only re-renders when volume changes
   const volume = useAppSelector(state => state.player.volume);
   
   // ❌ Re-renders on any player state change
   const player = usePlayer();
   const volume = player.volume;
   ```

2. **Action Batching**: Multiple dispatches in the same event are automatically batched

3. **Immutable Updates**: Redux Toolkit uses Immer internally, allowing "mutative" syntax that's actually immutable

## Testing

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Create test store
const testStore = configureStore({
    reducer: { auth: authReducer }
});

// Test actions
testStore.dispatch(setUser({ name: 'Test User' }));
expect(testStore.getState().auth.user.name).toBe('Test User');
```

## Future Enhancements

Consider adding:
- **RTK Query**: For API caching and data fetching
- **Redux Persist**: For advanced persistence strategies
- **Middleware**: For analytics, logging, or side effects
- **Selectors Library**: Reselect for memoized selectors
