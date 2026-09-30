import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Phone, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  Flag,
  Copy,
  Check,
  User,
  Package
} from 'lucide-react';
import { ReportItem } from '../types';

interface ReportDetailModalProps {
  report: ReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReportSighting: (report: ReportItem) => void;
  onOpenCorrection: (report: ReportItem) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onReportSighting,
  onOpenCorrection
}) => {
  const [copied, setCopied] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  if (!isOpen || !report) return null;

  const isPerson = report.type === 'missing_person' || report.type === 'found_person';
  const defaultImage = isPerson 
    ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';

  const imageSrc = report.photos && report.photos.length > 0 ? report.photos[0] : defaultImage;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `?reportId=${report.reportId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.origin + `?reportId=${report.reportId}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md">
              {report.reportId}
            </span>
            {report.isUrgent && (
              <span className="text-xs bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                জরুরি সন্ধান
              </span>
            )}
            {report.status === 'resolved' && (
              <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                সন্ধান মিলেছে 🟢
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPoster}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition text-xs flex items-center gap-1 font-medium cursor-pointer"
              title="পোস্টার প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">পোস্টার প্রিন্ট</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 print:p-8">
          {/* Printable Header Notice */}
          <div className="hidden print:block text-center border-b-2 border-red-600 pb-4 mb-4">
            <h1 className="text-3xl font-black text-red-600 uppercase">
              {report.type === 'missing_person' ? 'নিখোঁজ সংবাদ / MISSING ALERT' : 'জরুরি বিজ্ঞপ্তি'}
            </h1>
            <p className="text-sm font-bold text-slate-700 mt-1">
              Nikhoj Alert - নিখোঁজ মানুষ ও হারানো জিনিসের তথ্যভাণ্ডার (https://nikhojalert.online)
            </p>
          </div>

          {/* Photo & Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Column */}
            <div className="md:col-span-5 space-y-2">
              <div className="aspect-3/4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                <img
                  src={imageSrc}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {report.isDemo && (
                <div className="text-center p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-800">
                  নমুনা তথ্য / DEMO
                </div>
              )}
            </div>

            {/* Information Column */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-2">
                  {report.category || 'সাধারণ তথ্য'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {report.title}
                </h2>
              </div>

              {/* Status Banner */}
              {report.status === 'resolved' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>সন্ধান সফলভাবে সম্পন্ন হয়েছে</span>
                  </div>
                  {report.resolutionNote && (
                    <p className="text-emerald-700">{report.resolutionNote}</p>
                  )}
                  {report.resolvedAt && (
                    <p className="text-[11px] text-emerald-600">
                      তারিখ: {new Date(report.resolvedAt).toLocaleDateString('bn-BD')}
                    </p>
                  )}
                </div>
              )}

              {/* Details table */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                {isPerson ? (
                  <>
                    <div>
                      <p className="text-slate-500 font-medium">নাম</p>
                      <p className="text-slate-900 font-bold text-sm mt-0.5">{report.name || 'অজ্ঞাত'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">ডাকনাম</p>
                      <p className="text-slate-900 font-semibold mt-0.5">{report.nickname || 'নেই'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">বয়স</p>
                      <p className="text-slate-900 font-semibold mt-0.5">{report.age || 'অজানা'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">লিঙ্গ</p>
                      <p className="text-slate-900 font-semibold mt-0.5">
                        {report.gender === 'male' ? 'পুরুষ' : report.gender === 'female' ? 'নারী' : 'অন্যান্য'}
                      </p>
                    </div>
                    {report.physicalDescription && (
                      <div className="col-span-2">
                        <p className="text-slate-500 font-medium">শারীরিক গড়ন ও বর্ণ</p>
                        <p className="text-slate-900 font-semibold mt-0.5">{report.physicalDescription}</p>
                      </div>
                    )}
                    {report.clothing && (
                      <div className="col-span-2">
                        <p className="text-slate-500 font-medium">পোশাক</p>
                        <p className="text-slate-900 font-semibold mt-0.5">{report.clothing}</p>
                      </div>
                    )}
                    {report.identificationMarks && (
                      <div className="col-span-2">
                        <p className="text-slate-500 font-medium">শনাক্তকারী বিশেষ চিহ্ন</p>
                        <p className="text-slate-900 font-semibold mt-0.5 text-red-700">{report.identificationMarks}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-slate-500 font-medium">জিনিস</p>
                      <p className="text-slate-900 font-bold text-sm mt-0.5">{report.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">ধরন</p>
                      <p className="text-slate-900 font-semibold mt-0.5">{report.category}</p>
                    </div>
                  </>
                )}

                {/* Location & Time */}
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <p className="text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ঘটনাস্থল ও এলাকা</span>
                  </p>
                  <p className="text-slate-900 font-bold mt-0.5">
                    {report.location}, {report.upazila ? `${report.upazila}, ` : ''}{report.district}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>তারিখ</span>
                  </p>
                  <p className="text-slate-900 font-semibold mt-0.5">{report.incidentDate}</p>
                </div>

                {report.incidentTime && (
                  <div>
                    <p className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>সময়</span>
                    </p>
                    <p className="text-slate-900 font-semibold mt-0.5">{report.incidentTime}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Narrative Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              বিস্তারিত বিবরণ
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {report.description}
            </div>
          </div>

          {/* Contact Verification Box */}
          <div className="p-4 sm:p-5 bg-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-300 font-medium">জরুরি যোগাযোগের তথ্য</p>
              <h4 className="text-base font-bold text-white mt-0.5">
                {report.contactName}
              </h4>
              <p className="text-xs text-emerald-200/80 mt-1">
                {report.contactMethod || 'সরাসরি ফোন কল'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {showPhone ? (
                <a
                  href={`tel:${report.contactPhone}`}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-center flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>{report.contactPhone}</span>
                </a>
              ) : (
                <button
                  onClick={() => setShowPhone(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>নম্বর দেখুন ও কল করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Row Per Requirement */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              {/* Sighting button */}
              {report.status !== 'resolved' && (
                <button
                  onClick={() => onReportSighting(report)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-emerald-200" />
                  <span>আমি তাকে দেখেছি / তথ্য দিতে চাই</span>
                </button>
              )}

              {/* Share */}
              <button
                onClick={handleShareFacebook}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>ফেসবুকে শেয়ার</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
              </button>
            </div>

            {/* Correction Request button */}
            <button
              onClick={() => onOpenCorrection(report)}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>সংশোধন / ভুল তথ্য জানান</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
