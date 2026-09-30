import React from 'react';
import { Mail, Facebook, ExternalLink, HeartHandshake, ShieldCheck, Target, Award } from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutSectionProps {
  settings: SiteSettings;
  onOpenReportModal: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  settings,
  onOpenReportModal
}) => {
  return (
    <div className="space-y-16 py-12">
      {/* 1. Why Nikhoj Alert was founded */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              আমাদের লক্ষ্য ও উদ্দেশ্য
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
              Nikhoj Alert কেন তৈরি করা হয়েছে?
            </h2>

            <blockquote className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal italic border-l-4 border-emerald-600 pl-4 py-1 mb-6">
              "{settings.aboutText}"
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2.5">
                <Target className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">দ্রুত তথ্য প্রচার</h4>
                  <p className="text-slate-500 mt-0.5">নিখোঁজের সাথে সাথেই সারা বাংলাদেশের মানুষের কাছে তথ্য পৌঁছানো।</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">নিরাপদ ও যাচাইকৃত</h4>
                  <p className="text-slate-500 mt-0.5">প্রশাসন ও টিম দ্বারা যাচাইকৃত সঠিক তথ্যের নিশ্চয়তা।</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">সামাজিক দায়বদ্ধতা</h4>
                  <p className="text-slate-500 mt-0.5">একটি নিখোঁজ মানুষকে ফিরিয়ে দেওয়া একটি পরিবারের নতুন জীবন।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Founder & CEO Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Founder Avatar & Title */}
            <div className="md:col-span-4 text-center md:text-left space-y-4">
              <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto md:mx-0 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl bg-slate-800">
                <img
                  src={settings.founderPhoto}
                  alt={settings.founderName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                  Founder & CEO
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">
                  {settings.founderName}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Nikhoj Alert (নিখোঁজ অ্যালার্ট)
                </p>
              </div>

              {/* Founder Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                <a
                  href={settings.facebookProfile}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Facebook className="w-4 h-4 text-blue-400" />
                  <span>Facebook Profile</span>
                </a>

                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span>ইমেইল</span>
                </a>
              </div>
            </div>

            {/* Founder Bio & Words */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-emerald-300 font-bold mb-1">
                  উদ্যোক্তার বার্তা
                </h4>
                <p className="text-base sm:text-lg text-emerald-100 font-medium leading-relaxed italic">
                  "{settings.founderMessage}"
                </p>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 border-t border-white/10 pt-4">
                <p>{settings.founderBio}</p>
                <p>
                  Nikhoj Alert সবসময় চেষ্টা করে প্রযুক্তিকে মানবতার সবচেয়ে জরুরি কাজে ব্যবহার করার জন্য। কোনো পরিবার যখন তার সন্তান কিংবা বয়োবৃদ্ধ স্বজনকে হারিয়ে দিশেহারা হয়ে পড়ে, তখন এই প্ল্যাটফর্ম তাদের পাশে দাঁড়ানোর একটি নির্ভরযোগ্য সেতু।
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={settings.facebookPage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md"
                >
                  <Facebook className="w-4 h-4" />
                  <span>অফিসিয়াল ফেসবুক পেজ যুক্ত হোন</span>
                </a>

                <button
                  onClick={onOpenReportModal}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition"
                >
                  সহযোগিতা বা রিপোর্ট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
