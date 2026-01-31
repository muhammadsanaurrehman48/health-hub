import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  HeartPulse,
  Activity,
  BedDouble,
  Pill,
  FileText,
  Thermometer,
  Users,
  ClipboardList,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'Vitals Recorded', description: 'Patient Ali - Ward A, Bed 5', time: '5 min ago', status: 'completed' as const },
  { id: '2', title: 'Medication Given', description: 'Patient Fatima - 10 AM dose', time: '15 min ago', status: 'completed' as const },
  { id: '3', title: 'Care Note Added', description: 'Patient Usman - Post-op observation', time: '30 min ago', status: 'completed' as const },
  { id: '4', title: 'Bed Allocated', description: 'Ward B, Bed 3 - New admission', time: '1 hour ago', status: 'active' as const },
];

const NurseDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="nurse">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Patients in Ward"
            value={24}
            subtitle="Under your care"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Vitals Due"
            value={8}
            subtitle="Pending recording"
            icon={Activity}
            variant="warning"
          />
          <StatCard
            title="Medications Due"
            value={12}
            subtitle="Next 2 hours"
            icon={Pill}
            variant="destructive"
          />
          <StatCard
            title="Available Beds"
            value={6}
            subtitle="Out of 30"
            icon={BedDouble}
            variant="success"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction
              title="Record Vitals"
              description="BP, Temp, Pulse"
              icon={Activity}
              to="/nurse/vitals"
            />
            <QuickAction
              title="Ward Management"
              description="Bed allocation"
              icon={BedDouble}
              to="/nurse/wards"
            />
            <QuickAction
              title="Medications"
              description="Administration"
              icon={Pill}
              to="/nurse/medications"
            />
            <QuickAction
              title="Care Notes"
              description="Patient notes"
              icon={FileText}
              to="/nurse/notes"
            />
          </div>
        </div>

        {/* Ward Overview & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Ward Overview</h3>
            <div className="space-y-4">
              {[
                { ward: 'Ward A - General', beds: '8/10', critical: 1 },
                { ward: 'Ward B - Surgical', beds: '6/8', critical: 2 },
                { ward: 'Ward C - Pediatric', beds: '4/6', critical: 0 },
                { ward: 'ICU', beds: '4/6', critical: 4 },
              ].map((ward, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{ward.ward}</p>
                    <p className="text-xs text-muted-foreground">Beds: {ward.beds}</p>
                  </div>
                  {ward.critical > 0 && (
                    <span className="badge-cancelled">{ward.critical} Critical</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Upcoming Medications</h3>
            <div className="space-y-3">
              {[
                { patient: 'Ali Hassan', bed: 'A-5', med: 'Amoxicillin 500mg', time: '11:00 AM' },
                { patient: 'Fatima Bibi', bed: 'B-3', med: 'Paracetamol IV', time: '11:30 AM' },
                { patient: 'Usman Ali', bed: 'ICU-2', med: 'Insulin 10 units', time: '12:00 PM' },
                { patient: 'Sara Khan', bed: 'C-1', med: 'Vitamin C drip', time: '12:30 PM' },
              ].map((med, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{med.patient} ({med.bed})</p>
                    <p className="text-xs text-muted-foreground">{med.med}</p>
                  </div>
                  <span className="badge-pending">{med.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <RecentActivity title="Recent Activity" activities={mockActivities} />
      </div>
    </DashboardLayout>
  );
};

export default NurseDashboard;
