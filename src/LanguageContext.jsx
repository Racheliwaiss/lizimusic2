import React, { createContext, useContext, useState } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // Update HTML direction
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'he' ? 'rtl' : 'ltr';
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (let k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
