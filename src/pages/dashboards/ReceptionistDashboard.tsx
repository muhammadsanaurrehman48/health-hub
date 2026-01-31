import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  UserPlus,
  Users,
  Calendar,
  ClipboardList,
  Receipt,
  Search,
  Ticket,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'Patient Registered', description: 'Muhammad Ali - Force No: 12345', time: '2 min ago', status: 'completed' as const },
  { id: '2', title: 'Appointment Scheduled', description: 'Dr. Khan - 10:30 AM', time: '15 min ago', status: 'active' as const },
  { id: '3', title: 'Token Generated', description: 'OPD Token #45 - Cardiology', time: '30 min ago', status: 'pending' as const },
  { id: '4', title: 'Bill Generated', description: 'Invoice #1234 - Rs. 5,500', time: '1 hour ago', status: 'completed' as const },
];

const ReceptionistDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Today's Registrations"
            value={24}
            subtitle="New patients today"
            icon={UserPlus}
            variant="primary"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Pending Appointments"
            value={18}
            subtitle="Waiting to be assigned"
            icon={Calendar}
            variant="warning"
          />
          <StatCard
            title="Active Tokens"
            value={12}
            subtitle="Currently in queue"
            icon={Ticket}
            variant="success"
          />
          <StatCard
            title="Bills Generated"
            value={45}
            subtitle="Today's invoices"
            icon={Receipt}
            variant="primary"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickAction
              title="Register Patient"
              description="New registration"
              icon={UserPlus}
              to="/receptionist/patients/register"
            />
            <QuickAction
              title="Search Patient"
              description="By Force No / MR No"
              icon={Search}
              to="/receptionist/patients/search"
            />
            <QuickAction
              title="Book Appointment"
              description="Schedule visit"
              icon={Calendar}
              to="/receptionist/appointments"
            />
            <QuickAction
              title="Generate Token"
              description="OPD/IPD entry"
              icon={Ticket}
              to="/receptionist/entries"
            />
            <QuickAction
              title="Generate Bill"
              description="Create invoice"
              icon={Receipt}
              to="/receptionist/billing"
            />
          </div>
        </div>

        {/* Recent Activity & Upcoming Appointments */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity title="Recent Activity" activities={mockActivities} />
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {[
                { time: '09:00 AM', doctor: 'Dr. Khan', dept: 'Cardiology', slots: '5/10' },
                { time: '10:00 AM', doctor: 'Dr. Ahmed', dept: 'Orthopedics', slots: '8/10' },
                { time: '11:00 AM', doctor: 'Dr. Sara', dept: 'Pediatrics', slots: '3/10' },
                { time: '02:00 PM', doctor: 'Dr. Ali', dept: 'General', slots: '6/10' },
              ].map((slot, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{slot.doctor}</p>
                    <p className="text-xs text-muted-foreground">{slot.dept}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{slot.time}</p>
                    <p className="text-xs text-muted-foreground">Slots: {slot.slots}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;
