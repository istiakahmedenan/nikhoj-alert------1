import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Package, 
  MapPin, 
  Calendar, 
  Phone, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { DIVISIONS, DISTRICTS, getDistrictsByDivision } from '../data/bangladeshData';
import { ReportType } from '../types';
import { submitPublicReport } from '../services/reportService';

interface ReportSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ReportType;
  onSuccess: (reportId: string) => void;
}

export const ReportSubmissionModal: React.FC<ReportSubmissionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'missing_person',
  onSuccess
}) => {
  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka');
  const [upazila, setUpazila] = useState('');
  
  // Person fields
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [skinColor, setSkinColor] = useState('');
  const [clothing, setClothing] = useState('');
  const [identificationMarks, setIdentificationMarks] = useState('');
  
  // Item fields
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('স্মার্টফোন');
  const [itemBrand, setItemBrand] = useState('');
  const [itemColor, setItemColor] = useState('');
  
  // Common incident fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Contact details
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMethod, setContactMethod] = useState('সরাসরি ফোন কল ও হোয়াটসঅ্যাপ');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Available districts based on chosen division
  const availableDistricts = getDistrictsByDivision(division);
  const currentDistrictObj = DISTRICTS.find(d => d.id === district) || availableDistricts[0];

  const handleDivisionChange = (divId: string) => {
    setDivision(divId);
    const districtsInDiv = getDistrictsByDivision(divId);
    if (districtsInDiv.length > 0) {
      setDistrict(districtsInDiv[0].id);
      setUpazila(districtsInDiv[0].upazilas[0] || '');
    }
  };

  const handleDistrictChange = (distId: string) => {
    setDistrict(distId);
    const distObj = DISTRICTS.find(d => d.id === distId);
    if (distObj && distObj.upazilas.length > 0) {
      setUpazila(distObj.upazilas[0]);
    }
  };

  // Image Upload / Compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('শুধুমাত্র JPG, PNG বা WEBP ছবি গ্রহণযোগ্য।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotos([event.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!contactPhone.trim() || !contactName.trim()) {
      setErrorMessage('অনুগ্রহ করে যোগাযোগের নাম এবং মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    const isPerson = reportType === 'missing_person' || reportType === 'found_person';
    const computedTitle = title.trim() || (isPerson 
      ? `${name || 'অজ্ঞাত ব্যক্তি'} - ${reportType === 'missing_person' ? 'নিখোঁজ' : 'পাওয়া গেছে'}`
      : `${itemName || 'জিনিস'} - ${reportType === 'lost_item' ? 'হারানো' : 'পাওয়া গেছে'}`);

    if (isPerson && !name.trim()) {
      setErrorMessage('অনুগ্রহ করে ব্যক্তির নাম অথবা "অজ্ঞাত" উল্লেখ করুন।');
      return;
    }

    if (!isPerson && !itemName.trim()) {
      setErrorMessage('অনুগ্রহ করে জিনিসের নাম উল্লেখ করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitPublicReport({
        type: reportType,
        category: isPerson 
          ? (age ? `${age} বয়সী` : 'সাধারণ') 
          : itemCategory,
        title: computedTitle,
        name: isPerson ? name : itemName,
        nickname: nickname,
        age: age,
        gender: isPerson ? gender : undefined,
        photos: photos.length > 0 ? photos : [],
        description: description || 'বিস্তারিত তথ্য পরবর্তীতে আপডেট করা হবে।',
        division,
        district: currentDistrictObj?.nameBn || district,
        upazila: upazila || currentDistrictObj?.upazilas[0] || '',
        location: location || currentDistrictObj?.nameBn || 'অজ্ঞাত এলাকা',
        incidentDate,
        incidentTime,
        clothing: clothing,
        physicalDescription: height ? `উচ্চতা: ${height}, বর্ণ: ${skinColor}` : skinColor,
        identificationMarks,
        contactName,
        contactPhone,
        contactMethod
      });

      setSubmittedReportId(result.reportId);
      onSuccess(result.reportId);
    } catch (err) {
      console.error(err);
      setErrorMessage('দুঃখিত, তথ্যটি এখন জমা দেওয়া যাচ্ছে না। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedReportId(null);
    setName('');
    setItemName('');
    setTitle('');
    setDescription('');
    setPhotos([]);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {submittedReportId ? 'রিপোর্ট সফলভাবে জমা হয়েছে' : 'নতুন তথ্য বা রিপোর্ট জমা দিন'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              যাচাইকরণের পর আপনার তথ্যটি সারা বাংলাদেশে প্রকাশিত হবে
            </p>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Success Screen */}
          {submittedReportId ? (
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                আপনার তথ্য সফলভাবে জমা হয়েছে।
              </h3>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-xs text-slate-500 uppercase font-semibold">আপনার ট্র্যাকিং আইডি</p>
                <p className="text-2xl font-mono font-extrabold text-emerald-800 tracking-wider my-1">
                  {submittedReportId}
                </p>
                <p className="text-xs text-slate-600">
                  ভবিষ্যতে তথ্যের আপডেট বা সংশোধনের জন্য এই আইডিটি সংরক্ষণ করুন।
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 text-left space-y-1 max-w-md mx-auto">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>যাচাইকরণ প্রক্রিয়া:</span>
                </p>
                <p>
                  Nikhoj Alert তথ্য যাচাই ও সুরক্ষার স্বার্থে প্রতিটি রিপোর্ট সতর্কতার সাথে পরীক্ষা করে। তথ্য যাচাইয়ের পর অনুমোদিত হলে এটি public platform-এ প্রকাশিত হবে।
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  ঠিক আছে (বন্ধ করুন)
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Type Switcher Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  রিপোর্টের ধরন নির্বাচন করুন *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportType('missing_person')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reportType === 'missing_person'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-400/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-red-600" />
                    <span>নিখোঁজ ব্যক্তি</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportType('found_person')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reportType === 'found_person'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>পাওয়া ব্যক্তি</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportType('lost_item')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reportType === 'lost_item'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>হারানো জিনিস</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportType('found_item')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reportType === 'found_item'
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-400/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>পাওয়া জিনিস</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Form Sections */}
              {(reportType === 'missing_person' || reportType === 'found_person') ? (
                /* Person Details */
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    ব্যক্তির বিবরণ
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        পুরো নাম *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="যেমন: আরিয়ান রহমান"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ডাকনাম
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="যেমন: আরিয়ান"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        বয়স
                      </label>
                      <input
                        type="text"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="যেমন: ৭ বছর"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        লিঙ্গ
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="male">পুরুষ</option>
                        <option value="female">নারী</option>
                        <option value="other">অন্যান্য</option>
                      </select>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        উচ্চতা
                      </label>
                      <input
                        type="text"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="যেমন: ৫ ফুট ৩ ইঞ্চি"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        পোশাকের বিবরণ
                      </label>
                      <input
                        type="text"
                        value={clothing}
                        onChange={(e) => setClothing(e.target.value)}
                        placeholder="যেমন: লাল টি-শার্ট ও নীল জিন্স"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        বিশেষ শনাক্তকারী বৈশিষ্ট্য
                      </label>
                      <input
                        type="text"
                        value={identificationMarks}
                        onChange={(e) => setIdentificationMarks(e.target.value)}
                        placeholder="যেমন: কপালে কাটা দাগ, ডান হাতে তিল"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Item Details */
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    জিনিসের বিবরণ
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        জিনিসের নাম *
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="যেমন: কালো রঙের ব্যাকপ্যাক"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ক্যাটাগরি
                      </label>
                      <select
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="স্মার্টফোন">স্মার্টফোন / মোবাইল</option>
                        <option value="ল্যাপটপ ও ইলেকট্রনিক্স">ল্যাপটপ ও ইলেকট্রনিক্স</option>
                        <option value="ব্যাগ ও নথিপত্র">ব্যাগ ও নথিপত্র</option>
                        <option value="মানিব্যাগ ও কার্ড">মানিব্যাগ ও আইডি কার্ড</option>
                        <option value="গাড়ি বা মোটরসাইকেল">গাড়ি বা মোটরসাইকেল</option>
                        <option value="অন্যান্য প্রয়োজনীয় জিনিস">অন্যান্য প্রয়োজনীয় জিনিস</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ব্র্যান্ড বা মডেল
                      </label>
                      <input
                        type="text"
                        value={itemBrand}
                        onChange={(e) => setItemBrand(e.target.value)}
                        placeholder="যেমন: Dell / Samsung"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        রং বা বিশেষ চিহ্ন
                      </label>
                      <input
                        type="text"
                        value={itemColor}
                        onChange={(e) => setItemColor(e.target.value)}
                        placeholder="যেমন: গাঢ় নীল, সোনালী চেইন"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Upload */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ছবি আপলোড করুন (পরিষ্কার ছবি দ্রুত শনাক্তে সাহায্য করে)
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {photos.length > 0 ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                      <img src={photos[0]} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos([])}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 font-medium">ছবি নির্বাচন করতে ক্লিক করুন</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (সর্বোচ্চ ৫MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Location Hierarchy: Division -> District -> Upazila */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>স্থান ও এলাকা সংক্রান্ত তথ্য *</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      বিভাগ *
                    </label>
                    <select
                      value={division}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    >
                      {DIVISIONS.map(d => (
                        <option key={d.id} value={d.id}>{d.nameBn} বিভাগ</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      জেলা *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    >
                      {availableDistricts.map(d => (
                        <option key={d.id} value={d.id}>{d.nameBn}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      উপজেলা / থানা
                    </label>
                    <select
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    >
                      {currentDistrictObj.upazilas.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সর্বশেষ দেখা সুনির্দিষ্ট স্থান বা মহল্লা *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="যেমন: শেরপুর পৌর পার্ক মোড় / ধানমন্ডি লেক"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ঘটনার তারিখ *
                    </label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
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
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      placeholder="যেমন: বিকাল ৫:৩০"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  বিস্তারিত ঘটনা ও অতিরিক্ত তথ্য
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="কীভাবে ঘটনাটি ঘটেছিল বা জরুরি কোনো তথ্য থাকলে বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>জরুরি যোগাযোগের তথ্য (যাচাইয়ের জন্য আবশ্যক) *</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      যোগাযোগকারীর নাম *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="যেমন: আব্দুর রহমান (পিতা/মালিক)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="০১৭১১-XXXXXX"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notice & Submit Button */}
              <div className="pt-4 border-t border-slate-200">
                <div className="text-[11px] text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  ⚠️ মিথ্যা বা বিভ্রান্তিকর তথ্য প্রদান আইনত দণ্ডনীয়। জমাকৃত তথ্য পর্যালোচনার পরেই কেবল সাইটে দৃশ্যমান করা হবে।
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? 'জমা হচ্ছে...' : 'রিপোর্ট জমা দিন'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
