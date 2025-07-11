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
  Users, UserCheck, UserX, Clock, TrendingUp, Building2, Briefcase, 
  Calendar, Zap, UserPlus, BarChart3, AlertTriangle
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate?: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalEmployees: 0, presentToday: 0, absentToday: 0, averageHours: 0,
    totalOvertimeHours: 0, departments: 0, onTime: 0, late: 0, attendance: 0,
    totalHoursThisMonth: 0, avgDailyAttendance: 0, topPerformer: '', needsAttention: 0
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

      const departments = new Set(employees.map(e => e.department)).size;
      const todayStats = summary.reduce((acc, curr) => {
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
      
      const topPerformer = summary.reduce((top, curr) => {
        const currentScore = curr.punctuality_percentage || 0;
        const topScore = top.punctuality_percentage || 0;
        return currentScore > topScore ? curr : top;
      }, summary[0] || {});
      
      const needsAttention = summary.filter(emp => {
        const empTotalDays = (emp.present_days || 0) + (emp.absent_days || 0);
        const empAttendance = empTotalDays > 0 ? ((emp.present_days || 0) / empTotalDays) * 100 : 0;
        return empAttendance < 80;
      }).length;

      setStats({
        totalEmployees: employees.length,
        presentToday: Math.round(todayStats.present / summary.length),
        absentToday: Math.round(todayStats.absent / summary.length),
        averageHours: summary.reduce((sum, curr) => sum + (curr.total_hours || 0), 0) / (employees.length || 1),
        totalOvertimeHours, departments,
        onTime: Math.round(todayStats.onTime / summary.length),
        late: Math.round(todayStats.late / summary.length),
        attendance: Math.round(attendancePercentage),
        totalHoursThisMonth: Math.round(totalHoursThisMonth),
        avgDailyAttendance: Math.round(totalPresent / employees.length),
        topPerformer: topPerformer?.employee_name || 'N/A',
        needsAttention
      });
      
      setRecentActivities([
        {
          id: 1, type: 'attendance',
          message: `${employees.length} employees marked attendance today`,
          time: new Date().toISOString(), icon: UserCheck, color: 'text-green-600'
        },
        {
          id: 2, type: 'overtime',
          message: `${Math.round(totalOvertimeHours)} hours of overtime recorded this month`,
          time: new Date(Date.now() - 3600000).toISOString(), icon: Zap, color: 'text-orange-600'
        }
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
      addToast('Failed to load dashboard statistics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
    <Card className={`${color} text-white hover:shadow-lg transition-shadow cursor-pointer`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="opacity-80">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-white bg-opacity-20 p-3 rounded-full">
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-full`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-xl font-bold text-gray-800">{value}</h3>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of attendance statistics and employee metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigateTo('attendance')} icon={<Calendar size={18} />}>
            Mark Attendance
          </Button>
          <Button variant="outline" onClick={() => navigateTo('employees')} icon={<UserPlus size={18} />}>
            Add Employee
          </Button>
          <Button variant="outline" onClick={() => navigateTo('reports')} icon={<BarChart3 size={18} />}>
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} 
          color="bg-gradient-to-br from-blue-500 to-blue-600" onClick={() => navigateTo('employees')} />
        <StatCard title="Avg Present/Day" value={stats.presentToday} icon={UserCheck} 
          color="bg-gradient-to-br from-green-500 to-green-600" onClick={() => navigateTo('attendance')} />
        <StatCard title="Avg Absent/Day" value={stats.absentToday} icon={UserX} 
          color="bg-gradient-to-br from-red-500 to-red-600" onClick={() => navigateTo('reports')} />
        <StatCard title="Avg Hours/Employee" value={stats.averageHours.toFixed(1)} icon={Clock} 
          color="bg-gradient-to-br from-purple-500 to-purple-600" onClick={() => navigateTo('reports')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Departments" value={stats.departments} icon={Building2} color="bg-blue-100 text-blue-600" />
        <MetricCard title="Total Overtime" value={`${stats.totalOvertimeHours.toFixed(1)}h`} icon={Zap} color="bg-orange-100 text-orange-600" />
        <MetricCard title="Avg On Time" value={stats.onTime} icon={Briefcase} color="bg-green-100 text-green-600" />
        <MetricCard title="Attendance Rate" value={`${stats.attendance}%`} icon={TrendingUp} color="bg-indigo-100 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Hours (Month)" value={`${stats.totalHoursThisMonth}h`} icon={Clock} color="bg-indigo-100 text-indigo-600" />
        <MetricCard title="Avg Daily Attendance" value={stats.avgDailyAttendance} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" />
        <MetricCard title="Top Performer" value={stats.topPerformer} icon={Users} color="bg-yellow-100 text-yellow-600" />
        <MetricCard title="Needs Attention" value={stats.needsAttention} icon={AlertTriangle} color="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions onNavigate={handleNavigate} />
        <SystemStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        
        <Card title="Tips & Features">
          <div className="space-y-4">
            {[
              { title: 'Data Management', desc: 'Import/export data in multiple formats with legacy v1.0 support.', action: 'settings' },
              { title: 'Overtime Tracking', desc: 'Automatic calculation for hours worked beyond 8 hours per day.', action: 'reports' },
              { title: 'Security & RBAC', desc: 'Role-based access control with Supabase authentication.', action: 'settings' }
            ].map((tip, i) => (
              <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800">{tip.title}</div>
                <div className="text-blue-700 text-sm mt-1">{tip.desc}</div>
                <Button variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={() => handleNavigate(tip.action)}>
                  Go to {tip.title.split(' ')[0]}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};