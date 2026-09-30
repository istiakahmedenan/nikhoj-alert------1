import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration loaded directly from process.env to protect credentials
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'nikhoj-alert',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || 'nikhoj-alert.firebaseapp.com',
  firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
};

// Super admin email - bootstrapped owner
const SUPER_ADMIN_EMAIL = 'enanahmed776@gmail.com';

/**
 * Cryptographically verify Firebase ID token using Google Identity Toolkit API
 */
async function verifyFirebaseToken(idToken: string) {
  const apiKey = firebaseConfig.apiKey;
  if (!apiKey) {
    throw new Error('Firebase API key missing on server');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) {
    const errorJson: any = await response.json().catch(() => ({}));
    const message = errorJson.error?.message || 'Invalid or expired Firebase ID token';
    throw new Error(message);
  }

  const data: any = await response.json();
  const user = data.users?.[0];
  if (!user) {
    throw new Error('User not found in Firebase project');
  }

  // Check roles:
  // 1. Bootstrapped Super Admin
  const userEmail = (user.email || '').toLowerCase().trim();
  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase().trim();

  let isFirestoreAdmin = false;
  let adminRole = isSuperAdmin ? 'super_admin' : 'viewer';

  // 2. Check if registered in Firestore 'admins' collection
  if (!isSuperAdmin && user.localId && firebaseConfig.projectId && firebaseConfig.firestoreDatabaseId) {
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/admins/${user.localId}`;
      const fsRes = await fetch(firestoreUrl, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (fsRes.ok) {
        const doc: any = await fsRes.json();
        if (doc && doc.fields) {
          isFirestoreAdmin = true;
          adminRole = doc.fields.role?.stringValue || 'moderator';
        }
      }
    } catch (fsErr) {
      console.warn('Firestore admin lookup warning:', fsErr);
    }
  }

  const isAuthorized = isSuperAdmin || isFirestoreAdmin;

  return {
    valid: true,
    authorized: isAuthorized,
    user: {
      uid: user.localId,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      emailVerified: Boolean(user.emailVerified),
      photoUrl: user.photoUrl,
      role: adminRole,
      isSuperAdmin,
    },
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side authentication check endpoint
  app.post('/api/admin/verify-session', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const idToken = authHeader?.startsWith('Bearer ')
        ? authHeader.split('Bearer ')[1]
        : req.body?.idToken;

      if (!idToken) {
        return res.status(401).json({
          authorized: false,
          error: 'No Firebase authentication token provided in request header',
        });
      }

      const result = await verifyFirebaseToken(idToken);

      if (!result.authorized) {
        return res.status(403).json({
          authorized: false,
          user: result.user,
          error: 'Access Denied: You do not possess administrative permissions for Nikhoj Alert.',
        });
      }

      return res.status(200).json({
        authorized: true,
        user: result.user,
        role: result.user.role,
        verifiedAt: new Date().toISOString(),
        projectId: firebaseConfig.projectId,
      });
    } catch (err: any) {
      console.warn('Admin token verification error:', err.message);
      return res.status(401).json({
        authorized: false,
        error: err.message || 'Authentication session verification failed',
      });
    }
  });

  // Health and config status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      serverTime: new Date().toISOString(),
      superAdminConfigured: true,
    });
  });

  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
