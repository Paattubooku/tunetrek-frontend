import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedLanguages: ['tamil', 'english'],
    theme: 'dark',
};

const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
        setSelectedLanguages: (state, action) => {
            state.selectedLanguages = action.payload;
            localStorage.setItem('selectedLanguages', JSON.stringify(action.payload));
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', state.theme);
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        loadPreferences: (state) => {
            const savedLanguages = localStorage.getItem('selectedLanguages');
            const savedTheme = localStorage.getItem('theme');

            if (savedLanguages) {
                state.selectedLanguages = JSON.parse(savedLanguages);
            }
            if (savedTheme) {
                state.theme = savedTheme;
            }
        },
    },
});

export const { setSelectedLanguages, toggleTheme, setTheme, loadPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
