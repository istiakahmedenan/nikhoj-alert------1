# Nikhoj Alert (নিখোঁজ অ্যালার্ট)
### নিখোঁজ মানুষ ও হারানো জিনিসের খোঁজে, একসাথে পুরো বাংলাদেশ।

Official Production Domain: **https://nikhojalert.online**  
Admin Subdomain: **https://admin.nikhojalert.online**  
Official Contact Email: **nikhojalert.info@gmail.com**  
Official Facebook Page: **https://www.facebook.com/NikhojAlert.online**  
Founder & CEO: **Istiak Ahmed Enan**

---

## 1. Overview
Nikhoj Alert is a national-scale public information and alert platform for missing persons, found individuals, lost items, and recovered belongings across Bangladesh. Built with **React 19**, **Vite**, **Tailwind CSS**, and powered by **Google Cloud Firebase** (Authentication, Cloud Firestore, Cloud Storage, Security Rules, and Cloud Functions).

---

## 2. Complete Firebase Deployment Guide

Follow these steps to deploy and manage Nikhoj Alert in production:

### Step 1: Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `nikhoj-alert` (or choose your preferred ID), and select your Google Cloud organization/region.

### Step 2: Enable Authentication
1. Navigate to **Build > Authentication > Sign-in method**.
2. Enable **Google** provider (add support email e.g. `nikhojalert.info@gmail.com` or `enanahmed776@gmail.com`).
3. Enable **Email/Password** provider for administrative accounts.

### Step 3: Enable Firestore Database
1. Navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose location closest to Bangladesh (e.g. `asia-southeast1` Singapore or `asia-south1` Mumbai).
4. Start in **Production mode** (Security rules will be deployed in Step 5).

### Step 4: Enable Cloud Storage
1. Navigate to **Build > Storage**.
2. Click **Get Started**, choose standard storage bucket location, and finish setup.

### Step 5: Deploy Security Rules
Deploy the provided hardened zero-trust rules from project root:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Step 6: Deploy Firestore Indexes
Deploy composite queries defined in `firestore.indexes.json`:
```bash
firebase deploy --only firestore:indexes
```

### Step 7: Configure Environment Variables
Copy `.env.example` to `.env.local` or configure in your deployment hosting:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="nikhoj-alert.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="nikhoj-alert"
VITE_FIREBASE_STORAGE_BUCKET="nikhoj-alert.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="1:...:web:..."
```

### Step 8: Create First Admin Account
1. In Firebase Console > Authentication > Users, click **Add user**.
2. Enter the Founder & Super Admin email: `enanahmed776@gmail.com` and set a secure password (or sign in with Google).

### Step 9: Assign Admin Role / Custom Claims Securely
The security rules automatically grant Super Admin privileges to `enanahmed776@gmail.com`. You can also run the Cloud Function:
```bash
firebase deploy --only functions
```
Or execute in Firebase CLI:
```javascript
admin.auth().setCustomUserClaims('<SUPER_ADMIN_UID>', { role: 'super_admin', admin: true });
```

### Step 10: Build & Deploy Frontend
Build production bundle:
```bash
npm run build
firebase deploy --only hosting
```

### Step 11: Configure Custom Domain (Public Website)
1. Go to **Firebase Console > Hosting > Custom domains**.
2. Add `nikhojalert.online` and `www.nikhojalert.online`.
3. Add the provided DNS TXT / A records in your domain registrar (e.g. Cloudflare / Namecheap).
4. SSL certificate will automatically provision.

### Step 12: Deploy Admin Subdomain
1. In Firebase Hosting, add another target or custom domain `admin.nikhojalert.online`.
2. Map to the same hosting site with `/` routing to the secure Admin entrypoint.

---

## 3. Security Highlights
- **No Plaintext Passwords / Admin Secrets:** Admin access strictly validated via Firebase Authentication & server-side Firestore security rules.
- **Zero-Trust Rules:** Public submissions default to `status: "pending"`, `isPublished: false`. Only authorized administrators can publish, update, or resolve.
- **Sightings Protection:** Citizen eyewitness clues are stored in `/sightings` with private admin-only read rules to protect witness identity.
- **AI Face Privacy:** Temporary biometric feature calculations with mandatory legal disclaimer: *"এটি সম্ভাব্য মিল, চূড়ান্ত পরিচয় নয়।"*

---
© 2026 Nikhoj Alert. All rights reserved.
