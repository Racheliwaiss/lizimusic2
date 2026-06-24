import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { nearestCity, GEO_LS_KEY } from './lib/geolocation';

const GeoContext = createContext({ city: null, status: 'idle', detect: () => {}, clear: () => {} });

export function GeoProvider({ children }) {
  const [city, setCity] = useState(() => localStorage.getItem(GEO_LS_KEY) || null);
  const [status, setStatus] = useState(() =>
    localStorage.getItem(GEO_LS_KEY) ? 'success' : 'idle'
  );

  const detect = useCallback(() => {
    if (!navigator.geolocation) { setStatus('unsupported'); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setCity(found);
        localStorage.setItem(GEO_LS_KEY, found);
        setStatus('success');
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { timeout: 8000, maximumAge: 300_000 }
    );
  }, []);

  const clear = useCallback(() => {
    setCity(null);
    setStatus('idle');
    localStorage.removeItem(GEO_LS_KEY);
  }, []);

  /* Silently auto-detect if browser already granted permission */
  useEffect(() => {
    if (status === 'idle') {
      navigator.permissions?.query({ name: 'geolocation' }).then((p) => {
        if (p.state === 'granted') detect();
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GeoContext.Provider value={{ city, status, detect, clear }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeoContext() {
  return useContext(GeoContext);
}
