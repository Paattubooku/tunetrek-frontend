import API_URL from '../config/api.js';

const API_BASE = API_URL;

/**
 * Adds a track to the recently played history in Supabase.
 * @param {Object} item - The track object.
 * @param {Object} user - The user object containing the ID.
 */
export const addToRecentlyPlayed = async (item, user) => {
    if (!item || !item.id || !user || !user.id) return;
    try {
        await fetch(`${API_BASE}/recently-played/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                item_id: item.id,
                item_data: item
            })
        });
    } catch (e) {
        console.error("Failed to add to recently played", e);
    }
};

/**
 * Fetches the recently played history for a user from Supabase.
 * @param {string} userId - The user ID.
 * @returns {Promise<Array>} - List of track objects.
 */
export const getRecentlyPlayed = async (userId) => {
    if (!userId) return [];
    try {
        const res = await fetch(`${API_BASE}/recently-played/${userId}`);
        if (res.ok) {
            return await res.json();
        }
        return [];
    } catch (e) {
        console.error("Failed to fetch recently played", e);
        return [];
    }
};

/**
 * Clears the recently played history.
 * @param {string} userId 
 */
export const clearRecentlyPlayed = async (userId) => {
    if (!userId) return;
    try {
        await fetch(`${API_BASE}/recently-played/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
    } catch (e) {
        console.error(e);
    }
};
