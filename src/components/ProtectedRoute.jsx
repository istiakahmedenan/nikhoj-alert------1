import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2, ShieldCheck } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
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

  if (!currentUser) {
    // Redirect to /login preserving the requested location for return redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : null;
};

export default ProtectedRoute;
