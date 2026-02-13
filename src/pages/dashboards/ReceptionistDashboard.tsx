import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import api from '@/utils/api';
import {
  UserPlus,
  Users,
  Calendar,
  ClipboardList,
  Receipt,
  Search,
  Ticket,
  Loader2,
  FileText,
  Send,
} from 'lucide-react';

const ReceptionistDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, patientsRes] = await Promise.all([
          api.getAppointments(),
          api.getPatients()
        ]);
        if (appointmentsRes.success) {
          setAppointments(appointmentsRes.data);
          // Create activities from recent appointments
          const recentActivities = appointmentsRes.data.slice(0, 4).map((apt: any, idx: number) => ({
            id: String(idx + 1),
            title: apt.status === 'scheduled' ? 'Appointment Scheduled' : 'Patient Registered',
            description: `${apt.patientName || 'Patient'} - ${apt.doctor || 'Doctor'}`,
            time: apt.date || 'Recently',
            status: apt.status === 'completed' ? 'completed' : 'active'
          }));
          setActivities(recentActivities);
        }
        if (patientsRes.success) {
          setPatients(patientsRes.data);
        }
      } catch (error) {
        console.error('Error fetching receptionist data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayRegistrations = patients.filter((p: any) => {
    const today = new Date().toISOString().split('T')[0];
    return p.createdAt?.startsWith(today);
  }).length;

  const pendingAppointments = appointments.filter((a: any) => a.status === 'scheduled').length;
  const activeTokens = appointments.filter((a: any) => a.status === 'in-progress').length;
  const billsGenerated = appointments.filter((a: any) => a.status === 'completed').length;

  if (loading) {
    return (
      <DashboardLayout requiredRole="receptionist">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Today's Registrations"
            value={todayRegistrations}
            subtitle="New patients today"
            icon={UserPlus}
            variant="primary"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Pending Appointments"
            value={pendingAppointments}
            subtitle="Waiting to be assigned"
            icon={Calendar}
            variant="warning"
          />
          <StatCard
            title="Active Tokens"
            value={activeTokens}
            subtitle="Currently in queue"
            icon={Ticket}
            variant="success"
          />
          <StatCard
            title="Bills Generated"
            value={billsGenerated}
            subtitle="Today's invoices"
            icon={Receipt}
            variant="primary"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickAction
              title="Register Patient"
              description="New registration"
              icon={UserPlus}
              to="/receptionist/patients/register"
            />
            <QuickAction
              title="Search Patient"
              description="By Force No / MR No"
              icon={Search}
              to="/receptionist/patients/search"
            />
            <QuickAction
              title="Book Appointment"
              description="Schedule visit"
              icon={Calendar}
              to="/receptionist/appointments"
            />
            <QuickAction
              title="Generate Token"
              description="OPD/IPD entry"
              icon={Ticket}
              to="/receptionist/entries"
            />
            <QuickAction
              title="Make Referral"
              description="Refer to specialist"
              icon={Send}
              to="/receptionist/referrals"
            />
            <QuickAction
              title="Print Documents"
              description="Rx, Referrals, Tests"
              icon={FileText}
              to="/receptionist/documents"
            />
          </div>
        </div>

        {/* Recent Activity & Upcoming Appointments */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity title="Recent Activity" activities={activities} />
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Today's Appointments</h3>
            <div className="space-y-3">
              {appointments.filter((a: any) => a.status === 'scheduled').length > 0 ? (
                appointments.filter((a: any) => a.status === 'scheduled').slice(0, 5).map((apt: any, i: number) => (
                  <div key={apt._id || apt.id || i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{apt.patientName || apt.patient || 'Patient'}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctor || apt.doctorName || 'Doctor'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{apt.time || 'Scheduled'}</p>
                      <p className="text-xs text-muted-foreground">Room: {apt.roomNo || 'TBD'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;
