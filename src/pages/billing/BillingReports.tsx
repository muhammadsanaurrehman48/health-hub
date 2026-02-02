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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Download, FileText, DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react';

const revenueByDept = [
  { department: 'OPD', revenue: 450000 },
  { department: 'IPD', revenue: 820000 },
  { department: 'Pharmacy', revenue: 380000 },
  { department: 'Laboratory', revenue: 290000 },
  { department: 'Radiology', revenue: 350000 },
  { department: 'Emergency', revenue: 410000 },
  { department: 'Surgery', revenue: 680000 },
];

const monthlyTrend = [
  { month: 'Sep', revenue: 2100000, collections: 1950000 },
  { month: 'Oct', revenue: 2350000, collections: 2200000 },
  { month: 'Nov', revenue: 2500000, collections: 2350000 },
  { month: 'Dec', revenue: 2800000, collections: 2600000 },
  { month: 'Jan', revenue: 2650000, collections: 2450000 },
  { month: 'Feb', revenue: 1200000, collections: 1100000 },
];

const BillingReports: React.FC = () => {
  const [period, setPeriod] = useState('6months');
  const [department, setDepartment] = useState('all');

  return (
    <DashboardLayout requiredRole="billing">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing Reports</h1>
            <p className="text-muted-foreground">Financial analytics and department-wise reports</p>
          </div>
          <div className="flex gap-3">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="opd">OPD</SelectItem>
                <SelectItem value="ipd">IPD</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="laboratory">Laboratory</SelectItem>
                <SelectItem value="radiology">Radiology</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
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
                  <p className="text-2xl font-bold">Rs. 13.6M</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xs text-green-600">↑ 15% vs last period</p>
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
                  <p className="text-2xl font-bold">Rs. 12.6M</p>
                  <p className="text-sm text-muted-foreground">Collections</p>
                  <p className="text-xs text-green-600">92.6% collection rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs. 1.0M</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xs text-orange-600">156 invoices</p>
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
                  <p className="text-2xl font-bold">2,847</p>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-xs text-green-600">↑ 8% vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
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
              <CardTitle>Revenue vs Collections Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="collections" stroke="#14b8a6" strokeWidth={2} name="Collections" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Daily Collection Report', type: 'PDF' },
                { name: 'Department-wise Revenue', type: 'Excel' },
                { name: 'Pending Payments Report', type: 'PDF' },
                { name: 'Monthly Summary', type: 'Excel' },
                { name: 'Patient-wise Statement', type: 'PDF' },
                { name: 'Discount Report', type: 'Excel' },
              ].map((report) => (
                <Button key={report.name} variant="outline" className="justify-between h-auto py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm">{report.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{report.type}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BillingReports;
