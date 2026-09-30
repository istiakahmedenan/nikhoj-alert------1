import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Eye, Upload, ShieldCheck, Loader2 } from 'lucide-react';
import { ReportItem } from '../types';
import { submitSighting } from '../services/reportService';

interface SightingModalProps {
  report: ReportItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SightingModal: React.FC<SightingModalProps> = ({
  report,
  isOpen,
  onClose
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sightingId, setSightingId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phone.trim() || !location.trim() || !description.trim()) {
      setErrorMessage('অনুগ্রহ করে মোবাইল নম্বর, স্থান এবং বিস্তারিত বিবরণ প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitSighting({
        reportId: report.reportId,
        name: name.trim() || 'নাম প্রকাশে অনিচ্ছুক',
        phone,
        location,
        district: report.district,
        upazila: report.upazila,
        date,
        time,
        description
      });

      setSightingId(res.sightingId);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMessage('দুঃখিত, তথ্যটি পাঠাতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setName('');
    setPhone('');
    setLocation('');
    setDescription('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-base font-bold">আমি তাকে দেখেছি / তথ্য জানাতে চাই</h3>
              <p className="text-xs text-emerald-200">রিপোর্ট আইডি: {report.reportId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-emerald-300 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                আপনার মূল্যবান তথ্যের জন্য ধন্যবাদ!
              </h4>
              <p className="text-xs text-slate-600">
                আপনার জমাকৃত তথ্য এবং প্রমাণাদি সরাসরি আমাদের অনুসন্ধান ও ভেরিফিকেশন টিম এবং সংশ্লিষ্ট পরিবারের কাছে প্রেরিত হয়েছে।
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700">
                Sighting Tracking ID: {sightingId}
              </div>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Privacy protection guarantee */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>গোপনীয়তার নিশ্চয়তা:</strong> আপনার ব্যক্তিগত নাম ও ফোন নম্বর সাধারণ জনগণের কাছে কখনোই প্রকাশ করা হবে না। এটি শুধুমাত্র অ্যাডমিন প্যানেল থেকে তদন্তের স্বার্থে সংরক্ষিত থাকবে।
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="নাম প্রকাশ না করতে চাইলে খালি রাখুন"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭১১-XXXXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    দেখার তারিখ *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সময় (আনুমানিক)
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="যেমন: দুপুর ২:৩০"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  যেখানে দেখেছেন (সুনির্দিষ্ট স্থান বা এলাকা) *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="যেমন: মহাখালী বাস টার্মিনালের কাছে একটি দোকানে"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিস্তারিত অবস্থা ও শনাক্তকারী লক্ষণ *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="তার শারীরিক অবস্থা, কার সাথে ছিলেন, কী পোশাক পরেছিলেন ইত্যাদি বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'পাঠানো হচ্ছে...' : 'তথ্য জমা দিন'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
