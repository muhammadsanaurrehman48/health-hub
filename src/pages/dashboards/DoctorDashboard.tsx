import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  FileText,
  ClipboardList,
  Beaker,
  Scan,
  Users,
  Clock,
  CheckCircle,
  Send,
  Loader2,
  AlertCircle,
  Activity,
} from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [doctorRoom, setDoctorRoom] = useState<string>('101'); // Default room

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch queue data for the doctor's room
        const queueRes = await api.request(`/queue/room/${doctorRoom}`);
        if (queueRes.success) {
          setQueueData(queueRes.data);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto-refresh queue data every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [doctorRoom]);

  const waitingCount = queueData?.patients?.filter((p: any) => p.status === 'waiting').length || 0;
  const servingCount = queueData?.patients?.filter((p: any) => p.status === 'serving').length || 0;
  const completedCount = queueData?.patients?.filter((p: any) => p.status === 'completed').length || 0;
  const totalCount = queueData?.totalPatients || 0;
  const upcomingPatients = queueData?.patients?.filter((p: any) => p.status === 'waiting').slice(0, 4) || [];

  if (loading) {
    return (
      <DashboardLayout requiredRole="doctor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Doctor Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'Doctor'}</p>
        </div>

        {/* Stats Grid - Queue Data */}
        <div className="dashboard-grid">
          <StatCard
            title="Patients Waiting"
            value={waitingCount}
            subtitle={`In queue for Room ${queueData?.roomNo || '101'}`}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Currently Serving"
            value={servingCount}
            subtitle={queueData?.currentPatient?.patientName || 'No patient'}
            icon={Activity}
            variant="primary"
          />
          <StatCard
            title="Completed Today"
            value={completedCount}
            subtitle={`Out of ${totalCount} total patients`}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Total in Queue"
            value={totalCount}
            subtitle={`Department: ${queueData?.department || 'General'}`}
            icon={Users}
            variant="info"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickAction
              title="View Queue"
              description="Patient queue"
              icon={Calendar}
              to="/doctor/appointments"
            />
            <QuickAction
              title="Patient History"
              description="Medical records"
              icon={FileText}
              to="/doctor/history"
            />
            <QuickAction
              title="Write Prescription"
              description="Create new Rx"
              icon={ClipboardList}
              to="/doctor/prescriptions"
            />
            <QuickAction
              title="Request Lab Test"
              description="Order tests"
              icon={Beaker}
              to="/doctor/lab-requests"
            />
            <QuickAction
              title="Request Radiology"
              description="X-ray, MRI, CT"
              icon={Scan}
              to="/doctor/radiology-requests"
            />
            <QuickAction
              title="Refer Patient"
              description="To other units"
              icon={Send}
              to="/doctor/referrals"
            />
          </div>
        </div>

        {/* Current & Upcoming Patients */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Current Patient */}
          {queueData?.currentPatient ? (
            <Card className="border-primary border-2 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">Currently Serving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{queueData.currentPatient.patientName}</p>
                      <p className="text-sm text-muted-foreground">Token: {queueData.currentPatient.tokenNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Force No</p>
                      <p className="font-bold text-primary">{queueData.currentPatient.forceNo || 'N/A'}</p>
                    </div>
                  </div>
                  {queueData.currentPatient.complaint && (
                    <div className="p-2 bg-muted/50 rounded text-sm">
                      <p className="text-muted-foreground">Complaint: {queueData.currentPatient.complaint}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Currently Serving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">No patient being served</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Patients */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Waiting Patients</h3>
            <div className="space-y-3">
              {upcomingPatients.length > 0 ? upcomingPatients.map((patient: any, i: number) => (
                <div key={`${patient.tokenNo}-${i}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-warning">{patient.position}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{patient.patientName}</p>
                      <p className="text-xs text-muted-foreground">Token: {patient.tokenNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">#{patient.position}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No patients waiting</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
