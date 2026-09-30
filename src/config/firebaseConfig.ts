/**
 * Secure Firebase Configuration Module
 * 
 * Replaces hardcoded values from firebase-applet-config.json with 
 * process.env / import.meta.env environment variables to protect API keys.
 */

// Universal environment variable getter (supporting both Vite and Node.js)
const getEnvVar = (key: string): string => {
  // 1. Check Node.js / process.env (or Vite define shim)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // 2. Check Vite's import.meta.env
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  return '';
};

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  databaseURL: string;
  firestoreDatabaseId?: string;
}

export const firebaseConfig: FirebaseClientConfig = {
  // Google / Firebase API Key loaded strictly from environment variable
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || getEnvVar('FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || getEnvVar('FIREBASE_AUTH_DOMAIN') || 'nikhoj-alert.firebaseapp.com',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || getEnvVar('FIREBASE_PROJECT_ID') || 'nikhoj-alert',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || getEnvVar('FIREBASE_STORAGE_BUCKET') || 'nikhoj-alert.firebasestorage.app',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || getEnvVar('FIREBASE_MESSAGING_SENDER_ID') || '141430368303',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || getEnvVar('FIREBASE_APP_ID') || '1:141430368303:web:83d3398415d9308fba3eda',
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID') || getEnvVar('FIREBASE_MEASUREMENT_ID') || '',
  databaseURL: getEnvVar('VITE_FIREBASE_DATABASE_URL') || getEnvVar('FIREBASE_DATABASE_URL') || 'https://nikhoj-alert-default-rtdb.asia-southeast1.firebasedatabase.app/',
  firestoreDatabaseId: getEnvVar('VITE_FIREBASE_FIRESTORE_DATABASE_ID') || getEnvVar('FIREBASE_FIRESTORE_DATABASE_ID') || '(default)',
};

export default firebaseConfig;
