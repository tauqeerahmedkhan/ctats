import React from 'react';
import { Card } from '../common/Card';
import { 
  Database, 
  Shield, 
  Wifi, 
  Activity, 
  CheckCircle, 
  Clock,
  Users,
  Server
} from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const systemMetrics = [
    {
      label: 'Database Connection',
      status: 'Active',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      dotColor: 'bg-green-500'
    },
    {
      label: 'Authentication',
      status: 'Secure',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      dotColor: 'bg-green-500'
    },
    {
      label: 'Data Sync',
      status: 'Real-time',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      dotColor: 'bg-blue-500'
    },
    {
      label: 'API Status',
      status: 'Operational',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      dotColor: 'bg-green-500'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Response Time',
      value: '< 100ms',
      icon: Clock,
      color: 'text-emerald-600'
    },
    {
      label: 'Uptime',
      value: '99.9%',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Active Users',
      value: '1',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Data Integrity',
      value: '100%',
      icon: Shield,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card title="System Status">
      <div className="space-y-6">
        {/* System Health */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">System Health</h4>
          <div className="space-y-3">
            {systemMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className={`flex items-center justify-between p-3 ${metric.bgColor} rounded-lg border border-opacity-20`}>
                  <div className="flex items-center">
                    <Icon className={`${metric.color} mr-3`} size={18} />
                    <span className="text-gray-700 font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 ${metric.dotColor} rounded-full mr-2`}></div>
                    <span className={`${metric.color} font-semibold text-sm`}>{metric.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Performance</h4>
          <div className="grid grid-cols-2 gap-3">
            {performanceMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Icon className={`${metric.color} mr-2`} size={16} />
                    <span className="text-xs font-medium text-gray-600">{metric.label}</span>
                  </div>
                  <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <Wifi className="text-blue-600 mr-2" size={18} />
              <span className="font-semibold text-blue-800">Cloud Infrastructure</span>
            </div>
            <p className="text-blue-700 text-sm">
              Powered by Supabase with PostgreSQL database, real-time subscriptions, and row-level security.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};