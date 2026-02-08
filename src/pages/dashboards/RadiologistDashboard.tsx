import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import api from '@/utils/api';
import {
  Scan,
  ClipboardList,
  FileText,
  Upload,
  Printer,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';

const RadiologistDashboard: React.FC = () => {
  const [radiologyRequests, setRadiologyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getRadiologyRequests();
        if (response.success) {
          setRadiologyRequests(response.data);
        }
      } catch (error) {
        console.error('Error fetching radiology requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingRequests = radiologyRequests.filter(r => r.status === 'pending').length;
  const completedToday = radiologyRequests.filter(r => r.status === 'completed').length;
  const inProgress = radiologyRequests.filter(r => r.status === 'in-progress').length;
  const pendingTestRequests = radiologyRequests.filter(r => r.status === 'pending').slice(0, 4);
  const activities = radiologyRequests.slice(0, 4).map((req, idx) => ({
    id: String(idx + 1),
    title: req.status === 'completed' ? 'Report Uploaded' : 'Test Requested',
    description: `${req.patientName || 'Patient'} - ${req.test || req.testType || 'Test'}`,
    time: req.requestDate || 'Recently',
    status: req.status === 'completed' ? 'completed' : req.status === 'pending' ? 'pending' : 'active'
  }));

  if (loading) {
    return (
      <DashboardLayout requiredRole="radiologist">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="radiologist">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            subtitle="Awaiting processing"
            icon={ClipboardList}
            variant="warning"
          />
          <StatCard
            title="Completed Today"
            value={completedToday}
            subtitle="Reports uploaded"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="In Progress"
            value={inProgress}
            subtitle="Currently processing"
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Total This Month"
            value={radiologyRequests.length}
            subtitle="All radiology tests"
            icon={Scan}
            variant="primary"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction
              title="View Requests"
              description="Pending tests"
              icon={ClipboardList}
              to="/radiologist/requests"
            />
            <QuickAction
              title="Upload Report"
              description="X-ray, MRI, CT"
              icon={Upload}
              to="/radiologist/upload"
            />
            <QuickAction
              title="Completed Reports"
              description="View all reports"
              icon={FileText}
              to="/radiologist/completed"
            />
            <QuickAction
              title="Print Report"
              description="Generate printout"
              icon={Printer}
              to="/radiologist/completed"
            />
          </div>
        </div>

        {/* Pending Requests & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Pending Test Requests</h3>
            <div className="space-y-3">
              {pendingTestRequests.length > 0 ? pendingTestRequests.map((request: any, i: number) => (
                <div key={request.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{request.patientName}</p>
                      {request.priority === 'urgent' && (
                        <span className="badge-cancelled text-[10px]">Urgent</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{request.mrNo} • {request.test || request.testType}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{request.doctor}</p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
              )}
            </div>
          </div>
          <RecentActivity title="Recent Activity" activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RadiologistDashboard;
