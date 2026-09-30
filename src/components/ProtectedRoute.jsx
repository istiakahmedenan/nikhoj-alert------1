import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { verifyAdminSessionWithServer } from '../services/adminAuthService';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async () => {
      if (!currentUser) {
        if (isMounted) {
          setIsAdmin(false);
          setVerifying(false);
        }
        return;
      }

      try {
        setVerifying(true);
        // সার্ভার থেকে অ্যাডমিন সেশন যাচাই
        const result = await verifyAdminSessionWithServer();
        if (isMounted) {
          if (result.authorized) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            setErrorMessage(result.error || 'অ্যাডমিন অধিকার মেলেনি।');
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsAdmin(false);
          setErrorMessage('ভেরিফিকেশন সম্পন্ন করা সম্ভব হয়নি।');
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser, authLoading]);

  // অথেন্টিকেশন বা অ্যাডমিন ভেরিফিকেশন লোডিং স্ক্রিন
  if (authLoading || verifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">অ্যাডমিন এক্সেস যাচাইকরণ</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Verifying administrator authorization...</p>
          </div>
          <div className="flex justify-center pt-2">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // ইউজার লগইন না থাকলে লগইন পেজে রিডাইরেক্ট
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ইউজার অ্যাডমিন না হলে এরর মেসেজসহ এক্সেস ডিনাই স্ক্রিন
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-900 border border-red-900/50 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-950/60 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">অ্যাক্সেস অনুমোদিত নয়</h3>
            <p className="text-xs text-slate-400 mt-1">
              {errorMessage || 'শুধুমাত্র অনুমোদিত অ্যাডমিন এই পেজটি অ্যাক্সেস করতে পারবেন।'}
            </p>
          </div>
          <div className="pt-2">
            <Navigate to="/login" state={{ from: location }} replace />
          </div>
        </div>
      </div>
    );
  }

  return children ? children : null;
};

export default ProtectedRoute;
