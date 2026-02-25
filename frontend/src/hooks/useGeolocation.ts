import { useState } from 'react';
import toast from 'react-hot-toast';

export function useGeolocation() {
    const [isLoading, setIsLoading] = useState(false);

    const getAddress = async (): Promise<string | null> => {
        setIsLoading(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                });
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocoding using OpenStreetMap Nominatim (Free, no key required for low volume)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );

            const data = await response.json();

            if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
                const state = data.address.state || data.address.region;
                const country = data.address.country;

                if (city && state) return `${city}, ${state}`;
                if (city) return city;
                return country || "Unknown Location";
            }

            return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        } catch (error: any) {
            console.error('Geolocation error:', error);
            if (error.code === 1) toast.error('Location permission denied');
            else toast.error('Failed to detect location');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getAddress, isLoading };
}
