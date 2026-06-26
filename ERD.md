# 🗄️ ERD — מודל הנתונים של LIZI / LIZI Database Model

תרשים ישויות-קשרים (Entity-Relationship Diagram) של בסיס הנתונים ב-Supabase (PostgreSQL).

> **הערה:** תרשים זה מבוסס על הסכמה בפועל ב-Supabase. לתרשים אינטראקטיבי מלא ומדויק ניתן גם להפיק צילום מ-**Supabase Dashboard → Database → Schema Visualizer**.

---

## תרשים ERD (Mermaid)

```mermaid
erDiagram
    profiles ||--o{ Track : "uploads"
    profiles ||--o{ collaborations : "creates"
    profiles ||--o{ messages : "sends"
    profiles ||--o{ follows : "follows"
    profiles ||--o{ Like : "likes"
    profiles ||--o{ Comment : "writes"
    profiles ||--o{ Playlist : "owns"
    Genre ||--o{ Track : "categorizes"
    Track ||--o{ Like : "receives"
    Track ||--o{ Comment : "receives"
    Track ||--o{ Playlist_Track : "in"
    Playlist ||--o{ Playlist_Track : "contains"
    artists ||--o{ Track : "performs"

    profiles {
        uuid id PK "= auth.users.id"
        text name
        text avatar
        text bio
        text city
        timestamptz created_at
    }

    Track {
        uuid id PK
        text title
        text genre
        text file_url
        text file_name
        text duration
        uuid user_id FK "-> profiles.id"
        timestamptz created_at
    }

    collaborations {
        uuid id PK
        text title
        text genre
        text instruments
        text description
        text ageRange
        int members
        uuid created_by FK "-> profiles.id"
        timestamptz created_at
    }

    artists {
        uuid id PK
        text name
        text genre
        text instruments
        text city
        text style
        text avatar
    }

    Genre {
        uuid id PK
        text name
    }

    Playlist {
        uuid id PK
        text name
        uuid user_id FK "-> profiles.id"
        timestamptz created_at
    }

    Playlist_Track {
        uuid id PK
        uuid playlist_id FK "-> Playlist.id"
        uuid track_id FK "-> Track.id"
    }

    messages {
        uuid id PK
        text content
        uuid sender_id FK "-> profiles.id"
        uuid receiver_id FK "-> profiles.id"
        timestamptz created_at
    }

    follows {
        uuid id PK
        uuid follower_id FK "-> profiles.id"
        uuid following_id FK "-> profiles.id"
    }

    Like {
        uuid id PK
        uuid user_id FK "-> profiles.id"
        uuid track_id FK "-> Track.id"
    }

    Comment {
        uuid id PK
        text content
        uuid user_id FK "-> profiles.id"
        uuid track_id FK "-> Track.id"
        timestamptz created_at
    }
```

---

## הסבר על הקשרים / Relationships

| קשר / Relationship | סוג / Type | הסבר |
|---|---|---|
| `profiles` → `Track` | 1:N | משתמש אחד יכול להעלות מספר שירים |
| `profiles` → `collaborations` | 1:N | משתמש אחד יכול ליצור מספר פרויקטים |
| `Genre` → `Track` | 1:N | ז'אנר אחד מסווג מספר שירים |
| `Track` ↔ `Playlist` | N:M | דרך טבלת הקישור `Playlist_Track` |
| `profiles` ↔ `profiles` | N:M | מעקב הדדי דרך טבלת `follows` |
| `Track` → `Like` / `Comment` | 1:N | שיר מקבל לייקים ותגובות מרובים |

---

## אבטחת גישה / Row Level Security (RLS)

הופעלו מדיניויות RLS על הטבלאות הרגישות:

- **`Track`** — כל משתמש **מחובר** (`authenticated`) יכול לקרוא את כל השירים (פיד קהילתי), אך רק הבעלים (`auth.uid() = user_id`) יכול להוסיף / לעדכן / למחוק.
- **`collaborations`** — כל משתמש מחובר יכול לקרוא את כל הפרויקטים; רק היוצר יכול לערוך.
- **Storage bucket `tracks`** — רק משתמשים מחוברים יכולים להעלות לתיקייה שלהם; קריאה ציבורית לצורך השמעה.
- אורחים **לא מחוברים** אינם מקבלים גישה לתוכן דרך ה-API (deny-by-default).

> תרשים זה תואם למבנה בפועל ב-Supabase, כולל מפתחות ראשיים (PK), מפתחות זרים (FK), וטיפוסי הנתונים.
