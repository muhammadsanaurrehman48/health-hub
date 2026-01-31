import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import {
  Package,
  Boxes,
  BarChart3,
  AlertTriangle,
  Plus,
  ClipboardList,
  Calendar,
  TrendingDown,
} from 'lucide-react';

const mockActivities = [
  { id: '1', title: 'Stock Added', description: 'Medical gloves - 1000 units', time: '10 min ago', status: 'completed' as const },
  { id: '2', title: 'Items Issued', description: 'To Pharmacy dept - 50 items', time: '30 min ago', status: 'completed' as const },
  { id: '3', title: 'Expiry Alert', description: 'Surgical masks - Expiring in 30 days', time: '1 hour ago', status: 'cancelled' as const },
  { id: '4', title: 'Stock Audit', description: 'Monthly audit completed', time: '2 hours ago', status: 'completed' as const },
];

const InventoryDashboard: React.FC = () => {
  return (
    <DashboardLayout requiredRole="inventory">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Total Items"
            value={2450}
            subtitle="In inventory"
            icon={Boxes}
            variant="primary"
          />
          <StatCard
            title="Low Stock"
            value={18}
            subtitle="Need restocking"
            icon={TrendingDown}
            variant="warning"
          />
          <StatCard
            title="Expiring Soon"
            value={12}
            subtitle="Within 30 days"
            icon={Calendar}
            variant="destructive"
          />
          <StatCard
            title="Categories"
            value={15}
            subtitle="Item categories"
            icon={Package}
            variant="success"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickAction
              title="View All Items"
              description="Full inventory"
              icon={Boxes}
              to="/inventory/items"
            />
            <QuickAction
              title="Add Stock"
              description="New purchase"
              icon={Plus}
              to="/inventory/add"
            />
            <QuickAction
              title="Stock Alerts"
              description="Low & expiring"
              icon={AlertTriangle}
              to="/inventory/alerts"
            />
            <QuickAction
              title="Transactions"
              description="Issue history"
              icon={ClipboardList}
              to="/inventory/transactions"
            />
            <QuickAction
              title="Reports"
              description="Stock reports"
              icon={BarChart3}
              to="/inventory/reports"
            />
          </div>
        </div>

        {/* Alerts & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Critical Alerts</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Expiring Soon
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'Surgical Masks N95', batch: 'B-2024-001', expiry: '15 Feb 2025' },
                    { name: 'Disposable Syringes', batch: 'B-2024-015', expiry: '20 Feb 2025' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between p-2 bg-destructive-muted/30 rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.expiry}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Low Stock
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'IV Cannula 20G', stock: 25, min: 100 },
                    { name: 'Cotton Rolls', stock: 15, min: 50 },
                    { name: 'Bandage 4 inch', stock: 30, min: 100 },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between p-2 bg-warning-muted/30 rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-warning">{item.stock}/{item.min}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <RecentActivity title="Recent Transactions" activities={mockActivities} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryDashboard;
