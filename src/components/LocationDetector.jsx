import React, { useEffect, useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLanguage } from '../LanguageContext';
import './LocationDetector.css';

/**
 * Drop this component at the top of any page that has location-based content.
 * `onCity(city)` fires whenever a city is resolved (or on mount if already cached).
 */
export default function LocationDetector({ onCity }) {
  const { city, status, detect, clear } = useGeolocation();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  /* Notify parent whenever the city value changes */
  useEffect(() => {
    if (city && onCity) onCity(city);
  }, [city, onCity]);

  const handleDismiss = () => {
    clear();
    setDismissed(true);
  };

  /* Don't show anything if user dismissed or geolocation not supported */
  if (dismissed || status === 'unsupported') return null;

  /* Permission was denied — silent */
  if (status === 'denied') return null;

  /* Already have a city */
  if (status === 'success' && city) {
    return (
      <div className="geo-banner geo-banner--active" role="status">
        <span className="geo-banner-icon">📍</span>
        <span className="geo-banner-text">
          {t('geo.showingNear')} <strong>{city}</strong>
        </span>
        <button className="geo-banner-change" onClick={detect}>
          {t('geo.change')}
        </button>
        <button className="geo-banner-dismiss" onClick={handleDismiss} aria-label="Dismiss">✕</button>
      </div>
    );
  }

  /* Loading */
  if (status === 'loading') {
    return (
      <div className="geo-banner geo-banner--loading" role="status">
        <span className="geo-banner-dot" />
        <span className="geo-banner-text">{t('geo.detecting')}</span>
      </div>
    );
  }

  /* Idle — prompt the user */
  return (
    <div className="geo-banner geo-banner--prompt" role="complementary">
      <span className="geo-banner-icon">📍</span>
      <span className="geo-banner-text">{t('geo.prompt')}</span>
      <button className="geo-banner-cta" onClick={detect}>
        {t('geo.useLocation')}
      </button>
      <button className="geo-banner-dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss">✕</button>
    </div>
  );
}
