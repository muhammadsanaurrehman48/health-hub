import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Scan,
  ClipboardList,
  FileText,
  Upload,
  Printer,
  CheckCircle,
  Clock,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'X-Ray Report Uploaded', description: 'Patient: Ahmad Ali - Chest X-ray', time: '15 min ago', status: 'completed' as const },
  { id: '2', title: 'MRI Scan Requested', description: 'Dr. Khan - Brain MRI for patient #123', time: '30 min ago', status: 'pending' as const },
  { id: '3', title: 'CT Scan Completed', description: 'Patient Fatima - Abdominal CT', time: '1 hour ago', status: 'completed' as const },
  { id: '4', title: 'Report Verified', description: 'X-ray #456 verified and shared', time: '2 hours ago', status: 'completed' as const },
];

const RadiologistDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="radiologist">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Pending Requests"
            value={8}
            subtitle="Awaiting processing"
            icon={ClipboardList}
            variant="warning"
          />
          <StatCard
            title="Completed Today"
            value={15}
            subtitle="Reports uploaded"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="In Progress"
            value={3}
            subtitle="Currently processing"
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Total This Month"
            value={234}
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
              {[
                { patient: 'Ali Hassan', mrNo: 'MR-0045', test: 'Chest X-ray', doctor: 'Dr. Khan', priority: 'urgent' },
                { patient: 'Fatima Bibi', mrNo: 'MR-0089', test: 'Brain MRI', doctor: 'Dr. Ahmed', priority: 'normal' },
                { patient: 'Usman Ali', mrNo: 'MR-0123', test: 'CT Abdomen', doctor: 'Dr. Sara', priority: 'normal' },
                { patient: 'Sara Khan', mrNo: 'MR-0156', test: 'Spine X-ray', doctor: 'Dr. Ali', priority: 'normal' },
              ].map((request, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{request.patient}</p>
                      {request.priority === 'urgent' && (
                        <span className="badge-cancelled text-[10px]">Urgent</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{request.mrNo} • {request.test}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{request.doctor}</p>
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

export default RadiologistDashboard;
