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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, FileText, TrendingUp, Users, DollarSign, Activity, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';

const AdminReports: React.FC = () => {
  const [period, setPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [reports, setReports] = useState<any>({});

  const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const analyticsRes = await api.getAnalyticsData(period);
        const reportsRes = await api.getReports(period);

        // Set data only from API - no dummy data fallback
        if (analyticsRes?.success && analyticsRes?.data) {
          setPatientData(analyticsRes.data.patientData || []);
          setRevenueData(analyticsRes.data.revenueData || []);
          setDepartmentData(analyticsRes.data.departmentData || []);
        } else {
          setPatientData([]);
          setRevenueData([]);
          setDepartmentData([]);
        }

        if (reportsRes?.success && reportsRes?.data) {
          setReports(reportsRes.data);
        } else {
          setReports({
            patientReports: { totalPatients: 0, newPatients: 0, admittedPatients: 0 },
            appointmentReports: { totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0 }
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
        setPatientData([]);
        setRevenueData([]);
        setDepartmentData([]);
        setReports({
          patientReports: { totalPatients: 0, newPatients: 0, admittedPatients: 0 },
          appointmentReports: { totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  const handleDownloadReport = async (reportType: string) => {
    try {
      const blob = await api.downloadReport(reportType, 'csv');
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        toast.error('Failed to generate report - empty response');
        return;
      }
      
      // Create a blob and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`${reportType} report downloaded successfully`);
    } catch (error) {
      console.error('Error downloading report:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to download report';
      toast.error(`Download failed: ${errorMsg}`);
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

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Hospital performance insights and statistics</p>
          </div>
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
            <Button variant="outline" className="gap-2" onClick={() => handleDownloadReport('summary')}>
              <Download className="w-4 h-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.patientReports?.totalPatients || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-xs text-green-600">↑ {reports.patientReports?.newPatients || 0} new</p>
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
                  <p className="text-2xl font-bold">Rs. {(revenueData[revenueData.length - 1]?.revenue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xs text-green-600">↑ 18% vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.appointmentReports?.totalAppointments || 0}</p>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-xs text-green-600">↑ 8% vs last period</p>
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
                  <p className="text-2xl font-bold">94.2%</p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-xs text-green-600">↑ 2% vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="opd" fill="#0d9488" name="OPD" />
                  <Bar dataKey="ipd" fill="#14b8a6" name="IPD" />
                  <Bar dataKey="emergency" fill="#5eead4" name="Emergency" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rs. ${(Number(value)/100000).toFixed(1)}L`} />
                  <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {departmentData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: 'Patient Summary', type: 'patients', format: 'CSV' },
                  { name: 'Revenue Report', type: 'revenue', format: 'CSV' },
                  { name: 'Appointment Data', type: 'appointments', format: 'CSV' },
                  { name: 'Summary Report', type: 'summary', format: 'CSV' },
                ].map((report) => (
                  <Button 
                    key={report.type} 
                    variant="outline" 
                    className="justify-between h-auto py-3"
                    onClick={() => handleDownloadReport(report.type)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm">{report.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{report.format}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
