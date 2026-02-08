import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import api from '@/utils/api';
import {
  Receipt,
  CreditCard,
  BarChart3,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const BillingDashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getInvoices();
        if (response.success) {
          setInvoices(response.data);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  const todayRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  
  const activities = invoices.slice(0, 4).map((inv, idx) => ({
    id: String(idx + 1),
    title: inv.status === 'paid' ? 'Payment Received' : 'Invoice Generated',
    description: `${inv.invoiceNo || 'INV'} - Rs. ${inv.amount || 0}`,
    time: inv.date || 'Recently',
    status: inv.status === 'paid' ? 'completed' : 'pending'
  }));

  if (loading) {
    return (
      <DashboardLayout requiredRole="billing">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="billing">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Today's Revenue"
            value={`Rs. ${todayRevenue.toLocaleString()}`}
            subtitle="Total collections"
            icon={TrendingUp}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Pending Payments"
            value={`Rs. ${pendingTotal.toLocaleString()}`}
            subtitle={`${pendingInvoices.length} invoices`}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Invoices Today"
            value={invoices.length}
            subtitle="Generated today"
            icon={Receipt}
            variant="primary"
          />
          <StatCard
            title="Monthly Revenue"
            value={`Rs. ${(todayRevenue * 30).toLocaleString()}`}
            subtitle="Estimated"
            icon={DollarSign}
            variant="success"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction
              title="Generate Invoice"
              description="Create new bill"
              icon={Receipt}
              to="/billing/generate"
            />
            <QuickAction
              title="Accept Payment"
              description="Record payment"
              icon={CreditCard}
              to="/billing/payments"
            />
            <QuickAction
              title="View Reports"
              description="Financial reports"
              icon={BarChart3}
              to="/billing/reports"
            />
            <QuickAction
              title="Pending Bills"
              description="Outstanding dues"
              icon={FileText}
              to="/billing/payments"
            />
          </div>
        </div>

        {/* Department Revenue & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Department-wise Revenue (Today)</h3>
            <div className="space-y-4">
              {[
                { dept: 'OPD Consultation', amount: 'Rs. 85,000', percentage: 35 },
                { dept: 'Pharmacy', amount: 'Rs. 65,000', percentage: 27 },
                { dept: 'Laboratory', amount: 'Rs. 45,000', percentage: 18 },
                { dept: 'Radiology', amount: 'Rs. 35,000', percentage: 14 },
                { dept: 'IPD Services', amount: 'Rs. 15,000', percentage: 6 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.dept}</span>
                    <span className="text-muted-foreground">{item.amount}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <RecentActivity title="Recent Transactions" activities={activities} />
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Invoices</h3>
          <div className="overflow-x-auto">
            <table className="table-medical">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { inv: 'INV-2025-0456', patient: 'Ali Hassan', dept: 'OPD', amount: 'Rs. 2,500', status: 'paid' },
                  { inv: 'INV-2025-0455', patient: 'Fatima Bibi', dept: 'Lab', amount: 'Rs. 4,200', status: 'paid' },
                  { inv: 'INV-2025-0454', patient: 'Usman Ali', dept: 'Pharmacy', amount: 'Rs. 1,800', status: 'pending' },
                  { inv: 'INV-2025-0453', patient: 'Sara Khan', dept: 'Radiology', amount: 'Rs. 8,500', status: 'paid' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium">{row.inv}</td>
                    <td>{row.patient}</td>
                    <td>{row.dept}</td>
                    <td>{row.amount}</td>
                    <td>
                      <span className={row.status === 'paid' ? 'badge-completed' : 'badge-pending'}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingDashboard;
