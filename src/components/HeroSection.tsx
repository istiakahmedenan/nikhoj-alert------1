import React from 'react';
import { 
  UserPlus, 
  PackageSearch, 
  Search, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ReportType } from '../types';

interface HeroSectionProps {
  stats: {
    totalReports: number;
    missingPersons: number;
    foundPersons: number;
    lostItems: number;
    foundItems: number;
    resolvedReports: number;
    urgentReports: number;
  };
  onOpenReportModal: (type?: ReportType) => void;
  onOpenSearch: () => void;
  onExploreUrgent: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  onOpenReportModal,
  onOpenSearch,
  onExploreUrgent
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Urgent Alert Banner (if urgent cases exist) */}
        {stats.urgentReports > 0 && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={onExploreUrgent}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-red-950/40 border border-red-500/50 backdrop-blur-md transition-all hover:scale-102 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-200 animate-pulse" />
              <span>জরুরি বিজ্ঞপ্তি: {stats.urgentReports} জন ব্যক্তির আশু সন্ধান প্রয়োজন</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-200" />
            </button>
          </div>
        )}

        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight md:leading-tight mb-5 text-white">
            নিখোঁজ মানুষ ও হারানো জিনিসের খোঁজে,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
              একসাথে পুরো বাংলাদেশ।
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-emerald-100/90 font-normal max-w-2xl mx-auto mb-8 leading-relaxed">
            তথ্য জানান, খুঁজুন এবং গুরুত্বপূর্ণ আপডেট পান—সহজ, দ্রুত ও নিরাপদভাবে। প্রতিটি মুহূর্ত মূল্যবান, আপনার একটি সঠিক তথ্য ফিরিয়ে দিতে পারে হারানো আপনজনকে।
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => onOpenReportModal('missing_person')}
              className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 transition hover:scale-102 active:scale-98 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-red-200" />
              <span>নিখোঁজ ব্যক্তির রিপোর্ট করুন</span>
            </button>

            <button
              onClick={() => onOpenReportModal('lost_item')}
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-950/30 transition hover:scale-102 active:scale-98 cursor-pointer"
            >
              <PackageSearch className="w-5 h-5 text-amber-200" />
              <span>হারানো জিনিস জানান</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-md transition hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Search className="w-5 h-5 text-emerald-300" />
              <span>তথ্য খুঁজুন</span>
            </button>
          </div>
        </div>

        {/* Live Statistics Cards */}
        <div className="pt-4 border-t border-emerald-800/60">
          <div className="flex items-center justify-center gap-2 mb-4 text-emerald-200/80 text-xs font-semibold tracking-wider uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>লাইভ প্ল্যাটফর্ম পরিসংখ্যান</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-center">
            {/* Total Reports */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-xs hover:border-emerald-500/50 transition">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.totalReports}
              </p>
              <p className="text-xs sm:text-sm font-medium text-emerald-200/80 mt-1">
                মোট রিপোর্ট
              </p>
            </div>

            {/* Missing Persons */}
            <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 sm:p-4 backdrop-blur-xs hover:border-red-500/50 transition">
              <p className="text-2xl sm:text-3xl font-extrabold text-red-300">
                {stats.missingPersons}
              </p>
              <p className="text-xs sm:text-sm font-medium text-red-200/80 mt-1">
                নিখোঁজ ব্যক্তি
              </p>
            </div>

            {/* Found Persons */}
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 sm:p-4 backdrop-blur-xs hover:border-emerald-500/50 transition">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {stats.foundPersons}
              </p>
              <p className="text-xs sm:text-sm font-medium text-emerald-200/80 mt-1">
                পাওয়া ব্যক্তি
              </p>
            </div>

            {/* Lost Items */}
            <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 sm:p-4 backdrop-blur-xs hover:border-amber-500/50 transition">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {stats.lostItems}
              </p>
              <p className="text-xs sm:text-sm font-medium text-amber-200/80 mt-1">
                হারানো জিনিস
              </p>
            </div>

            {/* Found Items */}
            <div className="bg-teal-950/30 border border-teal-500/20 rounded-xl p-3 sm:p-4 backdrop-blur-xs hover:border-teal-500/50 transition">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-300">
                {stats.foundItems}
              </p>
              <p className="text-xs sm:text-sm font-medium text-teal-200/80 mt-1">
                পাওয়া জিনিস
              </p>
            </div>

            {/* Resolved */}
            <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-3 sm:p-4 backdrop-blur-xs hover:border-green-400/60 transition shadow-sm">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <p className="text-2xl sm:text-3xl font-extrabold text-green-300">
                  {stats.resolvedReports}
                </p>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-green-200 mt-1">
                সন্ধান সম্পন্ন 🟢
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
