import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/designTokens';
import Button from './Button';

/**
 * Profile Header Component
 * Displays user profile information with cover image, avatar, stats, and actions
 */
const ProfileHeader = ({
  coverImage,
  avatar,
  username,
  bio,
  followers,
  following,
  isOwnProfile = false,
  onFollowClick,
  onMessageClick,
  onEditClick,
  isDarkMode = false,
}) => {
  const headerStyle = {
    position: 'relative',
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.softLavender,
    marginBottom: SPACING.xl,
    fontFamily: TYPOGRAPHY.fontFamily,
  };

  const coverImageStyle = {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    backgroundColor: COLORS.electricPurple,
    backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #8A2BE2, #301934)',
  };

  const profileContentStyle = {
    padding: `0 ${SPACING.lg}`,
    position: 'relative',
  };

  const avatarContainerStyle = {
    marginTop: `-${SPACING.xl}`,
    marginBottom: SPACING.lg,
    display: 'flex',
    alignItems: 'flex-end',
    gap: SPACING.lg,
    justifyContent: 'space-between',
  };

  const avatarStyle = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    border: `4px solid ${isDarkMode ? COLORS.deepIndigo : COLORS.softLavender}`,
    objectFit: 'cover',
    backgroundColor: COLORS.electricPurple,
  };

  const usernameStyle = {
    ...TYPOGRAPHY.heading1,
    margin: 0,
    color: isDarkMode ? COLORS.white : COLORS.black,
  };

  const bioStyle = {
    ...TYPOGRAPHY.body1,
    margin: `${SPACING.sm} 0 0 0`,
    color: isDarkMode ? COLORS.lightGray : COLORS.darkGray,
    maxWidth: '600px',
  };

  const statsContainerStyle = {
    display: 'flex',
    gap: SPACING.xl,
    margin: `${SPACING.lg} 0`,
    padding: `${SPACING.md} 0`,
    borderTop: `1px solid ${COLORS.borderGray}`,
    borderBottom: `1px solid ${COLORS.borderGray}`,
  };

  const statStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const statNumberStyle = {
    ...TYPOGRAPHY.heading2,
    margin: 0,
    color: COLORS.electricPurple,
  };

  const statLabelStyle = {
    ...TYPOGRAPHY.caption,
    margin: `${SPACING.xs} 0 0 0`,
    color: isDarkMode ? COLORS.lightGray : COLORS.darkGray,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const actionsContainerStyle = {
    display: 'flex',
    gap: SPACING.md,
    margin: `${SPACING.lg} 0`,
    flexWrap: 'wrap',
  };

  const profileInfoStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  };

  return (
    <div style={headerStyle}>
      {/* Cover Image */}
      <div style={coverImageStyle} />

      {/* Profile Content */}
      <div style={profileContentStyle}>
        {/* Avatar and Profile Info */}
        <div style={avatarContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: SPACING.md }}>
            <img
              src={avatar || 'https://via.placeholder.com/150'}
              alt={username}
              style={avatarStyle}
            />
            <div style={profileInfoStyle}>
              <h1 style={usernameStyle}>{username}</h1>
              {bio && <p style={bioStyle}>{bio}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={actionsContainerStyle}>
            {isOwnProfile ? (
              <Button
                variant="primary"
                size="medium"
                onClick={onEditClick}
                icon="✏️"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={onFollowClick}
                  icon="👤"
                >
                  Follow
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={onMessageClick}
                  icon="💬"
                >
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          <div style={statStyle}>
            <div style={statNumberStyle}>{followers}</div>
            <div style={statLabelStyle}>Followers</div>
          </div>
          <div style={statStyle}>
            <div style={statNumberStyle}>{following}</div>
            <div style={statLabelStyle}>Following</div>
          </div>
          <div style={statStyle}>
            <div style={statNumberStyle}>42</div>
            <div style={statLabelStyle}>Tracks</div>
          </div>
          <div style={statStyle}>
            <div style={statNumberStyle}>1.2K</div>
            <div style={statLabelStyle}>Total Plays</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
