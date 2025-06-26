import React, { useState } from 'react';
import { Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';

interface PunctualityReportProps {
  attendanceSummary: any[];
  month: number;
  year: number;
}

export const PunctualityReport: React.FC<PunctualityReportProps> = ({
  attendanceSummary,
  month,
  year,
}) => {
  const [sortField, setSortField] = useState<string>('punctuality_percentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort data
  const sortedData = [...attendanceSummary].sort((a, b) => {
    let aValue = a[sortField] || 0;
    let bValue = b[sortField] || 0;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getPunctualityColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMinutes = (minutes: number) => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Detailed Punctuality & Overtime Analysis
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-600 border-b">
                  Employee
                </th>
                <th 
                  className="py-3 px-4 text-center font-semibold text-gray-600 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('punctuality_percentage')}
                >
                  Punctuality %
                </th>
                <th 
                  className="py-3 px-4 text-center font-semibold text-gray-600 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('on_time_days')}
                >
                  On Time Days
                </th>
                <th 
                  className="py-3 px-4 text-center font-semibold text-gray-600 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('late_days')}
                >
                  Late Days
                </th>
                <th 
                  className="py-3 px-4 text-center font-semibold text-gray-600 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('avg_lateness_minutes')}
                >
                  Avg Lateness
                </th>
                <th 
                  className="py-3 px-4 text-center font-semibold text-gray-600 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('overtime_hours')}
                >
                  Overtime Hours
                </th>
                <th 
                  className="py-3 px-4 text-center font-semibold text-gray-600 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('early_departures')}
                >
                  Early Departures
                </th>
                <th 
                  className="py-3 px-4 text-center font-semibold text-gray-600 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('hours_efficiency')}
                >
                  Hours Efficiency
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600 border-b">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => {
                const punctualityPercentage = Math.round(item.punctuality_percentage || 0);
                const hoursEfficiency = Math.round(item.hours_efficiency || 0);
                const onTimeDays = item.on_time_days || 0;
                const lateDays = item.late_days || 0;
                const avgLateness = item.avg_lateness_minutes || 0;
                const overtimeHours = item.overtime_hours || 0;
                const earlyDepartures = item.early_departures || 0;

                // Overall performance score
                const performanceScore = Math.round((punctualityPercentage + hoursEfficiency) / 2);
                
                return (
                  <tr key={item.employee_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.employee_name}</div>
                      <div className="text-sm text-gray-500">{item.department}</div>
                      <div className="text-xs text-gray-400 capitalize">{item.shift} shift</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`text-lg font-bold ${getPunctualityColor(punctualityPercentage)}`}>
                        {punctualityPercentage}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="text-green-500 mr-1" size={16} />
                        <span className="font-medium text-green-600">{onTimeDays}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <XCircle className="text-red-500 mr-1" size={16} />
                        <span className="font-medium text-red-600">{lateDays}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${avgLateness > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatMinutes(avgLateness)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <Zap className="text-orange-500 mr-1" size={16} />
                        <span className={`font-medium ${overtimeHours > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {overtimeHours.toFixed(1)}h
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${earlyDepartures > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {earlyDepartures}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`text-lg font-bold ${getEfficiencyColor(hoursEfficiency)}`}>
                        {hoursEfficiency}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className={`text-lg font-bold ${getPunctualityColor(performanceScore)}`}>
                          {performanceScore}%
                        </div>
                        <div className="flex items-center mt-1">
                          {performanceScore >= 95 && <TrendingUp className="text-green-500" size={16} />}
                          {performanceScore >= 85 && performanceScore < 95 && <Clock className="text-yellow-500" size={16} />}
                          {performanceScore < 85 && <AlertTriangle className="text-red-500" size={16} />}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Punctuality Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center mb-2">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            <h4 className="font-semibold text-green-800">Most Punctual</h4>
          </div>
          {sortedData.length > 0 && (
            <div>
              <div className="font-medium text-green-700">{sortedData[0]?.employee_name}</div>
              <div className="text-sm text-green-600">{Math.round(sortedData[0]?.punctuality_percentage || 0)}% punctuality</div>
            </div>
          )}
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center mb-2">
            <Zap className="text-orange-600 mr-2" size={20} />
            <h4 className="font-semibold text-orange-800">Top Overtime</h4>
          </div>
          {sortedData.length > 0 && (
            <div>
              {(() => {
                const topOvertime = [...sortedData].sort((a, b) => (b.overtime_hours || 0) - (a.overtime_hours || 0))[0];
                return (
                  <>
                    <div className="font-medium text-orange-700">{topOvertime?.employee_name}</div>
                    <div className="text-sm text-orange-600">{(topOvertime?.overtime_hours || 0).toFixed(1)}h overtime</div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center mb-2">
            <AlertTriangle className="text-red-600 mr-2" size={20} />
            <h4 className="font-semibold text-red-800">Needs Improvement</h4>
          </div>
          {sortedData.length > 0 && (
            <div>
              <div className="font-medium text-red-700">{sortedData[sortedData.length - 1]?.employee_name}</div>
              <div className="text-sm text-red-600">{Math.round(sortedData[sortedData.length - 1]?.punctuality_percentage || 0)}% punctuality</div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <TrendingUp className="text-blue-600 mr-2" size={20} />
            <h4 className="font-semibold text-blue-800">Team Average</h4>
          </div>
          <div>
            <div className="font-medium text-blue-700">
              {sortedData.length > 0 
                ? Math.round(sortedData.reduce((sum, item) => sum + (item.punctuality_percentage || 0), 0) / sortedData.length)
                : 0}% punctuality
            </div>
            <div className="text-sm text-blue-600">
              {sortedData.length > 0 
                ? (sortedData.reduce((sum, item) => sum + (item.overtime_hours || 0), 0) / sortedData.length).toFixed(1)
                : 0}h avg overtime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};