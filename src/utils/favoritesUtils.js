import API_URL from '../config/api.js';

const API_BASE = API_URL;

export const fetchFavorites = async (userId) => {
    if (!userId) return { songs: [], albums: [], playlists: [] };
    try {
        const res = await fetch(`${API_BASE}/favorites/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch favorites");
        return await res.json();
    } catch (e) {
        console.error(e);
        return { songs: [], albums: [], playlists: [] };
    }
};

export const addToFavorites = async (userId, item, type) => {
    if (!userId || !item) return false;
    try {
        const res = await fetch(`${API_BASE}/favorites/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                item_id: item.id,
                type,
                item_data: item
            })
        });
        return res.ok;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const removeFromFavorites = async (userId, itemId) => {
    if (!userId || !itemId) return false;
    try {
        const res = await fetch(`${API_BASE}/favorites/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                item_id: itemId
            })
        });
        return res.ok;
    } catch (e) {
        console.error(e);
        return false;
    }
};
