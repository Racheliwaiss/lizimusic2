# Google OAuth Setup Guide

## 🔐 How to Enable Google Sign-In for LIZI

Follow these steps to add Google Sign-In authentication to your LIZI platform.

### Step 1: Create a Google OAuth Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"NEW PROJECT"**
3. Enter project name (e.g., "LIZI Music")
4. Click **"Create"**

### Step 2: Enable Google Sign-In API

1. In the Cloud Console, search for **"Google+ API"**
2. Click **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"Credentials"** in the left sidebar
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. You may need to configure the OAuth consent screen first:
   - Click **"Configure Consent Screen"**
   - Choose **"External"**
   - Fill in app name, email, and other required fields
   - Add your domain to authorized domains
   - Save and continue
4. Back to credentials, select **"OAuth client ID"**
5. Choose **"Web application"**
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (for local development)
   - `https://yourdomain.com` (for production)
7. Add **Authorized redirect URIs**:
   - `http://localhost:5173` (for local development)
   - `https://yourdomain.com` (for production)
8. Click **"Create"**
9. Copy your **Client ID**

### Step 4: Add Client ID to LIZI

1. Open `src/pages/Login.jsx`
2. Find this line (around line 25):
   ```javascript
   client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID from Step 3

### Step 5: Test Google Sign-In

1. Run your app: `npm run dev`
2. Go to the login page
3. Click the **"Sign up with Google"** button
4. Authenticate with your Google account
5. You'll be automatically logged in and redirected to your profile!

## 🚀 Features

✅ **Sign Up with Google** - New users can create accounts instantly
✅ **Login with Google** - Existing users can log in with one click
✅ **Auto-fill Profile** - Name and profile picture are pulled from Google
✅ **Persistent Session** - Login info is saved in localStorage
✅ **Bilingual Support** - Works with both English and Hebrew

## 📝 Notes

- The Google Client ID should be kept private in production
- For production, use environment variables:
  ```javascript
  client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
  ```
- Update your Google Cloud project domain as your app grows

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
