import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Calendar,
  FileText,
  ClipboardList,
  Beaker,
  Scan,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'Consultation Completed', description: 'Patient: Ali Hassan - Flu symptoms', time: '10 min ago', status: 'completed' as const },
  { id: '2', title: 'Prescription Created', description: 'Rx #4521 - Antibiotics prescribed', time: '25 min ago', status: 'completed' as const },
  { id: '3', title: 'Lab Test Requested', description: 'Blood CBC for patient Fatima', time: '45 min ago', status: 'pending' as const },
  { id: '4', title: 'Follow-up Scheduled', description: 'Patient Usman - Next week', time: '1 hour ago', status: 'active' as const },
];

const DoctorDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Today's Appointments"
            value={15}
            subtitle="8 completed, 7 pending"
            icon={Calendar}
            variant="primary"
          />
          <StatCard
            title="Patients Seen"
            value={8}
            subtitle="Out of 15 scheduled"
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Pending Reports"
            value={5}
            subtitle="Lab & Radiology"
            icon={FileText}
            variant="warning"
          />
          <StatCard
            title="Prescriptions Today"
            value={12}
            subtitle="Written today"
            icon={ClipboardList}
            variant="primary"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickAction
              title="View Appointments"
              description="Today's schedule"
              icon={Calendar}
              to="/doctor/appointments"
            />
            <QuickAction
              title="Patient History"
              description="Medical records"
              icon={FileText}
              to="/doctor/history"
            />
            <QuickAction
              title="Write Prescription"
              description="Create new Rx"
              icon={ClipboardList}
              to="/doctor/prescriptions"
            />
            <QuickAction
              title="Request Lab Test"
              description="Order tests"
              icon={Beaker}
              to="/doctor/lab-requests"
            />
            <QuickAction
              title="Request Radiology"
              description="X-ray, MRI, CT"
              icon={Scan}
              to="/doctor/radiology-requests"
            />
          </div>
        </div>

        {/* Appointments & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Upcoming Patients</h3>
            <div className="space-y-3">
              {[
                { name: 'Muhammad Usman', mrNo: 'MR-0045', time: '10:30 AM', status: 'waiting' },
                { name: 'Fatima Bibi', mrNo: 'MR-0089', time: '11:00 AM', status: 'scheduled' },
                { name: 'Ahmed Khan', mrNo: 'MR-0123', time: '11:30 AM', status: 'scheduled' },
                { name: 'Sara Ali', mrNo: 'MR-0156', time: '12:00 PM', status: 'scheduled' },
              ].map((patient, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${patient.status === 'waiting' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.mrNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{patient.time}</span>
                  </div>
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

export default DoctorDashboard;
