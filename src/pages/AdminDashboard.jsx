import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { rtdb } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Phone, 
  MapPin, 
  User, 
  X, 
  RefreshCw, 
  Database,
  ExternalLink,
  Flame,
  Check,
  Eye
} from 'lucide-react';

export const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    personName: '',
    age: '',
    gender: 'male',
    district: 'ঢাকা',
    location: '',
    lastSeenDate: '',
    contactPhone: '',
    description: '',
    photoUrl: '',
    isUrgent: true,
    status: 'active'
  });

  // Subscribe to Realtime Database `/alerts`
  useEffect(() => {
    setLoading(true);
    const alertsRef = ref(rtdb, 'alerts');

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedAlerts = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        // Sort newest first
        loadedAlerts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setAlerts(loadedAlerts);
      } else {
        setAlerts([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Realtime Database listen error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAlertId(null);
    setFormData({
      title: '',
      personName: '',
      age: '',
      gender: 'male',
      district: 'ঢাকা',
      location: '',
      lastSeenDate: new Date().toISOString().split('T')[0],
      contactPhone: '',
      description: '',
      photoUrl: '',
      isUrgent: true,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (alert) => {
    setEditingAlertId(alert.id);
    setFormData({
      title: alert.title || '',
      personName: alert.personName || alert.name || '',
      age: alert.age || '',
      gender: alert.gender || 'male',
      district: alert.district || 'ঢাকা',
      location: alert.location || '',
      lastSeenDate: alert.lastSeenDate || '',
      contactPhone: alert.contactPhone || '',
      description: alert.description || '',
      photoUrl: alert.photoUrl || '',
      isUrgent: Boolean(alert.isUrgent),
      status: alert.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.personName.trim()) {
      alert('অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      if (editingAlertId) {
        // Update existing alert in Realtime Database
        const alertRef = ref(rtdb, `alerts/${editingAlertId}`);
        await update(alertRef, payload);
      } else {
        // Create new alert in Realtime Database
        payload.createdAt = new Date().toISOString();
        payload.createdBy = currentUser?.email || 'admin';
        const alertsRef = ref(rtdb, 'alerts');
        const newRef = push(alertsRef);
        await set(newRef, payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving alert:', err);
      alert('সংরক্ষণ করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`আপনি কি "${title || 'এই অ্যালার্টটি'}" স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      try {
        const alertRef = ref(rtdb, `alerts/${id}`);
        await remove(alertRef);
      } catch (err) {
        console.error('Error deleting alert:', err);
        alert('মুছে ফেলতে সমস্যা হয়েছে: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (alert) => {
    const nextStatus = alert.status === 'found' ? 'active' : 'found';
    try {
      const alertRef = ref(rtdb, `alerts/${alert.id}`);
      await update(alertRef, { 
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Seed sample Realtime Database alerts if empty
  const handleSeedSampleAlerts = async () => {
    setSubmitting(true);
    try {
      const sampleAlerts = [
        {
          title: 'মিরপুর থেকে শিশু নিখোঁজ',
          personName: 'আরাফাত হোসেন',
          age: '৭ বছর',
          gender: 'male',
          district: 'ঢাকা',
          location: 'মিরপুর-১০, ঢাকা',
          lastSeenDate: '২০২৬-০৩-২৮',
          contactPhone: '০১৭১১-২২৩৩৪৪',
          description: 'নীল রঙের গেঞ্জি ও কালো প্যান্ট পরিহিত ছিল। কোনো সহৃদয় ব্যক্তি সন্ধান পেলে অবিলম্বে ফোনে যোগাযোগ করুন।',
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          isUrgent: true,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          title: 'চট্টগ্রাম জিইসি মোড় থেকে বৃদ্ধ নিখোঁজ',
          personName: 'মোঃ আব্দুল খালেক',
          age: '৭২ বছর',
          gender: 'male',
          district: 'চট্টগ্রাম',
          location: 'জিইসি মোড়, চট্টগ্রাম',
          lastSeenDate: '২০২৬-০৩-২৬',
          contactPhone: '০১৮১২-৩৪৫৬৭৮',
          description: 'স্মৃতিভ্রম রোগী। সাদা পাঞ্জাবি ও পায়জামা পরিহিত ছিলেন। সন্ধানদাতাকে পুরস্কৃত করা হবে।',
          photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
          isUrgent: true,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          title: 'রাজশাহী সাহেব বাজার এলাকায় সন্ধানপ্রাপ্ত শিশু',
          personName: 'সুমাইয়া আক্তার',
          age: '৫ বছর',
          gender: 'female',
          district: 'রাজশাহী',
          location: 'সাহেব বাজার, রাজশাহী',
          lastSeenDate: '২০২৬-০৩-২৫',
          contactPhone: '০১৭৩৩-৯৮৭৬৫৪',
          description: 'শিশুটিকে নিরাপদে উদ্ধার করে পরিবারের কাছে হস্তান্তর করা হয়েছে। সবাইকে আন্তরিক ধন্যবাদ।',
          photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
          isUrgent: false,
          status: 'found',
          createdAt: new Date().toISOString()
        }
      ];

      const alertsRef = ref(rtdb, 'alerts');
      for (const item of sampleAlerts) {
        const newRef = push(alertsRef);
        await set(newRef, item);
      }
      alert('নমুনা নিখোঁজ এলার্ট Realtime Database-এ সফলভাবে সিড করা হয়েছে!');
    } catch (err) {
      console.error('Seed error:', err);
      alert('সিড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      alert.title?.toLowerCase().includes(term) ||
      alert.personName?.toLowerCase().includes(term) ||
      alert.district?.toLowerCase().includes(term) ||
      alert.location?.toLowerCase().includes(term) ||
      alert.contactPhone?.includes(term)
    );
  });

  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const foundAlerts = alerts.filter(a => a.status === 'found').length;
  const urgentAlerts = alerts.filter(a => a.isUrgent && a.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight">Nikhoj Alert Admin</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                  REALTIME DB (/alerts)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">admin.nikhojalert.online</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">পাবলিক সাইট</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-mono truncate max-w-[160px]">{currentUser?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-white bg-red-950/60 hover:bg-red-800 px-3 py-1.5 rounded-lg border border-red-800/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500">মোট সতর্কতা (Total)</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalAlerts}</div>
            <p className="text-[11px] text-slate-400 font-medium">Realtime Database নোডে সংরক্ষিত</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-amber-600">খোঁজ চলছে (Active)</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{activeAlerts}</div>
            <p className="text-[11px] text-slate-400 font-medium">বর্তমানে সন্ধান চলমান</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-emerald-600">উদ্ধারকৃত (Found / Resolved)</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{foundAlerts}</div>
            <p className="text-[11px] text-slate-400 font-medium">পরিবারের কাছে হস্তান্তর</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> জরুরি সতর্কবার্তা (Urgent)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-red-600">{urgentAlerts}</div>
            <p className="text-[11px] text-slate-400 font-medium">অগ্রাধিকারপ্রাপ্ত কেস</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, জেলা, অবস্থান বা মোবাইল দিয়ে অনুসন্ধান..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সব ({totalAlerts})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'active'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              খোঁজ চলছে ({activeAlerts})
            </button>
            <button
              onClick={() => setStatusFilter('found')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                statusFilter === 'found'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              উদ্ধারকৃত ({foundAlerts})
            </button>
          </div>

          {/* Create Button */}
          <div className="flex items-center gap-2">
            {alerts.length === 0 && (
              <button
                onClick={handleSeedSampleAlerts}
                disabled={submitting}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                নমুনা তথ্য সিড করুন
              </button>
            )}

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              নতুন নিখোঁজ এলার্ট যোগ করুন
            </button>
          </div>
        </div>

        {/* Alerts Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>সতর্কবার্তার তালিকা (Firebase /alerts Node)</span>
              <span className="text-xs font-normal text-slate-500">
                ({filteredAlerts.length} টি রেকর্ড পাওয়া গেছে)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs">রিয়েলটাইম ডাটাবেজ থেকে এলার্ট লোড হচ্ছে...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">কোনো সতর্কবার্তা পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                ডাটাবেজে বর্তমানে কোনো এলার্ট নেই অথবা আপনার সার্চের সাথে কোনো ফলাফল মেলেনি।
              </p>
              {alerts.length === 0 && (
                <button
                  onClick={handleSeedSampleAlerts}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
                >
                  পরীক্ষার জন্য নমুনা এলার্ট তৈরি করুন
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">ব্যক্তি / ছবি</th>
                    <th className="py-3 px-4">শিরোনাম ও বিবরণ</th>
                    <th className="py-3 px-4">অবস্থান ও জেলা</th>
                    <th className="py-3 px-4">যোগাযোগ</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50/80 transition">
                      {/* Person & Photo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={alert.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                            alt={alert.personName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {alert.personName || 'নাম উল্লেখ নেই'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {alert.age ? `বয়স: ${alert.age}` : ''} {alert.gender === 'female' ? '• নারী' : '• পুরুষ'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 line-clamp-1">
                          {alert.isUrgent && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded shrink-0">
                              জরুরি
                            </span>
                          )}
                          <span>{alert.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {alert.description || 'কোনো অতিরিক্ত বিবরণ নেই।'}
                        </p>
                      </td>

                      {/* Location & District */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{alert.district}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {alert.location || 'স্থান নির্ধারিত নয়'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{alert.contactPhone || '—'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          তারিখ: {alert.lastSeenDate || '—'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(alert)}
                          title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                            alert.status === 'found'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {alert.status === 'found' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              উদ্ধারকৃত
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              সন্ধান চলছে
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(alert)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(alert.id, alert.title)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {editingAlertId ? 'নিখোঁজ সতর্কবার্তা সম্পাদনা' : 'নতুন নিখোঁজ সতর্কবার্তা প্রকাশ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">সতর্কবার্তার শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: মিরপুর থেকে শিশু আরাফাত নিখোঁজ"
                  className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">নিখোঁজ ব্যক্তির নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    placeholder="নাম লিখুন"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">বয়স</label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="যেমন: ৮ বছর"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">জেলা</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="যেমন: ঢাকা"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">নির্দিষ্ট অবস্থান</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="যেমন: মিরপুর-১০ গোলচত্বর"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">জরুরি যোগাযোগ নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">সর্বশেষ দেখার তারিখ</label>
                  <input
                    type="date"
                    value={formData.lastSeenDate}
                    onChange={(e) => setFormData({ ...formData, lastSeenDate: e.target.value })}
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">ছবির ইউআরএল (Photo URL)</label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://... (ছবির সরাসরি লিংক)"
                  className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">শারীরিক বিবরণ ও বিস্তারিত</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="পোশাকের বর্ণনা, শারীরিক চিহ্ন, নিখোঁজ হওয়ার পারিপার্শ্বিক অবস্থা ইত্যাদি..."
                  className="w-full border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>জরুরি নিখোঁজ সতর্কতা হিসেবে চিহ্নিত করুন (Urgent)</span>
                </label>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span>অবস্থা:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="active">সন্ধান চলছে (Active)</option>
                    <option value="found">উদ্ধারকৃত (Found)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : editingAlertId ? 'আপডেট করুন' : 'প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
