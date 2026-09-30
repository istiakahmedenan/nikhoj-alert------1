import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Image as ImageIcon,
  Save, 
  Loader2, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  ShieldCheck 
} from 'lucide-react';
import { ReportItem, ReportType, ReportStatus, VerificationStatus } from '../types';
import { DIVISIONS, DISTRICTS, getDistrictsByDivision } from '../data/bangladeshData';

interface AdminEditReportModalProps {
  report: ReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (reportId: string, updates: Partial<ReportItem>) => Promise<void>;
}

// Curated sample high-resolution portraits & item photos for quick testing/editing
const SAMPLE_PHOTOS = [
  { name: 'শিশু প্রতিকৃতি (নমুনা)', url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80' },
  { name: 'প্রবীণ ব্যক্তি (নমুনা)', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80' },
  { name: 'তরুণী (নমুনা)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' },
  { name: 'ল্যাপটপ / ব্যাগ (নমুনা)', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { name: 'স্মার্টফোন (নমুনা)', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' },
];

export const AdminEditReportModal: React.FC<AdminEditReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !report) return null;

  const [title, setTitle] = useState(report.title || '');
  const [name, setName] = useState(report.name || '');
  const [nickname, setNickname] = useState(report.nickname || '');
  const [age, setAge] = useState(report.age?.toString() || '');
  const [gender, setGender] = useState(report.gender || 'male');
  const [category, setCategory] = useState(report.category || '');
  const [division, setDivision] = useState(report.division || 'dhaka');
  const [district, setDistrict] = useState(report.district || 'dhaka');
  const [upazila, setUpazila] = useState(report.upazila || '');
  const [location, setLocation] = useState(report.location || '');
  const [incidentDate, setIncidentDate] = useState(report.incidentDate || '');
  const [incidentTime, setIncidentTime] = useState(report.incidentTime || '');
  const [clothing, setClothing] = useState(report.clothing || '');
  const [physicalDescription, setPhysicalDescription] = useState(report.physicalDescription || '');
  const [identificationMarks, setIdentificationMarks] = useState(report.identificationMarks || '');
  const [description, setDescription] = useState(report.description || '');
  const [contactName, setContactName] = useState(report.contactName || '');
  const [contactPhone, setContactPhone] = useState(report.contactPhone || '');
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(report.verificationStatus);
  const [isUrgent, setIsUrgent] = useState(report.isUrgent);
  const [isFeatured, setIsFeatured] = useState(report.isFeatured);
  const [isPublished, setIsPublished] = useState(report.isPublished);
  const [photos, setPhotos] = useState<string[]>(report.photos || []);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const availableDistricts = getDistrictsByDivision(division);
  const currentDistObj = DISTRICTS.find(d => d.id === district || d.nameBn === district) || availableDistricts[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('সর্বোচ্চ ৫ মেগাবাইট ফাইল গ্রহণযোগ্য');
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

  const handleAddPhotoUrl = () => {
    if (customPhotoUrl.trim()) {
      setPhotos([customPhotoUrl.trim()]);
      setCustomPhotoUrl('');
    }
  };

  const handleSelectSamplePhoto = (url: string) => {
    setPhotos([url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(report.id, {
        title,
        name,
        nickname,
        age,
        gender: gender as any,
        category,
        division,
        district: currentDistObj?.nameBn || district,
        upazila,
        location,
        incidentDate,
        incidentTime,
        clothing,
        physicalDescription,
        identificationMarks,
        description,
        contactName,
        contactPhone,
        status,
        verificationStatus,
        isUrgent,
        isFeatured,
        isPublished,
        photos
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('রিপোর্ট আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-md">
              {report.reportId}
            </span>
            <h3 className="text-base font-bold">রিপোর্ট এডিটর (অ্যাডমিন কন্ট্রোল)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick status controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="pending">পেন্ডিং (Pending)</option>
                <option value="approved">অনুমোদিত (Approved)</option>
                <option value="resolved">সমাধান প্রাপ্ত 🟢 (Resolved)</option>
                <option value="rejected">বাতিল (Rejected)</option>
                <option value="archived">আর্কাইভ (Archived)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ভেরিফিকেশন</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="verified">যাচাইকৃত (Verified)</option>
                <option value="investigating">তদন্তাধীন (Investigating)</option>
                <option value="unverified">অযাচাইকৃত (Unverified)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>পাবলিক প্রকাশ (Public)</span>
              </label>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-red-700">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded-sm text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>জরুরি কেস (Urgent)</span>
              </label>
            </div>
          </div>

          {/* Photo Management Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>ছবি পরিবর্তন / এডিট (Photo Management)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              {/* Current Photo Preview */}
              <div className="sm:col-span-4">
                <p className="text-[11px] text-slate-500 font-semibold mb-1">বর্তমান ছবি:</p>
                <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={photos[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {photos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPhotos([])}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md"
                      title="ছবি বাদ দিন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Upload & Sample Selector */}
              <div className="sm:col-span-8 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    নতুন ছবি আপলোড করুন
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 text-xs text-slate-600">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>ডিভাইস থেকে ফাইল নির্বাচন করুন (JPG, PNG, WEBP)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    অথবা ছবির ওয়েব লিংক দিন
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                    >
                      সেট করুন
                    </button>
                  </div>
                </div>

                {/* Quick Sample Photos */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">দ্রুত নমুনা ছবি নির্বাচন করুন:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PHOTOS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSamplePhoto(sample.url)}
                        className="text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 px-2 py-1 rounded-md font-medium border border-slate-200 transition"
                      >
                        + {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title & Basic Information */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">রিপোর্ট শিরোনাম *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ডাকনাম</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">বয়স</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location Hierarchical Selectors */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">উপজেলা / থানা</label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সুনির্দিষ্ট স্থান / এলাকা *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          {/* Description & Contact */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিস্তারিত ঘটনা ও শারীরিক বিবরণ</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">যোগাযোগকারীর নাম</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
