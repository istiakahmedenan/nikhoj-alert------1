import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  Star, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Search, 
  Database, 
  RefreshCw, 
  Sliders, 
  ArrowLeft,
  Edit,
  Megaphone,
  Pin,
  Image as ImageIcon,
  UserCheck,
  Save,
  Loader2
} from 'lucide-react';
import { ReportItem, SightingItem, SiteSettings, ReportType, AnnouncementItem } from '../types';
import { 
  updateReportByAdmin, 
  deleteReportByAdmin, 
  seedDemoDataToFirestore, 
  clearAllDemoDataFromFirestore,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../services/reportService';
import { INITIAL_DEMO_ANNOUNCEMENTS } from '../data/demoData';
import { AdminEditReportModal } from './AdminEditReportModal';
import { AdminCreateReportModal } from './AdminCreateReportModal';
import { auth, pushRealtimeAlert } from '../lib/firebase';

interface AdminDashboardProps {
  reports: ReportItem[];
  sightings: SightingItem[];
  settings: SiteSettings;
  adminEmail: string;
  adminRole?: string;
  onLogout: () => void;
  onBackToPublicSite: () => void;
  onRefreshData: () => void;
  onOpenCreateReport: () => void;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  sightings,
  settings,
  adminEmail,
  adminRole = 'super_admin',
  onLogout,
  onBackToPublicSite,
  onRefreshData,
  onOpenCreateReport,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'sightings' | 'announcements' | 'cms'>('overview');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'approved' | 'resolved' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Edit Report Modal state
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_DEMO_ANNOUNCEMENTS);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDesc, setNewNoticeDesc] = useState('');
  const [newNoticeImage, setNewNoticeImage] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<'normal' | 'urgent' | 'pinned'>('normal');
  const [isNewNoticePinned, setIsNewNoticePinned] = useState(false);
  const [submittingNotice, setSubmittingNotice] = useState(false);

  // Editable CMS State
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle);
  const [aboutText, setAboutText] = useState(settings.aboutText);
  const [founderName, setFounderName] = useState(settings.founderName);
  const [founderBio, setFounderBio] = useState(settings.founderBio);
  const [founderMessage, setFounderMessage] = useState(settings.founderMessage);
  const [founderPhoto, setFounderPhoto] = useState(settings.founderPhoto);
  const [savingCms, setSavingCms] = useState(false);

  // Load announcements
  const loadAnnouncementsList = async () => {
    try {
      const list = await getAnnouncements();
      setAnnouncements(list);
    } catch (e) {
      console.warn('Could not load announcements:', e);
    }
  };

  useEffect(() => {
    loadAnnouncementsList();
  }, []);

  // Counts
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const urgentCount = reports.filter(r => r.isUrgent && r.status !== 'resolved').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const missingCount = reports.filter(r => r.type === 'missing_person').length;
  const newSightingsCount = sightings.filter(s => s.status === 'new').length;

  const handleApprove = async (report: ReportItem) => {
    setActionInProgress(report.id);
    try {
      await updateReportByAdmin(
        report.id,
        {
          status: 'approved',
          isPublished: true,
          verificationStatus: 'verified'
        },
        adminEmail
      );
      setStatusMessage(`${report.reportId} সফলভাবে অনুমোদিত ও প্রকাশিত হয়েছে।`);
      onRefreshData();
    } catch (e) {
      alert('অপারেশন ব্যর্থ হয়েছে।');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (report: ReportItem) => {
    if (!window.confirm('আপনি কি এই রিপোর্টটি বাতিল করতে চান?')) return;
    setActionInProgress(report.id);
    try {
      await updateReportByAdmin(
        report.id,
        {
          status: 'rejected',
          isPublished: false
        },
        adminEmail
      );
      setStatusMessage(`${report.reportId} বাতিল করা হয়েছে।`);
      onRefreshData();
    } catch (e) {
      alert('অপারেশন ব্যর্থ হয়েছে।');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleUrgent = async (report: ReportItem) => {
    setActionInProgress(report.id);
    try {
      await updateReportByAdmin(
        report.id,
        {
          isUrgent: !report.isUrgent
        },
        adminEmail
      );
      onRefreshData();
    } catch (e) {
      alert('অপারেশন ব্যর্থ হয়েছে।');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleFeatured = async (report: ReportItem) => {
    setActionInProgress(report.id);
    try {
      await updateReportByAdmin(
        report.id,
        {
          isFeatured: !report.isFeatured
        },
        adminEmail
      );
      onRefreshData();
    } catch (e) {
      alert('অপারেশন ব্যর্থ হয়েছে।');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkResolved = async (report: ReportItem) => {
    const note = window.prompt('সমাধান বা উদ্ধার সংক্রান্ত মন্তব্য লিখুন:', 'সন্ধান সফলভাবে সম্পন্ন হয়েছে ও পরিবারের কাছে হস্তান্তর করা হয়েছে।');
    if (note === null) return;

    setActionInProgress(report.id);
    try {
      await updateReportByAdmin(
        report.id,
        {
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolutionNote: note
        },
        adminEmail
      );
      setStatusMessage(`${report.reportId} সমাধান হিসেবে চিহ্নিত করা হয়েছে 🟢`);
      onRefreshData();
    } catch (e) {
      alert('অপারেশন ব্যর্থ হয়েছে।');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (report: ReportItem) => {
    if (!window.confirm(`আপনি কি স্থায়ীভাবে ${report.reportId} মুছে ফেলতে চান?`)) return;
    setActionInProgress(report.id);
    try {
      await deleteReportByAdmin(report.id, adminEmail);
      setStatusMessage(`${report.reportId} ডাটাবেজ থেকে মুছে ফেলা হয়েছে।`);
      onRefreshData();
    } catch (e) {
      alert('ডিলিট ব্যর্থ হয়েছে।');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenEditModal = (report: ReportItem) => {
    setEditingReport(report);
    setIsEditModalOpen(true);
  };

  const handleSaveReportEdit = async (reportId: string, updates: Partial<ReportItem>) => {
    await updateReportByAdmin(reportId, updates, adminEmail);
    setStatusMessage(`${updates.reportId || reportId} সফলভাবে আপডেট করা হয়েছে।`);
    onRefreshData();
  };

  // Announcements Handlers
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeDesc.trim()) {
      alert('শিরোনাম ও বিবরণ দেওয়া আবশ্যক।');
      return;
    }
    setSubmittingNotice(true);
    try {
      await createAnnouncement({
        title: newNoticeTitle.trim(),
        description: newNoticeDesc.trim(),
        image: newNoticeImage.trim() || undefined,
        priority: newNoticePriority,
        isPublished: true,
        isPinned: isNewNoticePinned
      }, adminEmail);

      // Broadcast urgent notices directly to Realtime Database liveAlerts
      if (newNoticePriority === 'urgent') {
        try {
          await pushRealtimeAlert({
            type: 'urgent_missing',
            title: newNoticeTitle.trim(),
            message: newNoticeDesc.trim().substring(0, 120),
            timestamp: new Date().toISOString(),
            active: true
          });
        } catch (rtdbErr) {
          console.warn('Realtime alert sync warning:', rtdbErr);
        }
      }

      setNewNoticeTitle('');
      setNewNoticeDesc('');
      setNewNoticeImage('');
      setIsNewNoticePinned(false);
      await loadAnnouncementsList();
      alert('নতুন বিজ্ঞপ্তি সফলভাবে প্রকাশ করা হয়েছে!');
    } catch (e) {
      alert('বিজ্ঞপ্তি প্রকাশে ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingNotice(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('আপনি কি এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?')) return;
    try {
      await deleteAnnouncement(id, adminEmail);
      await loadAnnouncementsList();
    } catch (e) {
      alert('মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleTogglePinAnnouncement = async (ann: AnnouncementItem) => {
    try {
      await updateAnnouncement(ann.id, { isPinned: !ann.isPinned }, adminEmail);
      await loadAnnouncementsList();
    } catch (e) {
      alert('পিন স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleSeedDemoData = async () => {
    if (!window.confirm('আপনি কি ফায়ারবেসে নমুনা তথ্য (DEMO data) ও নমুনা বিজ্ঞপ্তি সিড করতে চান?')) return;
    try {
      const count = await seedDemoDataToFirestore();
      alert(`${count} টি নমুনা রেকর্ড ফায়ারবেস ডাটাবেজে সংরক্ষণ করা হয়েছে।`);
      onRefreshData();
      await loadAnnouncementsList();
    } catch (e) {
      alert('সিড করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleClearDemoData = async () => {
    if (!window.confirm('সতর্কতা: সমস্ত নমুনা তথ্য (DEMO) ফায়ারবেস থেকে মুছে ফেলা হবে। আপনি কি নিশ্চিত?')) return;
    try {
      const count = await clearAllDemoDataFromFirestore();
      alert(`${count} টি নমুনা রেকর্ড ডাটাবেজ থেকে সফলভাবে মুছে ফেলা হয়েছে।`);
      onRefreshData();
    } catch (e) {
      alert('মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    try {
      await onUpdateSettings({
        ...settings,
        heroTitle,
        heroSubtitle,
        aboutText,
        founderName,
        founderBio,
        founderMessage,
        founderPhoto,
        updatedAt: new Date().toISOString()
      });
      alert('ওয়েবসাইট CMS সেটিংস সফলভাবে আপডেট করা হয়েছে।');
    } catch (e) {
      alert('সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSavingCms(false);
    }
  };

  // Filtered reports for admin table
  const displayedReports = reports.filter(r => {
    if (reportFilter === 'pending' && r.status !== 'pending') return false;
    if (reportFilter === 'approved' && (r.status !== 'approved' || !r.isPublished)) return false;
    if (reportFilter === 'resolved' && r.status !== 'resolved') return false;
    if (reportFilter === 'urgent' && !r.isUrgent) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        r.reportId?.toLowerCase().includes(term) ||
        r.title?.toLowerCase().includes(term) ||
        r.name?.toLowerCase().includes(term) ||
        r.district?.toLowerCase().includes(term) ||
        r.contactPhone?.includes(term)
      );
    }
    return true;
  });

  // Security Guard: Strictly verify that Firebase Auth user is present and matches the authorized admin
  if (!auth.currentUser || auth.currentUser.email !== 'enanahmed776@gmail.com') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-['Hind_Siliguri',sans-serif]">
        <div className="bg-red-950/40 border border-red-800/60 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-red-900/60 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-700/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">ফায়ারবেস প্রমাণীকরণ প্রয়োজন</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            নিরাপত্তার স্বার্থে সরাসরি সাইট থেকে অ্যাডমিন প্যানেলে প্রবেশাধিকার বন্ধ রাখা হয়েছে। শুধুমাত্র ফায়ারবেস অথেন্টিকেশন (Firebase Auth) দিয়ে অনুমোদিত সুপার অ্যাডমিন লগইন করলেই এটি সচল হবে।
          </p>
          <button
            onClick={onBackToPublicSite}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            মূল ওয়েবসাইটে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif]">
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight">Nikhoj Alert Admin</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                  SECURE CONTROL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">admin.nikhojalert.online</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublicSite}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">পাবলিক সাইটে যান</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-mono truncate max-w-[150px]">{adminEmail}</span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60 uppercase">
                {adminRole === 'super_admin' ? 'Super Admin' : (adminRole || 'Admin')}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="text-xs text-red-300 hover:text-white bg-red-950/60 hover:bg-red-800 px-3 py-1.5 rounded-lg border border-red-800/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-slate-950 px-4 sm:px-8 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ওভারভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>রিপোর্ট ও ছবি ম্যানেজমেন্ট</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'announcements'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>বিজ্ঞপ্তি ও নোটিশ পরিচালনা</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 rounded-full">
              {announcements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sightings')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sightings'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>নাগরিক সন্ধান ক্লু (Sightings)</span>
            {newSightingsCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 rounded-full">
                {newSightingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'cms'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>হোমপেজ ও CMS সেটিংস</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {statusMessage && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-700 font-bold cursor-pointer">×</button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">পেন্ডিং যাচাই</span>
                <p className="text-3xl font-black text-amber-600 mt-1">{pendingCount}</p>
                <p className="text-[11px] text-slate-400 mt-1">অনুমোদনের অপেক্ষায়</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">জরুরি কেস</span>
                <p className="text-3xl font-black text-red-600 mt-1">{urgentCount}</p>
                <p className="text-[11px] text-slate-400 mt-1">আশু অনুসন্ধান জরুরি</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">মোট নিখোঁজ</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{missingCount}</p>
                <p className="text-[11px] text-slate-400 mt-1">নথিভুক্ত নিখোঁজ ব্যক্তি</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">সমাধান প্রাপ্ত</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
                <p className="text-[11px] text-slate-400 mt-1">সফলভাবে উদ্ধার 🟢</p>
              </div>
            </div>

            {/* Quick Actions & Demo Management */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  দ্রুত প্রশাসনিক কার্যক্রম ও ডাটাবেজ টুলস
                </h3>
                <span className="text-xs text-slate-500">অনুমোদিত ইউজার: {adminEmail}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsCreateReportModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>অ্যাডমিন সরাসরি রিপোর্ট তৈরি করুন (Direct Intake)</span>
                </button>

                <button
                  onClick={onRefreshData}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ডাটা রিফ্রেশ করুন</span>
                </button>

                <button
                  onClick={handleSeedDemoData}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>নমুনা তথ্য ও ছবি সিড করুন (Seed DEMO)</span>
                </button>

                <button
                  onClick={handleClearDemoData}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>সকল নমুনা তথ্য মুছে ফেলুন (Purge DEMO)</span>
                </button>
              </div>
            </div>

            {/* Pending Reports Quick Review Table */}
            {pendingCount > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-700" />
                    <h3 className="text-sm font-bold text-amber-900">
                      পর্যালোচনার অপেক্ষায় নতুন জমা হওয়া রিপোর্ট ({pendingCount})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('reports');
                      setReportFilter('pending');
                    }}
                    className="text-xs text-amber-800 font-bold hover:underline"
                  >
                    সবগুলো দেখুন
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {reports.filter(r => r.status === 'pending').slice(0, 5).map(report => (
                    <div key={report.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img src={report.photos?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700">{report.reportId}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">
                              পেন্ডিং
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{report.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {report.district} ({report.location}) • যোগাযোগ: {report.contactName} ({report.contactPhone})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(report)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>এডিট</span>
                        </button>

                        <button
                          onClick={() => handleApprove(report)}
                          disabled={actionInProgress === report.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>অনুমোদন ও প্রকাশ</span>
                        </button>

                        <button
                          onClick={() => handleReject(report)}
                          disabled={actionInProgress === report.id}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>বাতিল</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. REPORTS & PHOTO EDIT TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="আইডি, নাম, এলাকা বা মোবাইল দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={() => setIsCreateReportModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন রিপোর্ট তৈরি</span>
                </button>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
                <button
                  onClick={() => setReportFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    reportFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  সকল ({reports.length})
                </button>
                <button
                  onClick={() => setReportFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    reportFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  পেন্ডিং ({pendingCount})
                </button>
                <button
                  onClick={() => setReportFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    reportFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  প্রকাশিত
                </button>
                <button
                  onClick={() => setReportFilter('urgent')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    reportFilter === 'urgent' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  জরুরি ({urgentCount})
                </button>
                <button
                  onClick={() => setReportFilter('resolved')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    reportFilter === 'resolved' ? 'bg-green-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  সমাধান ({resolvedCount})
                </button>
              </div>
            </div>

            {/* Reports Data Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ছবি ও বিবরণ</th>
                    <th className="p-3">ধরন</th>
                    <th className="p-3">এলাকা</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">যোগাযোগ</th>
                    <th className="p-3 text-right">পদক্ষেপ (অ্যাকশন)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        কোনো রিপোর্ট পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    displayedReports.map(report => (
                      <tr key={report.id} className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => handleOpenEditModal(report)}
                              className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer group"
                              title="ছবি পরিবর্তন করতে ক্লিক করুন"
                            >
                              <img
                                src={report.photos?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                className="w-full h-full object-cover group-hover:opacity-80 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                                ছবি
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">{report.reportId}</span>
                                {report.isDemo && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded-sm">DEMO</span>
                                )}
                              </div>
                              <p className="font-semibold text-slate-800 max-w-xs truncate mt-0.5">{report.title}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-medium text-slate-600">
                          {report.type === 'missing_person' && 'নিখোঁজ ব্যক্তি'}
                          {report.type === 'found_person' && 'পাওয়া ব্যক্তি'}
                          {report.type === 'lost_item' && 'হারানো জিনিস'}
                          {report.type === 'found_item' && 'পাওয়া জিনিস'}
                        </td>

                        <td className="p-3 text-slate-600">
                          <p className="font-medium text-slate-900">{report.district}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{report.location}</p>
                        </td>

                        <td className="p-3">
                          {report.status === 'resolved' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                              সমাধান 🟢
                            </span>
                          ) : report.status === 'approved' ? (
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                              প্রকাশিত
                            </span>
                          ) : report.status === 'pending' ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                              পেন্ডিং
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                              বাতিল
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-slate-600">
                          <p className="font-medium">{report.contactName}</p>
                          <p className="font-mono text-[11px] text-slate-500">{report.contactPhone}</p>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Full Edit Modal button */}
                            <button
                              onClick={() => handleOpenEditModal(report)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="রিপোর্ট ও ছবি এডিট করুন"
                            >
                              <Edit className="w-3 h-3" />
                              <span>এডিট</span>
                            </button>

                            {report.status === 'pending' && (
                              <button
                                onClick={() => handleApprove(report)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold cursor-pointer"
                                title="অনুমোদন করুন"
                              >
                                অনুমোদন
                              </button>
                            )}

                            {/* Urgent Toggle */}
                            <button
                              onClick={() => handleToggleUrgent(report)}
                              className={`p-1.5 rounded-md transition cursor-pointer ${
                                report.isUrgent ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-100'
                              }`}
                              title={report.isUrgent ? 'জরুরি স্ট্যাটাস সরান' : 'জরুরি হিসেবে মার্ক করুন'}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>

                            {/* Featured Toggle */}
                            <button
                              onClick={() => handleToggleFeatured(report)}
                              className={`p-1.5 rounded-md transition cursor-pointer ${
                                report.isFeatured ? 'bg-amber-500 text-white' : 'text-slate-400 hover:bg-slate-100'
                              }`}
                              title={report.isFeatured ? 'ফিচার্ড সরান' : 'ফিচার্ড করুন'}
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>

                            {/* Mark Resolved */}
                            {report.status !== 'resolved' && (
                              <button
                                onClick={() => handleMarkResolved(report)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                                title="সন্ধান সম্পন্ন চিহ্নিত করুন"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(report)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                              title="স্থায়ীভাবে মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ANNOUNCEMENTS TAB ("বিজ্ঞপ্তি পরিচালনা") */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Announcement Creation Form */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">নতুন বিজ্ঞপ্তি প্রকাশ করুন</h3>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      বিজ্ঞপ্তির শিরোনাম *
                    </label>
                    <input
                      type="text"
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      placeholder="যেমন: [জরুরি বিজ্ঞপ্তি] শেরপুর জেলায় অনুসন্ধান..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      অগ্রাধিকার ও ধরন
                    </label>
                    <select
                      value={newNoticePriority}
                      onChange={(e) => setNewNoticePriority(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="normal">সাধারণ বিজ্ঞপ্তি (Normal)</option>
                      <option value="urgent">জরুরি বিজ্ঞপ্তি (Urgent Alert)</option>
                      <option value="pinned">পিন করা নোটিশ (Pinned Notice)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      বিজ্ঞপ্তির বিস্তারিত বিবরণ *
                    </label>
                    <textarea
                      rows={3}
                      value={newNoticeDesc}
                      onChange={(e) => setNewNoticeDesc(e.target.value)}
                      placeholder="বিস্তারিত তথ্য ও সতর্কবার্তা লিখুন..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      বিজ্ঞপ্তির ছবি বা ব্যানারের লিংক (ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      value={newNoticeImage}
                      onChange={(e) => setNewNoticeImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="pinCheck"
                      checked={isNewNoticePinned}
                      onChange={(e) => setIsNewNoticePinned(e.target.checked)}
                      className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="pinCheck" className="text-xs text-slate-700 font-bold cursor-pointer">
                      বিজ্ঞপ্তিটি উপরে পিন করে রাখুন (Pinned on Top)
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingNotice}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submittingNotice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>বিজ্ঞপ্তি প্রকাশ করুন</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Published Announcements List */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">সকল সক্রিয় বিজ্ঞপ্তি ({announcements.length})</h3>
                  <button
                    onClick={loadAnnouncementsList}
                    className="text-xs text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>রিফ্রেশ</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {announcements.map(ann => (
                    <div key={ann.id} className="py-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {ann.isPinned && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Pin className="w-3 h-3" />
                              <span>পিন করা</span>
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ann.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ann.priority === 'urgent' ? 'জরুরি অ্যালার্ট' : 'সাধারণ'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePinAnnouncement(ann)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded-md"
                            title={ann.isPinned ? 'আনপিন করুন' : 'পিন করুন'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                            title="বিজ্ঞপ্তি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.description}</p>
                      
                      {ann.image && (
                        <div className="w-24 h-14 rounded-lg overflow-hidden border border-slate-200">
                          <img src={ann.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400">
                        প্রকাশকাল: {new Date(ann.createdAt).toLocaleString('bn-BD')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SIGHTINGS TAB */}
        {activeTab === 'sightings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">নাগরিক সন্ধান ক্লু (Citizen Sightings)</h3>
              <p className="text-xs text-slate-500">
                সাধারণ জনগণের প্রেরিত অবস্থান ও প্রত্যক্ষদর্শীর তথ্য (শুধুমাত্র অ্যাডমিনের জন্য দৃশ্যমান)
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {sightings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  এখনো কোনো প্রত্যক্ষদর্শীর ক্লু জমা পড়েনি।
                </div>
              ) : (
                sightings.map(s => (
                  <div key={s.id} className="p-4 space-y-2 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm">
                          {s.sightingId}
                        </span>
                        <span className="text-xs text-slate-500">রিপোর্ট: {s.reportId}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(s.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-semibold">
                      দেখা গেছে: {s.location} • তারিখ: {s.date} {s.time ? `(${s.time})` : ''}
                    </p>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {s.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <p className="text-emerald-700 font-medium">
                        প্রত্যক্ষদর্শী: {s.name || 'অজ্ঞাত'} (মোবাইল: <a href={`tel:${s.phone}`} className="underline font-mono">{s.phone}</a>)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. CMS TAB */}
        {activeTab === 'cms' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">হোমপেজ ও CMS কনটেন্ট এডিটর</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                সরাসরি ফায়ারবেসে ওয়েবসাইট টেক্সট, উদ্যোক্তার পরিচিতি ও সোশ্যাল লিংক পরিবর্তন করুন।
              </p>
            </div>

            <form onSubmit={handleSaveCms} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ১. হিরো সেকশন
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    হেডলাইন
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সাবটাইটেল
                  </label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ২. প্ল্যাটফর্ম মিশন ও পরিচিতি (About Text)
                </h4>
                <div>
                  <textarea
                    rows={3}
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ৩. Founder & CEO পরিচিতি
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      উদ্যোক্তার নাম
                    </label>
                    <input
                      type="text"
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      উদ্যোক্তার ছবির লিংক
                    </label>
                    <input
                      type="text"
                      value={founderPhoto}
                      onChange={(e) => setFounderPhoto(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    উদ্যোক্তার বার্তা
                  </label>
                  <input
                    type="text"
                    value={founderMessage}
                    onChange={(e) => setFounderMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সংক্ষিপ্ত বায়োগ্রাফি
                  </label>
                  <textarea
                    rows={3}
                    value={founderBio}
                    onChange={(e) => setFounderBio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={savingCms}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  {savingCms ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Edit Report Modal */}
      <AdminEditReportModal
        report={editingReport}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReportEdit}
      />

      {/* Admin Direct Create Report Modal */}
      <AdminCreateReportModal
        isOpen={isCreateReportModalOpen}
        onClose={() => setIsCreateReportModalOpen(false)}
        adminEmail={adminEmail}
        onSuccess={() => onRefreshData()}
      />
    </div>
  );
};
