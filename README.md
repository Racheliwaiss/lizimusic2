

# 🎵 LIZI — Music Collaboration Platform

### פלטפורמת שיתוף פעולה למוזיקאים חובבים בישראל

**🌐 Live:** [lizimusic.site](https://lizimusic.site) · **📧** lizimusicplatform@gmail.com

*A community platform where amateur musicians find bandmates, share tracks, discover open stages, and collaborate.*



---

## 🇮🇱 סקירה כללית (Hebrew)

**LIZI** היא פלטפורמה חברתית למוזיקאים חובבים בישראל. המשתמשים יכולים להעלות שירים, למצוא שותפים לנגינה, לגלות במות פתוחות ואירועים, להצטרף לפרויקטים משותפים, ולהתחבר לקהילה מקומית של יוצרי מוזיקה — הכול במקום אחד, בעברית מלאה עם תמיכת RTL.

## 🇬🇧 Overview (English)

**LIZI** is a social platform for amateur musicians in Israel. Users upload tracks, find bandmates, discover open stages and events, join collaboration projects, and connect with a local community of music creators — all in one place, fully bilingual (Hebrew RTL + English).

---

## 🎯 הבעיה שהפרויקט פותר / The Problem

**עברית:** למוזיקאים חובבים בישראל אין מקום ייעודי להיפגש, לשתף יצירות, ולמצוא שותפים לנגינה. הם מפוזרים בין קבוצות וואטסאפ, פוסטים אקראיים בפייסבוק, והמלצות "מפה לאוזן". התוצאה: בדידות יצירתית, קושי למצוא הרכב, ותחושת חוסר שייכות לקהילה.

**English:** Amateur musicians in Israel lack a dedicated space to meet, share their work, and find collaborators. They are scattered across WhatsApp groups, random Facebook posts, and word-of-mouth. The result is creative isolation, difficulty forming bands, and no sense of belonging to a community.

---

## 👥 קהל היעד / Target Audience

מוזיקאים חובבים בישראל (גילאי 16+) המחפשים שייכות ושיתוף פעולה:
- נגנים שמחפשים הרכב או שותפים לג'אם
- זמרים/יוצרים שרוצים לשתף יצירות ולקבל פידבק
- אמנים שמחפשים במות פתוחות ואירועים מקומיים
- כל מי שמרגיש שמוזיקה היא תחביב בודד ורוצה קהילה

*Amateur musicians in Israel (16+) seeking belonging and collaboration: instrumentalists looking for a band, singers/creators wanting to share work and get feedback, and artists searching for open stages and local events.*

---

## ⚔️ מתחרים ובידול / Competitors & Differentiation

| מתחרה / Competitor | החיסרון שלו / Limitation | הבידול של LIZI / How LIZI is Different |
|---|---|---|
| **קבוצות וואטסאפ / WhatsApp groups** | כאוטי, לא ניתן לחיפוש, פוסטים נעלמים | פרופילים מובנים, חיפוש לפי כלי/ז'אנר/עיר, תוכן נשמר |
| **Facebook / Instagram** | כללי מדי, אלגוריתם לא ממוקד מוזיקה | מותאם 100% למוזיקאים: העלאת טראקים, התאמת הרכבים, במות |
| **לעשות ידנית / Doing it manually** | תלוי בקשרים אישיים, איטי, מקרי | גילוי שיטתי + מיקום גיאוגרפי ("קרוב אליך") |
| **BandMix / פלטפורמות זרות** | באנגלית, ללא הקשר ישראלי/RTL, לא חינמי | עברית מלאה, RTL, מקומי, חינמי, מותאם לסצנה הישראלית |

**הבידול המרכזי:** LIZI היא הפלטפורמה היחידה שמשלבת **קהילה מקומית ישראלית**, **התאמה גיאוגרפית** ("קרוב אליך"), **תמיכת RTL מלאה**, ו**פיד חברתי של יצירות אמיתיות** — במקום אחד וחינמי.

---

## ✨ פיצ'רים מרכזיים / Key Features

| פיצ'ר | תיאור |
|---|---|
| 🎵 **My Tracks** | העלאת שירים (audio) הנשמרים ב-Supabase Storage + מסד הנתונים, עם נגן מובנה |
| 📡 **Community Feed** | פיד ציבורי — שירים של כל המשתמשים המחוברים מופיעים כפוסטים עם נגן |
| 🔒 **Login-gated content** | תוכן (שירים/פרויקטים) גלוי רק למשתמשים מחוברים; אורחים מקבלים "התחבר כדי לראות" |
| 🤝 **Collaboration** | יצירה והצטרפות לפרויקטים מוזיקליים משותפים |
| 🥁 **Find Bandmate** | חיפוש שותפים לנגינה לפי כלי, ז'אנר ועיר |
| 🎤 **Open Stage** | גילוי אמנים עם ציון התאמה (match score) לפי הפרופיל |
| 📅 **Events** | לוח אירועים: ג'אמים, הופעות, סדנאות, במות פתוחות |
| 💬 **Messages** | מערכת הודעות בין משתמשים |
| 📍 **Geolocation** | זיהוי עיר אוטומטי (24 ערים) + תגיות "קרוב אליך" |
| 🌐 **Bilingual + RTL** | עברית/אנגלית עם החלפה מיידית ותמיכת RTL מלאה |
| 🌓 **Dark / Light theme** | מצב כהה/בהיר |
| 📱 **Responsive** | מותאם מובייל עם תפריט המבורגר |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 · Vite 5 · React Router 6
- **Backend:** Supabase (PostgreSQL · Storage · Auth)
- **Auth:** Google OAuth (via Supabase Auth)
- **Styling:** Plain CSS with custom properties (no framework) · full RTL support
- **Deployment:** Vercel · custom domain via Porkbun (lizimusic.site)
- **Testing:** Vitest + jsdom

---

## 🗄️ מודל הנתונים / Database Model (ERD)

ה-Backend בנוי על **Supabase (PostgreSQL)**. תרשים ה-ERD המלא נמצא בקובץ `ERD.md` / `erd.png` בריפו זה.

הטבלאות המרכזיות / Core tables:

| טבלה / Table | תפקיד / Purpose |
|---|---|
| `Track` | העלאות שירים של משתמשים (title, genre, file_url, user_id) |
| `collaborations` | פרויקטים מוזיקליים משותפים |
| `profiles` | נתוני פרופיל מורחבים של משתמשים |
| `artists` | פרופילי אמנים לגילוי |
| `Genre` | ז'אנרים מוזיקליים |
| `Playlist` / `Playlist_Track` | רשימות השמעה וקישור לטראקים |
| `messages` | הודעות בין משתמשים |
| `follows` | מעקב בין משתמשים |
| `Like` / `Comment` | אינטראקציות חברתיות |

**אבטחה (RLS):** הופעלו Row Level Security policies — משתמש מחובר רואה את כל השירים והפרויקטים (פיד קהילתי), אך רק הבעלים יכול לערוך/למחוק את התוכן שלו. אורחים לא-מחוברים לא מקבלים גישה לתוכן דרך ה-API.

---

## 🔌 שירותים חיצוניים ואינטגרציות / External Services

ראו פירוט מלא בקובץ זה למטה ובמסמך ההגשה. בקצרה:

| שירות / Service | סוג / Type | תפקיד / Role |
|---|---|---|
| **Google OAuth** | אוטנטיקציה / Authentication | התחברות משתמשים דרך חשבון גוגל |
| **Supabase Auth** | אוטנטיקציה / Auth backend | ניהול sessions, JWT, ומשתמשים |
| **Supabase Database** | בסיס נתונים / Database | PostgreSQL — אחסון כל הנתונים |
| **Supabase Storage** | אחסון קבצים / File storage | אחסון קובצי שמע (tracks) ותמונות (avatars) |
| **Vercel** | אירוח / Hosting | פריסת האתר החי + CDN |
| **Porkbun** | דומיין / Domain | רישום הדומיין lizimusic.site |
| **Browser Geolocation API** | מיקום / Geolocation | זיהוי עיר המשתמש לתגיות "קרוב אליך" |
| **Web Speech API** | קלט קולי / Voice | חיפוש קולי בעמוד החיפוש (עברית/אנגלית) |

---

## 🚀 הוראות הרצה / Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (.env.local)
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# 3. Run dev server
npm run dev        # http://localhost:5173

# 4. Build for production
npm run build
```

---

## 🧪 משתמש דמו לבדיקה / Demo Access

כדי לבדוק את הזרימה המרכזית (העלאת שיר → הופעה בפיד):
1. כנסו ל-[lizimusic.site](https://lizimusic.site)
2. לחצו **Login** → **Continue with Google** והתחברו עם חשבון גוגל
3. עברו ל-**My Tracks** → **Upload Track** → העלו קובץ שמע
4. השיר נשמר ומופיע ב-**Feed** הקהילתי

*To test the main flow: log in with Google, go to My Tracks, upload an audio file — it persists and appears in the community Feed.*

---

## 📄 License

Private and proprietary — final project for an AI Product Development course. All rights reserved.
