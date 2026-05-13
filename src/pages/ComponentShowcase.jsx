import React, { useState } from 'react';
import {
  Button,
  Card,
  ProfileCard,
  GenreTag,
  ContentCard,
  AudioPlayer,
  SearchBar,
  ProfileHeader,
  Navigation,
  Modal,
  LikeButton,
  Rating,
  EngagementStats,
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from './index';

/**
 * Component Showcase/Demo Page
 * Demonstrates how to use all LIZI components
 */
const ComponentShowcase = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Discover');

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.white,
    color: isDarkMode ? COLORS.white : COLORS.black,
    fontFamily: TYPOGRAPHY.fontFamily,
    transition: 'all 0.3s ease',
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: SPACING.xl,
  };

  const sectionStyle = {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.softLavender,
    borderRadius: '8px',
    border: `1px solid ${COLORS.electricPurple}`,
  };

  const sectionTitleStyle = {
    ...TYPOGRAPHY.heading2,
    margin: `0 0 ${SPACING.lg} 0`,
    color: COLORS.electricPurple,
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: SPACING.lg,
    marginTop: SPACING.md,
  };

  return (
    <div style={containerStyle}>
      {/* Navigation */}
      <Navigation
        logo="LIZI"
        items={['Discover', 'Profile', 'Playlists']}
        activeItem={activeNavItem}
        onItemClick={setActiveNavItem}
        userProfile={{ name: 'John Doe', initial: 'JD' }}
        onUserMenuClick={(action) => {
          if (action === 'theme') {
            setIsDarkMode(!isDarkMode);
          }
        }}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <div style={contentStyle}>
        {/* Hero Section - Profile Header */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>👤 Profile Header</h2>
          <ProfileHeader
            coverImage="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=300&fit=crop"
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe"
            username="John Doe"
            bio="Electronic Music Producer | Ambient Enthusiast 🎵"
            followers={1250}
            following={340}
            isOwnProfile={true}
            onEditClick={() => alert('Edit profile')}
            isDarkMode={isDarkMode}
          />
        </section>

        {/* Search Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🔍 Search Bar</h2>
          <SearchBar
            placeholder="Search tracks, artists, or playlists..."
            onSearch={(value) => console.log('Searching:', value)}
            onFilter={(filter) => console.log('Filter by:', filter)}
            isDarkMode={isDarkMode}
            showFilters={true}
          />
        </section>

        {/* Buttons Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🔘 Buttons</h2>
          <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap', marginTop: SPACING.md }}>
            <Button variant="primary" size="medium" onClick={() => alert('Primary clicked')}>
              Primary Button
            </Button>
            <Button variant="secondary" size="medium" onClick={() => alert('Secondary clicked')}>
              Secondary Button
            </Button>
            <Button variant="ghost" size="medium" onClick={() => alert('Ghost clicked')}>
              Ghost Button
            </Button>
            <Button variant="icon" size="large" icon="🎵" onClick={() => alert('Icon clicked')} />
            <Button variant="primary" size="medium" loading>
              Loading
            </Button>
          </div>
        </section>

        {/* Cards Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🎴 Cards</h2>
          <div style={gridStyle}>
            <ProfileCard
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Artist1"
              name="Luna Beats"
              genre="Electronic"
              followers={542}
              isDarkMode={isDarkMode}
            />
            <ProfileCard
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Artist2"
              name="Ambient Dreams"
              genre="Ambient"
              followers={1203}
              isDarkMode={isDarkMode}
            />
            <ProfileCard
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Artist3"
              name="Hip-Hop Vibes"
              genre="Hip-Hop"
              followers={892}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Content Cards */}
          <h3 style={{ ...TYPOGRAPHY.heading2, marginTop: SPACING.lg, marginBottom: SPACING.md }}>
            Content Cards
          </h3>
          <div style={gridStyle}>
            <ContentCard
              image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
              title="Midnight Waves"
              subtitle="by Luna Beats"
              description="A captivating electronic journey through neon nights"
              metadata={{ Plays: '2.3K', Likes: '542', Duration: '3:45' }}
              isDarkMode={isDarkMode}
            />
            <ContentCard
              image="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop"
              title="Dreamy Nights"
              subtitle="by Ambient Dreams"
              description="Peaceful ambient soundscapes for relaxation"
              metadata={{ Plays: '5.2K', Likes: '1.1K', Duration: '12:30' }}
              isDarkMode={isDarkMode}
            />
          </div>
        </section>

        {/* Genre Tags Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🏷️ Genre Tags</h2>
          <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap', marginTop: SPACING.md }}>
            <GenreTag name="Electronic" color={COLORS.electricPurple} />
            <GenreTag name="Ambient" color={COLORS.vibrantBlue} />
            <GenreTag name="Hip-Hop" color={COLORS.warmOrange} />
            <GenreTag name="Lo-Fi" color={COLORS.successGreen} />
            <GenreTag name="Indie" color={COLORS.electricPurple} />
          </div>
        </section>

        {/* Audio Player Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🎵 Audio Player</h2>
          <AudioPlayer
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            title="Midnight Waves"
            artist="Luna Beats"
            onPlay={() => console.log('Playing...')}
            onPause={() => console.log('Paused...')}
            isDarkMode={isDarkMode}
          />
        </section>

        {/* Engagement Components */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>❤️ Engagement Components</h2>

          <div style={{ marginBottom: SPACING.lg }}>
            <h3 style={{ ...TYPOGRAPHY.body1, marginBottom: SPACING.md }}>Like Button</h3>
            <div style={{ display: 'flex', gap: SPACING.lg }}>
              <LikeButton
                isLiked={liked}
                count={542}
                variant="icon"
                size="large"
                onClick={() => setLiked(!liked)}
              />
              <LikeButton
                isLiked={liked}
                count={542}
                variant="inline"
                onClick={() => setLiked(!liked)}
              />
            </div>
          </div>

          <div style={{ marginBottom: SPACING.lg }}>
            <h3 style={{ ...TYPOGRAPHY.body1, marginBottom: SPACING.md }}>Rating</h3>
            <Rating
              value={selectedRating}
              maxValue={5}
              size="large"
              onRating={setSelectedRating}
            />
          </div>

          <div>
            <h3 style={{ ...TYPOGRAPHY.body1, marginBottom: SPACING.md }}>Engagement Stats</h3>
            <EngagementStats
              likes={2543}
              comments={142}
              shares={89}
              plays={15420}
              isDarkMode={isDarkMode}
            />
          </div>
        </section>

        {/* Modal Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🪟 Modal</h2>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            Open Modal
          </Button>

          <Modal
            isOpen={isModalOpen}
            title="Upload New Track"
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => alert('Track uploaded!')}
            confirmText="Upload"
            cancelText="Cancel"
            isDarkMode={isDarkMode}
            size="medium"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}>
              <div>
                <label style={{ ...TYPOGRAPHY.body1, fontWeight: 600, display: 'block', marginBottom: SPACING.sm }}>
                  Track Title
                </label>
                <input
                  type="text"
                  placeholder="Enter track title"
                  style={{
                    width: '100%',
                    padding: SPACING.sm,
                    border: `1px solid ${COLORS.borderGray}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                />
              </div>
              <div>
                <label style={{ ...TYPOGRAPHY.body1, fontWeight: 600, display: 'block', marginBottom: SPACING.sm }}>
                  Select File
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  style={{
                    width: '100%',
                    padding: SPACING.sm,
                  }}
                />
              </div>
              <div>
                <label style={{ ...TYPOGRAPHY.body1, fontWeight: 600, display: 'block', marginBottom: SPACING.sm }}>
                  Genre
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: SPACING.sm,
                    border: `1px solid ${COLORS.borderGray}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  <option>Electronic</option>
                  <option>Ambient</option>
                  <option>Hip-Hop</option>
                </select>
              </div>
            </div>
          </Modal>
        </section>

        {/* Component Catalog */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>📚 Component Catalog</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md, marginTop: SPACING.md }}>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>Button</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                Variants: primary, secondary, ghost, icon | Sizes: small, medium, large
              </p>
            </div>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>Card</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                Variants: profile, genre, content - Display artist profiles, genre tags, and content cards
              </p>
            </div>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>AudioPlayer</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                Full-featured audio player with progress control, volume control, and playback time
              </p>
            </div>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>SearchBar</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                Advanced search with filters, suggestions, and multi-category search
              </p>
            </div>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>ProfileHeader</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                User profile display with cover image, avatar, stats, and action buttons
              </p>
            </div>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>Navigation</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                Sticky navbar with logo, navigation items, notifications, and user menu
              </p>
            </div>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>Modal</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                Generic modal for dialogs, forms, and confirmations with sizes: small, medium, large
              </p>
            </div>
            <div>
              <h3 style={{ ...TYPOGRAPHY.body1, margin: 0, marginBottom: SPACING.xs }}>Engagement</h3>
              <p style={{ ...TYPOGRAPHY.caption, margin: 0 }}>
                Like buttons, star ratings, and engagement statistics display
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComponentShowcase;
