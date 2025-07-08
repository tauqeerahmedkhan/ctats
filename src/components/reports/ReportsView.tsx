import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { ImportExportMenu } from '../common/ImportExportMenu';
import { MonthSelector } from '../attendance/MonthSelector';
import { AttendanceSummary } from './AttendanceSummary';
import { PunctualityReport } from './PunctualityReport';
import { EmployeeAnalytics } from './EmployeeAnalytics';
import { AnalyticsExplanation } from './AnalyticsExplanation';
import { getAttendanceSummary } from '../../services/attendanceService';
import { getAllEmployees } from '../../services/employeeService';
import { Employee } from '../../types/Employee';
import { BarChart3, Clock, User, BookOpen } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { addToast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'punctuality' | 'analytics' | 'explanation'>('summary');
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
      const [employeesList, summary] = await Promise.all([
        getAllEmployees(),
        getAttendanceSummary(selectedYear, selectedMonth)
      ]);
      
      setEmployees(employeesList);
      setAttendanceSummary(summary);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  const handleExportCsv = async () => {
    if (attendanceSummary.length === 0) {
      addToast('No data to export', 'warning');
      return;
    }
    
    try {
      // Create CSV headers and data based on active tab
      let headers: string[];
      let data: any[][];
      
      if (activeTab === 'summary') {
        headers = [
          'Employee ID', 'Employee Name', 'Department', 'Present Days', 'Absent Days', 
          'Total Hours', 'Overtime Hours', 'Expected Hours', 'Hours Variance', 'Avg Hours/Day', 
          'Punctuality Score', 'Attendance %'
        ];
        
        data = attendanceSummary.map(summary => {
          const presentDays = summary.present_days || 0;
          const absentDays = summary.absent_days || 0;
          const totalDays = presentDays + absentDays;
          const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';
          const expectedHours = presentDays * 8;
          const actualHours = summary.total_hours || 0;
          const hoursVariance = actualHours - expectedHours;
          const avgHoursPerDay = summary.avg_hours_per_day || 0;
          const punctualityScore = Math.round(summary.punctuality_percentage || 0);
          
          return [
            summary.employee_id,
            summary.employee_name,
            summary.department || '',
            presentDays,
            absentDays,
            actualHours.toFixed(1),
            (summary.overtime_hours || 0).toFixed(1),
            expectedHours.toFixed(1),
            hoursVariance.toFixed(1),
            avgHoursPerDay.toFixed(1),
            punctualityScore,
            attendancePercentage,
          ];
        });
      } else {
        headers = [
          'Employee ID', 'Employee Name', 'Department', 'Shift', 'Punctuality %', 
          'On Time Days', 'Late Days', 'Avg Lateness (min)', 'Overtime Hours', 'Early Departures', 
          'Hours Efficiency %', 'Performance Score'
        ];
        
        data = attendanceSummary.map(summary => {
          const punctualityPercentage = Math.round(summary.punctuality_percentage || 0);
          const hoursEfficiency = Math.round(summary.hours_efficiency || 0);
          const performanceScore = Math.round((punctualityPercentage + hoursEfficiency) / 2);
          
          return [
            summary.employee_id,
            summary.employee_name,
            summary.department || '',
            summary.shift || '',
            punctualityPercentage,
            summary.on_time_days || 0,
            summary.late_days || 0,
            Math.round(summary.avg_lateness_minutes || 0),
            (summary.overtime_hours || 0).toFixed(1),
            summary.early_departures || 0,
            hoursEfficiency,
            performanceScore,
          ];
        });
      }
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeTab}-report-${selectedYear}-${selectedMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      addToast('Failed to export report', 'error');
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance & Analytics Reports</h1>
          <p className="text-gray-600">Comprehensive analysis with overtime tracking and employee insights</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <ImportExportMenu
            title="Report Data Management"
            description="Export reports and print analytics"
            onExportCsv={handleExportCsv}
            onPrint={handlePrint}
            disabled={attendanceSummary.length === 0 && activeTab !== 'analytics'}
          />
        </div>
      </div>
      
      {activeTab !== 'analytics' && (
        <div className="print:hidden">
          <MonthSelector 
            selectedMonth={selectedMonth} 
            selectedYear={selectedYear} 
            onMonthChange={handleMonthChange} 
          />
        </div>
      )}

      {/* Report Tabs */}
      <div className="print:hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 size={18} className="mr-2" />
                Attendance Summary
              </div>
            </button>
            <button
              onClick={() => setActiveTab('punctuality')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'punctuality'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                Punctuality & Overtime
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                Employee Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('explanation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'explanation'
                  ? 'border-navy-500 text-navy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BookOpen size={18} className="mr-2" />
                Analytics Guide
              </div>
            </button>
          </nav>
        </div>
      </div>
      
      <div className="hidden print:block text-center mb-4">
        <h1 className="text-2xl font-bold">
          {activeTab === 'summary' && 'Attendance Summary Report'}
          {activeTab === 'punctuality' && 'Punctuality & Overtime Analysis Report'}
          {activeTab === 'analytics' && 'Employee Analytics Report'}
          {activeTab === 'explanation' && 'Analytics & Calculations Guide'}
        </h1>
        {activeTab !== 'analytics' && activeTab !== 'explanation' && (
          <p className="text-gray-600">
            {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
            })}
          </p>
        )}
      </div>
      
      {activeTab === 'analytics' ? (
        <EmployeeAnalytics month={selectedMonth} year={selectedYear} />
      ) : activeTab === 'explanation' ? (
        <AnalyticsExplanation />
      ) : attendanceSummary.length === 0 ? (
        <Card className="print:border-0 print:shadow-none">
          <EmptyState
            icon={<BarChart3 size={40} />}
            title="No attendance data available"
            description="There is no attendance data for the selected month. Please select a different month or mark attendance first."
          />
        </Card>
      ) : (
        <Card className="print:border-0 print:shadow-none">
          {activeTab === 'summary' ? (
            <AttendanceSummary 
              attendanceSummary={attendanceSummary} 
              month={selectedMonth}
              year={selectedYear}
            />
          ) : (
            <PunctualityReport
              attendanceSummary={attendanceSummary}
              month={selectedMonth}
              year={selectedYear}
            />
          )}
        </Card>
      )}
    </div>
  );
};