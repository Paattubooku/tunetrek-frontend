/**
 * Utility functions for image handling
 */

/**
 * Transforms API image URLs to higher quality versions
 * Replaces common low-resolution patterns with high-resolution equivalents
 * 
 * @param {string} imageUrl - The original image URL from API
 * @param {string} size - Target size (default: '500x500')
 * @returns {string} Transformed high-quality image URL
 */
export const getHighQualityImage = (imageUrl, size = '500x500') => {
    if (!imageUrl) return 'https://via.placeholder.com/500';

    return imageUrl
        .replace(/150x150/g, size)
        .replace(/50x50/g, size)
        .replace(/250x250/g, size);
};

/**
 * Get image URL with fallback
 * @param {object} item - Item object from API
 * @param {string} size - Target size
 * @returns {string} Image URL
 */
export const getItemImage = (item, size = '500x500') => {
    if (!item) return 'https://via.placeholder.com/500';

    const imageUrl = item.image || item.artwork || item.thumbnail || item.cover;
    return getHighQualityImage(imageUrl, size);
};

/**
 * Extract ID from JioSaavn perma_url
 * Example: "https://www.jiosaavn.com/song/andha-kanna-paathaakaa/EzgKSSNHQXI" -> "EzgKSSNHQXI"
 * @param {string} permaUrl - The perma_url from API
 * @returns {string} Extracted ID
 */
export const extractIdFromUrl = (permaUrl) => {
    if (!permaUrl) return null;
    const parts = permaUrl.split('/');
    return parts[parts.length - 1].split('?')[0] || null;
};

/**
 * Preload an image
 * @param {string} src - Image source URL
 * @returns {Promise} Resolves when image is loaded
 */
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};
