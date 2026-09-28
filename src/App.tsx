import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RemindersProvider } from './contexts/RemindersContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { AppPage } from './components/layout/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { RemindersPage } from './pages/RemindersPage';
import { ManageSchedulePage } from './pages/ManageSchedulePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

const MainRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF4FB] dark:bg-[#050811] flex flex-col items-center justify-center text-slate-700 dark:text-slate-400 space-y-4">
        <div className="relative">
          <img
            src="/logo.png"
            alt="SASH"
            className="w-16 h-16 object-contain animate-pulse drop-shadow-[0_0_20px_rgba(0,194,255,0.4)]"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-cyan-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Initializing SASH...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated user -> Login/OTP screen
  if (!user) {
    return <AuthPage />;
  }

  // Authenticated user -> App Shell with active page
  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && (
        <DashboardPage onNavigateManage={() => setCurrentPage('manage-schedule')} />
      )}
      {currentPage === 'reminders' && <RemindersPage />}
      {currentPage === 'manage-schedule' && <ManageSchedulePage />}
      {currentPage === 'analytics' && <AnalyticsPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'profile' && <ProfilePage onNavigate={setCurrentPage} />}
      {currentPage === 'settings' && <SettingsPage />}
    </AppShell>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <RemindersProvider>
              <NotificationProvider>
                <MainRouter />
              </NotificationProvider>
            </RemindersProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
