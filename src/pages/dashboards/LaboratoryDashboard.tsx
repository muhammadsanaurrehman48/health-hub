import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  FlaskConical,
  ClipboardList,
  FileText,
  Beaker,
  Printer,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'Blood Test Completed', description: 'Patient: Ahmad Ali - CBC Report', time: '10 min ago', status: 'completed' as const },
  { id: '2', title: 'Sample Collected', description: 'Patient Fatima - Urine test', time: '25 min ago', status: 'active' as const },
  { id: '3', title: 'Results Entered', description: 'Lipid Profile - Patient #123', time: '45 min ago', status: 'completed' as const },
  { id: '4', title: 'Test Requested', description: 'Dr. Khan - LFT for patient Usman', time: '1 hour ago', status: 'pending' as const },
];

const LaboratoryDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="laboratory">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Pending Tests"
            value={12}
            subtitle="Awaiting sample/results"
            icon={ClipboardList}
            variant="warning"
          />
          <StatCard
            title="Samples Collected"
            value={8}
            subtitle="Processing today"
            icon={Beaker}
            variant="primary"
          />
          <StatCard
            title="Completed Today"
            value={25}
            subtitle="Reports generated"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Total This Month"
            value={456}
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
              {[
                { patient: 'Ali Hassan', mrNo: 'MR-0045', test: 'Complete Blood Count', status: 'awaiting-sample' },
                { patient: 'Fatima Bibi', mrNo: 'MR-0089', test: 'Lipid Profile', status: 'processing' },
                { patient: 'Usman Ali', mrNo: 'MR-0123', test: 'Liver Function Test', status: 'awaiting-sample' },
                { patient: 'Sara Khan', mrNo: 'MR-0156', test: 'Thyroid Panel', status: 'processing' },
              ].map((test, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{test.patient}</p>
                    <p className="text-xs text-muted-foreground">{test.mrNo} • {test.test}</p>
                  </div>
                  <span className={test.status === 'processing' ? 'badge-active' : 'badge-pending'}>
                    {test.status === 'processing' ? 'Processing' : 'Awaiting Sample'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <RecentActivity title="Recent Activity" activities={mockActivities} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;
