import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ReportItem, SightingItem, ReportType, ReportStatus, ContactRequest, AnnouncementItem, SiteSettings } from '../types';
import { INITIAL_DEMO_REPORTS, INITIAL_DEMO_ANNOUNCEMENTS, INITIAL_SITE_SETTINGS } from '../data/demoData';

const REPORTS_COLLECTION = 'reports';
const SIGHTINGS_COLLECTION = 'sightings';
const CONTACT_COLLECTION = 'contactRequests';
const AUDIT_COLLECTION = 'auditLogs';
const ANNOUNCEMENTS_COLLECTION = 'announcements';

// Generate human-friendly Report ID e.g. NA-2026-000123
export function generateReportId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `NA-${year}-${randomNum}`;
}

export function generateSightingId(): string {
  return `SG-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Fetch all published reports for public website
export async function getPublishedReports(options?: {
  type?: ReportType | 'all';
  district?: string;
  isUrgent?: boolean;
  limitCount?: number;
}): Promise<ReportItem[]> {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    let q = query(reportsRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'));

    if (options?.isUrgent) {
      q = query(reportsRef, where('isPublished', '==', true), where('isUrgent', '==', true), orderBy('createdAt', 'desc'));
    }

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const snapshot = await getDocs(q);
    const reports: ReportItem[] = [];
    
    snapshot.forEach(docSnap => {
      reports.push({ id: docSnap.id, ...(docSnap.data() as Omit<ReportItem, 'id'>) });
    });

    // If Firestore has no documents yet, return the marked demo data for immediate rich UX
    if (reports.length === 0) {
      let filtered = [...INITIAL_DEMO_REPORTS];
      if (options?.type && options.type !== 'all') {
        filtered = filtered.filter(r => r.type === options.type);
      }
      if (options?.district) {
        filtered = filtered.filter(r => r.district.toLowerCase() === options.district?.toLowerCase());
      }
      if (options?.isUrgent) {
        filtered = filtered.filter(r => r.isUrgent);
      }
      return filtered;
    }

    // Client-side filtering for type/district if queried together to avoid composite index bottlenecks
    let result = reports;
    if (options?.type && options.type !== 'all') {
      result = result.filter(r => r.type === options.type);
    }
    if (options?.district) {
      result = result.filter(r => r.district.toLowerCase() === options.district?.toLowerCase());
    }

    return result;
  } catch (error) {
    console.error('Error fetching published reports:', error);
    // Safe fallback to demo data if offline or rule in transition
    return INITIAL_DEMO_REPORTS;
  }
}

// Subscribe to real-time published reports
export function subscribeToPublishedReports(
  callback: (reports: ReportItem[]) => void,
  errorCallback?: (error: unknown) => void
) {
  try {
    const q = query(collection(db, REPORTS_COLLECTION), where('isPublished', '==', true), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(INITIAL_DEMO_REPORTS);
        } else {
          const list: ReportItem[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...(d.data() as Omit<ReportItem, 'id'>) }));
          callback(list);
        }
      },
      (err) => {
        console.warn('Realtime subscription fallback:', err);
        callback(INITIAL_DEMO_REPORTS);
        if (errorCallback) errorCallback(err);
      }
    );
  } catch (error) {
    callback(INITIAL_DEMO_REPORTS);
    return () => {};
  }
}

// Fetch single report by human reportId or document id
export async function getReportById(identifier: string): Promise<ReportItem | null> {
  try {
    // Check if directly a doc ID
    const docRef = doc(db, REPORTS_COLLECTION, identifier);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<ReportItem, 'id'>) };
    }

    // Search by reportId field
    const q = query(collection(db, REPORTS_COLLECTION), where('reportId', '==', identifier), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...(d.data() as Omit<ReportItem, 'id'>) };
    }

    // Search in demo data
    const demo = INITIAL_DEMO_REPORTS.find(r => r.id === identifier || r.reportId === identifier);
    return demo || null;
  } catch (error) {
    const demo = INITIAL_DEMO_REPORTS.find(r => r.id === identifier || r.reportId === identifier);
    return demo || null;
  }
}

// Submit a new citizen report (strictly pending and unverified until Admin review)
export async function submitPublicReport(reportData: Omit<ReportItem, 'id' | 'reportId' | 'status' | 'verificationStatus' | 'isPublished' | 'isUrgent' | 'isFeatured' | 'isDemo' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; reportId: string }> {
  const reportId = generateReportId();
  const docId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const newReport: ReportItem = {
    ...reportData,
    id: docId,
    reportId,
    status: 'pending',
    verificationStatus: 'unverified',
    isPublished: false,
    isUrgent: false,
    isFeatured: false,
    isDemo: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, REPORTS_COLLECTION, docId), newReport);
    return { success: true, reportId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${REPORTS_COLLECTION}/${docId}`);
  }
}

// Admin: Fetch all reports (including pending, rejected, archived)
export async function getAllReportsForAdmin(): Promise<ReportItem[]> {
  // Strict Firebase Auth Session enforcement
  if (!auth.currentUser) {
    console.warn('Unauthorized attempt to read admin reports: No active Firebase Auth session');
    return [];
  }

  try {
    const snapshot = await getDocs(query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc')));
    if (snapshot.empty) {
      return [];
    }
    const list: ReportItem[] = [];
    snapshot.forEach(d => list.push({ id: d.id, ...(d.data() as Omit<ReportItem, 'id'>) }));
    return list;
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    return [];
  }
}

// Admin: Update report status (Approve, Reject, Resolve, Feature, Urgent)
export async function updateReportByAdmin(
  reportDocId: string, 
  updates: Partial<ReportItem>, 
  adminEmail: string
): Promise<void> {
  const path = `${REPORTS_COLLECTION}/${reportDocId}`;
  try {
    const ref = doc(db, REPORTS_COLLECTION, reportDocId);
    const existingSnap = await getDoc(ref);
    let fullPayload: any = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (!existingSnap.exists()) {
      // Find if it was a demo report in memory
      const demoItem = INITIAL_DEMO_REPORTS.find(r => r.id === reportDocId || r.reportId === reportDocId);
      if (demoItem) {
        fullPayload = {
          ...demoItem,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    }

    await setDoc(ref, fullPayload, { merge: true });

    // Write audit log safely
    try {
      await setDoc(doc(collection(db, AUDIT_COLLECTION)), {
        adminEmail,
        action: 'UPDATE_REPORT',
        reportId: reportDocId,
        details: JSON.stringify(updates),
        timestamp: new Date().toISOString()
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Admin: Delete a report
export async function deleteReportByAdmin(reportDocId: string, adminEmail: string): Promise<void> {
  const path = `${REPORTS_COLLECTION}/${reportDocId}`;
  try {
    await deleteDoc(doc(db, REPORTS_COLLECTION, reportDocId));
    // Write audit log
    await setDoc(doc(collection(db, AUDIT_COLLECTION)), {
      adminEmail,
      action: 'DELETE_REPORT',
      reportId: reportDocId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Submit a sighting (Citizens providing clues, private to Admins)
export async function submitSighting(sighting: Omit<SightingItem, 'id' | 'sightingId' | 'status' | 'createdAt'>): Promise<{ success: boolean; sightingId: string }> {
  const sightingId = generateSightingId();
  const docId = `sg_${Date.now()}`;
  const now = new Date().toISOString();

  const data: SightingItem = {
    ...sighting,
    id: docId,
    sightingId,
    status: 'new',
    createdAt: now
  };

  try {
    await setDoc(doc(db, SIGHTINGS_COLLECTION, docId), data);
    return { success: true, sightingId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${SIGHTINGS_COLLECTION}/${docId}`);
  }
}

// Admin: Fetch all sightings
export async function getSightingsForAdmin(): Promise<SightingItem[]> {
  // Strict Firebase Auth Session enforcement
  if (!auth.currentUser) {
    console.warn('Unauthorized attempt to read sightings: No active Firebase Auth session');
    return [];
  }

  try {
    const snapshot = await getDocs(query(collection(db, SIGHTINGS_COLLECTION), orderBy('createdAt', 'desc')));
    const list: SightingItem[] = [];
    snapshot.forEach(d => list.push({ id: d.id, ...(d.data() as Omit<SightingItem, 'id'>) }));
    return list;
  } catch (error) {
    console.error('Error fetching sightings:', error);
    return [];
  }
}

// Contact / Correction / Abuse request
export async function submitContactRequest(req: Omit<ContactRequest, 'id' | 'status' | 'createdAt'>): Promise<void> {
  const docId = `req_${Date.now()}`;
  try {
    await setDoc(doc(db, CONTACT_COLLECTION, docId), {
      ...req,
      id: docId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${CONTACT_COLLECTION}/${docId}`);
  }
}

// Calculate live aggregate stats from reports
export async function getLiveStatistics(): Promise<{
  totalReports: number;
  missingPersons: number;
  foundPersons: number;
  lostItems: number;
  foundItems: number;
  resolvedReports: number;
  urgentReports: number;
}> {
  try {
    const snapshot = await getDocs(query(collection(db, REPORTS_COLLECTION)));
    if (snapshot.empty) {
      // Use demo counts
      return {
        totalReports: INITIAL_DEMO_REPORTS.length,
        missingPersons: INITIAL_DEMO_REPORTS.filter(r => r.type === 'missing_person').length,
        foundPersons: INITIAL_DEMO_REPORTS.filter(r => r.type === 'found_person').length,
        lostItems: INITIAL_DEMO_REPORTS.filter(r => r.type === 'lost_item').length,
        foundItems: INITIAL_DEMO_REPORTS.filter(r => r.type === 'found_item').length,
        resolvedReports: INITIAL_DEMO_REPORTS.filter(r => r.status === 'resolved').length,
        urgentReports: INITIAL_DEMO_REPORTS.filter(r => r.isUrgent).length,
      };
    }

    let total = 0;
    let missing = 0;
    let found = 0;
    let lost = 0;
    let foundItem = 0;
    let resolved = 0;
    let urgent = 0;

    snapshot.forEach(d => {
      const data = d.data() as ReportItem;
      total++;
      if (data.type === 'missing_person') missing++;
      if (data.type === 'found_person') found++;
      if (data.type === 'lost_item') lost++;
      if (data.type === 'found_item') foundItem++;
      if (data.status === 'resolved') resolved++;
      if (data.isUrgent) urgent++;
    });

    return {
      totalReports: total,
      missingPersons: missing,
      foundPersons: found,
      lostItems: lost,
      foundItems: foundItem,
      resolvedReports: resolved,
      urgentReports: urgent,
    };
  } catch (error) {
    return {
      totalReports: INITIAL_DEMO_REPORTS.length,
      missingPersons: 3,
      foundPersons: 1,
      lostItems: 1,
      foundItems: 1,
      resolvedReports: 1,
      urgentReports: 2,
    };
  }
}

// Admin: Directly create a verified report (offline / phone intake)
export async function createReportByAdmin(
  reportData: Omit<ReportItem, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>,
  adminEmail: string
): Promise<{ success: boolean; reportId: string; docId: string }> {
  const reportId = generateReportId();
  const docId = `rep_adm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const newReport: ReportItem = {
    ...reportData,
    id: docId,
    reportId,
    createdBy: adminEmail,
    createdAt: now,
    updatedAt: now,
  };

  const path = `${REPORTS_COLLECTION}/${docId}`;
  try {
    await setDoc(doc(db, REPORTS_COLLECTION, docId), newReport);

    // Audit log
    await setDoc(doc(collection(db, AUDIT_COLLECTION)), {
      adminEmail,
      action: 'ADMIN_CREATE_REPORT',
      reportId: docId,
      details: `Created report ${reportId} directly: ${newReport.title}`,
      timestamp: now
    });

    return { success: true, reportId, docId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Announcements: Fetch all (public or admin)
export async function getAnnouncements(): Promise<AnnouncementItem[]> {
  try {
    const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return INITIAL_DEMO_ANNOUNCEMENTS;
    }
    const list: AnnouncementItem[] = [];
    snapshot.forEach(d => list.push({ id: d.id, ...(d.data() as Omit<AnnouncementItem, 'id'>) }));
    return list;
  } catch (e) {
    console.warn('Fallback to demo announcements:', e);
    return INITIAL_DEMO_ANNOUNCEMENTS;
  }
}

// Admin: Create announcement
export async function createAnnouncement(
  data: Omit<AnnouncementItem, 'id' | 'createdAt'>,
  adminEmail: string
): Promise<string> {
  const docId = `ann_${Date.now()}`;
  const now = new Date().toISOString();
  const payload: AnnouncementItem = {
    ...data,
    id: docId,
    createdBy: adminEmail,
    createdAt: now
  };
  const path = `${ANNOUNCEMENTS_COLLECTION}/${docId}`;
  try {
    await setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, docId), payload);
    // Audit log
    await setDoc(doc(collection(db, AUDIT_COLLECTION)), {
      adminEmail,
      action: 'CREATE_ANNOUNCEMENT',
      reportId: docId,
      details: payload.title,
      timestamp: now
    });
    return docId;
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
}

// Admin: Update announcement
export async function updateAnnouncement(
  announcementId: string,
  updates: Partial<AnnouncementItem>,
  adminEmail: string
): Promise<void> {
  const path = `${ANNOUNCEMENTS_COLLECTION}/${announcementId}`;
  try {
    const ref = doc(db, ANNOUNCEMENTS_COLLECTION, announcementId);
    await setDoc(ref, updates, { merge: true });
    // Audit log
    await setDoc(doc(collection(db, AUDIT_COLLECTION)), {
      adminEmail,
      action: 'UPDATE_ANNOUNCEMENT',
      reportId: announcementId,
      details: JSON.stringify(updates),
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
}

// Admin: Delete announcement
export async function deleteAnnouncement(
  announcementId: string,
  adminEmail: string
): Promise<void> {
  const path = `${ANNOUNCEMENTS_COLLECTION}/${announcementId}`;
  try {
    await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, announcementId));
    // Audit log
    await setDoc(doc(collection(db, AUDIT_COLLECTION)), {
      adminEmail,
      action: 'DELETE_ANNOUNCEMENT',
      reportId: announcementId,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

// Seed Demo Data directly into Firestore
export async function seedDemoDataToFirestore(): Promise<number> {
  let seededCount = 0;
  for (const report of INITIAL_DEMO_REPORTS) {
    try {
      await setDoc(doc(db, REPORTS_COLLECTION, report.id), report, { merge: true });
      seededCount++;
    } catch (e) {
      console.warn('Could not seed item:', report.id, e);
    }
  }

  // Seed sample announcements as well
  for (const ann of INITIAL_DEMO_ANNOUNCEMENTS) {
    try {
      await setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, ann.id), ann, { merge: true });
    } catch (e) {}
  }

  return seededCount;
}

// Clear all demo data from Firestore (Admin action)
export async function clearAllDemoDataFromFirestore(): Promise<number> {
  try {
    const q = query(collection(db, REPORTS_COLLECTION), where('isDemo', '==', true));
    const snapshot = await getDocs(q);
    let deletedCount = 0;
    for (const d of snapshot.docs) {
      await deleteDoc(d.ref);
      deletedCount++;
    }
    return deletedCount;
  } catch (e) {
    console.error('Error clearing demo data:', e);
    return 0;
  }
}

// Site Settings helpers
const SETTINGS_DOC_ID = 'site_settings';
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC_ID));
    if (snap.exists()) {
      return { ...INITIAL_SITE_SETTINGS, ...(snap.data() as SiteSettings) };
    }
  } catch (e) {
    console.warn('Could not fetch settings:', e);
  }
  return INITIAL_SITE_SETTINGS;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>, adminEmail: string): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Error saving site settings:', e);
  }
}
