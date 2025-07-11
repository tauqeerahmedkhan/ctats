import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { getAllEmployees } from '../../services/employeeService';
import { getEmployeeAnalytics } from '../../services/attendanceService';
import { Employee } from '../../types/Employee';
import { EmployeeAnalytics as EmployeeAnalyticsType } from '../../types/Attendance';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { User, Calendar, Clock, TrendingUp, Zap, Target } from 'lucide-react';

interface EmployeeAnalyticsProps {
  month: number;
  year: number;
}

export const EmployeeAnalytics: React.FC<EmployeeAnalyticsProps> = ({
  month,
  year,
}) => {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [analytics, setAnalytics] = useState<EmployeeAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadAnalytics();
    }
  }, [selectedEmployeeId, dateRange, customStartDate, customEndDate, month, year]);

  const loadEmployees = async () => {
    try {
      const employeesList = await getAllEmployees();
      setEmployees(employeesList);
      if (employeesList.length > 0) {
        setSelectedEmployeeId(employeesList[0].id);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      addToast('Failed to load employees', 'error');
    }
  };

  const loadAnalytics = async () => {
    if (!selectedEmployeeId) return;

    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const analyticsData = await getEmployeeAnalytics(selectedEmployeeId, startDate, endDate);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      addToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = () => {
    const currentDate = new Date();
    let startDate: string;
    let endDate: string;

    switch (dateRange) {
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'last2Months':
        const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
        const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        startDate = twoMonthsAgo.toISOString().split('T')[0];
        endDate = lastMonthEndDate.toISOString().split('T')[0];
        break;
      case 'year':
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default: // month
        startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    }

    return { startDate, endDate };
  };

  const getAttendancePieData = () => {
    if (!analytics) return [];
    
    return [
      { name: 'Present', value: analytics.presentDays, color: '#10B981' },
      { name: 'Absent', value: analytics.absentDays, color: '#EF4444' },
    ];
  };

  const getPunctualityPieData = () => {
    if (!analytics) return [];
    
    return [
      { name: 'On Time', value: analytics.onTimeDays, color: '#10B981' },
      { name: 'Late', value: analytics.lateDays, color: '#F59E0B' },
    ];
  };

  const getWeeklyBarData = () => {
    if (!analytics?.weeklyStats) return [];
    
    return analytics.weeklyStats.map(week => ({
      week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Regular Hours': week.totalHours - week.overtimeHours,
      'Overtime Hours': week.overtimeHours,
      'Present Days': week.presentDays,
    }));
  };

  const getMonthlyLineData = () => {
    if (!analytics?.monthlyStats) return [];
    
    return analytics.monthlyStats.map(month => ({
      month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      'Total Hours': month.totalHours,
      'Overtime Hours': month.overtimeHours,
      'Present Days': month.presentDays,
    }));
  };

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

  if (!selectedEmployeeId) {
    return (
      <Card>
        <div className="text-center py-8">
          <User size={40} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees available</h3>
          <p className="text-gray-500">Add employees to view detailed analytics</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee Selection and Date Range */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            >
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last2Months">Previous 2 Months</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Attendance Rate</p>
                  <h3 className="text-3xl font-bold mt-1">{analytics.attendancePercentage.toFixed(1)}%</h3>
                </div>
                <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                  <Calendar size={24} />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Punctuality Score</p>
                  <h3 className="text-3xl font-bold mt-1">{analytics.punctualityScore.toFixed(1)}%</h3>
                </div>
                <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                  <Target size={24} />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Hours</p>
                  <h3 className="text-3xl font-bold mt-1">{analytics.totalHours.toFixed(1)}h</h3>
                </div>
                <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                  <Clock size={24} />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Overtime Hours</p>
                  <h3 className="text-3xl font-bold mt-1">{analytics.overtimeHours.toFixed(1)}h</h3>
                </div>
                <div className="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                  <Zap size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Attendance Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getAttendancePieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getAttendancePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Punctuality Analysis">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPunctualityPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPunctualityPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6">
            <Card title="Weekly Performance">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getWeeklyBarData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Regular Hours" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="Overtime Hours" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 gap-6">
            <Card title="Monthly Trends">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getMonthlyLineData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Total Hours" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Overtime Hours" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="Present Days" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <Card title="Detailed Statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{analytics.totalDays}</div>
                <div className="text-sm text-gray-600">Total Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.presentDays}</div>
                <div className="text-sm text-gray-600">Present Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analytics.absentDays}</div>
                <div className="text-sm text-gray-600">Absent Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.avgHoursPerDay.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Avg Hours/Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.onTimeDays}</div>
                <div className="text-sm text-gray-600">On Time Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{analytics.lateDays}</div>
                <div className="text-sm text-gray-600">Late Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics.avgLateness.toFixed(0)}m</div>
                <div className="text-sm text-gray-600">Avg Lateness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.earlyDepartures}</div>
                <div className="text-sm text-gray-600">Early Departures</div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-8">
            <TrendingUp size={40} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">No attendance data found for the selected period</p>
          </div>
        </Card>
      )}
    </div>
  );
};