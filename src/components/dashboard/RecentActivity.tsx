import React from 'react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled' | 'success' | 'warning' | 'processing' | 'error';
}

interface RecentActivityProps {
  title: string;
  activities: Activity[];
}

const statusStyles = {
  pending: 'badge-pending',
  active: 'badge-active',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  success: 'badge-completed',
  warning: 'badge-pending',
  processing: 'badge-active',
  error: 'badge-cancelled',
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ title, activities }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
                {activity.status && (
                  <span className={cn(statusStyles[activity.status])}>
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
