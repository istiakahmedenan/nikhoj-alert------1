import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  User, 
  Package 
} from 'lucide-react';
import { ReportItem } from '../types';

interface ReportCardProps {
  report: ReportItem;
  onViewDetails: (report: ReportItem) => void;
  onReportSighting: (report: ReportItem) => void;
  onShare: (report: ReportItem) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onViewDetails,
  onReportSighting,
  onShare,
}) => {
  const isPerson = report.type === 'missing_person' || report.type === 'found_person';
  const isFound = report.status === 'resolved' || report.type === 'found_person' || report.type === 'found_item';
  const isMissing = report.type === 'missing_person' || report.type === 'lost_item';

  const defaultImage = isPerson 
    ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
    : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80';

  const displayImage = report.photos && report.photos.length > 0 ? report.photos[0] : defaultImage;

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col ${
      report.isUrgent 
        ? 'border-red-300 ring-1 ring-red-400/40 bg-gradient-to-b from-red-50/20 to-white' 
        : report.status === 'resolved'
        ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/20 to-white'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Card Image Area with Badges */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={report.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
          {/* Main Status Badge */}
          {report.status === 'resolved' ? (
            <span className="bg-emerald-600/95 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
              <span>{isPerson ? 'সন্ধান পাওয়া গেছে 🟢' : 'জিনিসটি পাওয়া গেছে 🟢'}</span>
            </span>
          ) : report.isUrgent ? (
            <span className="bg-red-600/95 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
              <span>জরুরি সন্ধান</span>
            </span>
          ) : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs ${
              report.type === 'missing_person'
                ? 'bg-red-900/90 text-red-100'
                : report.type === 'found_person'
                ? 'bg-emerald-900/90 text-emerald-100'
                : report.type === 'lost_item'
                ? 'bg-amber-900/90 text-amber-100'
                : 'bg-teal-900/90 text-teal-100'
            }`}>
              {report.type === 'missing_person' && 'নিখোঁজ ব্যক্তি'}
              {report.type === 'found_person' && 'পাওয়া ব্যক্তি'}
              {report.type === 'lost_item' && 'হারানো জিনিস'}
              {report.type === 'found_item' && 'পাওয়া জিনিস'}
            </span>
          )}

          {/* Verification Badge */}
          {report.verificationStatus === 'verified' && (
            <span className="bg-blue-600/95 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>যাচাইকৃত</span>
            </span>
          )}
        </div>

        {/* Demo Data Tag if Demo */}
        {report.isDemo && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="bg-black/75 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-sm backdrop-blur-xs uppercase tracking-wider">
              নমুনা তথ্য / DEMO
            </span>
          </div>
        )}

        {/* Report ID chip */}
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <span className="bg-slate-900/80 text-white font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
            {report.reportId}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Person details */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
              {report.category || 'সাধারণ'}
            </span>
            {isPerson && report.age && (
              <span className="text-slate-600 font-medium">
                বয়স: {report.age}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(report)}
            className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 transition line-clamp-2 cursor-pointer leading-snug mb-2"
          >
            {report.title}
          </h3>

          {/* Location and Date */}
          <div className="space-y-1.5 text-xs text-slate-600 mb-3">
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-medium">
                {report.district} {report.upazila ? `(${report.upazila})` : ''} - {report.location}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{report.incidentDate || 'তারিখ অপ্রকাশিত'}</span>
              </span>
              {report.incidentTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{report.incidentTime}</span>
                </span>
              )}
            </div>
          </div>

          {/* Brief Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(report)}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>বিস্তারিত</span>
          </button>

          {/* Sighting button (only if still active/missing) */}
          {report.status !== 'resolved' && (
            <button
              onClick={() => onReportSighting(report)}
              className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition flex items-center justify-center gap-1 cursor-pointer"
              title="তথ্য দিতে ক্লিক করুন"
            >
              <span>দেখেছি?</span>
            </button>
          )}

          <button
            onClick={() => onShare(report)}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="শেয়ার করুন"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
