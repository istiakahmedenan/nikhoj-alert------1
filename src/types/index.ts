export type ReportType = 'missing_person' | 'found_person' | 'lost_item' | 'found_item';
export type ReportStatus = 'pending' | 'approved' | 'resolved' | 'rejected' | 'archived';
export type VerificationStatus = 'verified' | 'unverified' | 'investigating';

export interface ReportItem {
  id: string; // Firestore document ID
  reportId: string; // Human-friendly e.g. NA-2026-000001
  type: ReportType;
  category: string;
  title: string;
  name?: string;
  nickname?: string;
  age?: string | number;
  gender?: 'male' | 'female' | 'other' | '';
  photos: string[];
  description: string;
  division: string;
  district: string;
  upazila: string;
  location: string;
  incidentDate: string;
  incidentTime?: string;
  clothing?: string;
  physicalDescription?: string;
  identificationMarks?: string;
  contactName: string;
  contactPhone: string;
  contactMethod?: string;
  status: ReportStatus;
  verificationStatus: VerificationStatus;
  isPublished: boolean;
  isUrgent: boolean;
  isFeatured: boolean;
  isDemo?: boolean;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SightingItem {
  id: string;
  sightingId: string;
  reportId: string;
  name?: string;
  phone: string;
  location: string;
  district: string;
  upazila?: string;
  date: string;
  time?: string;
  description: string;
  photo?: string;
  status: 'new' | 'reviewed' | 'verified' | 'dismissed';
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  priority: 'normal' | 'urgent' | 'pinned';
  isPublished: boolean;
  isPinned: boolean;
  createdAt: string;
  expiresAt?: string;
  createdBy?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'moderator' | 'content_manager' | 'support';
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  reportId?: string;
  details?: string;
  timestamp: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutText: string;
  founderName: string;
  founderBio: string;
  founderMessage: string;
  founderPhoto: string;
  contactEmail: string;
  facebookPage: string;
  facebookProfile: string;
  updatedAt?: string;
}

export interface ContactRequest {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'correction' | 'abuse' | 'removal' | 'general';
  reportId?: string;
  message: string;
  status: 'pending' | 'processed' | 'dismissed';
  createdAt: string;
}

export interface FaceMatchResult {
  report: ReportItem;
  similarityScore: number; // 0 to 100
  analysisReason: string;
  matchedFeatures: string[];
}
