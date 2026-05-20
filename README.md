# LIZI - Music Collaboration Platform

A modern web-based music platform empowering amateur musicians to create, collaborate, discover, and share their music with a vibrant community.

## Overview

LIZI is a comprehensive music ecosystem designed to democratize music creation and distribution. Whether you're an aspiring producer, hobbyist musician, or music curator, LIZI provides intuitive tools and a supportive community to bring your musical vision to life.

## Key Features

- **Music Studio**: Browser-based music creation and editing tools
- **Discovery Hub**: Browse and discover music from other amateur musicians
- **User Profiles**: Showcase your portfolio with statistics and follower systems
- **Collaboration Tools**: Connect with other musicians for remixes and projects
- **Community Engagement**: Comments, likes, playlists, and sharing capabilities

## Target Audience

- **Aspiring Producers** (Ages 16-35): Learning production independently, seeking feedback and exposure
- **Hobbyist Musicians**: Creating music for leisure with an easy-to-use platform
- **Collaborators**: Partners looking to work on remixes and projects together
- **Music Curators**: Discovering and sharing music with their network

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: Custom design system with dark theme
- **Linting**: ESLint with React support
- **Package Manager**: npm

# LIZI - Music Collaboration Platform

A modern React-based music collaboration platform built with Vite, React Router, and styled with a dark/light theme toggle.

## 🎵 Project Overview

LIZI is a music collaboration platform that connects artists, producers, and musicians. Users can discover talent, collaborate on projects, send messages, and showcase their work.

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with navigation
│   └── Layout.css          # Layout styles
├── pages/
│   ├── Home.jsx            # Homepage with features
│   ├── Login.jsx           # Login page
│   ├── Profile.jsx         # User profile page
│   ├── Messages.jsx        # Direct messaging
│   ├── Collaboration.jsx   # Collaboration projects
│   ├── Search.jsx          # Search functionality
│   ├── OpenStage.jsx       # Artist discovery
│   └── Pages.css           # All page styles
├── styles/
│   └── global.css          # Global styles & theme variables
├── App.jsx                 # Main app component with routing
└── main.jsx                # Vite entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5174` (or the next available port).

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features

### Pages & Routes
- **Home (`/`)** - Homepage with platform overview and features
- **Discover (`/open-stage`)** - Browse emerging artists by genre
- **Search (`/search`)** - Search for artists, tracks, and producers
- **Collaborate (`/collaboration`)** - View and join collaboration projects
- **Messages (`/messages`)** - Direct messaging with other users
- **Profile (`/profile`)** - User profile with stats and recent works
- **Login (`/login`)** - Authentication page

### Theme Support
- Dark theme (default) with purple accent colors
- Light theme toggle via button in navbar
- Smooth transitions between themes

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Mobile-optimized navigation
- Touch-friendly buttons and interactions

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Routing**: React Router 6.22.0
- **Styling**: CSS with CSS Variables for theming
- **Linting**: ESLint with React plugins

## 🎨 Styling

### Color Scheme

#### Dark Theme
- Primary Background: `#301934` to `#131313`
- Accent: `#8A2BE2` (Purple)
- Secondary Accent: `#00BFFF` (Cyan)
- Text Primary: `#e5e2e1`

#### Light Theme
- Primary Background: `#f5f1ff` to `#ffffff`
- Text Primary: `#131313`

### CSS Variables
All colors, spacing, and transitions use CSS variables defined in `:root` for easy theming.

## 📦 Dependencies

### Production
- `react`: UI library
- `react-dom`: DOM rendering
- `react-router-dom`: Client-side routing

### Development
- `@vitejs/plugin-react`: Vite plugin for React
- `vite`: Build tool
- `eslint`: Code linting
- `eslint-plugin-react`: React-specific linting rules

## 🔧 Configuration Files

- `vite.config.js` - Vite configuration with React plugin
- `index.html` - Entry HTML file
- `package.json` - Project dependencies and scripts

## 📝 Development Guidelines

### Adding a New Page

1. Create a new component in `src/pages/`:
```jsx
import React from 'react';
import './Pages.css';

function NewPage() {
  return (
    <div className="page new-page">
      {/* Content */}
    </div>
  );
}

export default NewPage;
```

2. Import and add route in `src/App.jsx`:
```jsx
import NewPage from './pages/NewPage';

// Inside Routes:
<Route path="/new-page" element={<NewPage />} />
```

3. Add navigation link in `src/components/Layout.jsx`:
```jsx
<Link to="/new-page">New Page</Link>
```

### Adding Styles

- Global styles go in `src/styles/global.css`
- Page-specific styles go in `src/pages/Pages.css`
- Component styles go in corresponding `.css` files

### Theme Implementation

Use CSS variables for all colors:
```css
color: var(--text-primary);
background: var(--card-bg);
border-color: var(--border-color);
```

## 🚢 Deployment

Build for production:
```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📋 Future Enhancements

- [ ] Backend API integration
- [ ] User authentication & session management
- [ ] Real-time messaging with WebSockets
- [ ] Audio player component
- [ ] File upload for tracks
- [ ] User notifications
- [ ] Social features (likes, comments, follows)
- [ ] Admin dashboard
- [ ] Analytics

## 📞 Contact & Support

For issues or feature requests, please create an issue in the project repository.

## 📄 License

This project is private and proprietary.


### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

#

1. Clone the repository:
```bash
git clone <repository-url>
cd lizi
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

### Project Structure

```
src/
├── components/     # Reusable React components
├── pages/          # Page components
├── styles/         # Global styles and design system
└── utils/          # Utility functions and helpers

Public assets:
├── index.html      # Main entry point
├── login.html      # Authentication page
├── profile.html    # User profile page
├── search.html     - Music search and discovery
├── messages.html   # Messaging interface
└── collaboration.html  # Collaboration features
```

## Design System

LIZI uses a modern dark theme with carefully crafted color palette:

- **Primary Color**: White (#ffffff)
- **Surface Colors**: Dark grays (#131313 - #353534)
- **Text Color**: Light beige (#e5e2e1)
- **Accent Color**: Light gray (#c8c6c5)

For detailed design specifications, see [DESIGN.md](DESIGN.md)

## Documentation

- [PRD.md](PRD.md) - Complete Product Requirements Document
- [DESIGN.md](DESIGN.md) - Design system and visual specifications
- [COMPONENTS_README.md](COMPONENTS_README.md) - Component documentation



We welcome contributions! Please ensure your code:
- Follows the ESLint rules configured in the project
- Maintains the design system specifications
- Includes appropriate documentation

## Project Status

**Current Version**: 1.0.0  
**Status**: In Development  
**Last Updated**: May 2026



[Add your license information here]

## Support

For questions, feedback, or issues, please reach out to the development team.

---

**Built with ❤️ for musicians everywhere**
