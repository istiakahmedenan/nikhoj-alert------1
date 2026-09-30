import React, { useState } from 'react';
import { 
  ScanFace, 
  Upload, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  Loader2, 
  Info,
  ArrowRight
} from 'lucide-react';
import { ReportItem, FaceMatchResult } from '../types';
import { searchFacesWithAI } from '../services/aiFaceService';

interface AIFaceSearchSectionProps {
  reports: ReportItem[];
  onViewReport: (report: ReportItem) => void;
}

export const AIFaceSearchSection: React.FC<AIFaceSearchSectionProps> = ({
  reports,
  onViewReport
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FaceMatchResult[] | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
        setResults(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartSearch = async () => {
    if (!uploadedImage) return;
    setSearching(true);
    try {
      const matchResults = await searchFacesWithAI(
        uploadedImage, 
        reports, 
        { gender: selectedGender || undefined }
      );
      setResults(matchResults);
    } catch (err) {
      console.error(err);
      alert('সার্চ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setSearching(false);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setResults(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-900 rounded-full text-xs font-bold mb-3">
          <ScanFace className="w-4 h-4 text-purple-700" />
          <span>আধুনিক কৃত্রিম বুদ্ধিমত্তা ফেস ম্যাচিং</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          AI Face Search (মুখাবয়ব অনুসন্ধান)
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          হারানো বা উদ্ধারকৃত কোনো ব্যক্তির পরিষ্কার ছবি আপলোড করে Nikhoj Alert ডাটাবেজের নিখোঁজ ব্যক্তিদের ছবির সাথে কৃত্রিম বুদ্ধিমত্তার সাহায্যে মিল খুঁজুন।
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950 mb-0.5">
            ব্যক্তিগত তথ্যের নিরাপত্তা ও আইনি সতর্কবার্তা:
          </h4>
          <p>
            ১. আপলোডকৃত ছবি শুধুমাত্র সম্ভাব্য মিল খোঁজার জন্য সাময়িকভাবে প্রসেস করা হয়। কোনো ফেস ভেক্টর বা ব্যক্তিগত ছবি প্রকাশ্যে দেখানো হয় না।
          </p>
          <p className="mt-1 font-semibold text-red-800">
            ২. এটি শুধুমাত্র একটি প্রযুক্তিগত সহায়তামূলক মাধ্যম। কোনো অ্যালগরিদম ফলাফলই চূড়ান্ত আইনি পরিচয় নয়। প্রতিটি মিল মানুষের উপস্থিতিতে যাচাই করা বাধ্যতামূলক।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>১. ছবি নির্বাচন করুন</span>
          </h3>

          {uploadedImage ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
              <img
                src={uploadedImage}
                alt="Uploaded face"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={handleClearImage}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ছবি মুছে ফেলুন (Purge)</span>
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-2xl cursor-pointer bg-purple-50/40 hover:bg-purple-50 transition p-6 text-center">
              <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                ফটোগ্রাফ সিলেক্ট করুন
              </span>
              <span className="text-xs text-slate-500 mt-1">
                সামনাসামনি পরিষ্কার ও আলোযুক্ত ছবি ব্যবহার করুন
              </span>
              <span className="text-[11px] text-purple-700 font-semibold mt-3 bg-purple-100/70 px-2 py-0.5 rounded-sm">
                JPG, PNG, WEBP (সর্বোচ্চ ৫MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Optional Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              আনুমানিক লিঙ্গ (ঐচ্ছিক ফিল্টার)
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
            >
              <option value="">সকল লিঙ্গ</option>
              <option value="male">পুরুষ</option>
              <option value="female">নারী</option>
            </select>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 rounded-sm text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-600 cursor-pointer">
              আমি নিশ্চয়তা দিচ্ছি যে এই ছবিটি কোনো অপরাধমূলক কাজে ব্যবহার করা হচ্ছে না এবং আমি গোপনীয়তা নীতি মেনে নিচ্ছি।
            </label>
          </div>

          {/* Search Button */}
          <button
            onClick={handleStartSearch}
            disabled={!uploadedImage || !consentGiven || searching}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI ফেস অ্যানালাইসিস চলছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>ম্যাচিং শুরু করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              ২. সম্ভাব্য মিলের ফলাফল
            </h3>
            {results && (
              <span className="text-xs text-slate-500 font-medium">
                {results.length} টি সম্ভাব্য মিল পাওয়া গেছে
              </span>
            )}
          </div>

          {searching ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto animate-pulse">
                <ScanFace className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">
                ডাটাবেজের সংরক্ষিত নিখোঁজ ছবির সাথে মেলানো হচ্ছে...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                মুখমণ্ডলের গঠন, চোখ, নাক এবং অন্যান্য শনাক্তকারী বৈশিষ্ট্যের অনুপাত গণনা করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।
              </p>
            </div>
          ) : results === null ? (
            <div className="bg-slate-50 p-12 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 space-y-2">
              <ScanFace className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">ফলাফল দেখার জন্য ছবি আপলোড করুন</p>
              <p className="text-xs text-slate-400">
                বাম পাশের প্যানেলে নিখোঁজ বা উদ্ধারকৃত ব্যক্তির ছবি আপলোড করে সার্চ করুন।
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                কোনো উল্লেখযোগ্য মিল পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                বর্তমান ডাটাবেজের সংরক্ষিত ছবির সাথে কোনো যথেষ্ট সাদৃশ্য পাওয়া যায়নি। ব্যক্তির বয়স বা চেহারার কিছুটা পরিবর্তন থাকলে সাধারণ সার্চ দিয়ে খোঁজার চেষ্টা করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mandatory System Disclaimer */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>সতর্কতা: এটি সম্ভাব্য মিল, চূড়ান্ত পরিচয় নয়। পরিবার ও প্রশাসন কর্তৃক সরাসরি যাচাইকরণ আবশ্যক।</span>
              </div>

              {/* Match Result Cards */}
              {results.map((res, index) => (
                <div
                  key={res.report.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-sm transition space-y-3"
                >
                  <div className="flex items-start gap-4">
                    {/* Report Photo */}
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={res.report.photos?.[0]}
                        alt={res.report.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Match percentage badge */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          res.similarityScore >= 85 
                            ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {res.similarityScore}% সম্ভাব্য মিল
                        </span>

                        <span className="font-mono text-[11px] text-slate-500">
                          {res.report.reportId}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 truncate">
                        {res.report.name || res.report.title}
                      </h4>

                      <p className="text-xs text-slate-500 mt-0.5">
                        বয়স: {res.report.age || 'অজানা'} • এলাকা: {res.report.district} ({res.report.location})
                      </p>

                      {/* Matched Features */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {res.matchedFeatures.map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <p className="text-slate-600 line-clamp-1 italic text-[11px]">
                      {res.analysisReason}
                    </p>

                    <button
                      onClick={() => onViewReport(res.report)}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>রিপোর্ট দেখুন</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
