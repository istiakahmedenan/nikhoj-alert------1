import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Calendar, ArrowRight, User, Package } from 'lucide-react';
import { ReportItem, ReportType } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportItem[];
  onSelectReport: (report: ReportItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  reports,
  onSelectReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<ReportType | 'all'>('all');

  const filteredReports = useMemo(() => {
    if (!searchTerm.trim() && activeType === 'all') {
      return reports.slice(0, 8);
    }

    const term = searchTerm.toLowerCase().trim();

    return reports.filter(r => {
      // Type match
      if (activeType !== 'all' && r.type !== activeType) {
        return false;
      }

      if (!term) return true;

      // Text match
      const titleMatch = r.title?.toLowerCase().includes(term);
      const nameMatch = r.name?.toLowerCase().includes(term);
      const nickMatch = r.nickname?.toLowerCase().includes(term);
      const idMatch = r.reportId?.toLowerCase().includes(term);
      const districtMatch = r.district?.toLowerCase().includes(term);
      const upazilaMatch = r.upazila?.toLowerCase().includes(term);
      const locMatch = r.location?.toLowerCase().includes(term);
      const descMatch = r.description?.toLowerCase().includes(term);
      const catMatch = r.category?.toLowerCase().includes(term);

      return (
        titleMatch ||
        nameMatch ||
        nickMatch ||
        idMatch ||
        districtMatch ||
        upazilaMatch ||
        locMatch ||
        descMatch ||
        catMatch
      );
    });
  }, [searchTerm, activeType, reports]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, এলাকা, জেলা, জিনিস বা Report ID দিয়ে খুঁজুন..."
            className="flex-1 text-base sm:text-lg font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Categories */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
              activeType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            সকল ({reports.length})
          </button>
          <button
            onClick={() => setActiveType('missing_person')}
            className={`px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
              activeType === 'missing_person'
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            নিখোঁজ ব্যক্তি
          </button>
          <button
            onClick={() => setActiveType('found_person')}
            className={`px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
              activeType === 'found_person'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            পাওয়া ব্যক্তি
          </button>
          <button
            onClick={() => setActiveType('lost_item')}
            className={`px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
              activeType === 'lost_item'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            হারানো জিনিস
          </button>
          <button
            onClick={() => setActiveType('found_item')}
            className={`px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
              activeType === 'found_item'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            পাওয়া জিনিস
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">কোনো ফলাফল পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400">বানান সঠিক করে বা অন্য কোনো শব্দ দিয়ে সন্ধান করুন।</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div
                key={report.id}
                onClick={() => {
                  onSelectReport(report);
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={report.photos?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-sm font-semibold text-slate-700">
                        {report.reportId}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                        report.type === 'missing_person' ? 'bg-red-100 text-red-700' :
                        report.type === 'found_person' ? 'bg-emerald-100 text-emerald-700' :
                        report.type === 'lost_item' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {report.type === 'missing_person' && 'নিখোঁজ'}
                        {report.type === 'found_person' && 'পাওয়া গেছে'}
                        {report.type === 'lost_item' && 'হারানো'}
                        {report.type === 'found_item' && 'পাওয়া জিনিস'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition truncate mt-0.5">
                      {report.title}
                    </h4>

                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{report.district} ({report.location})</span>
                      </span>
                      <span>•</span>
                      <span>{report.incidentDate}</span>
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
