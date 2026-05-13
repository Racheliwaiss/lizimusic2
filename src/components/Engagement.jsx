import React, { useState } from 'react';
import { COLORS, SPACING, TRANSITIONS } from '../constants/designTokens';

/**
 * Like/Engagement Button Component
 * Allows users to like/heart tracks or content
 */
const LikeButton = ({
  isLiked = false,
  count = 0,
  onClick,
  variant = 'icon', // icon, inline
  size = 'medium', // small, medium, large
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onClick?.();
  };

  const sizeMap = {
    small: { icon: '16px', button: '24px' },
    medium: { icon: '24px', button: '40px' },
    large: { icon: '32px', button: '48px' },
  };

  const buttonStyle = {
    width: sizeMap[size].button,
    height: sizeMap[size].button,
    borderRadius: '50%',
    border: `2px solid ${isLiked ? COLORS.vibrantBlue : COLORS.borderGray}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: sizeMap[size].icon,
    transition: TRANSITIONS.fast,
  };

  const inlineStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    cursor: 'pointer',
  };

  const countStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: isLiked ? COLORS.vibrantBlue : COLORS.borderGray,
    transition: TRANSITIONS.fast,
  };

  if (variant === 'inline') {
    return (
      <div style={inlineStyle} onClick={handleClick}>
        <span
          style={{
            fontSize: '20px',
            transition: TRANSITIONS.fast,
            transform: isAnimating ? 'scale(1.3)' : 'scale(1)',
          }}
        >
          {isLiked ? '💙' : '🤍'}
        </span>
        <span style={countStyle}>{count}</span>
      </div>
    );
  }

  return (
    <button
      style={{
        ...buttonStyle,
        backgroundColor: isLiked ? COLORS.vibrantBlue : 'transparent',
        borderColor: isLiked ? COLORS.vibrantBlue : COLORS.borderGray,
        transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.target.style.borderColor = COLORS.vibrantBlue;
        e.target.style.backgroundColor = isLiked ? COLORS.vibrantBlue : 'rgba(0, 191, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.borderColor = isLiked ? COLORS.vibrantBlue : COLORS.borderGray;
        e.target.style.backgroundColor = isLiked ? COLORS.vibrantBlue : 'transparent';
      }}
    >
      {isLiked ? '💙' : '🤍'}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </button>
  );
};

/**
 * Rating Component
 * Star-based rating system
 */
const Rating = ({
  value = 0,
  maxValue = 5,
  onRating,
  isDarkMode = false,
  size = 'medium',
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px',
  };

  const containerStyle = {
    display: 'flex',
    gap: SPACING.xs,
    cursor: onRating ? 'pointer' : 'default',
  };

  const starStyle = (index) => ({
    fontSize: sizeMap[size],
    cursor: onRating ? 'pointer' : 'default',
    transition: TRANSITIONS.fast,
    opacity: (hoverValue || value) >= index + 1 ? 1 : 0.3,
    transform: (hoverValue || value) >= index + 1 ? 'scale(1)' : 'scale(0.9)',
  });

  return (
    <div style={containerStyle}>
      {Array.from({ length: maxValue }).map((_, index) => (
        <span
          key={index}
          style={starStyle(index)}
          onClick={() => onRating?.(index + 1)}
          onMouseEnter={() => onRating && setHoverValue(index + 1)}
          onMouseLeave={() => setHoverValue(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

/**
 * Engagement Stats Component
 * Shows likes, comments, shares counts
 */
const EngagementStats = ({
  likes = 0,
  comments = 0,
  shares = 0,
  plays = 0,
  isDarkMode = false,
}) => {
  const containerStyle = {
    display: 'flex',
    gap: SPACING.lg,
    justifyContent: 'space-around',
    padding: SPACING.md,
    backgroundColor: isDarkMode ? 'rgba(138, 43, 226, 0.1)' : 'rgba(138, 43, 226, 0.05)',
    borderRadius: '8px',
  };

  const statStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.electricPurple,
  };

  const countStyle = {
    fontSize: '18px',
    fontWeight: 700,
  };

  return (
    <div style={containerStyle}>
      <div style={statStyle}>
        <span>💙</span>
        <span style={countStyle}>{likes}</span>
        <span>Likes</span>
      </div>
      <div style={statStyle}>
        <span>💬</span>
        <span style={countStyle}>{comments}</span>
        <span>Comments</span>
      </div>
      <div style={statStyle}>
        <span>🔗</span>
        <span style={countStyle}>{shares}</span>
        <span>Shares</span>
      </div>
      <div style={statStyle}>
        <span>▶️</span>
        <span style={countStyle}>{plays}</span>
        <span>Plays</span>
      </div>
    </div>
  );
};

export { LikeButton, Rating, EngagementStats };
