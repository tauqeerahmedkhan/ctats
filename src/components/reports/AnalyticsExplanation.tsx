import React from 'react';
import { Calculator, Clock, TrendingUp, Target, Zap, Users, BarChart3, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export const AnalyticsExplanation: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Analytics & Calculations Guide</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive explanation of all metrics, calculations, and parameters used in the Employee Attendance Tracker system.
        </p>
      </div>

      {/* Core Metrics Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="text-blue-600 mr-3" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">Core Attendance Metrics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Users className="mr-2" size={18} />
              Present Days
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              <strong>Definition:</strong> Total number of days an employee was marked present during the selected period.
            </p>
            <p className="text-blue-700 text-sm">
              <strong>Calculation:</strong> COUNT(attendance records where present = true)
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center">
              <AlertTriangle className="mr-2" size={18} />
              Absent Days
            </h3>
            <p className="text-red-700 text-sm mb-2">
              <strong>Definition:</strong> Total number of days an employee was marked absent during the selected period.
            </p>
            <p className="text-red-700 text-sm">
              <strong>Calculation:</strong> COUNT(attendance records where present = false)
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <TrendingUp className="mr-2" size={18} />
              Attendance Percentage
            </h3>
            <p className="text-green-700 text-sm mb-2">
              <strong>Definition:</strong> Percentage of days an employee was present out of total working days.
            </p>
            <p className="text-green-700 text-sm">
              <strong>Formula:</strong> (Present Days ÷ Total Days) × 100
            </p>
            <p className="text-green-700 text-xs mt-2 italic">
              Example: 22 present days out of 25 total days = 88%
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
              <Clock className="mr-2" size={18} />
              Total Hours
            </h3>
            <p className="text-purple-700 text-sm mb-2">
              <strong>Definition:</strong> Sum of all regular working hours (excluding overtime) during the period.
            </p>
            <p className="text-purple-700 text-sm">
              <strong>Calculation:</strong> SUM(hours) for all present days
            </p>
            <p className="text-purple-700 text-xs mt-2 italic">
              Note: Regular hours are capped at 8 hours per day
            </p>
          </div>
        </div>
      </div>

      {/* Overtime Calculations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Zap className="text-orange-600 mr-3" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">Overtime Calculations</h2>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-100 mb-6">
          <h3 className="font-semibold text-orange-800 mb-4">How Overtime is Calculated</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-orange-200 rounded-full p-1 mr-3 mt-1">
                <span className="text-orange-800 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-orange-700 font-medium">Calculate Total Working Hours</p>
                <p className="text-orange-600 text-sm">Time Out - Time In = Total Hours Worked</p>
                <p className="text-orange-600 text-xs italic">Example: 19:30 - 09:00 = 10.5 hours</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-200 rounded-full p-1 mr-3 mt-1">
                <span className="text-orange-800 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-orange-700 font-medium">Determine Regular vs Overtime Hours</p>
                <p className="text-orange-600 text-sm">If Total Hours &gt; 8: Regular = 8, Overtime = Total - 8</p>
                <p className="text-orange-600 text-sm">If Total Hours ≤ 8: Regular = Total, Overtime = 0</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-200 rounded-full p-1 mr-3 mt-1">
                <span className="text-orange-800 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-orange-700 font-medium">Example Calculation</p>
                <p className="text-orange-600 text-sm">Employee works 10.5 hours:</p>
                <p className="text-orange-600 text-sm">• Regular Hours: 8 hours</p>
                <p className="text-orange-600 text-sm">• Overtime Hours: 2.5 hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Overtime Hours</h4>
            <p className="text-gray-600 text-sm">
              <strong>Formula:</strong> MAX(0, Total Hours - 8)
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Any hours worked beyond 8 hours per day
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Average Hours per Day</h4>
            <p className="text-gray-600 text-sm">
              <strong>Formula:</strong> Total Hours ÷ Present Days
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Average working hours on days when present
            </p>
          </div>
        </div>
      </div>

      {/* Punctuality Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Target className="text-green-600 mr-3" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">Punctuality & Performance Metrics</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Punctuality Score</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
              <p className="text-green-700 text-sm mb-2">
                <strong>Definition:</strong> Percentage of days an employee arrived on time.
              </p>
              <p className="text-green-700 text-sm mb-2">
                <strong>Formula:</strong> (On Time Days ÷ Present Days) × 100
              </p>
              <p className="text-green-700 text-sm">
                <strong>On Time Criteria:</strong>
              </p>
              <ul className="text-green-600 text-xs mt-2 ml-4 list-disc">
                <li>Morning Shift: Arrival ≤ 09:00</li>
                <li>Night Shift: Arrival ≤ 21:00</li>
              </ul>
            </div>

            <h4 className="font-medium text-gray-800 mb-2">Punctuality Grades</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm">Excellent: 95-100%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span className="text-sm">Good: 85-94%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                <span className="text-sm">Fair: 70-84%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-sm">Poor: Below 70%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Hours Efficiency</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
              <p className="text-blue-700 text-sm mb-2">
                <strong>Definition:</strong> How efficiently an employee utilizes their working time.
              </p>
              <p className="text-blue-700 text-sm mb-2">
                <strong>Formula:</strong> (Actual Hours ÷ Expected Hours) × 100
              </p>
              <p className="text-blue-700 text-sm">
                <strong>Expected Hours:</strong> Present Days × 8 hours
              </p>
            </div>

            <h4 className="font-medium text-gray-800 mb-2">Additional Metrics</h4>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800 text-sm">Late Days</p>
                <p className="text-gray-600 text-xs">Days when arrival time exceeded shift start time</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800 text-sm">Early Departures</p>
                <p className="text-gray-600 text-xs">Days when departure time was before shift end time</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800 text-sm">Average Lateness</p>
                <p className="text-gray-600 text-xs">Average minutes late on days when employee was late</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Scoring */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Calculator className="text-purple-600 mr-3" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">Performance Scoring System</h2>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-purple-800 mb-4">Overall Performance Score</h3>
          <p className="text-purple-700 text-sm mb-4">
            The overall performance score combines punctuality and hours efficiency to provide a comprehensive rating.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <p className="text-purple-800 font-medium mb-2">Formula:</p>
            <p className="text-purple-700 text-sm font-mono bg-purple-100 p-2 rounded">
              Performance Score = (Punctuality Score + Hours Efficiency) ÷ 2
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Example Calculation</h4>
              <div className="text-purple-700 text-sm space-y-1">
                <p>• Punctuality Score: 92%</p>
                <p>• Hours Efficiency: 88%</p>
                <p>• Performance Score: (92 + 88) ÷ 2 = 90%</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Performance Indicators</h4>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <TrendingUp className="text-green-500 mr-2" size={16} />
                  <span>90%+: Excellent Performance</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="text-yellow-500 mr-2" size={16} />
                  <span>80-89%: Good Performance</span>
                </div>
                <div className="flex items-center text-sm">
                  <AlertTriangle className="text-red-500 mr-2" size={16} />
                  <span>&lt;80%: Needs Improvement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources & Calculations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Info className="text-blue-600 mr-3" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">Data Sources & Technical Details</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Data Collection</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800 text-sm">Time Tracking</p>
                <p className="text-gray-600 text-xs">Automatic calculation from check-in and check-out times</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800 text-sm">Shift Management</p>
                <p className="text-gray-600 text-xs">Configurable shift timings for different employee groups</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800 text-sm">Weekend Handling</p>
                <p className="text-gray-600 text-xs">Individual weekend configurations per employee</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800 text-sm">Holiday Management</p>
                <p className="text-gray-600 text-xs">Automatic exclusion of company holidays from calculations</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Calculation Frequency</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded border border-blue-100">
                <p className="font-medium text-blue-800 text-sm">Real-time Updates</p>
                <p className="text-blue-600 text-xs">Metrics update immediately when attendance is marked</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-100">
                <p className="font-medium text-green-800 text-sm">Historical Analysis</p>
                <p className="text-green-600 text-xs">All calculations work retroactively for any date range</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                <p className="font-medium text-yellow-800 text-sm">Data Integrity</p>
                <p className="text-yellow-600 text-xs">Automatic validation and error handling for all calculations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <CheckCircle className="text-green-600 mr-3" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">Best Practices & Guidelines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">For Managers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Review punctuality scores monthly to identify patterns</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Use hours efficiency to optimize work schedules</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Monitor overtime trends to manage workload distribution</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Compare department performance for resource allocation</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">For HR Teams</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Use attendance percentage for performance reviews</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Track improvement trends after interventions</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Generate reports for payroll and compliance</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span>Identify training needs based on performance scores</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          All calculations are performed in real-time using the latest attendance data. 
          For technical support or questions about specific calculations, please contact your system administrator.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Last updated: {new Date().toLocaleDateString()} | Version 2.0
        </p>
      </div>
    </div>
  );
};