import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Pill,
  ClipboardList,
  Boxes,
  Printer,
  Search,
  AlertTriangle,
  CheckCircle,
  Package,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'Prescription Dispensed', description: 'Rx #4521 - 5 medicines issued', time: '5 min ago', status: 'completed' as const },
  { id: '2', title: 'New Prescription', description: 'Dr. Khan - Patient Ali Hassan', time: '15 min ago', status: 'pending' as const },
  { id: '3', title: 'Low Stock Alert', description: 'Paracetamol 500mg - Only 20 left', time: '30 min ago', status: 'cancelled' as const },
  { id: '4', title: 'Stock Updated', description: 'Added 500 units of Amoxicillin', time: '1 hour ago', status: 'completed' as const },
];

const PharmacyDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="pharmacy">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Pending Prescriptions"
            value={7}
            subtitle="Awaiting dispensing"
            icon={ClipboardList}
            variant="warning"
          />
          <StatCard
            title="Dispensed Today"
            value={34}
            subtitle="Prescriptions fulfilled"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Low Stock Items"
            value={5}
            subtitle="Need restocking"
            icon={AlertTriangle}
            variant="destructive"
          />
          <StatCard
            title="Total Medicines"
            value={1250}
            subtitle="In inventory"
            icon={Pill}
            variant="primary"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction
              title="View Prescriptions"
              description="Pending Rx"
              icon={ClipboardList}
              to="/pharmacy/prescriptions"
            />
            <QuickAction
              title="Dispense Medicine"
              description="Process Rx"
              icon={Pill}
              to="/pharmacy/dispense"
            />
            <QuickAction
              title="Search Medicine"
              description="By MR/Rx No"
              icon={Search}
              to="/pharmacy/inventory"
            />
            <QuickAction
              title="Print Prescription"
              description="Generate copy"
              icon={Printer}
              to="/pharmacy/prescriptions"
            />
          </div>
        </div>

        {/* Pending Prescriptions & Stock Alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Pending Prescriptions</h3>
            <div className="space-y-3">
              {[
                { rxNo: 'Rx-4525', patient: 'Ali Hassan', doctor: 'Dr. Khan', medicines: 3, time: '5 min ago' },
                { rxNo: 'Rx-4526', patient: 'Fatima Bibi', doctor: 'Dr. Ahmed', medicines: 5, time: '10 min ago' },
                { rxNo: 'Rx-4527', patient: 'Usman Ali', doctor: 'Dr. Sara', medicines: 2, time: '15 min ago' },
                { rxNo: 'Rx-4528', patient: 'Sara Khan', doctor: 'Dr. Ali', medicines: 4, time: '20 min ago' },
              ].map((rx, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{rx.patient}</p>
                    <p className="text-xs text-muted-foreground">{rx.rxNo} • {rx.medicines} medicines</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{rx.doctor}</p>
                    <p className="text-xs text-muted-foreground">{rx.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Low Stock Alerts</h3>
            <div className="space-y-3">
              {[
                { name: 'Paracetamol 500mg', stock: 20, min: 100 },
                { name: 'Amoxicillin 250mg', stock: 35, min: 50 },
                { name: 'Omeprazole 20mg', stock: 15, min: 50 },
                { name: 'Metformin 500mg', stock: 25, min: 100 },
                { name: 'Aspirin 75mg', stock: 40, min: 100 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-destructive-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Min stock: {item.min}</p>
                  </div>
                  <span className="badge-cancelled">{item.stock} left</span>
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

export default PharmacyDashboard;
