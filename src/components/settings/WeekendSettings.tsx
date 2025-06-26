import React from 'react';
import { Calendar, Info } from 'lucide-react';

interface WeekendSettingsProps {
  weekends: number[];
  onChange: (weekends: number[]) => void;
}

export const WeekendSettings: React.FC<WeekendSettingsProps> = ({
  weekends,
  onChange,
}) => {
  const handleWeekendChange = (day: number) => {
    const newWeekends = weekends.includes(day)
      ? weekends.filter((d) => d !== day)
      : [...weekends, day];
    
    onChange(newWeekends);
  };
  
  const days = [
    { name: 'Sunday', index: 0, short: 'Sun' },
    { name: 'Monday', index: 1, short: 'Mon' },
    { name: 'Tuesday', index: 2, short: 'Tue' },
    { name: 'Wednesday', index: 3, short: 'Wed' },
    { name: 'Thursday', index: 4, short: 'Thu' },
    { name: 'Friday', index: 5, short: 'Fri' },
    { name: 'Saturday', index: 6, short: 'Sat' },
  ];
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <Calendar className="text-navy-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">Weekend Configuration</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Select the days that should be considered weekends by default for all employees.
        Individual employees can have their own weekend settings that override these defaults.
      </p>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {days.map((day) => (
            <div 
              key={day.index}
              className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                weekends.includes(day.index)
                  ? 'border-amber-300 bg-amber-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleWeekendChange(day.index)}
            >
              <div className={`font-semibold text-sm md:text-base ${
                weekends.includes(day.index) ? 'text-amber-700' : 'text-gray-700'
              }`}>
                <div className="hidden md:block">{day.name}</div>
                <div className="md:hidden">{day.short}</div>
              </div>
              <div className="text-xs mt-1 text-gray-500">
                Day {day.index}
              </div>
              {weekends.includes(day.index) && (
                <div className="mt-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mx-auto"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <Info className="text-blue-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">About Weekend Settings</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Weekends are days when employees are typically not required to work</p>
                <p>• Attendance is not marked for weekend days by default</p>
                <p>• You can override these settings for individual employees</p>
                <p>• Changes apply to all new attendance records</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Current Selection</h4>
          <div className="flex flex-wrap gap-2">
            {weekends.length > 0 ? (
              weekends.map(dayIndex => {
                const day = days.find(d => d.index === dayIndex);
                return (
                  <span 
                    key={dayIndex}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                  >
                    {day?.name}
                  </span>
                );
              })
            ) : (
              <span className="text-gray-500 text-sm">No weekend days selected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};