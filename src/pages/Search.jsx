import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Search() {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const results = [
    { id: 1, title: 'Artist Name', type: 'Artist', followers: 2400 },
    { id: 2, title: 'Song Title', type: 'Track', plays: 5200 },
    { id: 3, title: 'Producer Name', type: 'Artist', followers: 1800 },
  ];

  return (
    <div className="page search-page">
      <h1>{t('search.title')}</h1>
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button className="search-button">🔍</button>
      </div>

      {query && (
        <div className="search-results">
          <h2>{t('search.resultsFor')} "{query}"</h2>
          <div className="results-list">
            {results.map((result) => (
              <div key={result.id} className="result-item">
                <div className="result-avatar">👤</div>
                <div className="result-info">
                  <h3>{result.title}</h3>
                  <p className="result-type">{result.type}</p>
                  <span className="result-stat">
                    {result.followers ? `${result.followers} ${t('search.followers')}` : `${result.plays} ${t('search.plays')}`}
                  </span>
                </div>
                <button className="follow-btn">{t('search.follow')}</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
