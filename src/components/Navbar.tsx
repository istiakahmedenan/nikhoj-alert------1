import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  PlusCircle, 
  ShieldCheck, 
  ScanFace, 
  MapPin, 
  PhoneCall, 
  ChevronDown 
} from 'lucide-react';
import { ReportType } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string, filterType?: ReportType | 'all', districtSlug?: string) => void;
  onOpenSearch: () => void;
  onOpenReportModal: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenReportModal,
  isAdminLoggedIn,
  onOpenAdminLogin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);

  const handleNavClick = (tab: string, filterType?: ReportType | 'all') => {
    onSelectTab(tab, filterType);
    setMobileMenuOpen(false);
    setReportDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-13 md:h-14">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 cursor-pointer group select-none min-w-0"
          >
            <img 
              src="https://i.postimg.cc/FKKTLRZG/output-onlinepngtools.png" 
              alt="Nikhoj Alert Logo" 
              className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition leading-none block">
                Nikhoj<span className="text-emerald-600">Alert</span>
              </span>
              <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 hidden md:block leading-tight mt-0.5">
                নিখোঁজ মানুষ ও হারানো জিনিসের তথ্যভাণ্ডার
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-0.5 font-medium text-xs md:text-sm text-slate-700">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                currentTab === 'home' 
                  ? 'text-emerald-700 bg-emerald-50 font-bold' 
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              হোম
            </button>

            <button
              onClick={() => handleNavClick('feed', 'missing_person')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                currentTab === 'feed' 
                  ? 'text-emerald-700 bg-emerald-50 font-bold' 
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              নিখোঁজ
            </button>

            <button
              onClick={() => handleNavClick('feed', 'found_person')}
              className="px-2.5 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              পাওয়া গেছে
            </button>

            <button
              onClick={() => handleNavClick('feed', 'lost_item')}
              className="px-2.5 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              হারানো জিনিস
            </button>

            <button
              onClick={() => handleNavClick('feed', 'found_item')}
              className="px-2.5 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              পাওয়া জিনিস
            </button>

            <button
              onClick={() => handleNavClick('districts')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${
                currentTab === 'districts' 
                  ? 'text-emerald-700 bg-emerald-50 font-bold' 
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>জেলাসমূহ</span>
            </button>

            <button
              onClick={() => handleNavClick('facesearch')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                currentTab === 'facesearch' 
                  ? 'text-purple-700 bg-purple-50 font-bold' 
                  : 'hover:text-purple-700 hover:bg-purple-50/60 text-purple-900'
              }`}
            >
              <ScanFace className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Face Search</span>
              <span className="text-[8px] bg-purple-600 text-white font-bold px-1 py-0.2 rounded-xs">NEW</span>
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                currentTab === 'about' 
                  ? 'text-emerald-700 bg-emerald-50 font-bold' 
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              আমাদের সম্পর্কে
            </button>
          </nav>

          {/* Action buttons (Search & Submit) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition cursor-pointer"
              title="খুঁজুন (নাম, এলাকা, রিপোর্ট আইডি)"
            >
              <Search className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline text-xs font-normal">খুঁজুন...</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>রিপোর্ট করুন</span>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'home' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            হোমপেজ
          </button>
          <button
            onClick={() => handleNavClick('feed', 'missing_person')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            নিখোঁজ ব্যক্তি
          </button>
          <button
            onClick={() => handleNavClick('feed', 'found_person')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            পাওয়া ব্যক্তি
          </button>
          <button
            onClick={() => handleNavClick('feed', 'lost_item')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            হারানো জিনিস
          </button>
          <button
            onClick={() => handleNavClick('feed', 'found_item')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            পাওয়া জিনিস
          </button>
          <button
            onClick={() => handleNavClick('districts')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
          >
            <span>জেলাসমূহ (৬৪ জেলা)</span>
            <MapPin className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => handleNavClick('facesearch')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-purple-800 bg-purple-50 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <ScanFace className="w-4 h-4 text-purple-600" />
              <span>AI Face Search</span>
            </span>
            <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded-sm">NEW</span>
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            আমাদের সম্পর্কে ও যোগাযোগ
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReportModal();
              }}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-sm text-center flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন রিপোর্ট জমা দিন</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
