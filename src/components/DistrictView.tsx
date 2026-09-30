import React, { useState } from 'react';
import { MapPin, ArrowLeft, AlertTriangle, Users, Package, CheckCircle2, ChevronRight } from 'lucide-react';
import { DIVISIONS, DISTRICTS, District, getDistrictBySlug } from '../data/bangladeshData';
import { ReportItem } from '../types';
import { ReportCard } from './ReportCard';

interface DistrictViewProps {
  selectedDistrictSlug: string | null;
  onSelectDistrict: (slug: string | null) => void;
  reports: ReportItem[];
  onViewReport: (report: ReportItem) => void;
  onReportSighting: (report: ReportItem) => void;
  onShare: (report: ReportItem) => void;
}

export const DistrictView: React.FC<DistrictViewProps> = ({
  selectedDistrictSlug,
  onSelectDistrict,
  reports,
  onViewReport,
  onReportSighting,
  onShare
}) => {
  const [activeDivisionTab, setActiveDivisionTab] = useState<string>('all');

  const currentDistrict = selectedDistrictSlug 
    ? getDistrictBySlug(selectedDistrictSlug) || DISTRICTS.find(d => d.slug === 'sherpur')
    : null;

  // If a district is selected, display that district's dedicated page!
  if (currentDistrict) {
    const districtReports = reports.filter(r => 
      r.district.toLowerCase() === currentDistrict.id.toLowerCase() ||
      r.district === currentDistrict.nameBn ||
      r.district.toLowerCase() === currentDistrict.slug.toLowerCase()
    );

    const urgentList = districtReports.filter(r => r.isUrgent && r.status !== 'resolved');
    const missingList = districtReports.filter(r => r.type === 'missing_person' && r.status !== 'resolved');
    const foundPersonList = districtReports.filter(r => r.type === 'found_person');
    const lostItemList = districtReports.filter(r => r.type === 'lost_item' && r.status !== 'resolved');
    const foundItemList = districtReports.filter(r => r.type === 'found_item');
    const resolvedList = districtReports.filter(r => r.status === 'resolved');

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back breadcrumb */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectDistrict(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল জেলা তালিকায় ফিরুন</span>
          </button>
        </div>

        {/* District Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4" />
                <span>জেলা তথ্যভাণ্ডার • {currentDistrict.nameEn} District</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {currentDistrict.nameBn} জেলার নিখোঁজ ও হারানো তথ্য
              </h1>
              <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
                {currentDistrict.nameBn} জেলার সকল নিখোঁজ মানুষ, উদ্ধারকৃত ব্যক্তি এবং হারানো জিনিসপত্রের তালিকা।
              </p>
            </div>

            {/* Quick Count Badge */}
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
              <span className="block text-2xl font-black text-emerald-300">{districtReports.length}</span>
              <span className="text-xs text-white/80 font-medium">মোট নথিভুক্ত রেকর্ড</span>
            </div>
          </div>

          {/* Upazila chips */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-emerald-300 font-bold mr-1">উপজেলা / থানা:</span>
            {currentDistrict.upazilas.map(u => (
              <span key={u} className="bg-white/15 px-2.5 py-1 rounded-md text-white font-medium">
                {u}
              </span>
            ))}
          </div>
        </div>

        {/* Sections per User Requirement */}
        
        {/* 1. Urgent Reports */}
        {urgentList.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <h2>জরুরি নিখোঁজ রিপোর্ট ({urgentList.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentList.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onViewDetails={onViewReport}
                  onReportSighting={onReportSighting}
                  onShare={onShare}
                />
              ))}
            </div>
          </section>
        )}

        {/* 2. Latest Missing */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Users className="w-5 h-5 text-red-600" />
              <h2>সর্বশেষ নিখোঁজ ব্যক্তি ({missingList.length})</h2>
            </div>
          </div>

          {missingList.length === 0 ? (
            <p className="text-xs text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">
              এই জেলায় বর্তমানে কোনো সক্রিয় নিখোঁজ রিপোর্ট নথিভুক্ত নেই।
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {missingList.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onViewDetails={onViewReport}
                  onReportSighting={onReportSighting}
                  onShare={onShare}
                />
              ))}
            </div>
          )}
        </section>

        {/* 3. Found Person & Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Found Persons */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2>পাওয়া ব্যক্তি ({foundPersonList.length})</h2>
            </div>
            {foundPersonList.length === 0 ? (
              <p className="text-xs text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">
                এই জেলায় কোনো উদ্ধারকৃত ব্যক্তির রিপোর্ট নেই।
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {foundPersonList.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onViewDetails={onViewReport}
                    onReportSighting={onReportSighting}
                    onShare={onShare}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Lost & Found Items */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Package className="w-5 h-5 text-amber-600" />
              <h2>হারানো ও পাওয়া জিনিসপত্র ({lostItemList.length + foundItemList.length})</h2>
            </div>
            {lostItemList.length + foundItemList.length === 0 ? (
              <p className="text-xs text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">
                কোনো হারানো বা পাওয়া জিনিসের তথ্য নেই।
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...lostItemList, ...foundItemList].map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onViewDetails={onViewReport}
                    onReportSighting={onReportSighting}
                    onShare={onShare}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 4. Resolved Reports */}
        {resolvedList.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2>সমাধান হওয়া রিপোর্ট (সফলভাবে সন্ধান প্রাপ্ত) ({resolvedList.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedList.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onViewDetails={onViewReport}
                  onReportSighting={onReportSighting}
                  onShare={onShare}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Otherwise, display 64 Districts Directory grouped by Divisions
  const displayedDistricts = activeDivisionTab === 'all'
    ? DISTRICTS
    : DISTRICTS.filter(d => d.divisionId === activeDivisionTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          ৬৪ জেলার নিখোঁজ ও হারানো তথ্যভাণ্ডার
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          আপনার নিজ জেলা বা এলাকা নির্বাচন করে নিখোঁজ মানুষ এবং উদ্ধারকৃত মালামালের সর্বশেষ তথ্য জানুন।
        </p>
      </div>

      {/* Division Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveDivisionTab('all')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeDivisionTab === 'all'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          সকল বিভাগ
        </button>
        {DIVISIONS.map(div => (
          <button
            key={div.id}
            onClick={() => setActiveDivisionTab(div.id)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeDivisionTab === div.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {div.nameBn} বিভাগ
          </button>
        ))}
      </div>

      {/* Districts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {displayedDistricts.map(dist => {
          const count = reports.filter(r => 
            r.district.toLowerCase() === dist.id.toLowerCase() ||
            r.district === dist.nameBn
          ).length;

          return (
            <div
              key={dist.id}
              onClick={() => onSelectDistrict(dist.slug)}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{dist.nameEn}</span>
                  {count > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                      {count} রিপোর্ট
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {dist.nameBn}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {dist.upazilas.slice(0, 3).join(', ')}...
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <span>তথ্য দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
