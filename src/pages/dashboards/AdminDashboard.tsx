import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Users,
  Building2,
  BarChart3,
  Settings,
  UserPlus,
  FileText,
  Shield,
  Activity,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'New user registered', description: 'Dr. Ahmed Khan joined as Doctor', time: '5 min ago', status: 'completed' as const },
  { id: '2', title: 'System backup completed', description: 'Daily backup successful', time: '1 hour ago', status: 'completed' as const },
  { id: '3', title: 'New department added', description: 'Cardiology department created', time: '2 hours ago', status: 'completed' as const },
  { id: '4', title: 'Role permissions updated', description: 'Nurse role updated', time: '3 hours ago', status: 'pending' as const },
];

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Total Users"
            value={156}
            subtitle="Active staff members"
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Departments"
            value={12}
            subtitle="Active departments"
            icon={Building2}
            variant="success"
          />
          <StatCard
            title="Today's Patients"
            value={89}
            subtitle="OPD + IPD combined"
            icon={Activity}
            variant="warning"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="System Health"
            value="98%"
            subtitle="All systems operational"
            icon={Shield}
            variant="success"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickAction
              title="Add User"
              description="Create new account"
              icon={UserPlus}
              to="/admin/users"
            />
            <QuickAction
              title="Manage Departments"
              description="View all departments"
              icon={Building2}
              to="/admin/departments"
            />
            <QuickAction
              title="View Reports"
              description="Analytics & insights"
              icon={BarChart3}
              to="/admin/reports"
            />
            <QuickAction
              title="Billing Overview"
              description="Financial summary"
              icon={FileText}
              to="/admin/billing"
            />
            <QuickAction
              title="Settings"
              description="System configuration"
              icon={Settings}
              to="/admin/settings"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity title="Recent System Activity" activities={mockActivities} />
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database Status</span>
                <span className="badge-completed">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">API Response Time</span>
                <span className="text-sm font-medium">45ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Sessions</span>
                <span className="text-sm font-medium">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Backup</span>
                <span className="text-sm font-medium">Today, 03:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
