import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Shift } from '../../types/Settings';
import { Clock, PlusCircle, Trash2, Sun, Moon, Info, Settings } from 'lucide-react';

interface ShiftSettingsProps {
  shifts: {
    [key: string]: Shift;
  };
  onChange: (shifts: { [key: string]: Shift }) => void;
}

export const ShiftSettings: React.FC<ShiftSettingsProps> = ({
  shifts,
  onChange,
}) => {
  const [newShift, setNewShift] = useState<{ name: string; start: string; end: string }>({
    name: '',
    start: '09:00',
    end: '17:00',
  });
  
  const handleShiftChange = (
    shiftName: string,
    field: 'start' | 'end',
    value: string
  ) => {
    const updatedShifts = {
      ...shifts,
      [shiftName]: {
        ...shifts[shiftName],
        [field]: value,
      },
    };
    
    onChange(updatedShifts);
  };
  
  const handleAddShift = () => {
    if (!newShift.name.trim() || !newShift.start || !newShift.end) {
      return;
    }
    
    // Format shift name to lowercase with no spaces
    const formattedName = newShift.name.toLowerCase().replace(/\s+/g, '');
    
    // Check if shift already exists
    if (shifts[formattedName]) {
      return;
    }
    
    const updatedShifts = {
      ...shifts,
      [formattedName]: {
        start: newShift.start,
        end: newShift.end,
      },
    };
    
    onChange(updatedShifts);
    
    // Reset form
    setNewShift({ name: '', start: '09:00', end: '17:00' });
  };
  
  const handleDeleteShift = (shiftName: string) => {
    // Don't allow deleting the default shifts
    if (shiftName === 'morning' || shiftName === 'night') {
      return;
    }
    
    const { [shiftName]: _, ...remainingShifts } = shifts;
    onChange(remainingShifts);
  };
  
  const formatShiftName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const calculateShiftDuration = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    let totalMinutes;
    if (endHour < startHour) {
      // Night shift (crosses midnight)
      totalMinutes = (endHour + 24) * 60 + endMinute - (startHour * 60 + startMinute);
    } else {
      totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };

  const getShiftIcon = (shiftName: string) => {
    if (shiftName === 'morning') return <Sun className="text-yellow-500" size={18} />;
    if (shiftName === 'night') return <Moon className="text-blue-500" size={18} />;
    return <Clock className="text-gray-500" size={18} />;
  };
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <Settings className="text-purple-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">Shift Configuration</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Configure shift timings for different work schedules.
        The morning and night shifts are default shifts and cannot be deleted.
      </p>
      
      <div className="space-y-6">
        {/* Current Shifts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(shifts).map(([name, shift]) => (
            <div 
              key={name}
              className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {getShiftIcon(name)}
                  <h3 className="font-semibold text-gray-800 ml-2">
                    {formatShiftName(name)} Shift
                  </h3>
                </div>
                
                {name !== 'morning' && name !== 'night' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteShift(name)}
                    icon={<Trash2 size={16} className="text-red-500" />}
                    className="text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={shift.start}
                    onChange={(e) => handleShiftChange(name, 'start', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={shift.end}
                    onChange={(e) => handleShiftChange(name, 'end', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-800">
                    {calculateShiftDuration(shift.start, shift.end)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-medium text-gray-800">
                    {shift.start} - {shift.end}
                  </span>
                </div>
              </div>
              
              {name === 'night' && (
                <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-2 rounded">
                  <Info className="inline mr-1" size={12} />
                  Night shifts that cross midnight are automatically handled
                </p>
              )}
            </div>
          ))}
        </div>
        
        {/* Add New Shift */}
        <div className="border-t pt-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <PlusCircle className="mr-2 text-green-600" size={20} />
            Add New Shift
          </h3>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="shiftName" className="block text-sm font-medium text-gray-700 mb-2">
                  Shift Name *
                </label>
                <input
                  type="text"
                  id="shiftName"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  placeholder="e.g., Afternoon"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                />
              </div>
              
              <div>
                <label htmlFor="shiftStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="shiftStart"
                  value={newShift.start}
                  onChange={(e) => setNewShift({ ...newShift, start: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                />
              </div>
              
              <div>
                <label htmlFor="shiftEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  id="shiftEnd"
                  value={newShift.end}
                  onChange={(e) => setNewShift({ ...newShift, end: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={handleAddShift}
                  disabled={!newShift.name.trim() || !newShift.start || !newShift.end}
                  icon={<PlusCircle size={18} />}
                  fullWidth
                >
                  Add Shift
                </Button>
              </div>
            </div>

            {newShift.start && newShift.end && (
              <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                <div className="text-sm text-gray-600">
                  Preview: <span className="font-medium text-gray-800">
                    {calculateShiftDuration(newShift.start, newShift.end)} 
                    ({newShift.start} - {newShift.end})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Panel */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <Info className="text-blue-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">Shift Configuration Guidelines</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Shift names should be unique and descriptive</p>
                <p>• Use 24-hour format for time entries (e.g., 09:00, 17:00)</p>
                <p>• Night shifts can cross midnight (e.g., 22:00 to 06:00)</p>
                <p>• Default shifts (Morning & Night) cannot be deleted</p>
                <p>• Overtime is calculated for hours worked beyond 8 hours</p>
                <p>• Changes apply to new attendance records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};