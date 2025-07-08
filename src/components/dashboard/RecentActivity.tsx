import React from 'react';
import { Card } from '../common/Card';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card title="Recent Activity">
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Icon className={activity.color} size={16} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.time))} ago
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Activity Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Activities Today</span>
            <span className="font-semibold text-gray-800">{activities.length}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};