import React from 'react';
import { COLORS, BORDER_RADIUS, SPACING, TYPOGRAPHY, TRANSITIONS } from '../constants/designTokens';

/**
 * Button Component
 * Variants: primary, secondary, ghost, icon
 * Sizes: small, medium, large
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  className = '',
  icon = null,
  loading = false,
  ...props
}) => {
  const baseStyles = {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: 700,
    fontSize: '16px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: TRANSITIONS.standard,
    borderRadius: BORDER_RADIUS.full,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    opacity: disabled ? 0.6 : 1,
    ...TYPOGRAPHY.buttonText,
  };

  const variantStyles = {
    primary: {
      backgroundColor: COLORS.electricPurple,
      color: COLORS.white,
      border: `2px solid ${COLORS.electricPurple}`,
      ':hover': {
        backgroundColor: '#7B1BA8',
      },
    },
    secondary: {
      backgroundColor: COLORS.softLavender,
      color: COLORS.electricPurple,
      border: `2px solid ${COLORS.electricPurple}`,
      ':hover': {
        backgroundColor: '#D4C5E6',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.electricPurple,
      border: `2px solid ${COLORS.electricPurple}`,
      ':hover': {
        backgroundColor: COLORS.softLavender,
      },
    },
    icon: {
      backgroundColor: COLORS.electricPurple,
      color: COLORS.white,
      border: 'none',
      borderRadius: '50%',
      padding: SPACING.sm,
      ':hover': {
        backgroundColor: '#7B1BA8',
      },
    },
  };

  const sizeStyles = {
    small: {
      padding: `${SPACING.xs} ${SPACING.md}`,
      fontSize: '14px',
    },
    medium: {
      padding: `${SPACING.sm} ${SPACING.md}`,
      fontSize: '16px',
    },
    large: {
      padding: `${SPACING.md} ${SPACING.lg}`,
      fontSize: '18px',
    },
  };

  const isIconVariant = variant === 'icon';
  const finalStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...(!isIconVariant && sizeStyles[size]),
  };

  return (
    <button
      style={finalStyle}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <span style={{ animation: 'spin 0.6s linear infinite' }}>⏳</span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
