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
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react';
import { DIVISIONS, DISTRICTS, getDistrictsByDivision } from '../data/bangladeshData';
import { ReportType, ReportItem } from '../types';
import { createReportByAdmin } from '../services/reportService';

interface AdminCreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  onSuccess: (reportId: string) => void;
}

const SAMPLE_PHOTOS = [
  { name: 'শিশু (নমুনা)', url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80' },
  { name: 'প্রবীণ (নমুনা)', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80' },
  { name: 'তরুণী (নমুনা)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' },
  { name: 'ল্যাপটপ ব্যাগ (নমুনা)', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { name: 'মোবাইল ফোন (নমুনা)', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' },
];

export const AdminCreateReportModal: React.FC<AdminCreateReportModalProps> = ({
  isOpen,
  onClose,
  adminEmail,
  onSuccess
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<ReportType>('missing_person');
  const [division, setDivision] = useState('mymensingh');
  const [district, setDistrict] = useState('sherpur');
  const [upazila, setUpazila] = useState('শেরপুর সদর');
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('');
  const [clothing, setClothing] = useState('');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [identificationMarks, setIdentificationMarks] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableDistricts = getDistrictsByDivision(division);
  const currentDistObj = DISTRICTS.find(d => d.id === district) || availableDistricts[0];

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
        setPhotos([event.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactName.trim() || !contactPhone.trim()) {
      setErrorMessage('নাম, যোগাযোগের ব্যক্তি ও মোবাইল নম্বর দেওয়া বাধ্যতামূলক।');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const isPerson = type === 'missing_person' || type === 'found_person';
    const finalTitle = title.trim() || `${name} - ${type === 'missing_person' ? 'নিখোঁজ' : 'পাওয়া গেছে'}`;

    try {
      const res = await createReportByAdmin({
        type,
        category: isPerson ? (age ? `${age} বছর বয়সী` : 'সাধারণ') : 'জরুরি জিনিস',
        title: finalTitle,
        name,
        nickname,
        age,
        gender: isPerson ? gender : undefined,
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'],
        description: description || 'অফিসিয়াল কন্ট্রোল প্যানেল থেকে তৈরি করা রিপোর্ট।',
        division,
        district: currentDistObj?.nameBn || district,
        upazila,
        location: location || currentDistObj?.nameBn || 'অজ্ঞাত এলাকা',
        incidentDate,
        incidentTime,
        clothing,
        physicalDescription,
        identificationMarks,
        contactName,
        contactPhone,
        status: 'approved',
        verificationStatus: 'verified',
        isPublished,
        isUrgent,
        isFeatured,
        isDemo: false
      }, adminEmail);

      alert(`রিপোর্ট সফলভাবে তৈরি ও সরাসরি প্রকাশ করা হয়েছে! রিপোর্ট আইডি: ${res.reportId}`);
      onSuccess(res.reportId);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage('রিপোর্ট তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">অ্যাডমিন সরাসরি রিপোর্ট তৈরি (Direct Intake)</h3>
              <p className="text-xs text-emerald-200">ফোন বা সরাসরি সংগৃহীত তথ্য অবিলম্বে যাচাই ও প্রকাশ করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-emerald-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">রিপোর্টের ধরন</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('missing_person')}
                className={`p-2 rounded-xl text-xs font-bold border transition ${
                  type === 'missing_person' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                নিখোঁজ ব্যক্তি
              </button>
              <button
                type="button"
                onClick={() => setType('found_person')}
                className={`p-2 rounded-xl text-xs font-bold border transition ${
                  type === 'found_person' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                পাওয়া ব্যক্তি
              </button>
              <button
                type="button"
                onClick={() => setType('lost_item')}
                className={`p-2 rounded-xl text-xs font-bold border transition ${
                  type === 'lost_item' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                হারানো জিনিস
              </button>
              <button
                type="button"
                onClick={() => setType('found_item')}
                className={`p-2 rounded-xl text-xs font-bold border transition ${
                  type === 'found_item' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                পাওয়া জিনিস
              </button>
            </div>
          </div>

          {/* Quick flags */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded-sm text-emerald-600 focus:ring-emerald-500"
              />
              <span>সরাসরি সাইটে প্রকাশ (Published)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-red-600">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded-sm text-red-600 focus:ring-red-500"
              />
              <span>জরুরি বিজ্ঞপ্তি (Urgent)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-amber-600">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              <span>ফিচার্ড রিপোর্ট (Featured)</span>
            </label>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">নাম বা শিরোনাম *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আরিয়ান রহমান"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বয়স</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="যেমন: ৭ বছর"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">লিঙ্গ</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="male">পুরুষ</option>
                <option value="female">নারী</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>
          </div>

          {/* Location Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিভাগ</label>
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  const inDiv = getDistrictsByDivision(e.target.value);
                  if (inDiv.length > 0) {
                    setDistrict(inDiv[0].id);
                    setUpazila(inDiv[0].upazilas[0] || '');
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {DIVISIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.nameBn} বিভাগ</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">জেলা</label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  const dObj = DISTRICTS.find(d => d.id === e.target.value || d.nameBn === e.target.value);
                  if (dObj && dObj.upazilas.length > 0) {
                    setUpazila(dObj.upazilas[0]);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {availableDistricts.map(d => (
                  <option key={d.id} value={d.id}>{d.nameBn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">উপজেলা</label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                placeholder="যেমন: শেরপুর সদর"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">সর্বশেষ দেখা স্থান *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="যেমন: শেরপুর ডিসি পার্ক মোড়"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>

          {/* Photo Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ছবি যুক্ত করুন</label>
            <div className="flex items-center gap-3">
              {photos.length > 0 ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  <img src={photos[0]} alt="Selected" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos([])}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>ডিভাইস থেকে ছবি আপলোড</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Sample Photos */}
              <div className="flex-1 flex flex-wrap gap-1">
                {SAMPLE_PHOTOS.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotos([s.url])}
                    className="text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200"
                  >
                    + {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Narrative & Contact */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">বিস্তারিত বিবরণ</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="শারীরিক গঠন, নিখোঁজের বিস্তারিত ঘটনা..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">যোগাযোগের নাম *</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="যেমন: পুলিশ কন্ট্রোল রুম / পিতা"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর *</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="০১৭১১-XXXXXX"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>রিপোর্ট তৈরি ও প্রকাশ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
