# Farewell Website 🌙✦

A personalized, immersive farewell experience for your college department batch. Each senior enters via a unique code and gets their own journey — memories, an autograph wall, and a digital autograph book.

---

## Features

- **Entry Screen** — Unique 6-character code for each senior, Three.js particle background
- **Personal Landing** — Name, profile photo, class info
- **Memory Scroll** — Shared & personal photo memories with GSAP scroll animations
- **Autograph Wall** — Write messages to classmates (admin can open/close)
- **Autograph Book** — 3D page-flip book with all messages received (swipe on mobile)
- **PDF Download** — Download your autograph book as a formatted PDF
- **Admin Panel** — Manage seniors, memories, settings, view all messages

---

## Setup Guide

### 1. Clone / Download
```bash
git clone <your-repo-url>
cd farewell
```

### 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** → enter a name → Create
3. Enable **Firestore Database** (Start in test mode for development)
4. Enable **Firebase Storage** (Start in test mode for development)
5. Go to **Project Settings → General → Your apps → Web** and register a web app
6. Copy the `firebaseConfig` object

### 3. Configure Firebase

Open `firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### 4. Firestore Security Rules

Go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Settings: public read, no write
    match /settings/{doc} {
      allow read: if true;
      allow write: if false;
    }

    // Seniors: public read (name+photo only), no write
    match /seniors/{id} {
      allow read: if true;
      allow write: if false;
    }

    // Memories: public read, no write
    match /memories/{id} {
      allow read: if true;
      allow write: if false;
    }

    // Messages: public read/write (restrict further for production)
    match /messages/{id} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ For production, restrict write access to admin only via Firebase Auth.

### 5. Storage Rules

Go to **Storage → Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;  // admin uploads only via console initially
    }
  }
}
```

### 6. Add Your First Senior (via Admin Panel)

1. Open `admin.html` in your browser
2. Default password: `farewell2025admin` (change this in `admin.html` line ~10)
3. Go to **Seniors** tab → fill in name, department, year, upload photo
4. A unique 6-character code is auto-generated — copy and share with the senior

### 7. Configure Site Settings

In the Admin Panel → **Settings** tab:
- Set Department Name and Batch Year
- These are displayed site-wide on the entry screen

### 8. Upload Memories

In **Memories** tab:
- Select target: **Shared** (all seniors see) or a specific senior
- Upload one or more photos with an optional caption

### 9. Open the Autograph Wall

In **Settings** tab, toggle **"Allow seniors to write messages"** to **OPEN** on the day of your event.

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project folder
vercel
```
All files are static — no build step needed.

### Netlify
1. Drag and drop the project folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Or connect your GitHub repo for auto-deploy

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## File Structure

```
farewell/
├── index.html          # Main site (all 6 sections)
├── admin.html          # Admin panel
├── style.css           # All styles (mobile-first)
├── main.js             # Frontend logic (Three.js, GSAP, Firebase, PDF)
├── firebase-config.js  # Firebase initialization
└── README.md           # This file
```

---

## Customization

| What | Where |
|------|-------|
| Admin password | `admin.html` line with `ADMIN_PASSWORD` |
| Color palette | `style.css` `:root` CSS variables |
| Particle count | `main.js` `getParticleCount()` function |
| Max message length | `index.html` `maxlength="500"` on textarea |
| PDF filename format | `main.js` `generatePDF()` function |

---

## Browser Support
Chrome, Firefox, Safari, Edge (latest 2 versions). Three.js requires WebGL support.

## Performance Notes
- Images lazy-loaded via `IntersectionObserver`
- Particle count automatically reduced on mobile
- PDF generation runs async to avoid blocking UI
- Firestore uses one-time `getDocs` except for autograph-wall open/close toggle (`onSnapshot`)
