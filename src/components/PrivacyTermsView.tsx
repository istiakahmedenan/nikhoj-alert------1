import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft, AlertCircle } from 'lucide-react';

interface PrivacyTermsViewProps {
  onBack: () => void;
  onOpenReportModal: () => void;
}

export const PrivacyTermsView: React.FC<PrivacyTermsViewProps> = ({
  onBack,
  onOpenReportModal
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>হোমপেজে ফিরুন</span>
        </button>

        <h1 className="text-3xl font-black text-slate-900">
          গোপনীয়তা নীতি ও ব্যবহারের শর্তাবলী (Privacy & Terms)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          সর্বশেষ হালনাগাদ: ১ জানুয়ারি, ২০২৬ • Nikhoj Alert Official Legal Policy
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-slate-700 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>১. তথ্যের উদ্দেশ্য ও সংরক্ষণ</span>
          </h2>
          <p>
            Nikhoj Alert (https://nikhojalert.online) একটি জাতীয় স্তরের জনকল্যাণমূলক ও তথ্য আদান-প্রদান প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য নিখোঁজ মানুষ এবং হারানো জিনিসপত্রের তথ্য পরিবার ও প্রশাসনের সহায়তার জন্য দ্রুততম সময়ে জনগণের কাছে পৌঁছে দেওয়া।
          </p>
          <p>
            জমাকৃত প্রতিটি তথ্য আমাদের সুরক্ষিত ক্লাউড ফায়ারস্টোর ডাটাবেজে এনক্রিপ্টেড অবস্থায় সংরক্ষিত থাকে।
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>২. সংবেদনশীল তথ্যের নিরাপত্তা ও সুরক্ষানীতি</span>
          </h2>
          <p>
            আমরা কখনো কোনো ব্যক্তির জাতীয় পরিচয়পত্র (NID), পাসপোর্ট নম্বর, ব্যক্তিগত ব্যাঙ্ক তথ্য বা অপ্রয়োজনীয় সংবেদনশীল ঠিকানা ওয়েবসাইটে প্রকাশ্যে প্রচার করি না।
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>প্রত্যক্ষদর্শীদের জমাকৃত তথ্য (Sightings) সম্পূর্ণভাবে সাধারণ পাবলিকদের কাছ থেকে গোপন থাকে। এটি শুধুমাত্র অনুমোদিত অ্যাডমিন ও তদন্ত টিম পর্যবেক্ষণ করতে পারে।</li>
            <li>মিথ্যা বা ভুয়া তথ্য প্রদান করা হলে সংশ্লিষ্ট আইপি ও ফোন নম্বর সংরক্ষণপূর্বক প্রয়োজনীয় আইনি ব্যবস্থা গ্রহণ করা হতে পারে।</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>৩. তথ্য সংশোধন বা অপসারণের অধিকার (Request Removal)</span>
          </h2>
          <p>
            কোনো নিখোঁজ ব্যক্তি বা হারানো জিনিস উদ্ধার হলে তা সাথে সাথে অ্যাডমিন প্যানেল থেকে 'সন্ধান সম্পন্ন' হিসেবে চিহ্নিত করা হয় অথবা পরিবারের অনুরোধক্রমে স্থায়ীভাবে পাবলিক ভিউ থেকে সরিয়ে ফেলা হয়।
          </p>
          <p>
            আপনার কোনো তথ্যে ভুল পরিলক্ষিত হলে যে কোনো সময় রিপোর্টের নিচে থাকা 'সংশোধন / ভুল তথ্য জানান' বাটনে ক্লিক করে অথবা সরাসরি <a href="mailto:nikhojalert.info@gmail.com" className="text-emerald-700 underline font-semibold">nikhojalert.info@gmail.com</a> এ ইমেইল করে অবহিত করতে পারেন।
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>৪. AI ফেস সার্চ ব্যবহারের শর্ত</span>
          </h2>
          <p>
            প্ল্যাটফর্মের ফেস সার্চ সুবিধাটি কোনো চূড়ান্ত আইনি বা বায়োমেট্রিক শনাক্তকরণ নয়। এটি সম্ভাব্য মিল খুঁজে বের করার একটি প্রযুক্তিগত অ্যালগরিদম। কোনো ফলাফলের ভিত্তিতে চূড়ান্ত সিদ্ধান্ত নেওয়ার পূর্বে পরিবার ও স্থানীয় আইন-শৃঙ্খলা বাহিনীর প্রত্যক্ষ সহায়তা গ্রহণ বাধ্যতামূলক।
          </p>
        </section>
      </div>
    </div>
  );
};
