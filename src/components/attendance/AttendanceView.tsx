import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { ImportExportMenu } from '../common/ImportExportMenu';
import { AttendanceCalendar } from './AttendanceCalendar';
import { MonthSelector } from './MonthSelector';
import { getAttendanceByMonth, importAttendanceFromCsv, exportAttendanceToCsv, getAttendanceTemplate } from '../../services/attendanceService';
import { getAllEmployees } from '../../services/employeeService';
import { getSettings } from '../../services/settingsService';
import { Employee } from '../../types/Employee';
import { AttendanceRecord } from '../../types/Attendance';
import { Settings } from '../../types/Settings';
import { Save, UsersRound } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { addToast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Load data when component mounts or date changes
  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [employeesList, attendanceList, settingsData] = await Promise.all([
        getAllEmployees(),
        getAttendanceByMonth(selectedYear, selectedMonth),
        getSettings()
      ]);
      
      setEmployees(employeesList);
      setAttendanceRecords(attendanceList);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Optimized data refresh that doesn't cause full page reload
  const handleDataChange = () => {
    // Only reload attendance data, not the entire page
    getAttendanceByMonth(selectedYear, selectedMonth).then(attendanceList => {
      setAttendanceRecords(attendanceList);
    }).catch(error => {
      console.error('Error refreshing attendance data:', error);
    });
  };
  
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  const handleSaveAttendance = () => {
    addToast('Attendance records saved successfully', 'success');
  };

  const handleImportAttendance = async (csvData: string) => {
    try {
      const result = await importAttendanceFromCsv(csvData);
      if (result.success) {
        addToast(`Successfully imported ${result.count} attendance records`, 'success');
        loadData();
      } else {
        addToast('Failed to import attendance records', 'error');
      }
    } catch (error) {
      console.error('Error importing attendance:', error);
      addToast('Failed to import attendance records', 'error');
    }
  };
  
  const handleExportCsv = async () => {
    try {
      const csvContent = await exportAttendanceToCsv(selectedYear, selectedMonth);
      
      if (!csvContent) {
        addToast('No data to export', 'warning');
        return;
      }
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-${selectedYear}-${selectedMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Attendance data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting attendance data:', error);
      addToast('Failed to export attendance data', 'error');
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Attendance Tracking</h1>
          <p className="text-gray-600">Manage employee attendance records with overtime tracking</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="primary" 
            onClick={handleSaveAttendance}
            icon={<Save size={18} />}
          >
            Save Attendance
          </Button>
          <ImportExportMenu
            title="Attendance Data Management"
            description="Import and export attendance records"
            onExportCsv={handleExportCsv}
            onImportCsv={handleImportAttendance}
            csvTemplate={getAttendanceTemplate()}
            disabled={attendanceRecords.length === 0}
          />
        </div>
      </div>
      
      <MonthSelector 
        selectedMonth={selectedMonth} 
        selectedYear={selectedYear} 
        onMonthChange={handleMonthChange} 
      />
      
      {employees.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UsersRound size={40} />}
            title="No employees found"
            description="Start by adding employees to track their attendance"
            action={
              <Button 
                variant="primary" 
                onClick={() => window.location.hash = 'employees'}
              >
                Add Employees
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          {settings ? (
            <AttendanceCalendar
              employees={employees}
              attendanceRecords={attendanceRecords}
              month={selectedMonth}
              year={selectedYear}
              settings={settings}
              onSave={handleSaveAttendance}
              onDataChange={handleDataChange}
            />
          ) : (
            <EmptyState
              icon={<UsersRound size={40} />}
              title="Loading calendar..."
              description="Please wait while we load the attendance calendar"
            />
          )}
        </Card>
      )}
    </div>
  );
};