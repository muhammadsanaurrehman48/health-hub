import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import api from '@/utils/api';
import {
  Users,
  Building2,
  BarChart3,
  Settings,
  UserPlus,
  FileText,
  Shield,
  Activity,
  Loader2,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, departments: 0, todayPatients: 0, systemHealth: '0%' });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.getAdminStats(),
          api.getActivities()
        ]);
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (activitiesRes.success) {
          setActivities(activitiesRes.data);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Active staff members"
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Departments"
            value={stats.departments}
            subtitle="Active departments"
            icon={Building2}
            variant="success"
          />
          <StatCard
            title="Today's Patients"
            value={stats.todayPatients}
            subtitle="OPD + IPD combined"
            icon={Activity}
            variant="warning"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="System Health"
            value={stats.systemHealth}
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
          <RecentActivity title="Recent System Activity" activities={activities} />
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
