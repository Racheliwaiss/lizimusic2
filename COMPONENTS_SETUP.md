# LIZI Components & Pages Documentation

## 📄 Available Pages

### 1. Home (`/`)
**File**: `src/pages/Home.jsx`

Landing page introducing the LIZI platform with:
- Hero section with call-to-action
- Feature cards highlighting platform benefits
- Responsive grid layout

**Features Highlighted**:
- 🎤 Collaboration
- 🎵 Discovery
- 💬 Connection
- 🎧 Sharing

---

### 2. Open Stage - Discover (`/open-stage`)
**File**: `src/pages/OpenStage.jsx`

Artist discovery page with:
- Genre filtering buttons
- Artist card grid
- Follower count display
- Listen Now buttons

**Features**:
- Filter by genre (All, Electronic, Jazz, Hip-Hop, Rock)
- Responsive grid layout
- Artist cards with hover effects

---

### 3. Search (`/search`)
**File**: `src/pages/Search.jsx`

Search functionality with:
- Search bar input
- Result list with avatars
- Result type display (Artist/Track)
- Statistics (followers/plays)
- Follow button

**Features**:
- Real-time search input
- Dynamic results display
- Quick follow action

---

### 4. Collaboration (`/collaboration`)
**File**: `src/pages/Collaboration.jsx`

Collaboration project management with:
- New project button
- Project card grid
- Project details (title, genre, members)
- Join project action
- Active collaborations section

**Features**:
- Browse available projects
- Filter by genre
- Member count display
- Join/participate in projects

---

### 5. Messages (`/messages`)
**File**: `src/pages/Messages.jsx`

Direct messaging interface with:
- Sidebar with conversation list
- Search conversations
- Conversation preview with avatar
- Time stamps
- Main chat area

**Features**:
- Multiple conversations
- Last message preview
- Time display
- Ready for real-time integration

---

### 6. Profile (`/profile`)
**File**: `src/pages/Profile.jsx`

User profile page with:
- Profile banner
- User avatar
- Bio and stats (followers, following, collaborations)
- Recent works grid
- Work cards with metadata

**Features**:
- Profile customization ready
- Stats display
- Works/tracks showcase
- Responsive layout

---

### 7. Login (`/login`)
**File**: `src/pages/Login.jsx`

Authentication page with:
- Email input
- Password input
- Login button
- Sign up link
- Form validation ready

**Features**:
- Form submission handling
- Navigation on login
- Sign up redirect link
- Responsive design

---

## 🧩 Shared Components

### Layout Component
**File**: `src/components/Layout.jsx`

Main layout wrapper for all pages except login.

**Features**:
- Navigation bar with links to all pages
- Active route highlighting
- Theme toggle button (light/dark mode)
- Responsive navigation
- Sticky navbar with blur effect

**Sub-components**:
- Navigation bar with routing
- Logo link to home
- Theme toggle

---

## 🎨 Styling System

### Global Styles
**File**: `src/styles/global.css`

Contains:
- CSS variables for theming
- Typography styles (headings, paragraphs, links)
- Button styles
- Form input styles
- Scrollbar styling
- Reset/normalization

### Page-Specific Styles
**File**: `src/pages/Pages.css`

Contains all styles for:
- Hero section
- Feature cards
- Form layouts
- Grid layouts
- Cards and containers
- Responsive breakpoints

### Component Styles
**File**: `src/components/Layout.css`

Navigation-specific styles:
- Navbar layout
- Navigation links
- Theme toggle
- Mobile responsive nav

---

## 🎨 Theme System

### Color Variables

#### Dark Theme (default)
```css
--bg-primary: linear-gradient(135deg, #301934 0%, #131313 100%)
--bg-secondary: rgba(48, 25, 52, 0.95)
--text-primary: #e5e2e1
--text-secondary: #c4c7c8
--accent: #8A2BE2 (Purple)
--accent-alt: #00BFFF (Cyan)
```

#### Light Theme
```css
--bg-primary: linear-gradient(135deg, #f5f1ff 0%, #ffffff 100%)
--bg-secondary: rgba(255, 255, 255, 0.95)
--text-primary: #131313
--text-secondary: #333333
--card-bg: rgba(230, 230, 250, 0.5)
```

### Spacing System
```css
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem (default)
--spacing-lg: 1.5rem
--spacing-xl: 2rem
```

---

## 🔄 Routing Structure

```
/
├── / (Home)
├── /open-stage (Discover)
├── /search (Search)
├── /collaboration (Collaboration)
├── /messages (Messages)
├── /profile (Profile)
└── /login (Login - no layout)
```

---

## 🚀 Next Steps for Development

### Feature Integration
- [ ] Connect to backend API
- [ ] Implement real authentication
- [ ] Add real-time messaging (WebSocket)
- [ ] Integrate audio player
- [ ] Add file upload functionality
- [ ] Implement notifications

### Component Enhancements
- [ ] Audio Player component
- [ ] Modal/Dialog component
- [ ] Toast notification component
- [ ] Loading states
- [ ] Error boundaries

### Pages Enhancement
- [ ] Profile editing
- [ ] Settings page
- [ ] Notification center
- [ ] Analytics dashboard
- [ ] Admin panel

---

## 📝 Code Examples

### Using Route
```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/profile');
  };
  
  return <button onClick={handleClick}>Go to Profile</button>;
}
```

### Using Theme Variables
```css
.my-component {
  color: var(--text-primary);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔗 File References

- **Entry Point**: `index.html` → `src/main.jsx`
- **Config**: `vite.config.js`
- **Dependencies**: `package.json`
