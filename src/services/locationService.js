import { Linking, Platform } from 'react-native';

/**
 * Location helpers for the NyumbaSync mobile app.
 *
 * Search uses OpenStreetMap Nominatim (free, no API key) so landlords can
 * find an address and capture coordinates. The map preview is a static
 * OpenStreetMap image. Tapping "Open in Google Maps" launches the native
 * Google Maps app (or the web fallback) for directions.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Search for places by free-form query (e.g. "Riverside Drive, Nairobi").
 * Returns an array of result objects with display_name, lat, lon.
 */
export const searchPlaces = async (query, limit = 5) => {
  if (!query || query.trim().length < 3) return [];

  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&countrycodes=ke`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'NyumbaSyncMobile/1.0',
      },
    });
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
};

/**
 * Build a static OpenStreetMap preview URL for a coordinate.
 */
export const buildStaticMapUrl = (latitude, longitude, width = 600, height = 300, zoom = 15) => {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&maptype=map&markers=${latitude},${longitude},ol-marker-gold`;
};

/**
 * Open the given coordinates in Google Maps for directions.
 */
export const openInGoogleMaps = async (latitude, longitude, label = 'Property') => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const query = encodeURIComponent(`${lat},${lon}(${label})`);

  const urls = [
    `comgooglemaps://?q=${query}`,
    `geo:${lat},${lon}?q=${query}`,
    `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
  ];

  for (const url of urls) {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      return Linking.openURL(url);
    }
  }

  // Fallback to web Google Maps
  return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
};

/**
 * Open an address query in Google Maps (used when coordinates are not yet set).
 */
export const openAddressInGoogleMaps = async (address) => {
  const query = encodeURIComponent(address);
  const url = Platform.select({
    ios: `comgooglemaps://?q=${query}`,
    android: `geo:0,0?q=${query}`,
    default: `https://www.google.com/maps/search/?api=1&query=${query}`,
  });

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    return Linking.openURL(url);
  }
  return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
};
