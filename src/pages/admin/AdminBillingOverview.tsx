import React, { useState } from 'react';
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
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, FileText, Download, Eye } from 'lucide-react';

const revenueByDept = [
  { department: 'OPD', revenue: 450000 },
  { department: 'IPD', revenue: 820000 },
  { department: 'Pharmacy', revenue: 380000 },
  { department: 'Lab', revenue: 290000 },
  { department: 'Radiology', revenue: 350000 },
  { department: 'Emergency', revenue: 410000 },
];

const recentTransactions = [
  { id: 'INV-001234', patient: 'Muhammad Ali', department: 'OPD', amount: 2500, status: 'paid', date: '2025-02-01' },
  { id: 'INV-001233', patient: 'Fatima Bibi', department: 'Pharmacy', amount: 4800, status: 'paid', date: '2025-02-01' },
  { id: 'INV-001232', patient: 'Ahmed Khan', department: 'Lab', amount: 3200, status: 'pending', date: '2025-02-01' },
  { id: 'INV-001231', patient: 'Sara Hassan', department: 'IPD', amount: 45000, status: 'partial', date: '2025-01-31' },
  { id: 'INV-001230', patient: 'Usman Ali', department: 'Radiology', amount: 8500, status: 'paid', date: '2025-01-31' },
  { id: 'INV-001229', patient: 'Ayesha Siddiqui', department: 'OPD', amount: 1500, status: 'paid', date: '2025-01-31' },
];

const AdminBillingOverview: React.FC = () => {
  const [period, setPeriod] = useState('month');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'badge-completed';
      case 'pending':
        return 'badge-pending';
      case 'partial':
        return 'badge-active';
      default:
        return 'badge-pending';
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing Overview</h1>
            <p className="text-muted-foreground">Monitor hospital-wide financial performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
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
                  <p className="text-2xl font-bold">Rs. 2.7M</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
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
                  <p className="text-2xl font-bold">Rs. 2.4M</p>
                  <p className="text-sm text-muted-foreground">Collected</p>
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
                  <p className="text-2xl font-bold">Rs. 320K</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+18%</p>
                  <p className="text-sm text-muted-foreground">vs Last Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart & Table */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                  <YAxis dataKey="department" type="category" width={80} />
                  <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-primary">{tx.id}</TableCell>
                      <TableCell>{tx.patient}</TableCell>
                      <TableCell>Rs. {tx.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getStatusBadge(tx.status)}>
                          {tx.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBillingOverview;
