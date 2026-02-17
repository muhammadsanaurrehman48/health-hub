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
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    departments: 0, 
    todayPatients: 0, 
    todayRegistrations: 0,
    todayInvoices: 0,
    todayRevenue: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalLabRequests: 0,
    totalRadiologyRequests: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.getAdminStats().catch(err => {
          console.error('Stats API error:', err);
          return { success: false, data: null };
        });
        
        const activitiesRes = await api.getActivities().catch(err => {
          console.error('Activities API error:', err);
          return { success: false, data: [] };
        });
        
        if (statsRes?.success && statsRes?.data) {
          setStats(statsRes.data);
        }
        
        if (activitiesRes?.success && activitiesRes?.data) {
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
            subtitle={`${stats.todayRegistrations} new registrations`}
            icon={Activity}
            variant="warning"
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            subtitle="All time registrations"
            icon={Users}
            variant="info"
          />
          <StatCard
            title="Appointments"
            value={stats.totalAppointments}
            subtitle="Total scheduled"
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Total Revenue"
            value={`Rs. ${stats.totalRevenue >= 100000 ? (stats.totalRevenue / 100000).toFixed(1) + 'L' : stats.totalRevenue.toLocaleString()}`}
            subtitle={`Pending: Rs. ${stats.pendingRevenue?.toLocaleString() || 0}`}
            icon={DollarSign}
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
                <span className="text-sm text-muted-foreground">Total Prescriptions</span>
                <span className="text-sm font-medium">{stats.totalPrescriptions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lab Requests</span>
                <span className="text-sm font-medium">{stats.totalLabRequests || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Radiology Requests</span>
                <span className="text-sm font-medium">{stats.totalRadiologyRequests || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Invoices</span>
                <span className="text-sm font-medium">{stats.totalInvoices || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Today's Revenue</span>
                <span className="text-sm font-medium text-green-600">Rs. {(stats.todayRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Paid Revenue</span>
                <span className="text-sm font-medium text-green-600">Rs. {(stats.paidRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Revenue</span>
                <span className="text-sm font-medium text-orange-600">Rs. {(stats.pendingRevenue || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
