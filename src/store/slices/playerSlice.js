import { createSlice } from '@reduxjs/toolkit';

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const initialState = {
    currentTrack: null,
    queue: [],
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    repeat: 'off', // 'off', 'one', 'all'
    shuffle: false,
    showQueue: false,
    stationId: null, // For radio infinite scroll
    originalQueue: [], // Store original order for shuffle
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setCurrentTrack: (state, action) => {
            state.currentTrack = action.payload;
            state.isPlaying = true;
        },
        togglePlayPause: (state) => {
            state.isPlaying = !state.isPlaying;
        },
        setPlaying: (state, action) => {
            state.isPlaying = action.payload;
        },
        setQueue: (state, action) => {
            state.queue = action.payload;
            state.originalQueue = [];
            state.shuffle = false;
        },
        addToQueue: (state, action) => {
            state.queue.push(action.payload);
        },
        removeFromQueue: (state, action) => {
            state.queue = state.queue.filter((_, index) => index !== action.payload);
        },
        addRangeToQueue: (state, action) => {
            if (Array.isArray(action.payload)) {
                state.queue.push(...action.payload);
            }
        },
        reorderQueue: (state, action) => {
            const { fromIndex, toIndex } = action.payload;
            if (fromIndex < 0 || fromIndex >= state.queue.length || toIndex < 0 || toIndex >= state.queue.length) return;
            const [movedItem] = state.queue.splice(fromIndex, 1);
            state.queue.splice(toIndex, 0, movedItem);
        },
        playNext: (state, action) => {
            const currentIndex = state.queue.findIndex(
                track => track.id?.toString() === state.currentTrack?.id?.toString()
            );
            if (currentIndex !== -1) {
                if (Array.isArray(action.payload)) {
                    state.queue.splice(currentIndex + 1, 0, ...action.payload);
                } else {
                    state.queue.splice(currentIndex + 1, 0, action.payload);
                }
            } else {
                if (Array.isArray(action.payload)) {
                    state.queue.push(...action.payload);
                } else {
                    state.queue.push(action.payload);
                }
            }
        },
        setVolume: (state, action) => {
            state.volume = action.payload;
        },
        setCurrentTime: (state, action) => {
            state.currentTime = action.payload;
        },
        setDuration: (state, action) => {
            state.duration = action.payload;
        },
        nextTrack: (state) => {
            const currentIndex = state.queue.findIndex(
                track => track.id?.toString() === state.currentTrack?.id?.toString()
            );
            if (currentIndex !== -1 && currentIndex < state.queue.length - 1) {
                state.currentTrack = state.queue[currentIndex + 1];
            } else if (state.repeat === 'all') {
                state.currentTrack = state.queue[0];
            }
        },
        previousTrack: (state) => {
            const currentIndex = state.queue.findIndex(
                track => track.id?.toString() === state.currentTrack?.id?.toString()
            );
            if (currentIndex > 0) {
                state.currentTrack = state.queue[currentIndex - 1];
            } else {
                // Option: Loop to last or just restart? Usually restart or do nothing.
                if (state.repeat === 'all') state.currentTrack = state.queue[state.queue.length - 1];
            }
        },
        toggleRepeat: (state) => {
            const modes = ['off', 'all', 'one'];
            const currentIndex = modes.indexOf(state.repeat);
            state.repeat = modes[(currentIndex + 1) % modes.length];
        },
        toggleShuffle: (state) => {
            if (state.stationId) return;
            state.shuffle = !state.shuffle;
            if (state.shuffle) {
                state.originalQueue = [...state.queue];
                if (state.currentTrack) {
                    const idx = state.queue.findIndex(t => t.id === state.currentTrack.id);
                    if (idx !== -1) {
                        const current = state.queue[idx];
                        const others = [...state.queue];
                        others.splice(idx, 1);
                        state.queue = [current, ...shuffleArray(others)];
                    } else {
                        state.queue = shuffleArray(state.queue);
                    }
                } else {
                    state.queue = shuffleArray(state.queue);
                }
            } else {
                if (state.originalQueue.length > 0) {
                    state.queue = state.originalQueue;
                    state.originalQueue = [];
                }
            }
        },
        toggleQueue: (state) => {
            state.showQueue = !state.showQueue;
        },
        setStationId: (state, action) => {
            state.stationId = action.payload;
            if (state.stationId) {
                state.shuffle = false;
                if (state.originalQueue.length > 0) {
                    state.queue = state.originalQueue;
                    state.originalQueue = [];
                }
            }
        },
    },
});

export const {
    setCurrentTrack,
    togglePlayPause,
    setPlaying,
    setQueue,
    addToQueue,
    removeFromQueue,
    addRangeToQueue,
    reorderQueue,
    playNext,
    setVolume,
    setCurrentTime,
    setDuration,
    nextTrack,
    previousTrack,
    toggleRepeat,
    toggleShuffle,
    toggleQueue,
    setStationId,
} = playerSlice.actions;

export default playerSlice.reducer;
