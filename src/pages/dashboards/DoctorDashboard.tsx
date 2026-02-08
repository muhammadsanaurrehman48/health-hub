import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
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
} from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, activitiesRes] = await Promise.all([
          api.getDoctorAppointments(user?.id || ''),
          api.getActivities()
        ]);
        if (appointmentsRes.success) {
          setAppointments(appointmentsRes.data);
        }
        if (activitiesRes.success) {
          setActivities(activitiesRes.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const completedAppointments = appointments.filter((a: any) => a.status === 'completed').length;
  const pendingAppointments = appointments.filter((a: any) => a.status === 'scheduled').length;
  const upcomingPatients = appointments.filter((a: any) => a.status === 'scheduled').slice(0, 4);

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
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Today's Appointments"
            value={appointments.length}
            subtitle={`${completedAppointments} completed, ${pendingAppointments} pending`}
            icon={Calendar}
            variant="primary"
          />
          <StatCard
            title="Patients Seen"
            value={completedAppointments}
            subtitle={`Out of ${appointments.length} scheduled`}
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Pending Reports"
            value={pendingAppointments}
            subtitle="Lab & Radiology"
            icon={FileText}
            variant="warning"
          />
          <StatCard
            title="Prescriptions Today"
            value={completedAppointments}
            subtitle="Written today"
            icon={ClipboardList}
            variant="primary"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickAction
              title="View Appointments"
              description="Today's schedule"
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

        {/* Appointments & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Upcoming Patients</h3>
            <div className="space-y-3">
              {upcomingPatients.length > 0 ? upcomingPatients.map((patient: any, i: number) => (
                <div key={patient.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${patient.status === 'waiting' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{patient.patientName}</p>
                      <p className="text-xs text-muted-foreground">{patient.forceNo || patient.mrNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{patient.time}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming patients</p>
              )}
            </div>
          </div>
          <RecentActivity title="Recent Activity" activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
