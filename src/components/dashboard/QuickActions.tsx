import React from 'react';
import { Card } from '../common/Card';
import { 
  Calendar, 
  UserPlus, 
  BarChart3, 
  Settings, 
  FileText, 
  Download, 
  Upload,
  Clock,
  Users,
  Database
} from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (view: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'attendance',
      title: 'Mark Attendance',
      description: 'Track daily employee attendance',
      icon: Calendar,
      color: 'bg-navy-50 hover:bg-navy-100 text-navy-600',
      iconColor: 'text-navy-600'
    },
    {
      id: 'employees',
      title: 'Manage Employees',
      description: 'Add, edit, and organize staff',
      icon: UserPlus,
      color: 'bg-teal-50 hover:bg-teal-100 text-teal-600',
      iconColor: 'text-teal-600'
    },
    {
      id: 'reports',
      title: 'View Reports',
      description: 'Analytics and insights',
      icon: BarChart3,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
      iconColor: 'text-purple-600'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure holidays and shifts',
      icon: Settings,
      color: 'bg-amber-50 hover:bg-amber-100 text-amber-600',
      iconColor: 'text-amber-600'
    }
  ];

  const quickLinks = [
    {
      title: 'Export Data',
      description: 'Download attendance reports',
      icon: Download,
      action: () => onNavigate('reports'),
      color: 'text-green-600'
    },
    {
      title: 'Import Data',
      description: 'Upload employee or attendance data',
      icon: Upload,
      action: () => onNavigate('settings'),
      color: 'text-blue-600'
    },
    {
      title: 'Time Tracking',
      description: 'Monitor working hours',
      icon: Clock,
      action: () => onNavigate('attendance'),
      color: 'text-orange-600'
    },
    {
      title: 'Employee Directory',
      description: 'Browse all employees',
      icon: Users,
      action: () => onNavigate('employees'),
      color: 'text-indigo-600'
    }
  ];

  return (
    <Card title="Quick Actions">
      <div className="space-y-6">
        {/* Primary Actions */}
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`w-full flex items-center p-4 ${action.color} rounded-lg transition-all duration-200 group hover:shadow-md`}
              >
                <Icon className={`${action.iconColor} mr-4 group-hover:scale-110 transition-transform`} size={24} />
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{action.title}</div>
                  <div className="text-sm text-gray-600">{action.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Links</h4>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  onClick={link.action}
                  className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <Icon className={`${link.color} mb-2 group-hover:scale-110 transition-transform`} size={20} />
                  <div className="text-xs font-medium text-gray-800 text-center">{link.title}</div>
                  <div className="text-xs text-gray-500 text-center mt-1">{link.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">System Status</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};