# LIZI React Setup - Quick Start Guide

## ✅ What's Been Created

A complete React-based music collaboration platform with:

### ✨ Core Infrastructure
- ✅ React 18 with Vite for fast development
- ✅ React Router v6 for client-side routing
- ✅ CSS Variables-based theme system (dark/light mode)
- ✅ Responsive design with mobile-first approach
- ✅ Global styling with component-specific CSS files

### 📄 7 Full-Featured Pages
1. **Home** - Platform introduction and features
2. **Open Stage (Discover)** - Artist discovery with genre filtering
3. **Search** - Search functionality for artists and tracks
4. **Collaboration** - Browse and join collaboration projects
5. **Messages** - Direct messaging interface
6. **Profile** - User profile with stats and works
7. **Login** - Authentication page

### 🎨 Design System
- Consistent color scheme with CSS variables
- Smooth theme transitions (dark ↔ light)
- Responsive grid layouts
- Hover effects and animations
- Mobile-optimized components

---

## 🏃 Running the Project

```bash
# Navigate to project directory
cd c:\Users\ASUS\Downloads\Liz3

# Start development server
npm run dev

# Open browser to http://localhost:5174
```

The app will automatically reload when you edit files (Hot Module Replacement).

---

## 📂 Project Structure

```
Liz3/
├── public/                 # (Optional) Static files
├── src/
│   ├── components/
│   │   ├── Layout.jsx      # Navigation & layout wrapper
│   │   └── Layout.css      # Layout styles
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── OpenStage.jsx
│   │   ├── Search.jsx
│   │   ├── Collaboration.jsx
│   │   ├── Messages.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   └── Pages.css       # All page styles
│   ├── styles/
│   │   └── global.css      # Global & theme styles
│   ├── App.jsx             # Main component with routing
│   └── main.jsx            # Vite entry point
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies & scripts
└── README.md               # Project documentation
```

---

## 🛠️ Common Development Tasks

### Add a New Page

1. **Create component** in `src/pages/YourPage.jsx`:
```jsx
import React from 'react';
import './Pages.css';

function YourPage() {
  return (
    <div className="page your-page">
      <h1>Your Page</h1>
      {/* Add your content here */}
    </div>
  );
}

export default YourPage;
```

2. **Add route** in `src/App.jsx`:
```jsx
import YourPage from './pages/YourPage';

// Inside the Routes component:
<Route path="/your-page" element={<YourPage />} />
```

3. **Add navigation link** in `src/components/Layout.jsx`:
```jsx
<Link to="/your-page" className={isActive('/your-page') ? 'active' : ''}>
  Your Page
</Link>
```

### Add Styling

Use CSS variables for consistency:
```css
.my-element {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: var(--spacing-md);
  margin: var(--spacing-lg);
}

.my-element:hover {
  background: var(--bg-secondary);
}
```

### Add Theme Toggle Feature

Theme is already handled in `Layout.jsx`:
```jsx
const [theme, setTheme] = useState('dark');

const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

### Navigate Programmatically

```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/profile')}>
      Go to Profile
    </button>
  );
}
```

---

## 🎨 Color Palette

### Dark Mode (Default)
- **Primary Gradient**: `#301934` → `#131313`
- **Accent (Purple)**: `#8A2BE2`
- **Secondary (Cyan)**: `#00BFFF`
- **Text**: `#e5e2e1`

### Light Mode
- **Primary Gradient**: `#f5f1ff` → `#ffffff`
- **Text**: `#131313`

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally

# Quality
npm run lint         # Run ESLint checks
```

---

## 🔗 API Integration Ready

All pages are structured to easily integrate with backend APIs. Example:

```jsx
import { useEffect, useState } from 'react';

function YourPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data from your API
    fetch('/api/endpoint')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return <div>{/* Render data */}</div>;
}
```

---

## ⚙️ Configuration Files

### vite.config.js
Already configured with React plugin. No changes needed unless you want:
- Custom aliases
- Proxy setup
- Environment variables
- Different output directory

### package.json
Contains:
- React, React DOM, React Router dependencies
- Vite and dev tools
- NPM scripts
- Project metadata

---

## 🐛 Troubleshooting

### Port Already in Use
If port 5173/5174 is in use:
```bash
npm run dev -- --port 3000
```

### HMR Not Working
Add to `vite.config.js`:
```js
export default {
  server: {
    hmr: {
      host: 'localhost',
      port: 5174
    }
  }
}
```

### Theme Not Persisting
Add localStorage logic:
```jsx
const [theme, setTheme] = useState(
  localStorage.getItem('theme') || 'dark'
);

const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [MDN CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

## 🚀 Next Steps

1. **Connect to Backend**: Replace mock data with API calls
2. **Add Authentication**: Implement login/signup flow
3. **Real-time Features**: Add WebSocket for messaging
4. **Audio Player**: Create audio playback component
5. **File Uploads**: Add track/image upload functionality
6. **Notifications**: Implement toast/notification system
7. **Testing**: Add unit and integration tests
8. **Deployment**: Set up CI/CD pipeline

---

## 💡 Tips & Best Practices

✅ **Do**:
- Use CSS variables for colors/spacing
- Keep components small and focused
- Use meaningful component/file names
- Comment complex logic
- Test pages in different browsers/devices

❌ **Don't**:
- Hardcode colors (use CSS variables)
- Create deeply nested component trees
- Use inline styles (except for dynamic values)
- Forget to handle loading/error states
- Skip responsive design testing

---

## 📞 Need Help?

Refer to:
1. `README.md` - Full project documentation
2. `COMPONENTS_SETUP.md` - Detailed component descriptions
3. React/Vite official documentation
4. Browser DevTools for debugging

Happy Coding! 🎵