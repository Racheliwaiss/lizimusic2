import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, Z_INDEX, SHADOWS } from '../constants/designTokens';
import Button from './Button';

/**
 * Modal/Dialog Component
 * Generic modal for displaying content, forms, or confirmations
 */
const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDarkMode = false,
  size = 'medium', // small, medium, large
}) => {
  if (!isOpen) return null;

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.modalBackdrop,
    animation: 'fadeIn 0.2s ease',
  };

  const sizeMap = {
    small: '400px',
    medium: '600px',
    large: '800px',
  };

  const modalStyle = {
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    maxWidth: sizeMap[size],
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: SHADOWS.dark,
    zIndex: Z_INDEX.modal,
    animation: 'slideUp 0.3s ease',
    fontFamily: TYPOGRAPHY.fontFamily,
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottom: `1px solid ${COLORS.borderGray}`,
  };

  const titleStyle = {
    ...TYPOGRAPHY.heading2,
    margin: 0,
    color: isDarkMode ? COLORS.white : COLORS.black,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: isDarkMode ? COLORS.lightGray : COLORS.darkGray,
    transition: 'color 0.2s ease',
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTop: `1px solid ${COLORS.borderGray}`,
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => (e.target.style.color = COLORS.electricPurple)}
            onMouseLeave={(e) => (e.target.style.color = isDarkMode ? COLORS.lightGray : COLORS.darkGray)}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: SPACING.lg }}>
          {children}
        </div>

        {onConfirm && (
          <div style={footerStyle}>
            <Button
              variant="ghost"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
