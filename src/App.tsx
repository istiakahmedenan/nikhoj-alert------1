import React, { useState, useEffect, useMemo } from 'react';
import { 
  ReportItem, 
  ReportType, 
  SightingItem, 
  AnnouncementItem, 
  SiteSettings 
} from './types';
import { 
  INITIAL_SITE_SETTINGS, 
  INITIAL_DEMO_REPORTS, 
  INITIAL_DEMO_ANNOUNCEMENTS 
} from './data/demoData';
import { 
  subscribeToPublishedReports, 
  getLiveStatistics, 
  getAnnouncements, 
  getSiteSettings, 
  getAllReportsForAdmin, 
  getSightingsForAdmin, 
  updateSiteSettings 
} from './services/reportService';
import { 
  auth, 
  db, 
  subscribeToRealtimeAlerts, 
  RealtimeBroadcastAlert 
} from './lib/firebase';
import { 
  verifyAdminSessionWithServer, 
  logoutAdminSession 
} from './services/adminAuthService';

// Main Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ReportCard } from './components/ReportCard';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ReportSubmissionModal } from './components/ReportSubmissionModal';
import { SightingModal } from './components/SightingModal';
import { SearchModal } from './components/SearchModal';
import { ContactCorrectionModal } from './components/ContactCorrectionModal';
import { AIFaceSearchSection } from './components/AIFaceSearchSection';
import { DistrictView } from './components/DistrictView';
import { AboutSection } from './components/AboutSection';
import { PrivacyTermsView } from './components/PrivacyTermsView';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';

import { 
  AlertTriangle, 
  Flame, 
  Search, 
  Users, 
  Package, 
  CheckCircle, 
  Filter, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Megaphone, 
  Loader2, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone
} from 'lucide-react';

export default function App() {
  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string | null>(null);

  // Data states
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_DEMO_REPORTS);
  const [sightings, setSightings] = useState<SightingItem[]>([]);
  const [allAdminReports, setAllAdminReports] = useState<ReportItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_DEMO_ANNOUNCEMENTS);
  const [realtimeAlerts, setRealtimeAlerts] = useState<RealtimeBroadcastAlert[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);

  // Statistics
  const [stats, setStats] = useState({
    totalReports: 12,
    missingPersons: 6,
    foundPersons: 2,
    lostItems: 3,
    foundItems: 1,
    resolvedReports: 4,
    urgentReports: 3
  });

  // Filter & Search states for Public Feed
  const [feedFilterType, setFeedFilterType] = useState<ReportType | 'all'>('all');
  const [feedSearchQuery, setFeedSearchQuery] = useState<string>('');
  const [feedSelectedDistrict, setFeedSelectedDistrict] = useState<string>('all');
  const [feedSortBy, setFeedSortBy] = useState<'newest' | 'urgent' | 'verified'>('newest');

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalInitialType, setReportModalInitialType] = useState<ReportType>('missing_person');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReportForSighting, setSelectedReportForSighting] = useState<ReportItem | null>(null);
  const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
  const [selectedReportForCorrection, setSelectedReportForCorrection] = useState<ReportItem | null>(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Audio / Announcement toggle
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Admin Authentication & Security state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<'super_admin' | 'moderator' | null>(null);
  const [adminServerStatus, setAdminServerStatus] = useState<'idle' | 'checking' | 'authorized' | 'denied'>('idle');
  const [adminDenialReason, setAdminDenialReason] = useState<string | null>(null);

  // Check URL parameters & custom domains (admin.nikhojalert.online, /admin, ?admin=true)
  const isAdminDomain = useMemo(() => {
    const host = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    return (
      host === 'admin.nikhojalert.online' ||
      host.startsWith('admin.') ||
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      params.get('admin') === 'true'
    );
  }, []);

  // Sync title for admin domain
  useEffect(() => {
    if (isAdminDomain) {
      document.title = 'Nikhoj Alert Admin - অ্যাডমিন ড্যাশবোর্ড (admin.nikhojalert.online)';
    } else {
      document.title = 'Nikhoj Alert - নিখোঁজ মানুষ ও হারানো জিনিসের জাতীয় সন্ধান প্ল্যাটফর্ম';
    }
  }, [isAdminDomain]);

  // Firebase Auth State Listener & Server Verification
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setAdminServerStatus('checking');
        try {
          const verification = await verifyAdminSessionWithServer(false);
          if (verification.authorized) {
            setIsAdminLoggedIn(true);
            setAdminEmail(user.email || verification.user?.email || null);
            const role = (verification.role as 'super_admin' | 'moderator') || 'super_admin';
            setAdminRole(role);
            setAdminServerStatus('authorized');
            setAdminDenialReason(null);
            loadAdminData();
          } else {
            setIsAdminLoggedIn(false);
            setAdminEmail(user.email);
            setAdminRole(null);
            setAdminServerStatus('denied');
            setAdminDenialReason(verification.error || 'এই অ্যাকাউন্টে অ্যাডমিন রোল নেই।');
            setAllAdminReports([]);
            setSightings([]);
          }
        } catch (e: any) {
          setIsAdminLoggedIn(false);
          setAdminRole(null);
          setAdminServerStatus('denied');
          setAdminDenialReason(e?.message || 'সার্ভার নিরাপত্তা যাচাই ব্যর্থ হয়েছে।');
          setAllAdminReports([]);
          setSightings([]);
        }
      } else {
        setIsAdminLoggedIn(false);
        setAdminEmail(null);
        setAdminRole(null);
        setAdminServerStatus('idle');
        setAdminDenialReason(null);
        setAllAdminReports([]);
        setSightings([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Reports and Realtime Subscriptions
  useEffect(() => {
    const unsub = subscribeToPublishedReports((published) => {
      setReports(published);
    });

    const refreshStatistics = async () => {
      const liveStats = await getLiveStatistics();
      setStats(liveStats);
    };
    refreshStatistics();
    getAnnouncements().then(setAnnouncements);
    getSiteSettings().then(setSiteSettings);

    // Subscribe to Realtime Database broadcast alerts
    const unsubRtdb = subscribeToRealtimeAlerts((alerts) => {
      setRealtimeAlerts(alerts);
    });

    return () => {
      unsub();
      unsubRtdb();
    };
  }, []);

  const loadAdminData = async () => {
    try {
      const [adminRepList, adminSightList] = await Promise.all([
        getAllReportsForAdmin(),
        getSightingsForAdmin()
      ]);
      setAllAdminReports(adminRepList);
      setSightings(adminSightList);
    } catch (e) {
      console.warn('Failed to load full admin datasets:', e);
    }
  };

  const handleAdminLogout = async () => {
    await logoutAdminSession();
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    setAdminRole(null);
    setAdminServerStatus('idle');
    setAllAdminReports([]);
    setSightings([]);
    if (isAdminDomain) {
      window.location.href = '/';
    } else {
      setCurrentTab('home');
    }
  };

  const handleAdminLoginSuccess = async (email: string) => {
    setIsAdminLoggedIn(true);
    setAdminEmail(email);
    setAdminServerStatus('authorized');
    setIsAdminLoginModalOpen(false);
    await loadAdminData();
    setCurrentTab('admin');
  };

  const handleOpenReportModal = (type?: ReportType) => {
    if (type) setReportModalInitialType(type);
    setIsReportModalOpen(true);
  };

  const handleSelectTab = (tab: string, filterType?: ReportType | 'all', districtSlug?: string) => {
    setCurrentTab(tab);
    if (filterType) {
      setFeedFilterType(filterType);
    }
    if (districtSlug) {
      setSelectedDistrictSlug(districtSlug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewReportDetails = (report: ReportItem) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleOpenSightingModal = (report: ReportItem) => {
    setSelectedReportForSighting(report);
    setIsSightingModalOpen(true);
  };

  const handleOpenCorrectionModal = (report: ReportItem) => {
    setSelectedReportForCorrection(report);
    setIsCorrectionModalOpen(true);
  };

  const handleShareReport = (report: ReportItem) => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: `${report.name || report.title} সংক্রান্ত Nikhoj Alert বিজ্ঞপ্তি। সন্ধান দিন: ${report.contactPhone}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?report=${report.reportId}`);
      alert('সতর্কবার্তার লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<SiteSettings>) => {
    await updateSiteSettings(newSettings, adminEmail || 'super_admin');
    const fresh = await getSiteSettings();
    setSiteSettings(fresh);
    alert('ওয়েবসাইটের কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
  };

  // Filtered reports for the public feed
  const filteredFeedReports = useMemo(() => {
    let result = [...reports];

    // Filter by Type
    if (feedFilterType !== 'all') {
      result = result.filter(r => r.type === feedFilterType);
    }

    // Filter by District
    if (feedSelectedDistrict !== 'all') {
      result = result.filter(r => 
        r.district.toLowerCase() === feedSelectedDistrict.toLowerCase() ||
        r.district === feedSelectedDistrict
      );
    }

    // Search query match
    if (feedSearchQuery.trim()) {
      const q = feedSearchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.title?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.nickname?.toLowerCase().includes(q) ||
        r.reportId?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.contactPhone?.includes(q)
      );
    }

    // Sort order
    if (feedSortBy === 'urgent') {
      result.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
    } else if (feedSortBy === 'verified') {
      result.sort((a, b) => (b.verificationStatus === 'verified' ? 1 : 0) - (a.verificationStatus === 'verified' ? 1 : 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [reports, feedFilterType, feedSelectedDistrict, feedSearchQuery, feedSortBy]);

  // Urgent reports list for headline ticker & carousel
  const urgentReports = useMemo(() => {
    return reports.filter(r => r.isUrgent && r.status !== 'resolved');
  }, [reports]);

  // If user visits on admin custom domain or selects Admin Tab
  if (isAdminDomain || currentTab === 'admin') {
    if (adminServerStatus === 'checking') {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-['Hind_Siliguri',sans-serif]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">অ্যাডমিন এক্সেস যাচাইকরণ</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Verifying server authorization...</p>
            </div>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          </div>
        </div>
      );
    }

    if (adminServerStatus === 'denied') {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-['Hind_Siliguri',sans-serif]">
          <div className="bg-slate-900 border border-red-900/60 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 bg-red-950/80 border border-red-700/50 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-red-400">প্রবেশাধিকার সংরক্ষিত (Access Denied)</h3>
              <p className="text-xs text-slate-400 font-mono">403 Forbidden • Insufficient Privileges</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার অ্যাকাউন্ট <strong>{adminEmail}</strong> সফলভাবে সাইন-ইন হলেও এতে Nikhoj Alert-এর অনুমোদিত অ্যাডমিন রোল নেই।
            </p>
            {adminDenialReason && (
              <div className="text-[11px] text-red-300 bg-red-950/40 p-2.5 rounded-xl border border-red-900/50">
                {adminDenialReason}
              </div>
            )}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleAdminLogout}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                অনুমোদিত অ্যাকাউন্টে লগইন করুন
              </button>
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                পাবলিক সাইটে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (adminServerStatus === 'authorized' && isAdminLoggedIn) {
      return (
        <AdminDashboard
          reports={allAdminReports}
          sightings={sightings}
          settings={siteSettings}
          adminEmail={adminEmail || 'admin@nikhojalert.online'}
          adminRole={adminRole || 'super_admin'}
          onLogout={handleAdminLogout}
          onBackToPublicSite={() => {
            window.location.href = '/';
          }}
          onRefreshData={loadAdminData}
          onOpenCreateReport={() => handleOpenReportModal('missing_person')}
          onUpdateSettings={handleUpdateSettings}
        />
      );
    }

    // Unauthenticated: Render secure login gateway
    return (
      <AdminLoginModal
        isOpen={true}
        isStandalone={true}
        onClose={() => {
          if (isAdminDomain) {
            window.location.href = '/';
          } else {
            setCurrentTab('home');
          }
        }}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // -------------------------------------------------------------
  // PUBLIC WEBSITE (Home, Feed, AI Search, Districts, About, etc.)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-['Hind_Siliguri',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenReportModal={() => handleOpenReportModal('missing_person')}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Realtime Database Live Alert Broadcast Bar (if active) */}
      {realtimeAlerts.length > 0 && (
        <div className="bg-red-600 text-white py-2 px-4 shadow-sm text-xs sm:text-sm font-bold flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2 w-full">
            <span className="bg-white text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm animate-pulse shrink-0">
              🔴 জরুরী লাইভ সতর্কতা (RTDB)
            </span>
            <span className="truncate flex-1">
              {realtimeAlerts[0].title}: {realtimeAlerts[0].message}
            </span>
            {realtimeAlerts[0].reportId && (
              <button
                onClick={() => {
                  const match = reports.find(r => r.reportId === realtimeAlerts[0].reportId || r.id === realtimeAlerts[0].reportId);
                  if (match) {
                    setSelectedReport(match);
                    setIsDetailModalOpen(true);
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] font-semibold underline shrink-0 transition"
              >
                বিস্তারিত দেখুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: HOME */}
        {currentTab === 'home' && (
          <div className="space-y-12">
            {/* Hero & Live Statistics */}
            <HeroSection
              stats={stats}
              onOpenReportModal={handleOpenReportModal}
              onOpenSearch={() => setIsSearchModalOpen(true)}
              onExploreUrgent={() => {
                setFeedFilterType('all');
                setFeedSortBy('urgent');
                setCurrentTab('feed');
              }}
            />

            {/* Urgent Missing Ticker */}
            {urgentReports.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 border border-red-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
                        <Flame className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-red-950 flex items-center gap-2">
                          জরুরি নিখোঁজ সতর্কতা (Urgent Missing)
                          <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {urgentReports.length} টি সক্রিয়
                          </span>
                        </h2>
                        <p className="text-xs text-red-700">
                          তাৎক্ষণিক সন্ধান আবশ্যক। আপনার যেকোনো তথ্য একটি পরিবারকে বাঁচাতে পারে।
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setFeedSortBy('urgent');
                        setCurrentTab('feed');
                      }}
                      className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 group cursor-pointer"
                    >
                      সবগুলো দেখুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {urgentReports.slice(0, 3).map(report => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onViewDetails={handleViewReportDetails}
                        onReportSighting={handleOpenSightingModal}
                        onShare={handleShareReport}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action Category Selector */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
                  <h3 className="text-xl font-black text-slate-900">কীভাবে সাহায্য করতে চান?</h3>
                  <p className="text-xs text-slate-500">
                    সঠিক ক্যাটাগরি বেছে নিয়ে সহজেই তথ্য অনুসন্ধান করুন অথবা নতুন নোটিশ প্রকাশ করুন
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setFeedFilterType('missing_person');
                      setCurrentTab('feed');
                    }}
                    className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">নিখোঁজ ব্যক্তি</div>
                      <div className="text-[11px] text-slate-600">খোঁজ চলছে ({stats.missingPersons} জন)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFeedFilterType('found_person');
                      setCurrentTab('feed');
                    }}
                    className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">পাওয়া ব্যক্তি</div>
                      <div className="text-[11px] text-slate-600">পরিবার খোঁজা হচ্ছে ({stats.foundPersons} জন)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFeedFilterType('lost_item');
                      setCurrentTab('feed');
                    }}
                    className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">হারানো জিনিস</div>
                      <div className="text-[11px] text-slate-600">ডকুমেন্ট, বাইক ও ব্যাগ ({stats.lostItems} টি)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFeedFilterType('found_item');
                      setCurrentTab('feed');
                    }}
                    className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 transition text-left space-y-2 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">পাওয়া জিনিস</div>
                      <div className="text-[11px] text-slate-600">মালিকের অপেক্ষায় ({stats.foundItems} টি)</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Public Alerts Feed Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    সর্বশেষ নিখোঁজ ও সন্ধান সতর্কবার্তা
                  </h2>
                  <p className="text-xs text-slate-500">
                    বাংলাদেশজুড়ে নাগরিক ও প্রশাসনের যাচাইকৃত তথ্যের তালিকা
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReportModal('missing_person')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-900/10 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    তথ্য জানান
                  </button>

                  <button
                    onClick={() => setCurrentTab('feed')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">কোনো সতর্কবার্তা নেই</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    বর্তমানে কোনো প্রকাশিত বিজ্ঞপ্তি পাওয়া যায়নি।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {reports.slice(0, 8).map(report => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onViewDetails={handleViewReportDetails}
                      onReportSighting={handleOpenSightingModal}
                      onShare={handleShareReport}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: FULL FEED */}
        {currentTab === 'feed' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header & Search */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">
                    নিখোঁজ ও সন্ধান তালিকা (All Alerts)
                  </h1>
                  <p className="text-xs text-slate-500">
                    মোট {filteredFeedReports.length} টি রেকর্ড পাওয়া গেছে
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={feedSearchQuery}
                      onChange={(e) => setFeedSearchQuery(e.target.value)}
                      placeholder="নাম, জেলা বা মোবাইল দিয়ে খুঁজুন..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                    />
                  </div>

                  <button
                    onClick={() => handleOpenReportModal('missing_person')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    রিপোর্ট করুন
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                {/* Type Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFeedFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      feedFilterType === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    সব ({reports.length})
                  </button>
                  <button
                    onClick={() => setFeedFilterType('missing_person')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      feedFilterType === 'missing_person'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    নিখোঁজ ব্যক্তি
                  </button>
                  <button
                    onClick={() => setFeedFilterType('found_person')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      feedFilterType === 'found_person'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    পাওয়া ব্যক্তি
                  </button>
                  <button
                    onClick={() => setFeedFilterType('lost_item')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      feedFilterType === 'lost_item'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    হারানো জিনিস
                  </button>
                  <button
                    onClick={() => setFeedFilterType('found_item')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      feedFilterType === 'found_item'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    পাওয়া জিনিস
                  </button>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">সর্ট:</span>
                  <select
                    value={feedSortBy}
                    onChange={(e: any) => setFeedSortBy(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="newest">সর্বশেষ প্রকাশিত</option>
                    <option value="urgent">জরুরি অগ্রাধিকার</option>
                    <option value="verified">যাচাইকৃত কেস</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feed Cards Grid */}
            {filteredFeedReports.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">কোনো তথ্য পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  আপনার অনুসন্ধানের সাথে কোনো রেকর্ড মিলছে না। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredFeedReports.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onViewDetails={handleViewReportDetails}
                    onReportSighting={handleOpenSightingModal}
                    onShare={handleShareReport}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: AI FACE SEARCH */}
        {currentTab === 'ai-search' && (
          <AIFaceSearchSection
            reports={reports}
            onViewReport={handleViewReportDetails}
          />
        )}

        {/* VIEW 4: DISTRICTS DIRECTORY */}
        {currentTab === 'districts' && (
          <DistrictView
            selectedDistrictSlug={selectedDistrictSlug}
            onSelectDistrict={(slug) => setSelectedDistrictSlug(slug)}
            reports={reports}
            onViewReport={handleViewReportDetails}
            onReportSighting={handleOpenSightingModal}
            onShare={handleShareReport}
          />
        )}

        {/* VIEW 5: ABOUT NIKHOJ ALERT */}
        {currentTab === 'about' && (
          <AboutSection
            settings={siteSettings}
            onOpenReportModal={() => handleOpenReportModal('missing_person')}
          />
        )}

        {/* VIEW 6: PRIVACY & TERMS */}
        {(currentTab === 'privacy' || currentTab === 'terms') && (
          <PrivacyTermsView
            onBack={() => setCurrentTab('home')}
            onOpenReportModal={() => handleOpenReportModal('missing_person')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenReportModal={() => handleOpenReportModal('missing_person')}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* MODALS */}
      {/* 1. Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onReportSighting={(rep) => {
          setIsDetailModalOpen(false);
          handleOpenSightingModal(rep);
        }}
        onOpenCorrection={(rep) => {
          setIsDetailModalOpen(false);
          handleOpenCorrectionModal(rep);
        }}
      />

      {/* 2. Public Report Submission Modal */}
      <ReportSubmissionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialType={reportModalInitialType}
        onSuccess={(reportId) => {
          setIsReportModalOpen(false);
          alert(`আপনার রিপোর্টটি সফলভাবে জমা হয়েছে! ট্র্যাকিং আইডি: ${reportId}\nঅ্যাডমিন পর্যালোচনার পর এটি সর্বসাধারণের জন্য প্রকাশিত হবে।`);
        }}
      />

      {/* 3. Sighting Submission Modal */}
      <SightingModal
        report={selectedReportForSighting}
        isOpen={isSightingModalOpen}
        onClose={() => setIsSightingModalOpen(false)}
      />

      {/* 4. Global Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        reports={reports}
        onSelectReport={(rep) => {
          setIsSearchModalOpen(false);
          handleViewReportDetails(rep);
        }}
      />

      {/* 5. Contact / Correction Modal */}
      <ContactCorrectionModal
        report={selectedReportForCorrection}
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
      />

      {/* 6. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
