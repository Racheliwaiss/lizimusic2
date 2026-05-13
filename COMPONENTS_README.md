# LIZI React Component Library

A comprehensive, production-ready React component library for the LIZI music platform. Built with the LIZI Design System for a cohesive, modern music collaboration experience.

## 📦 Components

### Core Components

#### 1. **Button** (`Button.jsx`)
Versatile button component with multiple variants and sizes.

**Variants:**
- `primary` - Solid purple button for main actions
- `secondary` - Light purple button with purple border
- `ghost` - Transparent button with border
- `icon` - Circular icon button

**Sizes:**
- `small` - Compact button
- `medium` - Default size
- `large` - Large button

**Props:**
```jsx
<Button
  variant="primary"
  size="medium"
  onClick={() => {}}
  disabled={false}
  loading={false}
  icon="🎵"
>
  Click Me
</Button>
```

---

#### 2. **Card** (`Card.jsx`)
Flexible card component for displaying content in containers.

**Variants:**
- `profile` - Profile card with border and hover effects
- `genre` - Genre tag (pill-shaped)
- `content` - Generic content card

**Sub-components:**
- `ProfileCard` - Display artist information
- `GenreTag` - Show music genres
- `ContentCard` - Display track/playlist information

**Props:**
```jsx
<ProfileCard
  avatar="https://..."
  name="Luna Beats"
  genre="Electronic"
  followers={542}
  isDarkMode={false}
  onClick={() => {}}
/>
```

---

#### 3. **AudioPlayer** (`AudioPlayer.jsx`)
Full-featured audio player with controls and volume management.

**Features:**
- Play/pause controls
- Progress bar with seek functionality
- Current time and duration display
- Volume control with mute button
- Responsive design

**Props:**
```jsx
<AudioPlayer
  src="https://example.com/track.mp3"
  title="Midnight Waves"
  artist="Luna Beats"
  onPlay={() => {}}
  onPause={() => {}}
  isDarkMode={false}
/>
```

---

#### 4. **SearchBar** (`SearchBar.jsx`)
Advanced search with filters and suggestions.

**Features:**
- Search input with placeholder
- Filter buttons (all, tracks, artists, playlists, genres)
- Suggestion dropdown
- Clear button
- Responsive design

**Props:**
```jsx
<SearchBar
  placeholder="Search tracks, artists, playlists..."
  onSearch={(value) => {}}
  onFilter={(filter) => {}}
  isDarkMode={false}
  showFilters={true}
/>
```

---

#### 5. **ProfileHeader** (`ProfileHeader.jsx`)
Complete user profile header with stats and actions.

**Features:**
- Cover image
- Avatar with border
- Username and bio
- Follower/following stats
- Follow and message buttons (for other profiles)
- Edit button (for own profile)

**Props:**
```jsx
<ProfileHeader
  coverImage="https://..."
  avatar="https://..."
  username="John Doe"
  bio="Electronic music producer"
  followers={1250}
  following={340}
  isOwnProfile={false}
  onFollowClick={() => {}}
  onMessageClick={() => {}}
  onEditClick={() => {}}
  isDarkMode={false}
/>
```

---

#### 6. **Navigation** (`Navigation.jsx`)
Sticky navigation bar with menu and user options.

**Features:**
- Logo with link to home
- Navigation items with active state
- Notification bell with badge
- User avatar with dropdown menu
- Dark mode toggle
- Logout option

**Props:**
```jsx
<Navigation
  logo="LIZI"
  items={['Discover', 'Profile', 'Playlists']}
  onItemClick={(item) => {}}
  activeItem="Discover"
  userProfile={{ name: 'John Doe', initial: 'JD' }}
  onUserMenuClick={(action) => {}}
  isDarkMode={false}
/>
```

---

#### 7. **Modal** (`Modal.jsx`)
Generic modal component for dialogs and confirmations.

**Sizes:**
- `small` - 400px
- `medium` - 600px
- `large` - 800px

**Props:**
```jsx
<Modal
  isOpen={true}
  title="Upload Track"
  onClose={() => {}}
  onConfirm={() => {}}
  confirmText="Upload"
  cancelText="Cancel"
  isDarkMode={false}
  size="medium"
>
  {/* Modal content */}
</Modal>
```

---

#### 8. **Engagement Components** (`Engagement.jsx`)

##### LikeButton
```jsx
<LikeButton
  isLiked={false}
  count={542}
  variant="icon" // or "inline"
  size="medium" // small, medium, large
  onClick={() => {}}
/>
```

##### Rating
```jsx
<Rating
  value={3}
  maxValue={5}
  size="medium"
  onRating={(value) => {}}
  isDarkMode={false}
/>
```

##### EngagementStats
```jsx
<EngagementStats
  likes={2543}
  comments={142}
  shares={89}
  plays={15420}
  isDarkMode={false}
/>
```

---

## 🎨 Design Tokens

All design tokens are centralized in `constants/designTokens.js`:

### Colors
```javascript
COLORS = {
  electricPurple: '#8A2BE2',
  deepIndigo: '#301934',
  white: '#FFFFFF',
  vibrantBlue: '#00BFFF',
  successGreen: '#32CD32',
  warmOrange: '#FF8C00',
  softLavender: '#E6E6FA',
  // ... more colors
}
```

### Typography
```javascript
TYPOGRAPHY = {
  fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
  heading1: { fontSize: '32px', fontWeight: 700 },
  heading2: { fontSize: '24px', fontWeight: 600 },
  body1: { fontSize: '16px', fontWeight: 400 },
  body2: { fontSize: '14px', fontWeight: 400 },
  // ... more styles
}
```

### Spacing
```javascript
SPACING = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  xxl: '64px',
}
```

---

## 🚀 Usage Examples

### Basic Button Usage
```jsx
import { Button } from './components';

function App() {
  return (
    <Button 
      variant="primary" 
      onClick={() => alert('Clicked!')}
    >
      Upload Track
    </Button>
  );
}
```

### Profile Header Example
```jsx
import { ProfileHeader } from './components';

function ProfilePage() {
  return (
    <ProfileHeader
      coverImage="https://example.com/cover.jpg"
      avatar="https://example.com/avatar.jpg"
      username="Luna Beats"
      bio="Electronic music producer from Berlin"
      followers={1250}
      following={340}
      isOwnProfile={false}
      onFollowClick={() => console.log('Follow clicked')}
    />
  );
}
```

### Complete Music Player
```jsx
import { AudioPlayer, Button, EngagementStats, LikeButton } from './components';

function TrackPage() {
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <div>
      <AudioPlayer
        src="https://example.com/track.mp3"
        title="Midnight Waves"
        artist="Luna Beats"
      />
      <EngagementStats
        likes={2543}
        comments={142}
        shares={89}
        plays={15420}
      />
      <LikeButton
        isLiked={isLiked}
        count={2543 + (isLiked ? 1 : 0)}
        variant="inline"
        onClick={() => setIsLiked(!isLiked)}
      />
    </div>
  );
}
```

---

## 🌙 Dark Mode Support

All components support dark mode via the `isDarkMode` prop:

```jsx
<Button isDarkMode={true}>Dark Mode Button</Button>
<ProfileHeader isDarkMode={true} {...props} />
<SearchBar isDarkMode={true} {...props} />
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── AudioPlayer.jsx
│   ├── SearchBar.jsx
│   ├── ProfileHeader.jsx
│   ├── Navigation.jsx
│   ├── Modal.jsx
│   ├── Engagement.jsx
│   └── index.js
├── constants/
│   └── designTokens.js
└── pages/
    └── ComponentShowcase.jsx
```

---

## 🎯 Component Showcase

View the complete component library with all examples in `ComponentShowcase.jsx`:

```jsx
import ComponentShowcase from './pages/ComponentShowcase';

function App() {
  return <ComponentShowcase />;
}
```

---

## ✨ Features

✅ **8+ Production-Ready Components**  
✅ **Dark Mode Support** for all components  
✅ **Fully Accessible** with keyboard navigation  
✅ **Responsive Design** for all screen sizes  
✅ **Smooth Animations** and transitions  
✅ **Type-Safe Props** with clear documentation  
✅ **Design System Integration** using tokens  
✅ **Zero Dependencies** - Pure React & CSS  

---

## 🔧 Customization

### Using Custom Colors
```jsx
import { GenreTag, COLORS } from './components';

<GenreTag 
  name="Synthwave" 
  color="#FF00FF" // Custom color
/>
```

### Extending Components
```jsx
import Button from './components/Button';

const PrimaryButton = (props) => (
  <Button variant="primary" size="large" {...props} />
);
```

---

## 🤝 Best Practices

1. **Import from index** - Use `import { Button } from './components'`
2. **Use design tokens** - Don't hardcode colors/spacing
3. **Pass isDarkMode** - Ensure consistent theme support
4. **Provide callbacks** - Use `onClick`, `onSearch`, `onFilter` properly
5. **Responsive props** - Test on mobile and desktop

---

## 📝 Notes

- All components use inline styles for maximum portability
- No external CSS dependencies required
- Components are fully self-contained
- Design tokens can be easily customized globally

---

## 🎵 LIZI Design System

This component library implements the LIZI Design System with:
- **Electric Purple** (#8A2BE2) as primary brand color
- **Dark Theme** with light accents for music production aesthetic
- **Rounded Pill Buttons** for modern, friendly interaction
- **Professional Typography** with Inter font family
- **Consistent Spacing** using 8px unit system

---

## 📄 License

© 2026 LIZI Music Platform. All rights reserved.

---

## 🚀 Next Steps

1. Copy components to your project
2. Import design tokens globally
3. Customize colors/spacing as needed
4. Integrate with your API
5. Build amazing features! 🎵

Happy coding! 🚀
