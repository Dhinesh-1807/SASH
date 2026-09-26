import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF4FB] via-[#E4EFFB] to-[#F5F8FD] dark:bg-[#050811] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-block relative">
          <img
            src="/logo.png"
            alt="SASH"
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-[0_0_20px_rgba(0,102,255,0.3)] dark:drop-shadow-[0_0_25px_rgba(0,194,255,0.45)] transform hover:scale-105 transition-transform"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-cyan-300 dark:to-white bg-clip-text text-transparent">
          SASH
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-slate-600 dark:text-slate-400 mt-1">
          PLAN • SCHEDULE • ACHIEVE
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        <LoginForm />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 SASH. High-Performance Productivity Platform.</p>
      </footer>
    </div>
  );
};
