import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Button } from './common/Button';
import { Menu, Calendar, Clock, LogOut, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, signOut } = useDatabase();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current date and time
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

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
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-navy-600 transition-colors"
              >
                <div className="bg-teal-500 p-2 rounded-full">
                  <User size={18} />
                </div>
                <span className="hidden sm:inline text-sm">{user?.email?.split('@')[0]}</span>
                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-navy-600 p-3 rounded-full">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user?.email?.split('@')[0]}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">Account</div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // Navigate to settings/users
                        const event = new CustomEvent('navigate', { detail: 'settings' });
                        window.dispatchEvent(event);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <User size={16} />
                      Profile Settings
                    </button>
                    
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};