import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Terminal, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView: 'public' | 'admin' | 'springboot-code';
  onNavigate: (view: 'public' | 'admin' | 'springboot-code') => void;
  adminSubView?: string;
  onAdminNavigate?: (subView: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
}) => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('public')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-[#3368a0] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#3368a0]/30 transition-transform group-hover:scale-105">
              J
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#0f172a]">Jai-Blog</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Dual-Interface
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Visual Builder &amp; Spring Boot Platform</p>
            </div>
          </button>
        </div>

        {/* Global Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spring Boot Source Code & API Console Shortcut */}
          <button
            onClick={() => onNavigate(currentView === 'springboot-code' ? 'public' : 'springboot-code')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'springboot-code'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title="Inspect Java Spring Boot (Maven) Backend Architecture & Codebase"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">
              {currentView === 'springboot-code' ? 'Back to Public' : 'Spring Boot (Maven) Code'}
            </span>
            <span className="sm:hidden">
              {currentView === 'springboot-code' ? 'Public' : 'Java'}
            </span>
          </button>

          {/* When Admin Portal is accessed via URL, show Admin status badge and Exit to Public button */}
          {currentView === 'admin' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Portal</span>
                {isAuthenticated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Session Active" />
                )}
              </div>

              <button
                onClick={() => onNavigate('public')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-[#0f172a] text-xs font-medium transition-all shadow-xs"
                title="Exit Admin Portal and return to Public Reader"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#3368a0]" />
                <span className="hidden sm:inline">Exit to Public</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          ) : (
            /* For public reader, provide Public Reader indicator if needed when in other views */
            currentView === 'springboot-code' && (
              <button
                onClick={() => onNavigate('public')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#3368a0]" />
                <span>Public Reader</span>
              </button>
            )
          )}

          {/* User Session Quick Info if Logged in */}
          {isAuthenticated && currentView === 'admin' && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-medium text-slate-600">
                {user?.name.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
