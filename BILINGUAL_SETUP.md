# LIZI Bilingual Support (English & Hebrew)

## 🌍 Language Support Overview

LIZI now supports **English** and **Hebrew** with full internationalization (i18n) support, including:
- ✅ Complete translations for all pages
- ✅ Language toggle button in navbar
- ✅ RTL (Right-to-Left) support for Hebrew
- ✅ LTR (Left-to-Right) support for English
- ✅ Persistent language preference (localStorage)
- ✅ Automatic HTML direction switching

---

## 🔄 How It Works

### Language Context System

The app uses a React Context API pattern for language management:

```jsx
// LanguageContext.jsx
const { language, toggleLanguage, t } = useLanguage();
```

**Features**:
- `language` - Current language ('en' or 'he')
- `toggleLanguage()` - Switch between languages
- `t(key)` - Translation function for accessing strings

### Translation Structure

All translations are organized in `src/translations.js`:

```javascript
const translations = {
  en: {
    nav: { home: 'Home', profile: 'Profile', ... },
    home: { title: 'Welcome to LIZI', ... },
    // ... more sections
  },
  he: {
    nav: { home: 'בית', profile: 'פרופיל', ... },
    home: { title: 'ברוכים הבאים ל-LIZI', ... },
    // ... more sections
  }
}
```

### RTL/LTR Support

The app automatically sets HTML attributes for correct text direction:

```javascript
// Automatic when language changes
document.documentElement.lang = language; // 'en' or 'he'
document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
```

---

## 📁 File Structure

```
src/
├── translations.js          # All language strings (EN & HE)
├── LanguageContext.jsx      # Language context & provider
├── App.jsx                  # LanguageProvider wrapper
├── components/
│   └── Layout.jsx           # Language toggle button
└── pages/
    ├── Home.jsx
    ├── Login.jsx
    ├── Profile.jsx
    ├── Messages.jsx
    ├── Collaboration.jsx
    ├── Search.jsx
    └── OpenStage.jsx
```

---

## 🎯 Usage Examples

### Using Translations in Components

```jsx
import { useLanguage } from '../LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      <button>{t('home.cta')}</button>
    </div>
  );
}
```

### Getting Current Language

```jsx
function MyComponent() {
  const { language } = useLanguage();
  
  if (language === 'he') {
    // Do something for Hebrew
  }
  
  return <div>Current: {language}</div>;
}
```

### Toggling Language

```jsx
function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button onClick={toggleLanguage}>
      {language === 'en' ? 'עברית' : 'English'}
    </button>
  );
}
```

---

## 📝 Available Translations

### Navigation (`nav`)
- `home` - Home
- `discover` - Discover/Discover Artists
- `search` - Search
- `collaborate` - Collaborate/Collaborations
- `messages` - Messages
- `profile` - Profile
- `logo` - 🎵 LIZI

### Home Page (`home`)
- `title` - Page title
- `subtitle` - Subtitle
- `cta` - Call-to-action button
- `whyLizi` - "Why LIZI?" section
- `features` - Feature descriptions

### Login (`login`)
- `title` - Login title
- `email` - Email label
- `password` - Password label
- `loginBtn` - Login button
- `noAccount` - Sign up prompt
- `signup` - Sign up link

### Profile (`profile`)
- `artistName` - Artist name display
- `bio` - Bio text
- `followers` - Followers label
- `following` - Following label
- `collaborations` - Collaborations label
- `recentWorks` - Recent works section
- `collaboration` - Collaboration label

### Messages (`messages`)
- `title` - Messages title
- `searchConversations` - Search placeholder
- `selectConversation` - Selection prompt

### Collaboration (`collaboration`)
- `title` - Page title
- `newProject` - New project button
- `members` - Members label
- `joinProject` - Join project button
- `activeCollaborations` - Active section title
- `noCollaborations` - Empty state message

### Search (`search`)
- `title` - Search title
- `placeholder` - Search input placeholder
- `resultsFor` - Results header
- `followers` - Followers label
- `plays` - Plays label
- `follow` - Follow button

### Open Stage (`openStage`)
- `title` - Page title
- `subtitle` - Subtitle
- `allGenres` - All genres button
- `followers` - Followers label
- `listenNow` - Listen now button

---

## 🌐 Supporting RTL Design

### CSS RTL Support

The app includes RTL-aware CSS:

```css
/* RTL Support */
html[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

html[dir="ltr"] {
  direction: ltr;
  text-align: left;
}

/* Flexbox auto-reversal for RTL */
[dir="rtl"] .nav-links {
  flex-direction: row-reverse;
}
```

### Browser Compatibility

RTL support works in:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 💾 Language Persistence

Language preference is automatically saved to localStorage:

```javascript
// When language changes
localStorage.setItem('language', newLanguage); // 'en' or 'he'

// On app load
const savedLanguage = localStorage.getItem('language') || 'en';
```

---

## 🔧 Adding New Translations

### Step 1: Add to `src/translations.js`

```javascript
const translations = {
  en: {
    // ... existing
    newFeature: {
      title: 'My New Feature',
      description: 'This is a new feature'
    }
  },
  he: {
    // ... existing
    newFeature: {
      title: 'התכונה החדשה שלי',
      description: 'זו תכונה חדשה'
    }
  }
}
```

### Step 2: Use in Component

```jsx
function NewFeature() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('newFeature.title')}</h1>
      <p>{t('newFeature.description')}</p>
    </div>
  );
}
```

---

## 🎨 Theme + Language

The app supports both theme switching AND language switching independently:

```jsx
// Dark theme + Hebrew
// Dark theme + English
// Light theme + Hebrew
// Light theme + English
```

All combinations work seamlessly!

---

## 📊 Current Language Coverage

| Feature | English | Hebrew |
|---------|---------|--------|
| Navigation | ✅ | ✅ |
| Home Page | ✅ | ✅ |
| Login Page | ✅ | ✅ |
| Profile Page | ✅ | ✅ |
| Messages Page | ✅ | ✅ |
| Collaboration Page | ✅ | ✅ |
| Search Page | ✅ | ✅ |
| Discover Page | ✅ | ✅ |

---

## 🚀 Future Language Support

To add a new language (e.g., Arabic):

1. Add language object to `translations.js`:
```javascript
const translations = {
  en: { ... },
  he: { ... },
  ar: { ... }  // New language
}
```

2. Update language toggle logic

3. Test RTL support if needed

---

## 🐛 Troubleshooting

### Language Not Changing
```javascript
// Force clear cache and reset
localStorage.removeItem('language');
location.reload();
```

### Text Not Displaying in Hebrew
Check if:
1. Translation key exists in `translations.js`
2. Using `t()` function correctly
3. Font supports Hebrew characters (built-in support)

### RTL Layout Issues
- Ensure `document.dir` is set correctly
- Check CSS for `direction` property
- Verify media queries have RTL variants

---

## 📱 Mobile Considerations

- Language toggle is visible on all screen sizes
- RTL layout adapts to mobile viewports
- Touch-friendly buttons for language switching
- Language preference persists across sessions

---

## 🔒 Security Notes

- No sensitive data in translations
- Translations don't use user input
- Safe localStorage usage
- XSS protection through React

---

## 📖 Code Examples

### Complete Translation in Component

```jsx
import { useLanguage } from '../LanguageContext';

function Example() {
  const { language, toggleLanguage, t } = useLanguage();
  
  return (
    <div dir={language === 'he' ? 'rtl' : 'ltr'}>
      <h1>{t('home.title')}</h1>
      
      <button onClick={toggleLanguage}>
        {language === 'en' ? 'עברית' : 'English'}
      </button>
      
      <p>Current Language: {language}</p>
    </div>
  );
}
```

### Conditional Logic Based on Language

```jsx
function FormattedDate() {
  const { language, t } = useLanguage();
  
  const date = new Date().toLocaleDateString(
    language === 'he' ? 'he-IL' : 'en-US'
  );
  
  return <span>{date}</span>;
}
```

---

## ✅ Testing the Feature

1. **Switch Languages**: Click language button in navbar
2. **Check Persistence**: Refresh page - language stays same
3. **Test RTL**: Switch to Hebrew - text flows right-to-left
4. **Check All Pages**: Navigate through all pages in both languages
5. **Theme + Language**: Switch themes while using Hebrew
6. **Mobile**: Test on mobile devices/responsive view

---

## 📝 Notes

- Default language: English
- All translations are complete
- RTL support is automatic
- No external i18n library needed
- Lightweight implementation (~3KB)
- Easy to extend with more languages

---

## 🎉 That's It!

LIZI now fully supports English and Hebrew with seamless language switching and proper RTL/LTR layout support!
