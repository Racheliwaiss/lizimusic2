import React, { useState } from 'react';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../constants/designTokens';

/**
 * Search Bar Component
 * Features: search input, filter options, suggestions
 */
const SearchBar = ({
  placeholder = 'Search tracks, artists, playlists...',
  onSearch,
  onFilter,
  isDarkMode = false,
  showFilters = true,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filterOptions = ['all', 'tracks', 'artists', 'playlists', 'genres'];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
    setShowSuggestions(value.length > 0);
  };

  const handleFilter = (filter) => {
    setSelectedFilter(filter);
    onFilter?.(filter);
  };

  const containerStyle = {
    width: '100%',
    maxWidth: '600px',
    margin: `0 auto ${SPACING.md}`,
    fontFamily: TYPOGRAPHY.fontFamily,
  };

  const searchInputContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.softLavender,
    border: `2px solid ${COLORS.electricPurple}`,
    borderRadius: BORDER_RADIUS.full,
    padding: `${SPACING.xs} ${SPACING.md}`,
    transition: TRANSITIONS.standard,
  };

  const searchInputStyle = {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '16px',
    fontFamily: TYPOGRAPHY.fontFamily,
    color: isDarkMode ? COLORS.white : COLORS.black,
    outline: 'none',
    '::placeholder': {
      color: isDarkMode ? COLORS.lightGray : COLORS.darkGray,
    },
  };

  const filterContainerStyle = {
    display: 'flex',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    overflowX: 'auto',
    paddingBottom: SPACING.sm,
  };

  const filterButtonStyle = (isActive) => ({
    padding: `${SPACING.xs} ${SPACING.md}`,
    border: `2px solid ${isActive ? COLORS.electricPurple : COLORS.borderGray}`,
    backgroundColor: isActive ? COLORS.electricPurple : 'transparent',
    color: isActive ? COLORS.white : isDarkMode ? COLORS.white : COLORS.black,
    borderRadius: BORDER_RADIUS.full,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: TRANSITIONS.fast,
    fontFamily: TYPOGRAPHY.fontFamily,
  });

  const suggestionsStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.white,
    border: `1px solid ${COLORS.borderGray}`,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 10,
    display: showSuggestions ? 'block' : 'none',
  };

  const suggestionItemStyle = {
    padding: SPACING.sm,
    borderBottom: `1px solid ${COLORS.borderGray}`,
    cursor: 'pointer',
    transition: TRANSITIONS.fast,
    color: isDarkMode ? COLORS.white : COLORS.black,
  };

  return (
    <div style={containerStyle}>
      <div style={{ position: 'relative' }}>
        <div style={searchInputContainerStyle}>
          <span style={{ fontSize: '18px' }}>🔍</span>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearch}
            onFocus={() => searchValue && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            style={searchInputStyle}
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('');
                setShowSuggestions(false);
                onSearch?.('');
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: isDarkMode ? COLORS.lightGray : COLORS.darkGray,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {showSuggestions && searchValue && (
          <div style={suggestionsStyle}>
            <div
              style={suggestionItemStyle}
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.softLavender)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              🔍 Search for "{searchValue}"
            </div>
            {['Trending: Synthwave', 'Artist: Lo-Fi Beats', 'Playlist: Chill Mix'].map((suggestion, index) => (
              <div
                key={index}
                style={suggestionItemStyle}
                onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.softLavender)}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <div style={filterContainerStyle}>
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilter(filter)}
              style={filterButtonStyle(selectedFilter === filter)}
              onMouseEnter={(e) => {
                if (selectedFilter !== filter) {
                  e.target.style.borderColor = COLORS.electricPurple;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFilter !== filter) {
                  e.target.style.borderColor = COLORS.borderGray;
                }
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
