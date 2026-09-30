import React from 'react';
import { Mail, Facebook, Phone, Heart, ExternalLink } from 'lucide-react';
import { ReportType } from '../types';

interface FooterProps {
  onSelectTab: (tab: string, filterType?: ReportType | 'all', districtSlug?: string) => void;
  onOpenReportModal: () => void;
  onOpenAdminLogin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenReportModal
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://i.postimg.cc/FKKTLRZG/output-onlinepngtools.png"
                alt="Nikhoj Alert Logo"
                className="h-10 w-auto object-contain brightness-110"
              />
              <span className="text-xl font-black text-white tracking-tight">
                Nikhoj<span className="text-emerald-500">Alert</span>
              </span>
            </div>

            <p className="text-slate-300 font-medium text-sm leading-relaxed max-w-sm">
              নিখোঁজ মানুষ ও হারানো জিনিসের খোঁজে, একসাথে পুরো বাংলাদেশ।
            </p>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              আমাদের লক্ষ্য হলো সারা বাংলাদেশের নিখোঁজ ব্যক্তি এবং হারানো জিনিসপত্রের সঠিক তথ্য দ্রুততম সময়ে প্রশাসন ও সাধারণ জনগণের কাছে পৌঁছে দেওয়া।
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/NikhojAlert.online"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition"
                title="অফিসিয়াল ফেসবুক পেজ"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="mailto:nikhojalert.info@gmail.com"
                className="p-2 bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition"
                title="অফিসিয়াল ইমেইল"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              দ্রুত লিঙ্ক
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('home')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  হোম
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('feed', 'missing_person')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  নিখোঁজ ব্যক্তি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('feed', 'found_person')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  পাওয়া গেছে
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('feed', 'lost_item')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  হারানো জিনিস
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('feed', 'found_item')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  পাওয়া জিনিস
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenReportModal}
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  রিপোর্ট করুন
                </button>
              </li>
            </ul>
          </div>

          {/* Platform features */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              সেবাসমূহ
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('districts')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  জেলাসমূহ (৬৪ জেলা)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('facesearch')}
                  className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5 text-purple-400 font-medium"
                >
                  <span>AI Face Search</span>
                  <span className="text-[9px] bg-purple-900 text-purple-200 px-1 rounded-sm">AI</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('about')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('privacy')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  গোপনীয়তা নীতি ও শর্তাবলী
                </button>
              </li>
              <li>
                <a
                  href="mailto:nikhojalert.info@gmail.com?subject=Contact%20Nikhoj%20Alert"
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  যোগাযোগ ও সহায়তা
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              অফিসিয়াল যোগাযোগ
            </h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="mailto:nikhojalert.info@gmail.com" className="hover:underline">
                  nikhojalert.info@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Facebook className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a 
                  href="https://www.facebook.com/NikhojAlert.online" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:underline truncate"
                >
                  fb.com/NikhojAlert.online
                </a>
              </p>
              <p className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                <span>ওয়েবসাইট:</span>
                <span className="text-emerald-400 font-semibold">https://nikhojalert.online</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="select-none text-slate-500">
            © 2026 Nikhoj Alert. All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            <span>কারিগরি রূপায়ণে:</span>
            <span className="text-slate-400 font-semibold">Istiak Ahmed Enan</span>
            <span>• নিখোঁজ অ্যালার্ট বাংলাদেশ</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
