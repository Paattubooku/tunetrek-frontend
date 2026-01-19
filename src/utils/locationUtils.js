// Get user's geolocation
export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                // Fallback to default location
                resolve({
                    latitude: 11.0142,
                    longitude: 76.9941
                });
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 3600000 // Cache for 1 hour
            }
        );
    });
};

// Get location details from coordinates using reverse geocoding
export const getLocationDetails = async (latitude, longitude) => {
    try {
        // Using a free geocoding API (you can replace with your preferred service)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'TuneTrek Music App'
                }
            }
        );

        const data = await response.json();

        return {
            city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
            state: data.address?.state || 'Unknown',
            country: data.address?.country || 'IN',
            countryCode: data.address?.country_code?.toUpperCase() || 'IN',
            postalCode: data.address?.postcode || '000000'
        };
    } catch (error) {
        console.error('Error fetching location details:', error);
        // Fallback to default
        return {
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            country: 'IN',
            countryCode: 'IN',
            postalCode: '641018'
        };
    }
};

// Get or retrieve cached location
export const getCachedLocation = async () => {
    const CACHE_KEY = 'user_location';
    const CACHE_DURATION = 3600000; // 1 hour

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        }

        // Get fresh location
        const coords = await getUserLocation();
        const details = await getLocationDetails(coords.latitude, coords.longitude);

        const locationData = {
            ...coords,
            ...details
        };

        // Cache it
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: locationData,
            timestamp: Date.now()
        }));

        return locationData;
    } catch (error) {
        console.error('Error getting location:', error);
        // Return default location
        return {
            latitude: 11.0142,
            longitude: 76.9941,
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            country: 'IN',
            countryCode: 'IN',
            postalCode: '641018'
        };
    }
};

// Format location for API
export const formatLocationForAPI = (location) => {
    // Format: IP%2CCountryCode%2CState%2CCity%2CPostalCode
    // Note: We use 'USER_IP' as placeholder - backend will replace with actual user IP from request headers
    const geo = `USER_IP%2C${location.longitude}%2C${location.countryCode}%2C${encodeURIComponent(location.state)}%2C${encodeURIComponent(location.city)}%2C${location.postalCode}`;
    const latlong = `${location.latitude}%2C${location.longitude}`;

    return {
        geo,
        latlong
    };
};
