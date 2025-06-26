import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Button } from './common/Button';
import { Menu, Calendar, Clock, LogOut, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, signOut } = useDatabase();
  
  // Get current date and time
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-navy-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-navy-600 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Clock className="text-teal-400" size={24} />
              <h1 className="text-xl font-bold">Employee Attendance Tracker</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-gray-200">
              <Calendar size={20} />
              <span>{currentDate}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-200">
              <User size={20} />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              icon={<LogOut size={18} />}
              className="text-white hover:bg-navy-600"
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};