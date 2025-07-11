import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { PermissionGate } from './common/PermissionGate';
import { 
  LayoutDashboard,
  CalendarCheck, 
  Users, 
  Settings, 
  BarChart3,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeView: 'dashboard' | 'attendance' | 'employees' | 'settings' | 'reports';
  setActiveView: (view: 'dashboard' | 'attendance' | 'employees' | 'settings' | 'reports') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  activeView, 
  setActiveView 
}) => {
  const { hasPermission } = useDatabase();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'viewDashboard' as const },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, permission: 'viewAttendance' as const },
    { id: 'employees', label: 'Employees', icon: Users, permission: 'viewEmployees' as const },
    { id: 'reports', label: 'Reports', icon: BarChart3, permission: 'viewReports' as const },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'viewSettings' as const },
  ];

  return (
    <aside 
      className={`bg-white shadow-lg transition-all duration-300 overflow-hidden ${
        isOpen ? 'w-64' : 'w-0 md:w-16'
      }`}
    >
      <nav className="h-full py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <PermissionGate key={item.id} permission={item.permission}>
                <li>
                  <button
                    onClick={() => setActiveView(item.id as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      activeView === item.id
                        ? 'bg-navy-50 text-navy-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon 
                      size={20} 
                      className={activeView === item.id ? 'text-navy-600' : ''} 
                    />
                    <span className={`flex-1 ${!isOpen ? 'hidden' : ''}`}>
                      {item.label}
                    </span>
                    {activeView === item.id && isOpen && (
                      <ChevronRight size={16} className="text-navy-600" />
                    )}
                  </button>
                </li>
              </PermissionGate>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};