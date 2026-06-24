import { useState, useCallback, useEffect } from 'react';
import { nearestCity, GEO_LS_KEY } from '../lib/geolocation';

/* STATUS: 'idle' | 'loading' | 'success' | 'denied' | 'error' | 'unsupported' */
export function useGeolocation() {
  const [city, setCity] = useState(() => localStorage.getItem(GEO_LS_KEY) || null);
  const [status, setStatus] = useState(() =>
    localStorage.getItem(GEO_LS_KEY) ? 'success' : 'idle'
  );

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setCity(found);
        localStorage.setItem(GEO_LS_KEY, found);
        setStatus('success');
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
  }, []);

  const clear = useCallback(() => {
    setCity(null);
    setStatus('idle');
    localStorage.removeItem(GEO_LS_KEY);
  }, []);

  /* Auto-detect on first load if not yet stored */
  useEffect(() => {
    if (status === 'idle' && navigator.geolocation) {
      /* Only silently attempt if the permission was previously granted */
      navigator.permissions?.query({ name: 'geolocation' }).then((perm) => {
        if (perm.state === 'granted') detect();
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { city, status, detect, clear };
}
