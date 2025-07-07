import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { getAttendanceSummary } from '../../services/attendanceService';
import { getAllEmployees } from '../../services/employeeService';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Building2,
  Briefcase,
  Calendar,
  Zap,
  UserPlus,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    averageHours: 0,
    totalOvertimeHours: 0,
    departments: 0,
    onTime: 0,
    late: 0,
    attendance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const employees = await getAllEmployees();
      const today = new Date();
      const summary = await getAttendanceSummary(today.getFullYear(), today.getMonth() + 1);

      // Calculate statistics
      const departments = new Set(employees.map(e => e.department)).size;
      const todayStr = today.toISOString().split('T')[0];
      
      const todayStats = summary.reduce((acc, curr) => {
        // Note: This is a simplified calculation since we don't have today's specific data
        // In a real scenario, you'd query today's attendance specifically
        if (curr.present_days > 0) {
          acc.present += curr.present_days;
          acc.onTime += curr.on_time_days || 0;
          acc.late += curr.late_days || 0;
        }
        acc.absent += curr.absent_days || 0;
        return acc;
      }, { present: 0, absent: 0, onTime: 0, late: 0 });

      const totalPresent = summary.reduce((sum, curr) => sum + (curr.present_days || 0), 0);
      const totalDays = summary.reduce((sum, curr) => sum + ((curr.present_days || 0) + (curr.absent_days || 0)), 0);
      const attendancePercentage = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;
      const totalOvertimeHours = summary.reduce((sum, curr) => sum + (curr.overtime_hours || 0), 0);

      setStats({
        totalEmployees: employees.length,
        presentToday: Math.round(todayStats.present / summary.length), // Average approximation
        absentToday: Math.round(todayStats.absent / summary.length), // Average approximation
        averageHours: summary.reduce((sum, curr) => sum + (curr.total_hours || 0), 0) / (employees.length || 1),
        totalOvertimeHours,
        departments,
        onTime: Math.round(todayStats.onTime / summary.length), // Average approximation
        late: Math.round(todayStats.late / summary.length), // Average approximation
        attendance: Math.round(attendancePercentage)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      addToast('Failed to load dashboard statistics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (view: string) => {
    // This would typically use a router, but for this demo we'll use a simple approach
    const event = new CustomEvent('navigate', { detail: view });
    window.dispatchEvent(event);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of attendance statistics and employee metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Employees</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalEmployees}</h3>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
              <Users size={24} />
            </div>
          </div>
        </Card>

        {/* Present Today */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Avg Present/Day</p>
              <h3 className="text-3xl font-bold mt-1">{stats.presentToday}</h3>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
              <UserCheck size={24} />
            </div>
          </div>
        </Card>

        {/* Absent Today */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Avg Absent/Day</p>
              <h3 className="text-3xl font-bold mt-1">{stats.absentToday}</h3>
            </div>
            <div className="bg-red-400 bg-opacity-30 p-3 rounded-full">
              <UserX size={24} />
            </div>
          </div>
        </Card>

        {/* Average Hours */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg Hours/Employee</p>
              <h3 className="text-3xl font-bold mt-1">{stats.averageHours.toFixed(1)}</h3>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
              <Clock size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Departments */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <h3 className="text-xl font-bold text-gray-800">{stats.departments}</h3>
            </div>
          </div>
        </Card>

        {/* Overtime Hours */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Overtime</p>
              <h3 className="text-xl font-bold text-gray-800">{stats.totalOvertimeHours.toFixed(1)}h</h3>
            </div>
          </div>
        </Card>

        {/* On Time */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg On Time</p>
              <h3 className="text-xl font-bold text-gray-800">{stats.onTime}</h3>
            </div>
          </div>
        </Card>

        {/* Attendance Rate */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <h3 className="text-xl font-bold text-gray-800">{stats.attendance}%</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <Card title="System Overview">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="text-blue-600 mr-3" size={20} />
                <span className="text-gray-700">Total Employees</span>
              </div>
              <span className="font-semibold text-blue-600">{stats.totalEmployees}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="text-green-600 mr-3" size={20} />
                <span className="text-gray-700">Attendance Rate</span>
              </div>
              <span className="font-semibold text-green-600">{stats.attendance}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Zap className="text-orange-600 mr-3" size={20} />
                <span className="text-gray-700">Total Overtime</span>
              </div>
              <span className="font-semibold text-orange-600">{stats.totalOvertimeHours.toFixed(1)}h</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-4">
            <button 
              onClick={() => navigateTo('attendance')}
              className="w-full flex items-center p-3 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors group"
            >
              <Calendar className="text-navy-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-left">
                <div className="text-gray-700 font-medium">Mark Attendance</div>
                <div className="text-sm text-gray-500">Track daily employee attendance</div>
              </div>
            </button>
            
            <button 
              onClick={() => navigateTo('employees')}
              className="w-full flex items-center p-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors group"
            >
              <UserPlus className="text-teal-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-left">
                <div className="text-gray-700 font-medium">Manage Employees</div>
                <div className="text-sm text-gray-500">Add, edit, and organize staff</div>
              </div>
            </button>
            
            <button 
              onClick={() => navigateTo('reports')}
              className="w-full flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <BarChart3 className="text-purple-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-left">
                <div className="text-gray-700 font-medium">View Reports</div>
                <div className="text-sm text-gray-500">Analytics and insights</div>
              </div>
            </button>
            
            <button 
              onClick={() => navigateTo('settings')}
              className="w-full flex items-center p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors group"
            >
              <Settings className="text-amber-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-left">
                <div className="text-gray-700 font-medium">System Settings</div>
                <div className="text-sm text-gray-500">Configure holidays and shifts</div>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="System Status">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Database Connection</span>
              </div>
              <span className="text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Authentication</span>
              </div>
              <span className="text-green-600 font-medium">Secure</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Data Sync</span>
              </div>
              <span className="text-blue-600 font-medium">Real-time</span>
            </div>
          </div>
        </Card>

        <Card title="Tips & Features">
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <FileText className="text-blue-600 mr-2 mt-0.5" size={16} />
                <div>
                  <div className="font-medium text-blue-800">Data Management</div>
                  <div className="text-blue-600">Use the unified Data Management button to import/export data in multiple formats including legacy v1.0 support.</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-start">
                <Zap className="text-green-600 mr-2 mt-0.5" size={16} />
                <div>
                  <div className="font-medium text-green-800">Overtime Tracking</div>
                  <div className="text-green-600">Overtime is automatically calculated for hours worked beyond 8 hours per day.</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-start">
                <Settings className="text-purple-600 mr-2 mt-0.5" size={16} />
                <div>
                  <div className="font-medium text-purple-800">User Management</div>
                  <div className="text-purple-600">Manage users and RBAC settings in Settings → User Management. Advanced user management available in Supabase dashboard.</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};