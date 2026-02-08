import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import api from '@/utils/api';
import {
  FlaskConical,
  ClipboardList,
  FileText,
  Beaker,
  Printer,
  CheckCircle,
  Clock,
  Activity,
  Loader2,
} from 'lucide-react';

const LaboratoryDashboard: React.FC = () => {
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getLabRequests();
        if (response.success) {
          setLabRequests(response.data);
        }
      } catch (error) {
        console.error('Error fetching lab requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingTests = labRequests.filter(r => r.status === 'pending').length;
  const samplesCollected = labRequests.filter(r => r.status === 'sample-collected' || r.status === 'in-progress').length;
  const completedToday = labRequests.filter(r => r.status === 'completed').length;
  const pendingLabTests = labRequests.filter(r => r.status === 'pending' || r.status === 'sample-collected').slice(0, 4);
  const activities = labRequests.slice(0, 4).map((req, idx) => ({
    id: String(idx + 1),
    title: req.status === 'completed' ? 'Test Completed' : 'Test Requested',
    description: `${req.patientName || 'Patient'} - ${req.test || 'Test'}`,
    time: req.requestDate || 'Recently',
    status: req.status === 'completed' ? 'completed' : req.status === 'pending' ? 'pending' : 'active'
  }));

  if (loading) {
    return (
      <DashboardLayout requiredRole="laboratory">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="laboratory">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Pending Tests"
            value={pendingTests}
            subtitle="Awaiting sample/results"
            icon={ClipboardList}
            variant="warning"
          />
          <StatCard
            title="Samples Collected"
            value={samplesCollected}
            subtitle="Processing today"
            icon={Beaker}
            variant="primary"
          />
          <StatCard
            title="Completed Today"
            value={completedToday}
            subtitle="Reports generated"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Total This Month"
            value={labRequests.length}
            subtitle="All lab tests"
            icon={FlaskConical}
            variant="primary"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction
              title="Test Requests"
              description="View pending"
              icon={ClipboardList}
              to="/laboratory/requests"
            />
            <QuickAction
              title="Sample Collection"
              description="Record samples"
              icon={Beaker}
              to="/laboratory/samples"
            />
            <QuickAction
              title="Enter Results"
              description="Update test data"
              icon={Activity}
              to="/laboratory/results"
            />
            <QuickAction
              title="Print Reports"
              description="Generate PDF"
              icon={Printer}
              to="/laboratory/reports"
            />
          </div>
        </div>

        {/* Pending Tests & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Pending Lab Tests</h3>
            <div className="space-y-3">
              {pendingLabTests.length > 0 ? pendingLabTests.map((test: any, i: number) => (
                <div key={test.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{test.patientName}</p>
                    <p className="text-xs text-muted-foreground">{test.mrNo} • {test.test}</p>
                  </div>
                  <span className={test.status === 'sample-collected' ? 'badge-active' : 'badge-pending'}>
                    {test.status === 'sample-collected' ? 'Processing' : 'Awaiting Sample'}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No pending tests</p>
              )}
            </div>
          </div>
          <RecentActivity title="Recent Activity" activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;
