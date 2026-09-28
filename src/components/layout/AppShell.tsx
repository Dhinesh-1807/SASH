import React, { useState, useEffect } from 'react';
import { Sidebar, AppPage } from './Sidebar';
import { TopHeader } from './TopHeader';
import { MobileNav } from './MobileNav';
import { FocusTimerModal } from '../productivity/FocusTimerModal';
import { SupabaseConfigModal } from '../auth/SupabaseConfigModal';
import { InAppAlertBanner } from '../common/InAppAlertBanner';
import { checkSupabaseTablesStatus } from '../../lib/supabase';
import { AlertTriangle, Database } from 'lucide-react';

interface AppShellProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentPage, onNavigate, children }) => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [hasMissingTables, setHasMissingTables] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkSupabaseTablesStatus().then((status) => {
      if (mounted && status.checked && !status.allExist) {
        setHasMissingTables(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-[#EEF4FB] dark:bg-[#050811] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onOpenTimer={() => setIsTimerOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 sm:pb-28 lg:pb-8">
        <TopHeader
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
          onNavigate={onNavigate}
        />

        {/* Missing Tables Notice Banner */}
        {hasMissingTables && (
          <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Supabase Setup Required:</strong> Database tables (<code className="text-amber-300 font-mono">profiles, schedules, activities</code>) are not yet created in Supabase Cloud.
              </span>
            </div>
            <button
              onClick={() => setIsSupabaseConfigOpen(true)}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 text-[11px] shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3 h-3" />
              View & Copy Setup SQL
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentPage={currentPage} onNavigate={onNavigate} />

      {/* Global Modals */}
      <FocusTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => {
          setIsSupabaseConfigOpen(false);
          // Re-evaluate table status when modal closes
          checkSupabaseTablesStatus().then((status) => {
            setHasMissingTables(status.checked && !status.allExist);
          });
        }}
      />

      {/* Global In-App Notifications & Alerts Banner */}
      <InAppAlertBanner />
    </div>
  );
};
