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
  const [doctorRoom, setDoctorRoom] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Auto-detect doctor's room by fetching all queues
        const allQueuesRes = await api.getAllQueues();
        if (allQueuesRes.success && allQueuesRes.data) {
          const doctorName = user?.name || '';
          const myQueue = (Array.isArray(allQueuesRes.data) ? allQueuesRes.data : []).find(
            (q: any) => q.doctorName?.toLowerCase() === doctorName.toLowerCase()
          );
          if (myQueue) {
            setDoctorRoom(myQueue.roomNo);
            // Fetch specific room queue data
            const queueRes = await api.request(`/queue/room/${myQueue.roomNo}`);
            if (queueRes.success) {
              setQueueData(queueRes.data);
            }
          }
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
  }, [user]);

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

        {/* Upcoming Patients */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Upcoming Patients</h3>
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
    </DashboardLayout>
  );
};

export default DoctorDashboard;
