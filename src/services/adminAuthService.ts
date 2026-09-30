import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export type AdminAuthServerStatus = 'idle' | 'verifying' | 'authorized' | 'denied';

export interface AdminVerificationResult {
  authorized: boolean;
  role?: string;
  user?: {
    uid: string;
    email: string;
    displayName: string;
    role: string;
    isSuperAdmin?: boolean;
  };
  error?: string;
}

// In-memory verification cache to prevent redundant HTTP roundtrips
let cachedVerification: {
  result: AdminVerificationResult;
  timestamp: number;
  token: string;
} | null = null;

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache for verified session

/**
 * Verify current Firebase Authentication session with the backend server.
 * Requires a cryptographically valid Firebase ID token with approved admin roles.
 */
export async function verifyAdminSessionWithServer(forceRefresh = false): Promise<AdminVerificationResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    cachedVerification = null;
    return {
      authorized: false,
      error: 'কোনো সক্রিয় ফায়ারবেস অথেন্টিকেশন সেশন নেই।',
    };
  }

  try {
    // Obtain fresh Firebase ID Token from client SDK
    const idToken = await currentUser.getIdToken(forceRefresh);

    // Check cache
    if (
      !forceRefresh &&
      cachedVerification &&
      cachedVerification.token === idToken &&
      Date.now() - cachedVerification.timestamp < CACHE_TTL_MS
    ) {
      return cachedVerification.result;
    }

    // Call server-side verification endpoint
    const response = await fetch('/api/admin/verify-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.authorized) {
      cachedVerification = null;
      return {
        authorized: false,
        error: data.error || 'অ্যাডমিন অধিকার মেলেনি। প্রবেশাধিকার প্রত্যাখ্যাত।',
      };
    }

    const verificationResult: AdminVerificationResult = {
      authorized: true,
      role: data.role || data.user?.role || 'super_admin',
      user: data.user,
    };

    cachedVerification = {
      result: verificationResult,
      timestamp: Date.now(),
      token: idToken,
    };

    return verificationResult;
  } catch (error: any) {
    console.error('Server-side admin verification failed:', error);
    cachedVerification = null;
    return {
      authorized: false,
      error: error.message || 'সার্ভার নিরাপত্তা যাচাইয়ে ত্রুটি ঘটেছে।',
    };
  }
}

/**
 * Invalidate cached admin session
 */
export function clearAdminSessionCache() {
  cachedVerification = null;
}

/**
 * Securely logs out the admin and clears server session cache
 */
export async function logoutAdminSession(): Promise<void> {
  clearAdminSessionCache();
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
}
