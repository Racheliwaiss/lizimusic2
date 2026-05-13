import React, { useState } from 'react';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, Z_INDEX } from '../constants/designTokens';

/**
 * Navigation Component
 * Main navigation bar with logo, links, and user menu
 */
const Navigation = ({
  logo = 'LIZI',
  items = ['Discover', 'Profile', 'Playlists'],
  onItemClick,
  activeItem,
  userProfile,
  onUserMenuClick,
  isDarkMode = false,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${SPACING.sm} ${SPACING.lg}`,
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.white,
    borderBottom: `1px solid ${COLORS.borderGray}`,
    fontFamily: TYPOGRAPHY.fontFamily,
    position: 'sticky',
    top: 0,
    zIndex: Z_INDEX.sticky,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const logoStyle = {
    fontSize: '28px',
    fontWeight: 800,
    color: COLORS.electricPurple,
    margin: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const navItemsStyle = {
    display: 'flex',
    gap: SPACING.xl,
    alignItems: 'center',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  };

  const navItemStyle = (isActive) => ({
    color: isActive ? COLORS.electricPurple : isDarkMode ? COLORS.lightGray : COLORS.darkGray,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: isActive ? 700 : 500,
    padding: `${SPACING.xs} ${SPACING.sm}`,
    borderBottom: isActive ? `3px solid ${COLORS.electricPurple}` : 'none',
    transition: 'all 0.2s ease',
    position: 'relative',
  });

  const userMenuContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
  };

  const userAvatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: COLORS.electricPurple,
    cursor: 'pointer',
    border: `2px solid ${COLORS.electricPurple}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.white,
    fontWeight: 700,
    transition: 'all 0.2s ease',
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.white,
    border: `1px solid ${COLORS.borderGray}`,
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    minWidth: '200px',
    marginTop: SPACING.sm,
    zIndex: Z_INDEX.dropdown,
    display: isUserMenuOpen ? 'block' : 'none',
  };

  const dropdownItemStyle = {
    padding: SPACING.md,
    borderBottom: `1px solid ${COLORS.borderGray}`,
    cursor: 'pointer',
    color: isDarkMode ? COLORS.white : COLORS.black,
    transition: 'all 0.2s ease',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
  };

  const dropdownItemLastStyle = {
    ...dropdownItemStyle,
    borderBottom: 'none',
  };

  const notificationIconStyle = {
    position: 'relative',
    cursor: 'pointer',
    fontSize: '20px',
    transition: 'all 0.2s ease',
  };

  const notificationBadgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: COLORS.warmOrange,
    color: COLORS.white,
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
  };

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <div style={logoStyle} onClick={() => onItemClick?.('home')}>
        ♪ {logo}
      </div>

      {/* Navigation Items */}
      <ul style={navItemsStyle}>
        {items.map((item) => (
          <li
            key={item}
            style={navItemStyle(activeItem === item)}
            onClick={() => onItemClick?.(item)}
            onMouseEnter={(e) => {
              if (activeItem !== item) {
                e.target.style.color = COLORS.electricPurple;
              }
            }}
            onMouseLeave={(e) => {
              if (activeItem !== item) {
                e.target.style.color = isDarkMode ? COLORS.lightGray : COLORS.darkGray;
              }
            }}
          >
            {item}
          </li>
        ))}
      </ul>

      {/* User Menu */}
      <div style={userMenuContainerStyle}>
        {/* Notification Icon */}
        <div
          style={notificationIconStyle}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          🔔
          <div style={notificationBadgeStyle}>3</div>
        </div>

        {/* User Avatar & Menu */}
        <div style={userMenuContainerStyle}>
          <div
            style={userAvatarStyle}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#7B1BA8')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.electricPurple)}
          >
            {userProfile?.initial || 'U'}
          </div>

          {/* Dropdown Menu */}
          <div style={dropdownMenuStyle}>
            <div style={dropdownItemStyle}>
              👤 {userProfile?.name || 'My Profile'}
            </div>
            <div
              style={dropdownItemStyle}
              onClick={() => {
                onUserMenuClick?.('settings');
                setIsUserMenuOpen(false);
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.softLavender)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              ⚙️ Settings
            </div>
            <div
              style={dropdownItemStyle}
              onClick={() => {
                onUserMenuClick?.('notifications');
                setIsUserMenuOpen(false);
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.softLavender)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              🔔 Notifications
            </div>
            <div
              style={dropdownItemStyle}
              onClick={() => {
                onUserMenuClick?.('messages');
                setIsUserMenuOpen(false);
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.softLavender)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              💬 Messages
            </div>
            <div
              style={dropdownItemStyle}
              onClick={() => {
                onUserMenuClick?.('theme');
                setIsUserMenuOpen(false);
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.softLavender)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              🌙 Dark Mode
            </div>
            <div
              style={dropdownItemLastStyle}
              onClick={() => {
                onUserMenuClick?.('logout');
                setIsUserMenuOpen(false);
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = COLORS.softLavender)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              🚪 Logout
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {isUserMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: Z_INDEX.dropdown - 1,
          }}
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
