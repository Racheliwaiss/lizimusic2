import React from 'react';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS, TYPOGRAPHY } from '../constants/designTokens';

/**
 * Card Component
 * Variants: profile, genre, content
 */
const Card = ({
  variant = 'content',
  children,
  className = '',
  onClick,
  isDarkMode = false,
  ...props
}) => {
  const baseStyles = {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontFamily: TYPOGRAPHY.fontFamily,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
  };

  const variantStyles = {
    profile: {
      backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.white,
      border: `2px solid ${COLORS.electricPurple}`,
      textAlign: 'center',
      boxShadow: isDarkMode ? 'none' : SHADOWS.light,
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: SHADOWS.medium,
      },
    },
    genre: {
      backgroundColor: COLORS.electricPurple,
      color: COLORS.white,
      borderRadius: BORDER_RADIUS.full,
      padding: `${SPACING.xs} ${SPACING.md}`,
      display: 'inline-block',
      fontSize: '14px',
      fontWeight: 600,
      border: 'none',
    },
    content: {
      backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.white,
      border: `1px solid ${isDarkMode ? COLORS.borderGray : COLORS.borderGray}`,
      boxShadow: isDarkMode ? 'none' : SHADOWS.light,
      ':hover': {
        boxShadow: isDarkMode ? 'none' : SHADOWS.medium,
      },
    },
  };

  const finalStyle = {
    ...baseStyles,
    ...variantStyles[variant],
  };

  return (
    <div
      style={finalStyle}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Profile Card Component
 * Displays artist profile information
 */
export const ProfileCard = ({
  avatar,
  name,
  genre,
  followers,
  onClick,
  isDarkMode = false,
}) => {
  return (
    <Card variant="profile" onClick={onClick} isDarkMode={isDarkMode}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
        {avatar && (
          <img
            src={avatar}
            alt={name}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              margin: '0 auto',
              border: `3px solid ${COLORS.electricPurple}`,
            }}
          />
        )}
        <h3 style={{ ...TYPOGRAPHY.heading2, margin: 0, color: isDarkMode ? COLORS.white : COLORS.black }}>
          {name}
        </h3>
        <p style={{ ...TYPOGRAPHY.body2, margin: 0, color: COLORS.electricPurple }}>
          {genre}
        </p>
        <p style={{ ...TYPOGRAPHY.caption, margin: 0, color: isDarkMode ? COLORS.lightGray : COLORS.darkGray }}>
          {followers} followers
        </p>
      </div>
    </Card>
  );
};

/**
 * Genre Tag Component
 * Displays genre as a pill-shaped tag
 */
export const GenreTag = ({ name, color = COLORS.electricPurple, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-block',
        backgroundColor: color,
        color: COLORS.white,
        borderRadius: BORDER_RADIUS.full,
        padding: `${SPACING.xs} ${SPACING.md}`,
        fontSize: '14px',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {name}
    </div>
  );
};

/**
 * Content Card Component
 * Generic card for displaying content (tracks, playlists, etc.)
 */
export const ContentCard = ({
  image,
  title,
  subtitle,
  description,
  metadata,
  onClick,
  isDarkMode = false,
}) => {
  return (
    <Card variant="content" onClick={onClick} isDarkMode={isDarkMode}>
      {image && (
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: BORDER_RADIUS.md,
            marginBottom: SPACING.md,
          }}
        />
      )}
      <h3 style={{ ...TYPOGRAPHY.heading2, margin: 0, marginBottom: SPACING.xs, color: isDarkMode ? COLORS.white : COLORS.black }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ ...TYPOGRAPHY.body2, margin: 0, marginBottom: SPACING.sm, color: COLORS.electricPurple }}>
          {subtitle}
        </p>
      )}
      {description && (
        <p style={{ ...TYPOGRAPHY.body2, margin: 0, marginBottom: SPACING.md, color: isDarkMode ? COLORS.lightGray : COLORS.darkGray }}>
          {description}
        </p>
      )}
      {metadata && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: SPACING.md }}>
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0, color: isDarkMode ? COLORS.lightGray : COLORS.darkGray }}>
                {key}
              </p>
              <p style={{ ...TYPOGRAPHY.body1, margin: 0, fontWeight: 600, color: COLORS.electricPurple }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default Card;
