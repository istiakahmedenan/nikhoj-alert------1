import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Mail, Key, Loader2, AlertCircle } from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { verifyAdminSessionWithServer } from '../services/adminAuthService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
  isStandalone?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isStandalone = false
}) => {
  const [email, setEmail] = useState('enanahmed776@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen && !isStandalone) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Verify token and role with server
      const verification = await verifyAdminSessionWithServer(true);
      if (verification.authorized) {
        onLoginSuccess(user.email || 'admin');
        onClose();
      } else {
        await auth.signOut();
        setErrorMessage(verification.error || 'অননুমোদিত একাউন্ট! শুধুমাত্র অনুমোদিত ফায়ারবেস অ্যাডমিন প্রবেশ করতে পারবেন।');
      }
    } catch (err: any) {
      console.warn('Google login failed:', err);
      setErrorMessage('ফায়ারবেস গুগল লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে পপআপ সচল করুন অথবা ফায়ারবেস পাসওয়ার্ড দিয়ে লগইন করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('অনুগ্রহ করে ফায়ারবেস পাসওয়ার্ড লিখুন।');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      // Authenticate via Firebase Authentication
      let userCred;
      try {
        userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' && email.trim() === 'enanahmed776@gmail.com') {
          // Initialize owner account once if not yet registered in Firebase project
          userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        } else {
          throw signInErr;
        }
      }

      const user = userCred.user;
      const verification = await verifyAdminSessionWithServer(true);
      if (verification.authorized) {
        onLoginSuccess(user.email || email.trim());
        onClose();
      } else {
        await auth.signOut();
        setErrorMessage(verification.error || 'অননুমোদিত একাউন্ট! এই একাউন্ট দিয়ে অ্যাডমিন প্যানেলে প্রবেশ নিষেধ।');
      }
    } catch (signInErr: any) {
      console.warn('Firebase sign-in error:', signInErr);
      if (signInErr.code === 'auth/user-not-found') {
        setErrorMessage('ফায়ারবেসে এই ইমেইলের কোনো একাউন্ট পাওয়া যায়নি।');
      } else if (signInErr.code === 'auth/wrong-password' || signInErr.code === 'auth/invalid-credential') {
        setErrorMessage('ভুল ফায়ারবেস পাসওয়ার্ড! সঠিক পাসওয়ার্ড প্রদান করুন।');
      } else if (signInErr.code === 'auth/too-many-requests') {
        setErrorMessage('অতিরিক্ত ভুল চেষ্টার কারণে ফায়ারবেস থেকে একাউন্ট সাময়িক ব্লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।');
      } else {
        setErrorMessage(`ফায়ারবেস যাচাইকরণ ব্যর্থ: ${signInErr.message || 'ভুল তথ্য দেওয়া হয়েছে'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-600 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold">অ্যাডমিন প্রবেশদ্বার</h3>
            <p className="text-[11px] text-emerald-400 font-mono font-semibold">admin.nikhojalert.online</p>
          </div>
        </div>
        {isStandalone ? (
          <button
            onClick={() => {
              window.location.href = 'https://nikhojalert.online';
            }}
            className="text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            পাবলিক সাইট
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        <div className="text-center space-y-1">
          <h4 className="text-lg font-black text-slate-900">
            নিরাপদ অ্যাডমিন এক্সেস
          </h4>
          <p className="text-xs text-slate-500">
            শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন ও মডারেটরদের জন্য
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Sign-in */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google একাউন্ট দিয়ে সাইন-ইন করুন</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>অথবা ইমেইল পাসওয়ার্ড</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              অ্যাডমিন ইমেইল
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enanahmed776@gmail.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>লগইন করুন</span>
            </button>
          </div>
        </form>

        {/* Super admin hint */}
        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          সুপার অ্যাডমিন: <strong>Istiak Ahmed Enan</strong> (<span className="font-mono">enanahmed776@gmail.com</span>)
        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-['Hind_Siliguri',sans-serif]">
        <div className="mb-6 text-center">
          <img 
            src="https://i.postimg.cc/FKKTLRZG/output-onlinepngtools.png" 
            alt="Nikhoj Alert Logo" 
            className="h-16 w-auto mx-auto mb-3 object-contain"
          />
          <h1 className="text-2xl font-black text-white">
            Nikhoj<span className="text-emerald-500">Alert</span> Admin
          </h1>
          <p className="text-xs text-emerald-400 font-mono mt-1">
            admin.nikhojalert.online
          </p>
        </div>
        {cardContent}
        <p className="text-[11px] text-slate-600 mt-6 text-center">
          © 2026 Nikhoj Alert • নিরাপদ কেন্দ্রীয় নিয়ন্ত্রণ ব্যবস্থা
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {cardContent}
    </div>
  );
};
