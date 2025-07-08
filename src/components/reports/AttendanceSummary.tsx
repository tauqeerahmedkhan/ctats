import React, { useState } from 'react';
import { BarChart, Download, Search, ArrowUpDown, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface AttendanceSummaryProps {
  attendanceSummary: any[];
  month: number;
  year: number;
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  attendanceSummary,
  month,
  year,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('employeeName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter by search term
  const filteredData = attendanceSummary.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (item.employeeName && item.employeeName.toLowerCase().includes(searchTermLower)) ||
      (item.department && item.department.toLowerCase().includes(searchTermLower))
    );
  });
  
  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle null or undefined values
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    // Convert to appropriate type for comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = String(bValue).toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Calculate punctuality metrics
  const calculatePunctualityMetrics = (item: any) => {
    const presentDays = item.present_days || 0;
    const expectedHoursPerDay = 8;
    const expectedTotalHours = presentDays * expectedHoursPerDay;
    const actualHours = item.total_hours || 0;
    const hoursVariance = actualHours - expectedTotalHours;
    const punctualityScore = expectedTotalHours > 0 ? Math.min(100, (actualHours / expectedTotalHours) * 100) : 100;
    
    return {
      expectedHours: expectedTotalHours,
      actualHours,
      hoursVariance,
      punctualityScore: Math.round(punctualityScore),
      avgHoursPerDay: presentDays > 0 ? (actualHours / presentDays).toFixed(1) : '0.0'
    };
  };

  const getPunctualityColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPunctualityBadge = (score: number) => {
    if (score >= 95) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 85) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 70) return { text: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800' };
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h2 className="text-lg font-semibold text-gray-800">
          Attendance & Punctuality Report for {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="flex items-center border rounded-lg overflow-hidden w-64">
          <div className="bg-gray-100 p-2 text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="p-2 flex-1 outline-none"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer print:py-2"
                onClick={() => handleSort('employeeName')}
              >
                <div className="flex items-center">
                  Employee
                  {sortField === 'employeeName' && (
                    <ArrowUpDown size={16} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer print:py-2"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center">
                  Department
                  {sortField === 'department' && (
                    <ArrowUpDown size={16} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer print:py-2 text-center"
                onClick={() => handleSort('presentDays')}
              >
                <div className="flex items-center justify-center">
                  Present
                  {sortField === 'presentDays' && (
                    <ArrowUpDown size={16} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer print:py-2 text-center"
                onClick={() => handleSort('totalHours')}
              >
                <div className="flex items-center justify-center">
                  Actual Hours
                  {sortField === 'totalHours' && (
                    <ArrowUpDown size={16} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-gray-600 border-b text-center print:py-2">
                Expected Hours
              </th>
              <th className="py-3 px-4 font-semibold text-gray-600 border-b text-center print:py-2">
                Hours Variance
              </th>
              <th className="py-3 px-4 font-semibold text-gray-600 border-b text-center print:py-2">
                Avg Hours/Day
              </th>
              <th className="py-3 px-4 font-semibold text-gray-600 border-b text-center print:py-2">
                Punctuality Score
              </th>
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b text-center print:py-2"
              >
                Attendance %
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => {
              const presentDays = item.present_days || 0;
              const absentDays = item.absent_days || 0;
              const totalDays = presentDays + absentDays;
              const attendancePercentage = totalDays > 0 
                ? ((presentDays / totalDays) * 100).toFixed(1) 
                : '0.0';
              
              const metrics = calculatePunctualityMetrics(item);
              const punctualityBadge = getPunctualityBadge(metrics.punctualityScore);
              
              return (
                <tr key={item.employee_id} className="border-b hover:bg-gray-50 print:hover:bg-white">
                  <td className="py-3 px-4 print:py-2">
                    <div className="font-medium text-gray-900">{item.employee_name}</div>
                    <div className="text-xs text-gray-500 print:hidden">{item.employee_id}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 print:py-2">
                    {item.department || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-center print:py-2">
                    <span className="font-medium text-green-600">{presentDays}</span>
                    {absentDays > 0 && (
                      <div className="text-xs text-red-500">({absentDays} absent)</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center print:py-2">
                    <span className="font-medium text-gray-800">{metrics.actualHours.toFixed(1)}h</span>
                  </td>
                  <td className="py-3 px-4 text-center print:py-2">
                    <span className="text-gray-600">{metrics.expectedHours.toFixed(1)}h</span>
                  </td>
                  <td className="py-3 px-4 text-center print:py-2">
                    <span className={`font-medium ${metrics.hoursVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.hoursVariance >= 0 ? '+' : ''}{metrics.hoursVariance.toFixed(1)}h
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center print:py-2">
                    <span className="text-gray-700">{metrics.avgHoursPerDay}h</span>
                  </td>
                  <td className="py-3 px-4 text-center print:py-2">
                    <div className="flex flex-col items-center">
                      <span className={`font-bold text-lg ${getPunctualityColor(metrics.punctualityScore)}`}>
                        {metrics.punctualityScore}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${punctualityBadge.color} print:hidden`}>
                        {punctualityBadge.text}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center print:py-2">
                    <div className="flex items-center justify-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 print:hidden">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${attendancePercentage}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{attendancePercentage}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  No attendance data found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 print:mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 print:bg-white print:border print:border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Working Days</div>
                <div className="text-2xl font-bold text-blue-700">{daysInMonth}</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-500 print:hidden">
                <BarChart size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 print:bg-white print:border print:border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Average Attendance</div>
                <div className="text-2xl font-bold text-green-700">
                  {sortedData.length > 0
                    ? (sortedData.reduce((sum, item) => sum + (item.presentDays || 0), 0) / sortedData.length).toFixed(1)
                    : '0.0'} days
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-500 print:hidden">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 print:bg-white print:border print:border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-amber-600 font-medium">Average Hours</div>
                <div className="text-2xl font-bold text-amber-700">
                  {sortedData.length > 0
                    ? (sortedData.reduce((sum, item) => sum + (item.totalHours || 0), 0) / sortedData.length).toFixed(1)
                    : '0.0'} hrs
                </div>
              </div>
              <div className="bg-amber-100 p-3 rounded-full text-amber-500 print:hidden">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 print:bg-white print:border print:border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium">Avg Punctuality</div>
                <div className="text-2xl font-bold text-purple-700">
                  {sortedData.length > 0
                    ? Math.round(sortedData.reduce((sum, item) => {
                        const metrics = calculatePunctualityMetrics(item);
                        return sum + metrics.punctualityScore;
                      }, 0) / sortedData.length)
                    : 0}%
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-500 print:hidden">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Punctuality Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 print:bg-white">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Punctuality Score Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Excellent (95-100%)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span>Good (85-94%)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            <span>Fair (70-84%)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span>Poor (&lt;70%)</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Punctuality score is calculated based on actual hours worked vs expected hours (8 hours per present day).
          Hours variance shows the difference between actual and expected hours worked.
        </p>
      </div>
      
      <div className="mt-8 text-xs text-gray-500 text-center print:mt-4">
        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};