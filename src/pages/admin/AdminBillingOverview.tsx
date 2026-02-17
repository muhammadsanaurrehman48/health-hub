import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, Download, Loader2, RefreshCw } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';

const COLORS = ['#0d9488', '#14b8a6', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

const AdminBillingOverview: React.FC = () => {
  const [period, setPeriod] = useState('1month');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getBillingOverview(period);
      if (res?.success && res?.data) {
        setOverview(res.data);
      }
    } catch (error) {
      console.error('Error fetching billing overview:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [period]);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `Rs. ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`;
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      case 'pending':
        return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800';
      case 'partial':
        return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
      default:
        return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
  };

  const handleExport = async () => {
    try {
      const blob = await api.downloadReport('revenue', 'csv');
      if (!blob || blob.size === 0) {
        toast.error('Failed to generate report');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'revenue_report.csv');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      toast.success('Revenue report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const data = overview || {};
  const revenueByDept = data.revenueByDept || [];
  const recentTransactions = data.recentTransactions || [];
  const growth = data.growthPercent || 0;

  // Pie chart data for source distribution
  const pieData = revenueByDept.filter((d: any) => d.revenue > 0).map((d: any) => ({
    name: d.department,
    value: d.revenue,
  }));

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing Overview</h1>
            <p className="text-muted-foreground">Monitor hospital-wide financial performance - live data</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="1month">This Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatAmount(data.periodRevenue || 0)}</p>
                  <p className="text-sm text-muted-foreground">Period Revenue</p>
                  <p className="text-xs text-muted-foreground">All-time: {formatAmount(data.totalRevenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatAmount(data.periodCollected || 0)}</p>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-xs text-muted-foreground">{data.periodInvoices || 0} invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatAmount(data.periodPending || 0)}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xs text-muted-foreground">All-time: {formatAmount(data.totalPending || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${growth >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                  {growth >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold">{growth >= 0 ? '+' : ''}{growth}%</p>
                  <p className="text-sm text-muted-foreground">vs Previous Period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source-wise Revenue Breakdown Cards */}
        {revenueByDept.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Revenue by Source</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {revenueByDept.map((dept: any, index: number) => (
                <Card key={dept.department}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-medium">{dept.department}</span>
                    </div>
                    <p className="text-xl font-bold">{formatAmount(dept.revenue)}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{dept.count} invoices</span>
                      <span className="text-green-600">Paid: {formatAmount(dept.collected)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chart & Table */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Department/Source</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByDept.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByDept} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                    <YAxis dataKey="department" type="category" width={80} />
                    <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                    <Bar dataKey="collected" fill="#0d9488" name="Collected" stackId="a" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No revenue data for this period
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data to display
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Patient Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-primary">{tx.id}</TableCell>
                      <TableCell>{tx.patient}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {tx.department}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{tx.patientType || '-'}</TableCell>
                      <TableCell className="font-medium">Rs. {(tx.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getStatusBadge(tx.status)}>
                          {tx.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.date ? new Date(tx.date).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminBillingOverview;
