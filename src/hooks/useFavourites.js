import { useState, useCallback } from 'react';

const LS_KEY = 'lizi_favourites';

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

export function useFavourites() {
  const [favourites, setFavourites] = useState(load);

  const isFav = useCallback((id) => favourites.some(f => f.id === id), [favourites]);

  const toggle = useCallback((item) => {
    setFavourites(prev => {
      const exists = prev.some(f => f.id === item.id);
      const next = exists ? prev.filter(f => f.id !== item.id) : [item, ...prev];
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id) => {
    setFavourites(prev => {
      const next = prev.filter(f => f.id !== id);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favourites, isFav, toggle, remove };
}
