// Translations for Hebrew and English
const translations = {
  en: {
    // Navigation
    nav: {
      logo: '🎵 LIZI',
      home: 'Home',
      discover: 'Discover',
      search: 'Search',
      collaborate: 'Collaborate',
      messages: 'Messages',
      profile: 'Profile',
      about: 'About',
    },

    // Home Page
    home: {
      title: 'Welcome to LIZI',
      subtitle: 'Your Music Collaboration Platform',
      cta: 'Get Started',
      ctaLogged: 'Open Your Profile',
      quickActions: 'Quick Actions',
      actions: {
        createProfile: 'Create / Edit Profile',
        seeMusic: 'See Music',
        messages: 'Messages',
      },
      whyLizi: 'Why LIZI?',
      features: {
        collaborate: '🎤 Collaborate',
        collaborateDesc: 'Connect with artists and create amazing music together',
        discover: '🎵 Discover',
        discoverDesc: 'Find new talent and explore unique music in your genre',
        connect: '💬 Connect',
        connectDesc: 'Direct messaging with fellow musicians and producers',
        share: '🎧 Share',
        shareDesc: 'Showcase your work to the world and build your fanbase',
      },
    },

    // Login Page
    login: {
      title: 'Login',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      loginBtn: 'Login',
      noAccount: "Don't have an account?",
      signup: 'Sign up',
      orContinueWith: 'Or continue with',
      googleLogin: 'Continue with Google',
      googleSignup: 'Sign up with Google',
    },

    // Profile Page
    profile: {
      artistName: 'Artist Name',
      bio: 'Music Producer | Singer | Composer',
      aboutPlaceholder: 'Tell us about yourself',
      favoriteGenres: 'Favorite Genres',
      instruments: 'Instruments',
      createGoals: 'What do you want to create?',
      musicStyle: 'Music creation style',
      connectAges: 'Preferred Ages',
      lookingFor: 'Looking For',
      noPreference: 'Add your music preferences to connect with the right collaborators',
      noAboutYet: 'Write a short About section to introduce yourself',
      followers: 'Followers',
      following: 'Following',
      collaborations: 'Collaborations',
      recentWorks: 'Recent Works',
      collaboration: 'Collaboration',
      weeksAgo: 'weeks ago',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
    },

    // Messages Page
    messages: {
      title: 'Messages',
      searchConversations: 'Search conversations...',
      selectConversation: 'Select a conversation to start messaging',
      whatsappChat: 'WhatsApp',
      sendEmail: 'Email',
      whatsappGreeting: 'Hi, I\'d like to connect with you on LIZI!',
    },

    // Collaboration Page
    collaboration: {
      title: 'Collaboration Projects',
      newProject: '+ New Project',
      members: 'members',
      joinProject: 'Join Project',
      suggestedForYou: 'Suggested for you',
      updateProfile: 'Not matching? Update your profile',
      activeCollaborations: 'Your Active Collaborations',
      noCollaborations: 'No active collaborations yet. Create or join one to get started!',
    },

    // Search Page
    search: {
      title: 'Search LIZI',
      placeholder: 'Search artists, tracks, or producers...',
      resultsFor: 'Results for',
      followers: 'followers',
      plays: 'plays',
      follow: 'Follow',
    },

    // Open Stage Page
    openStage: {
      title: 'Open Stage - Discover Artists',
      subtitle: 'Explore emerging talent and upcoming artists',
      allGenres: 'All Genres',
      suggestedForYou: 'Suggested for you',
      updateProfile: 'Not matching? Update your profile',
      followers: 'followers',
      listenNow: 'Listen Now',
    },

    // About Page
    about: {
      title: 'About LIZI',
      subtitle: 'Empowering Musicians Worldwide',
      mission: 'Our Mission',
      missionDesc: 'LIZI is dedicated to democratizing music creation and distribution. We believe every musician deserves a platform to create, collaborate, and share their artistry with the world.',
      vision: 'Our Vision',
      visionDesc: 'To build a vibrant global community where amateur and professional musicians can collaborate, inspire each other, and create incredible music together.',
      values: 'Our Values',
      creativity: 'Creativity',
      creativetyDesc: 'We celebrate artistic expression in all its forms',
      community: 'Community',
      communityDesc: 'We foster connections between musicians worldwide',
      accessibility: 'Accessibility',
      accessibilityDesc: 'Quality music tools should be available to everyone',
      innovation: 'Innovation',
      innovationDesc: 'We continuously evolve to serve our musicians better',
    },
  },
  he: {
    // Navigation
    nav: {
      logo: '🎵 LIZI',
      home: 'בית',
      discover: 'גילוי',
      search: 'חיפוש',
      collaborate: 'שיתוף פעולה',
      messages: 'הודעות',
      profile: 'פרופיל',
      about: 'אודות',
    },

    // Home Page
    home: {
      title: 'ברוכים הבאים ל-LIZI',
      subtitle: 'פלטפורמת שיתוף פעולה למוזיקה שלך',
      cta: 'התחל עכשיו',
      ctaLogged: 'פתח/י את הפרופיל שלך',
      quickActions: 'פעולות מהירות',
      actions: {
        createProfile: 'צור/ערוך פרופיל',
        seeMusic: 'האזן למוזיקה',
        messages: 'הודעות',
      },
      whyLizi: 'למה LIZI?',
      features: {
        collaborate: '🎤 שיתוף פעולה',
        collaborateDesc: 'התחבר לאמנים וצור מוזיקה מדהימה ביחד',
        discover: '🎵 גילוי',
        discoverDesc: 'מצא כישרונות חדשים וחקור מוזיקה ייחודית בז\'אנר שלך',
        connect: '💬 התחברות',
        connectDesc: 'הודעות ישירות עם מוזיקאים ומפיקים אחרים',
        share: '🎧 שתף',
        shareDesc: 'הצג את עבודתך לעולם ובנה את קהל המעריצים שלך',
      },
    },

    // Login Page
    login: {
      title: 'התחברות',
      email: 'דוא"ל',
      emailPlaceholder: 'your@email.com',
      password: 'סיסמה',
      passwordPlaceholder: '••••••••',
      loginBtn: 'התחברות',
      noAccount: 'אין לך חשבון?',
      signup: 'הירשם',
      orContinueWith: 'או המשך עם',
      googleLogin: 'המשך עם Google',
      googleSignup: 'הירשם עם Google',
    },

    // Profile Page
    profile: {
      artistName: 'שם האמן',
      bio: 'מפיק מוזיקה | זמר | מלחין',
      aboutPlaceholder: 'ספר על עצמך',
      favoriteGenres: 'ז\'אנרים מועדפים',
      instruments: 'כלי נגינה',
      createGoals: 'מה תרצה/י ליצור?',
      musicStyle: 'סגנון מוזיקה ליצירה',
      connectAges: 'גילאים מועדפים',
      lookingFor: 'מחפש/ת קשר עם',
      noPreference: 'הוסיפו את העדפות המוזיקה שלכם כדי להתחבר לשיתופי פעולה נכונים',
      noAboutYet: 'כתבו פסקת אודות קצרה כדי להציג את עצמכם',
      followers: 'עוקבים',
      following: 'עוקב אחר',
      collaborations: 'שיתופי פעולה',
      recentWorks: 'עבודות אחרונות',
      collaboration: 'שיתוף פעולה',
      weeksAgo: 'שבועות',
      saveChanges: 'שמירה',
      cancel: 'ביטול',
    },

    // Messages Page
    messages: {
      title: 'הודעות',
      searchConversations: 'חפש שיחות...',
      selectConversation: 'בחר שיחה כדי להתחיל הודעות',
      whatsappChat: 'WhatsApp',
      sendEmail: 'דוא"ל',
      whatsappGreeting: 'היי, הייתי רוצה להתחבר איתך ב-LIZI!',
    },

    // Collaboration Page
    collaboration: {
      title: 'פרויקטי שיתוף פעולה',
      newProject: '+ פרויקט חדש',
      members: 'חברים',
      joinProject: 'הצטרף לפרויקט',
      suggestedForYou: 'מומלץ עבורך',
      updateProfile: 'לא מתאים? עדכן את הפרופיל שלך',
      activeCollaborations: 'שיתופי הפעולה הפעילים שלך',
      noCollaborations: 'אין שיתופי פעולה פעילים עדיין. צור או הצטרף לאחד כדי להתחיל!',
    },

    // Search Page
    search: {
      title: 'חפש ב-LIZI',
      placeholder: 'חפש אמנים, שירים או מפיקים...',
      resultsFor: 'תוצאות עבור',
      followers: 'עוקבים',
      plays: 'השמעות',
      follow: 'עקוב',
    },

    // Open Stage Page
    openStage: {
      title: 'Open Stage - גלה אמנים',
      subtitle: 'חקור כישרונות שיוצאים לדרך ואמנים קרובים',
      allGenres: 'כל הז\'אנרים',
      suggestedForYou: 'מומלץ עבורך',
      updateProfile: 'לא מתאים? עדכן את הפרופיל שלך',
      followers: 'עוקבים',
      listenNow: 'היוזן עכשיו',
    },

    // About Page
    about: {
      title: 'אודות LIZI',
      subtitle: 'הנעת מוזיקאים ברחבי העולם',
      mission: 'המשימה שלנו',
      missionDesc: 'LIZI מוקדשת לדמוקרטיזציה של יצירה וחלוקה של מוזיקה. אנחנו מאמינים שלכל מוזיקאי מגיע פלטפורמה ליצור, לשתף פעולה ולשתף את יצירתו עם העולם.',
      vision: 'החזון שלנו',
      visionDesc: 'לבנות קהילה גלובלית תוססת שבה מוזיקאים חובבים ומקצועיים יכולים לשתף פעולה, להשראות זה את זה ליצור מוזיקה מדהימה ביחד.',
      values: 'הערכים שלנו',
      creativity: 'יצירתיות',
      creativetyDesc: 'אנחנו חוגגים ביטוי אמנותי בכל הצורות שלו',
      community: 'קהילה',
      communityDesc: 'אנחנו טוענים חיבורים בין מוזיקאים ברחבי העולם',
      accessibility: 'נגישות',
      accessibilityDesc: 'כלים איכותיים למוזיקה צריכים להיות זמינים לכולם',
      innovation: 'חדשנות',
      innovationDesc: 'אנחנו מתפתחים כל הזמן כדי לשרת את המוזיקאים שלנו בצורה טובה יותר',
    },
  },
};

export default translations;
