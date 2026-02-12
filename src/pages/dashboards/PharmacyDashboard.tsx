import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import api from '@/utils/api';
import {
  Pill,
  ClipboardList,
  Boxes,
  Printer,
  Search,
  AlertTriangle,
  CheckCircle,
  Package,
  Loader2,
} from 'lucide-react';

const PharmacyDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prescriptionsRes, lowStockRes, inventoryRes] = await Promise.all([
          api.getPharmacyPrescriptions(),
          api.getLowStockItems().catch(() => ({ success: false, data: [] })),
          api.getPharmacyInventory().catch(() => ({ success: false, data: [] })),
        ]);
        if (prescriptionsRes.success) {
          setPrescriptions(prescriptionsRes.data);
        }
        if (lowStockRes.success) {
          setLowStockItems(Array.isArray(lowStockRes.data) ? lowStockRes.data : []);
        }
        if (inventoryRes.success && Array.isArray(inventoryRes.data)) {
          setTotalMedicines(inventoryRes.data.length);
        }
      } catch (error) {
        console.error('Error fetching pharmacy data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const today = new Date().toLocaleDateString();
  const dispensedToday = prescriptions.filter(p => {
    if (p.status !== 'dispensed') return false;
    const rxDate = p.dispensedAt ? new Date(p.dispensedAt).toLocaleDateString() : (p.date || '');
    return rxDate === today;
  }).length;
  const activities = prescriptions.slice(0, 4).map((rx, idx) => ({
    id: String(idx + 1),
    title: rx.status === 'dispensed' ? 'Prescription Dispensed' : 'New Prescription',
    description: `${rx.rxNo || 'Rx'} - ${Array.isArray(rx.medicines) ? rx.medicines.length : 0} medicines`,
    time: rx.date || 'Recently',
    status: rx.status === 'dispensed' ? 'completed' : 'pending'
  }));

  if (loading) {
    return (
      <DashboardLayout requiredRole="pharmacy">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="pharmacy">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Pending Prescriptions"
            value={pendingPrescriptions.length}
            subtitle="Awaiting dispensing"
            icon={ClipboardList}
            variant="warning"
          />
          <StatCard
            title="Dispensed Today"
            value={dispensedToday}
            subtitle="Prescriptions fulfilled"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockItems.length}
            subtitle="Need restocking"
            icon={AlertTriangle}
            variant="destructive"
          />
          <StatCard
            title="Total Medicines"
            value={totalMedicines}
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
              {pendingPrescriptions.slice(0, 4).map((rx: any, i: number) => (
                <div key={rx.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{rx.patientName}</p>
                    <p className="text-xs text-muted-foreground">{rx.rxNo} • {Array.isArray(rx.medicines) ? rx.medicines.length : 0} medicines</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{rx.doctor}</p>
                    <p className="text-xs text-muted-foreground">{rx.date}</p>
                  </div>
                </div>
              ))}
              {pendingPrescriptions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No pending prescriptions</p>
              )}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Low Stock Alerts</h3>
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item: any, i: number) => (
                <div key={item.id || i} className="flex items-center justify-between p-3 bg-destructive-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Min stock: {item.minStock || item.min}</p>
                  </div>
                  <span className="badge-cancelled">{item.quantity ?? item.stock ?? 0} left</span>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No low stock items</p>
              )}
            </div>
          </div>
        </div>

        <RecentActivity title="Recent Activity" activities={activities} />
      </div>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
