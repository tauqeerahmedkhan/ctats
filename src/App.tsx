import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { EmployeeView } from './components/employees/EmployeeView';
import { SettingsView } from './components/settings/SettingsView';
import { ReportsView } from './components/reports/ReportsView';
import { AuthForm } from './components/auth/AuthForm';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { ToastProvider } from './context/ToastContext';
import { Toast } from './components/common/Toast';

function AppContent() {
  const { user, isLoading } = useDatabase();
  const [activeView, setActiveView] = useState<'dashboard' | 'attendance' | 'employees' | 'settings' | 'reports'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on small screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />
        <main className="flex-1 overflow-auto p-4 transition-all duration-300">
          <div className="container mx-auto">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'attendance' && <AttendanceView />}
            {activeView === 'employees' && <EmployeeView />}
            {activeView === 'settings' && <SettingsView />}
            {activeView === 'reports' && <ReportsView />}
          </div>
        </main>
      </div>
      <Toast />
    </div>
  );
}

function App() {
  return (
    <DatabaseProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </DatabaseProvider>
  );
}

export default App;