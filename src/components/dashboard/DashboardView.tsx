import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { QuickActions } from './QuickActions';
import { SystemStatus } from './SystemStatus';
import { RecentActivity } from './RecentActivity';
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
  Download,
  Upload,
  Settings,
  BarChart3,
  Bell,
  Activity,
  Shield,
  Database,
  Wifi
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
    attendance: 0,
    totalHoursThisMonth: 0,
    avgDailyAttendance: 0,
    topPerformer: '',
    needsAttention: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

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
      const totalHoursThisMonth = summary.reduce((sum, curr) => sum + (curr.total_hours || 0), 0);
      const avgDailyAttendance = employees.length > 0 ? (totalPresent / employees.length) : 0;
      
      // Find top performer (highest punctuality score)
      const topPerformer = summary.reduce((top, curr) => {
        const currentScore = curr.punctuality_percentage || 0;
        const topScore = top.punctuality_percentage || 0;
        return currentScore > topScore ? curr : top;
      }, summary[0] || {});
      
      // Count employees needing attention (attendance < 80%)
      const needsAttention = summary.filter(emp => {
        const empTotalDays = (emp.present_days || 0) + (emp.absent_days || 0);
        const empAttendance = empTotalDays > 0 ? ((emp.present_days || 0) / empTotalDays) * 100 : 0;
        return empAttendance < 80;
      }).length;

      setStats({
        totalEmployees: employees.length,
        presentToday: Math.round(todayStats.present / summary.length), // Average approximation
        absentToday: Math.round(todayStats.absent / summary.length), // Average approximation
        averageHours: summary.reduce((sum, curr) => sum + (curr.total_hours || 0), 0) / (employees.length || 1),
        totalOvertimeHours,
        departments,
        onTime: Math.round(todayStats.onTime / summary.length), // Average approximation
        late: Math.round(todayStats.late / summary.length), // Average approximation
        attendance: Math.round(attendancePercentage),
        totalHoursThisMonth: Math.round(totalHoursThisMonth),
        avgDailyAttendance: Math.round(avgDailyAttendance),
        topPerformer: topPerformer?.employee_name || 'N/A',
        needsAttention
      });
      
      // Generate recent activities (mock data for demo)
      setRecentActivities([
        {
          id: 1,
          type: 'attendance',
          message: `${employees.length} employees marked attendance today`,
          time: new Date().toISOString(),
          icon: UserCheck,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'overtime',
          message: `${Math.round(totalOvertimeHours)} hours of overtime recorded this month`,
          time: new Date(Date.now() - 3600000).toISOString(),
          icon: Zap,
          color: 'text-orange-600'
        },
        {
          id: 3,
          type: 'report',
          message: 'Monthly attendance report generated',
          time: new Date(Date.now() - 7200000).toISOString(),
          icon: FileText,
          color: 'text-blue-600'
        }
      ]);
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
      {/* Header with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of attendance statistics and employee metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="primary" 
            onClick={() => navigateTo('attendance')}
            icon={<Calendar size={18} />}
          >
            Mark Attendance
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigateTo('employees')}
            icon={<UserPlus size={18} />}
          >
            Add Employee
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigateTo('reports')}
            icon={<BarChart3 size={18} />}
          >
            View Reports
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('employees')}>
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
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('attendance')}>
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
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('reports')}>
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
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('reports')}>
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

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Departments */}
        <Card className="hover:shadow-md transition-shadow">
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
        <Card className="hover:shadow-md transition-shadow">
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
        <Card className="hover:shadow-md transition-shadow">
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
        <Card className="hover:shadow-md transition-shadow">
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

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-indigo-600 font-medium">Total Hours (Month)</p>
              <h3 className="text-xl font-bold text-indigo-700">{stats.totalHoursThisMonth}h</h3>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">Avg Daily Attendance</p>
              <h3 className="text-xl font-bold text-emerald-700">{stats.avgDailyAttendance}</h3>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Top Performer</p>
              <h3 className="text-sm font-bold text-yellow-700 truncate">{stats.topPerformer}</h3>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Needs Attention</p>
              <h3 className="text-xl font-bold text-red-700">{stats.needsAttention}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions onNavigate={navigateTo} />
        <SystemStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        
        {/* Enhanced Tips & Features */}
        <Card title="Tips & Features">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <Download className="text-blue-600 mr-3 mt-0.5" size={18} />
                <div>
                  <div className="font-semibold text-blue-800">Data Management</div>
                  <div className="text-blue-700 text-sm mt-1">Import/export data in multiple formats with legacy v1.0 support. Access via Settings → Database Management.</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                    onClick={() => navigateTo('settings')}
                  >
                    Go to Settings
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-start">
                <Zap className="text-green-600 mr-3 mt-0.5" size={18} />
                <div>
                  <div className="font-semibold text-green-800">Overtime Tracking</div>
                  <div className="text-green-700 text-sm mt-1">Automatic calculation for hours worked beyond 8 hours per day. View detailed analytics in Reports.</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-green-600 border-green-300 hover:bg-green-50"
                    onClick={() => navigateTo('reports')}
                  >
                    View Analytics
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-start">
                <Shield className="text-purple-600 mr-3 mt-0.5" size={18} />
                <div>
                  <div className="font-semibold text-purple-800">Security & RBAC</div>
                  <div className="text-purple-700 text-sm mt-1">Role-based access control with Supabase authentication. Manage users in Settings → User Management.</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-purple-600 border-purple-300 hover:bg-purple-50"
                    onClick={() => navigateTo('settings')}
                  >
                    User Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};