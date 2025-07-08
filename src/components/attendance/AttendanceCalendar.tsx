import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { saveAttendanceRecord } from '../../services/attendanceService';
import { Employee } from '../../types/Employee';
import { AttendanceRecord } from '../../types/Attendance';
import { Settings } from '../../types/Settings';
import { formatTime } from '../../utils/dateUtils';
import { Clock, Zap } from 'lucide-react';

interface AttendanceCalendarProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  month: number;
  year: number;
  settings: Settings;
  onSave: () => void;
  onDataChange: () => void;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  employees,
  attendanceRecords,
  month,
  year,
  settings,
  onSave,
  onDataChange,
}) => {
  const { addToast } = useToast();
  const [calendar, setCalendar] = useState<Date[]>([]);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: AttendanceRecord}>({});

  // Generate calendar days for the selected month
  useEffect(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: Date[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month - 1, day));
    }
    
    setCalendar(days);
  }, [month, year]);

  // Organize attendance records by employeeId and date
  useEffect(() => {
    const data: {[key: string]: AttendanceRecord} = {};
    
    attendanceRecords.forEach(record => {
      const key = `${record.employeeId}-${record.date}`;
      data[key] = record;
    });
    
    setAttendanceData(data);
  }, [attendanceRecords]);

  // Handle attendance checkbox change
  const handleAttendanceChange = async (
    employeeId: string, 
    date: string, 
    present: boolean
  ) => {
    const key = `${employeeId}-${date}`;
    const existingRecord = attendanceData[key] || {
      employeeId,
      date,
      present: false,
    };
    
    const employee = employees.find(e => e.id === employeeId);
    const newRecord: AttendanceRecord = {
      ...existingRecord,
      present,
      shift: employee?.shift || 'morning',
    };
    
    // Add default time if marked present and no time set
    if (present && (!newRecord.timeIn || !newRecord.timeOut)) {
      const defaultShift = settings.shifts[employee?.shift || 'morning'];
      newRecord.timeIn = defaultShift.start;
      newRecord.timeOut = defaultShift.end;
    }
    
    // Clear time if marked absent
    if (!present) {
      newRecord.timeIn = undefined;
      newRecord.timeOut = undefined;
      newRecord.hours = 0;
      newRecord.overtimeHours = 0;
    }
    
    const success = await saveAttendanceRecord(newRecord);
    if (success) {
      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        [key]: newRecord,
      }));
      onDataChange();
    } else {
      addToast('Failed to save attendance record', 'error');
    }
  };

  // Handle time change
  const handleTimeChange = async (
    employeeId: string, 
    date: string, 
    field: 'timeIn' | 'timeOut', 
    value: string
  ) => {
    const key = `${employeeId}-${date}`;
    const existingRecord = attendanceData[key] || {
      employeeId,
      date,
      present: true,
    };
    
    const employee = employees.find(e => e.id === employeeId);
    const newRecord: AttendanceRecord = {
      ...existingRecord,
      [field]: value,
      shift: employee?.shift || 'morning',
    };
    
    const success = await saveAttendanceRecord(newRecord);
    if (success) {
      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        [key]: newRecord,
      }));
      onDataChange();
    } else {
      addToast('Failed to save time record', 'error');
    }
  };

  // Check if a date is a weekend
  const isWeekend = (date: Date, employeeId?: string) => {
    const dayOfWeek = date.getDay();
    
    // Check employee-specific weekend setting
    if (employeeId) {
      const employee = employees.find(e => e.id === employeeId);
      if (employee && employee.weekends) {
        return employee.weekends.includes(dayOfWeek);
      }
    }
    
    // Fall back to global weekend setting
    return settings.weekends.includes(dayOfWeek);
  };

  // Check if a date is a holiday
  const isHoliday = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return settings.holidays.some(holiday => holiday.date === dateString);
  };

  // Get holiday name
  const getHolidayName = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const holiday = settings.holidays.find(h => h.date === dateString);
    return holiday ? holiday.name : '';
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="py-4 px-4 font-semibold text-gray-600 border-b sticky left-0 bg-gray-50 z-10">
              Employee
            </th>
            {calendar.map((date) => {
              const isWeekendDay = isWeekend(date);
              const isHolidayDay = isHoliday(date);
              const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayOfMonth = date.getDate();
              
              return (
                <th 
                  key={date.toISOString()} 
                  className={`p-2 text-sm font-semibold border border-gray-200 min-w-20 text-center ${
                    isWeekendDay ? 'bg-amber-50' : isHolidayDay ? 'bg-green-50' : ''
                  }`}
                >
                  <div className={`${isWeekendDay ? 'text-amber-700' : isHolidayDay ? 'text-green-700' : 'text-gray-600'}`}>
                    {dayOfMonth}
                  </div>
                  <div className="text-xs font-normal">
                    {dayOfWeek}
                  </div>
                  {isHolidayDay && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      {getHolidayName(date)}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-900 sticky left-0 bg-white z-10 border-r">
                <div>{employee.name}</div>
                <div className="text-xs text-gray-500">{employee.id}</div>
                <div className="text-xs text-gray-500">{employee.department || 'No Department'}</div>
              </td>
              
              {calendar.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const key = `${employee.id}-${dateStr}`;
                const record = attendanceData[key];
                const isWeekendDay = isWeekend(date, employee.id);
                const isHolidayDay = isHoliday(date);
                
                return (
                  <td 
                    key={dateStr} 
                    className={`p-2 border border-gray-200 text-center ${
                      isWeekendDay ? 'bg-amber-50' : isHolidayDay ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={record?.present || false}
                          onChange={(e) => handleAttendanceChange(employee.id, dateStr, e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                          disabled={isWeekendDay || isHolidayDay}
                        />
                      </div>
                      
                      {record?.present && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-center gap-1">
                            <Clock size={12} className="text-gray-500" />
                            <input
                              type="time"
                              value={record?.timeIn || ''}
                              onChange={(e) => handleTimeChange(employee.id, dateStr, 'timeIn', e.target.value)}
                              className="text-xs p-1 border rounded w-20"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Clock size={12} className="text-gray-500" />
                            <input
                              type="time"
                              value={record?.timeOut || ''}
                              onChange={(e) => handleTimeChange(employee.id, dateStr, 'timeOut', e.target.value)}
                              className="text-xs p-1 border rounded w-20"
                            />
                          </div>
                          {record?.hours !== undefined && record.hours > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatTime(record.hours)}
                              {record.overtimeHours && record.overtimeHours > 0 && (
                                <div className="flex items-center justify-center gap-1 text-orange-600">
                                  <Zap size={10} />
                                  +{formatTime(record.overtimeHours)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};