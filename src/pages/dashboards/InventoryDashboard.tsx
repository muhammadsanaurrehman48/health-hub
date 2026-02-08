import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import api from '@/utils/api';
import {
  Package,
  Boxes,
  BarChart3,
  AlertTriangle,
  Plus,
  ClipboardList,
  Calendar,
  TrendingDown,
  Loader2,
} from 'lucide-react';

const InventoryDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryRes, lowStockRes] = await Promise.all([
          api.getInventory(),
          api.getLowStockItems()
        ]);
        if (inventoryRes.success) {
          setInventory(inventoryRes.data);
        }
        if (lowStockRes.success) {
          setLowStockItems(lowStockRes.data);
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const expiringItems = inventory.filter(i => i.expiringDays && i.expiringDays <= 30);
  const categories = [...new Set(inventory.map(i => i.category))].length;

  const activities = inventory.slice(0, 4).map((item, idx) => ({
    id: String(idx + 1),
    title: 'Stock Item',
    description: `${item.name} - ${item.stock} ${item.unit || 'units'}`,
    time: item.updatedAt || 'Recently',
    status: item.stock < item.minStock ? 'cancelled' : 'completed'
  }));

  if (loading) {
    return (
      <DashboardLayout requiredRole="inventory">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="inventory">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Total Items"
            value={inventory.length}
            subtitle="In inventory"
            icon={Boxes}
            variant="primary"
          />
          <StatCard
            title="Low Stock"
            value={lowStockItems.length}
            subtitle="Need restocking"
            icon={TrendingDown}
            variant="warning"
          />
          <StatCard
            title="Expiring Soon"
            value={expiringItems.length}
            subtitle="Within 30 days"
            icon={Calendar}
            variant="destructive"
          />
          <StatCard
            title="Categories"
            value={categories}
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
          <RecentActivity title="Recent Transactions" activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryDashboard;
