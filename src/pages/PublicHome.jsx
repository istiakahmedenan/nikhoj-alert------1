import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase.js';
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Search, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Share2, 
  Lock, 
  ExternalLink,
  Users,
  AlertCircle
} from 'lucide-react';

export const PublicHome = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    const alertsRef = ref(rtdb, 'alerts');
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setAlerts(list);
      } else {
        setAlerts([]);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Realtime database read warning:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAlerts = alerts.filter(a => {
    if (filterDistrict !== 'all' && a.district !== filterDistrict) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.title?.toLowerCase().includes(term) ||
      a.personName?.toLowerCase().includes(term) ||
      a.location?.toLowerCase().includes(term) ||
      a.district?.toLowerCase().includes(term) ||
      a.contactPhone?.includes(term)
    );
  });

  const districts = Array.from(new Set(alerts.map(a => a.district).filter(Boolean)));
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const foundAlertsCount = alerts.filter(a => a.status === 'found').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight">Nikhoj Alert</span>
              <span className="ml-2 text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                Bangladesh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              অ্যাডমিন পোর্টাল
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            সরাসরি ফায়ারবেস রিয়েলটাইম ডাটাবেজ দ্বারা পরিচালিত
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            বাংলাদেশ নিখোঁজ ও সন্ধান সতর্কবার্তা
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            কোনো প্রিয়জন নিখোঁজ হলে তাৎক্ষণিক লাইভ সতর্কতা জারি এবং সবার সহায়তায় দ্রুত পরিবারের কাছে ফিরিয়ে দেওয়ার উন্মুক্ত প্ল্যাটফর্ম।
          </p>

          {/* Counts */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-bold">
            <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl">
              খোঁজ চলছে: <span className="text-amber-400 font-black">{activeAlertsCount}</span> জন
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl">
              উদ্ধারপ্রাপ্ত: <span className="text-emerald-400 font-black">{foundAlertsCount}</span> জন
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, জেলা, অবস্থান বা মোবাইল দিয়ে অনুসন্ধান..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-700 outline-none font-medium cursor-pointer"
            >
              <option value="all">সকল জেলা ({alerts.length})</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerts Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">রিয়েলটাইম নিখোঁজ তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">কোনো সতর্কবার্তা পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              বর্তমানে কোনো সক্রিয় নিখোঁজ সতর্কবার্তা পাওয়া যায়নি অথবা অনুসন্ধানের তথ্যের সাথে মিল নেই।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group"
              >
                {/* Image & Urgent Badge */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={alert.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'}
                    alt={alert.personName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {alert.isUrgent && (
                      <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3" /> জরুরি
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                      alert.status === 'found'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {alert.status === 'found' ? 'উদ্ধারকৃত' : 'সন্ধান চলছে'}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {alert.title}
                    </h3>
                    <div className="text-xs text-slate-600 font-semibold mt-1">
                      নাম: <span className="text-slate-900">{alert.personName}</span> 
                      {alert.age && <span className="text-slate-500 font-normal"> ({alert.age})</span>}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{alert.location || alert.district}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>সর্বশেষ দেখা: {alert.lastSeenDate || 'উল্লেখ নেই'}</span>
                    </div>

                    {alert.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {alert.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${alert.contactPhone}`}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      যোগাযোগ: {alert.contactPhone}
                    </a>

                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: alert.title,
                            text: `${alert.personName} নিখোঁজ সংক্রান্ত সতর্কতা: ${alert.title}`,
                            url: window.location.href
                          }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(`${window.location.origin}`);
                          alert('লিংক কপি করা হয়েছে!');
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="শেয়ার করুন"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 text-center border-t border-slate-800 space-y-2">
        <p className="font-semibold text-slate-300">Nikhoj Alert Bangladesh • নিখোঁজ মানুষের সন্ধানে সবার সাথে</p>
        <p className="text-[11px] text-slate-500">
          Firebase Realtime Database ও Modular SDK v9+ ভিত্তিক কেন্দ্রীয় সতর্কবার্তা প্ল্যাটফর্ম।
        </p>
      </footer>
    </div>
  );
};

export default PublicHome;
