import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, onValue, set, push, Database } from 'firebase/database';
import firebaseConfig from '../config/firebaseConfig';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Realtime Database
let rtdbInstance: Database | null = null;
try {
  rtdbInstance = getDatabase(app, firebaseConfig.databaseURL);
} catch (rtdbErr) {
  console.warn('Realtime Database initialization info:', rtdbErr);
}
export const rtdb = rtdbInstance;

// Realtime Database listeners & broadcast helpers
export interface RealtimeBroadcastAlert {
  id: string;
  type: 'urgent_missing' | 'found_person' | 'lost_item' | 'system_notice';
  title: string;
  message: string;
  timestamp: string;
  reportId?: string;
  active: boolean;
}

/**
 * Subscribe to Realtime Database broadcast alerts
 */
export function subscribeToRealtimeAlerts(callback: (alerts: RealtimeBroadcastAlert[]) => void) {
  if (!rtdb) {
    callback([]);
    return () => {};
  }

  const alertsRef = ref(rtdb, 'liveAlerts');
  return onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const list: RealtimeBroadcastAlert[] = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).filter(a => a.active);
    callback(list);
  }, (err) => {
    console.warn('Realtime database listener warning:', err);
    callback([]);
  });
}

/**
 * Push an urgent alert to Realtime Database
 */
export async function pushRealtimeAlert(alert: Omit<RealtimeBroadcastAlert, 'id'>): Promise<string | null> {
  if (!rtdb) return null;
  try {
    const alertsRef = ref(rtdb, 'liveAlerts');
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, alert);
    return newAlertRef.key;
  } catch (err) {
    console.warn('Error pushing realtime alert:', err);
    return null;
  }
}

// Operation types for error reporting per skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client appears offline. Checking configuration...');
    }
  }
}

testFirebaseConnection();
