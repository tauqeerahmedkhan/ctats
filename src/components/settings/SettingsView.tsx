import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { WeekendSettings } from './WeekendSettings';
import { HolidaySettings } from './HolidaySettings';
import { ShiftSettings } from './ShiftSettings';
import { DatabaseSettings } from './DatabaseSettings';
import { UserSettings } from './UserSettings';
import { getSettings, updateSettings } from '../../services/settingsService';
import { Settings } from '../../types/Settings';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { addToast } = useToast();
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<'weekends' | 'holidays' | 'shifts' | 'database' | 'users'>('weekends');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settingsData = await getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
      addToast('Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const success = await updateSettings(settings);
      
      if (success) {
        addToast('Settings saved successfully', 'success');
      } else {
        addToast('Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('An error occurred while saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleWeekendChange = (weekends: number[]) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      weekends,
    });
  };
  
  const handleHolidayChange = (holidays: { date: string; name: string }[]) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      holidays,
    });
  };
  
  const handleShiftChange = (shifts: { [key: string]: { start: string; end: string } }) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      shifts,
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">Configure application settings and preferences</p>
        </div>
        
        {activeTab !== 'database' && activeTab !== 'users' && (
          <Button 
            variant="primary" 
            onClick={handleSaveSettings}
            icon={<Save size={18} />}
            disabled={!settings}
            isLoading={isSaving}
          >
            Save Settings
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab('weekends')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'weekends' 
                      ? 'bg-navy-50 text-navy-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Weekend Configuration
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('holidays')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'holidays' 
                      ? 'bg-navy-50 text-navy-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Holiday Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('shifts')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'shifts' 
                      ? 'bg-navy-50 text-navy-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Shift Configuration
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'users' 
                      ? 'bg-navy-50 text-navy-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  User Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'database' 
                      ? 'bg-navy-50 text-navy-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Database Management
                </button>
              </li>
            </ul>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card>
            {!settings && activeTab !== 'database' && activeTab !== 'users' ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center">
                  <SettingsIcon size={40} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Settings not available</h3>
                  <p className="text-gray-500 mb-4">There was a problem loading the settings.</p>
                  <Button 
                    variant="primary" 
                    onClick={loadSettings}
                  >
                    Reload Settings
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'weekends' && settings && (
                  <WeekendSettings 
                    weekends={settings.weekends} 
                    onChange={handleWeekendChange} 
                  />
                )}
                
                {activeTab === 'holidays' && settings && (
                  <HolidaySettings 
                    holidays={settings.holidays} 
                    onChange={handleHolidayChange} 
                  />
                )}
                
                {activeTab === 'shifts' && settings && (
                  <ShiftSettings 
                    shifts={settings.shifts} 
                    onChange={handleShiftChange} 
                  />
                )}
                
                {activeTab === 'users' && (
                  <UserSettings />
                )}
                
                {activeTab === 'database' && (
                  <DatabaseSettings />
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};