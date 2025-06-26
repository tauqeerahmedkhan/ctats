import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Holiday } from '../../types/Settings';
import { CalendarPlus, Trash2, Calendar, Info, Gift } from 'lucide-react';

interface HolidaySettingsProps {
  holidays: Holiday[];
  onChange: (holidays: Holiday[]) => void;
}

export const HolidaySettings: React.FC<HolidaySettingsProps> = ({
  holidays,
  onChange,
}) => {
  const [newHoliday, setNewHoliday] = useState<{ date: string; name: string }>({
    date: '',
    name: '',
  });
  
  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name.trim()) {
      return;
    }
    
    // Check if holiday already exists
    const exists = holidays.some((h) => h.date === newHoliday.date);
    if (exists) {
      return;
    }
    
    const updatedHolidays = [...holidays, { ...newHoliday, name: newHoliday.name.trim() }]
      .sort((a, b) => a.date.localeCompare(b.date));
    onChange(updatedHolidays);
    
    // Reset form
    setNewHoliday({ date: '', name: '' });
  };
  
  const handleDeleteHoliday = (date: string) => {
    const updatedHolidays = holidays.filter((h) => h.date !== date);
    onChange(updatedHolidays);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getUpcomingHolidays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return holidays
      .filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= today || holidayDate.getFullYear() === currentYear;
      })
      .slice(0, 3);
  };

  const getPastHolidays = () => {
    const today = new Date();
    
    return holidays
      .filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate < today;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <Gift className="text-green-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">Holiday Management</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Add company holidays to prevent attendance marking on those days.
        Holidays are displayed in the attendance calendar and no employee is expected to work on these days.
      </p>
      
      {/* Add New Holiday */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Add New Holiday</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="holidayDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="holidayDate"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          
          <div>
            <label htmlFor="holidayName" className="block text-sm font-medium text-gray-700 mb-2">
              Holiday Name *
            </label>
            <input
              type="text"
              id="holidayName"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              placeholder="e.g., Independence Day"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleAddHoliday}
              disabled={!newHoliday.date || !newHoliday.name.trim()}
              icon={<CalendarPlus size={18} />}
              fullWidth
            >
              Add Holiday
            </Button>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      {getUpcomingHolidays().length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-green-800 mb-3 flex items-center">
            <Calendar className="mr-2" size={18} />
            Upcoming Holidays
          </h4>
          <div className="space-y-2">
            {getUpcomingHolidays().map((holiday) => (
              <div key={holiday.date} className="flex items-center justify-between bg-white p-3 rounded-md">
                <div>
                  <div className="font-medium text-gray-800">{holiday.name}</div>
                  <div className="text-sm text-gray-600">{formatDate(holiday.date)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteHoliday(holiday.date)}
                  icon={<Trash2 size={16} className="text-red-500" />}
                  className="text-red-500 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* All Holidays Table */}
      {holidays.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Gift className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No holidays added yet</h3>
          <p className="text-gray-500">Add your first holiday using the form above</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-md font-semibold text-gray-800">All Holidays ({holidays.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left font-semibold text-gray-600 border-b">Date</th>
                  <th className="py-3 px-6 text-left font-semibold text-gray-600 border-b">Holiday Name</th>
                  <th className="py-3 px-6 text-left font-semibold text-gray-600 border-b">Day</th>
                  <th className="py-3 px-6 text-right font-semibold text-gray-600 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => {
                  const holidayDate = new Date(holiday.date);
                  const isUpcoming = holidayDate >= new Date();
                  
                  return (
                    <tr key={holiday.date} className={`border-b hover:bg-gray-50 ${isUpcoming ? 'bg-green-25' : ''}`}>
                      <td className="py-4 px-6 text-gray-700">
                        <div className="font-medium">
                          {holidayDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        {isUpcoming && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                            Upcoming
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{holiday.name}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {holidayDate.toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHoliday(holiday.date)}
                          icon={<Trash2 size={16} className="text-red-500" />}
                          className="text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-3 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">Holiday Guidelines</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Holidays automatically prevent attendance marking for all employees</p>
              <p>• Holidays are displayed with a green background in the attendance calendar</p>
              <p>• You can add holidays for any year, past or future</p>
              <p>• Holiday names should be descriptive and professional</p>
              <p>• Consider adding both national and company-specific holidays</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};