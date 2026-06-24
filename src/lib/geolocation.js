/* City coordinates for all supported locations */
export const CITY_COORDS = {
  'Tel Aviv':       { lat: 32.0853, lng: 34.7818 },
  'Jerusalem':      { lat: 31.7683, lng: 35.2137 },
  'Haifa':          { lat: 32.7940, lng: 34.9896 },
  'Beer Sheva':     { lat: 31.2520, lng: 34.7915 },
  'Rishon LeZion':  { lat: 31.9730, lng: 34.7925 },
  'Petah Tikva':    { lat: 32.0840, lng: 34.8878 },
  'Netanya':        { lat: 32.3215, lng: 34.8532 },
  'Ashdod':         { lat: 31.8044, lng: 34.6553 },
  'Rehovot':        { lat: 31.8928, lng: 34.8114 },
  'Ramat Gan':      { lat: 32.0824, lng: 34.8137 },
  'Herzliya':       { lat: 32.1663, lng: 34.8440 },
  'Raanana':        { lat: 32.1844, lng: 34.8706 },
  'Holon':          { lat: 32.0107, lng: 34.7794 },
  'Bat Yam':        { lat: 32.0236, lng: 34.7528 },
  'Bnei Brak':      { lat: 32.0844, lng: 34.8338 },
  'Eilat':          { lat: 29.5577, lng: 34.9519 },
  'Tiberias':       { lat: 32.7940, lng: 35.5300 },
  'Nazareth':       { lat: 32.7021, lng: 35.2972 },
  'Safed':          { lat: 32.9646, lng: 35.4965 },
  "Modi'in":        { lat: 31.8986, lng: 35.0104 },
  'Jaffa':          { lat: 32.0524, lng: 34.7506 },
  'Ramat Hasharon': { lat: 32.1487, lng: 34.8397 },
  'Givatayim':      { lat: 32.0697, lng: 34.8126 },
  'Kfar Saba':      { lat: 32.1750, lng: 34.9072 },
};

/* Geographic regions for partial-match scoring */
export const REGION = {
  'Tel Aviv': 'center', 'Jaffa': 'center', 'Ramat Gan': 'center',
  'Bnei Brak': 'center', 'Herzliya': 'center', 'Ramat Hasharon': 'center',
  'Rishon LeZion': 'center', 'Netanya': 'center', "Modi'in": 'center',
  'Holon': 'center', 'Bat Yam': 'center', 'Rehovot': 'center',
  'Givatayim': 'center', 'Raanana': 'center', 'Petah Tikva': 'center',
  'Kfar Saba': 'center',
  'Jerusalem': 'jerusalem',
  'Ashdod': 'south', 'Beer Sheva': 'south', 'Eilat': 'south',
  'Haifa': 'north', 'Safed': 'north', 'Nazareth': 'north', 'Tiberias': 'north',
};

/* Haversine distance in km */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* Return the nearest city name from CITY_COORDS for given GPS coords */
export function nearestCity(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const d = haversineKm(lat, lng, coords.lat, coords.lng);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best;
}

/* Location proximity score 0-1 (same as OpenStage logic, shared here) */
export function calcLocationScore(userLoc, targetLoc) {
  if (!userLoc || !targetLoc) return 0;
  const uL = userLoc.toLowerCase();
  const aL = targetLoc.toLowerCase();
  if (uL === 'remote / online' || aL === 'remote / online' ||
      uL === 'online / remote' || aL === 'online / remote') return 0.7;
  if (uL === aL) return 1;
  const ur = REGION[userLoc];
  const ar = REGION[targetLoc];
  if (ur && ar && ur === ar) return 0.5;
  return 0;
}

/* Proximity label: 'exact' | 'nearby' | 'remote' | null */
export function proximityLabel(userCity, targetLoc) {
  if (!userCity || !targetLoc) return null;
  const score = calcLocationScore(userCity, targetLoc);
  if (score === 1) return 'exact';
  if (score === 0.7) return 'remote';
  if (score >= 0.5) return 'nearby';
  return null;
}

export const GEO_LS_KEY = 'lizi_detected_location';
