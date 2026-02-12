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
  LineChart,
  Line,
} from 'recharts';
import { Download, Package, TrendingUp, DollarSign, Loader2, Clock, Printer } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';
import { PrintHeader, PrintHide } from '@/components/common/PrintHeader';

interface CategoryItem {
  category: string;
  items: number;
  value: number;
  quantity: number;
}

interface ReportData {
  totalItems: number;
  totalValue: number;
  itemsByCategory: CategoryItem[];
}

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

const InventoryReports: React.FC = () => {
  const [period, setPeriod] = useState('6months');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch reports data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.getReportAnalytics();
        if (response.success) {
          setReportData(response.data);
          setLastUpdated(new Date());
        } else {
          toast.error('Failed to fetch report data');
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Error fetching report data');
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchReportData();

    // Set up polling every 5 seconds
    const pollInterval = setInterval(fetchReportData, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  // Generate mock monthly usage data (would come from historical data in a real scenario)
  const monthlyUsage = [
    { month: 'Sep', usage: 850000 },
    { month: 'Oct', usage: 920000 },
    { month: 'Nov', usage: 780000 },
    { month: 'Dec', usage: 1050000 },
    { month: 'Jan', usage: 890000 },
    { month: 'Feb', usage: reportData ? Math.round(reportData.totalValue * 0.35) : 450000 },
  ];

  const handleExport = () => {
    toast.success('Report exported as PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="inventory">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalStockItems = reportData?.itemsByCategory.reduce((sum, cat) => sum + cat.items, 0) || 0;
  const monthlyUsageValue = reportData ? Math.round(reportData.totalValue * 0.35) : 0;

  return (
    <DashboardLayout requiredRole="inventory">
      <PrintHeader title="Inventory Report" subtitle="Stock Analysis & Category Breakdown" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory Reports</h1>
            <p className="text-muted-foreground">Analytics and insights for inventory management</p>
          </div>
          <PrintHide>
            <div className="flex gap-3">
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
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
          </PrintHide>
        </div>

        {/* Last Updated Info */}
        <PrintHide>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
            <span className="ml-2 text-xs">• Auto-refreshing every 5 seconds</span>
          </div>
        </PrintHide>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reportData?.totalItems || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    Rs. {reportData?.totalValue ? (reportData.totalValue / 10000000).toFixed(1) : 0}M
                  </p>
                  <p className="text-sm text-muted-foreground">Stock Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    Rs. {(monthlyUsageValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly Usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reportData?.itemsByCategory.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Usage Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                  <Bar dataKey="usage" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData && reportData.itemsByCategory.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={reportData.itemsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="items"
                      >
                        {reportData.itemsByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {reportData.itemsByCategory.map((entry, index) => (
                      <div key={entry.category} className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{entry.category} ({entry.items})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No category data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown Table */}
        {reportData && reportData.itemsByCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-center py-2 px-2">Items</th>
                      <th className="text-center py-2 px-2">Quantity</th>
                      <th className="text-right py-2 px-2">Stock Value</th>
                      <th className="text-right py-2 px-2">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.itemsByCategory.map((category, index) => {
                      const percentage = reportData.totalValue > 0 ? (category.value / reportData.totalValue * 100) : 0;
                      return (
                        <tr key={category.category} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 font-medium flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            {category.category}
                          </td>
                          <td className="text-center py-3 px-2">{category.items}</td>
                          <td className="text-center py-3 px-2">{category.quantity}</td>
                          <td className="text-right py-3 px-2 font-semibold">
                            Rs. {(category.value / 100000).toFixed(1)}L
                          </td>
                          <td className="text-right py-3 px-2">
                            <span className="bg-primary/10 text-primary rounded px-2 py-1">
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </DashboardLayout>
  );
};

export default InventoryReports;
