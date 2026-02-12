import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Stethoscope,
  Building,
  RefreshCw,
  Loader2,
  Bell,
  CheckCircle2,
} from 'lucide-react';

interface PendingAppointment {
  id: string;
  notificationId: string;
  patientName: string;
  patientNo: string;
  mrNo: string;
  forceNo?: string;
  doctorName: string;
  roomNo?: string;
  appointmentNo?: string;
  token?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const NurseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [completedToday, setCompletedToday] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch pending appointments AND completed vitals today
  const fetchPendingAppointments = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch all scheduled appointments (OPD patients)
      const appointmentsRes = await api.getAppointments().catch(() => ({ success: false, data: [] }));
      
      // Get today's date for filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentsRes.success && appointmentsRes.data) {
        // Filter today's appointments
        const todaysAppointments = (appointmentsRes.data || []).filter((apt: any) => {
          const aptDate = new Date(apt.date || apt.createdAt);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
        
        console.log('🏥 [NURSE] Today\'s appointments:', todaysAppointments.length);
        
        // Check which appointments have vitals recorded
        const appointmentsWithVitalsStatus = await Promise.all(
          todaysAppointments.map(async (apt: any) => {
            try {
              const vitalsRes = await api.getAppointmentVitals(apt.id || apt._id).catch(() => ({ success: false, data: null }));
              return {
                ...apt,
                hasVitals: !!(vitalsRes.success && vitalsRes.data),
                vitalsData: vitalsRes.data || null,
              };
            } catch {
              return { ...apt, hasVitals: false, vitalsData: null };
            }
          })
        );
        
        // Separate into pending and completed
        const pending = appointmentsWithVitalsStatus
          .filter((apt: any) => !apt.hasVitals && (apt.status === 'scheduled' || apt.status === 'waiting'))
          .map((apt: any) => ({
            id: apt.id || apt._id,
            notificationId: '',
            patientName: apt.patientName || 'Unknown',
            patientNo: apt.mrNo || apt.patientNo || '',
            mrNo: apt.mrNo || apt.patientNo || '',
            doctorName: apt.doctor || apt.doctorName || 'Unknown',
            roomNo: apt.roomNo,
            appointmentNo: apt.appointmentNo,
            token: apt.token || 'N/A',
            message: `Patient waiting for vitals recording. Please proceed.`,
            createdAt: new Date(apt.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            read: false,
          }));
        
        const completed = appointmentsWithVitalsStatus
          .filter((apt: any) => apt.hasVitals)
          .map((apt: any) => ({
            id: apt.id || apt._id,
            patientName: apt.patientName || 'Unknown',
            mrNo: apt.mrNo || apt.patientNo || '',
            doctorName: apt.doctor || apt.doctorName || 'Unknown',
            roomNo: apt.roomNo,
            token: apt.token || 'N/A',
            vitals: apt.vitalsData,
            completedAt: apt.vitalsData?.recordedAt 
              ? new Date(apt.vitalsData.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : 'Recently',
          }));
        
        console.log('✅ [NURSE] Pending:', pending.length, '| Completed:', completed.length);
        setPendingAppointments(pending);
        setCompletedToday(completed);
      }

      // Get unread notification count
      const countRes = await api.getUnreadNotificationCount();
      if (countRes.success) {
        const count = typeof countRes.data === 'object' ? (countRes.data.unreadCount || 0) : (countRes.data || 0);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingAppointments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchPendingAppointments(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRecordVitals = async (appointmentId: string, notificationId: string) => {
    // Mark notification as read
    if (notificationId) {
      await api.markNotificationAsRead(notificationId).catch(() => {});
    }
    
    // Navigate to vitals page with appointment ID
    navigate(`/nurse/vitals?appointmentId=${appointmentId}`);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      await fetchPendingAppointments(true);
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="nurse">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="nurse">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Nurse Dashboard</h2>
            <p className="text-muted-foreground">View pending patients and manage vitals recording</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchPendingAppointments(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Vitals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-muted-foreground">Unread Notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedToday.length}</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              <AlertCircle className="w-4 h-4 mr-2" />
              Pending ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed Today
            </TabsTrigger>
          </TabsList>

          {/* Pending Appointments Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">
                    All Caught Up!
                  </h3>
                  <p className="text-muted-foreground">
                    No pending appointments. Check back soon.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingAppointments.map((apt, idx) => (
                  <Card key={apt.id || idx} className="border-l-4 border-l-warning">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-warning text-warning-foreground">
                              #{idx + 1} PENDING
                            </Badge>
                            {apt.token && apt.token !== 'N/A' && (
                              <Badge className="bg-blue-600 text-white font-mono">{apt.token}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {apt.createdAt}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{apt.patientName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            MR No: {apt.mrNo}
                            {apt.forceNo && ` • Force No: ${apt.forceNo}`}
                          </p>
                        </div>
                        <div className="text-right">
                          {!apt.read && (
                            <Badge className="mb-2">New</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Doctor</p>
                            <p className="font-medium">{apt.doctorName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Referral</p>
                            <p className="font-medium">{apt.appointmentNo || 'OPD'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Message */}
                      <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                        <p className="text-sm text-info-foreground">
                          {apt.message}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRecordVitals(apt.id, apt.notificationId)}
                          className="flex-1"
                        >
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Record Vitals
                        </Button>
                        {!apt.read && (
                          <Button
                            variant="outline"
                            onClick={() => handleMarkAsRead(apt.notificationId)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedToday.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">
                    No Completed Vitals Today
                  </h3>
                  <p className="text-muted-foreground">
                    Vitals you record will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedToday.map((apt, idx) => (
                  <Card key={apt.id} className="border-l-4 border-l-success">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-success text-success-foreground">
                              ✓ COMPLETED
                            </Badge>
                            {apt.token && apt.token !== 'N/A' && (
                              <Badge variant="outline" className="font-mono">{apt.token}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              at {apt.completedAt}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{apt.patientName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            MR No: {apt.mrNo} • Dr. {apt.doctorName}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Recorded Vitals Summary */}
                      {apt.vitals && (
                        <div className="grid grid-cols-4 gap-3 bg-success/5 rounded-lg p-3">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">BP</p>
                            <p className="font-semibold">{apt.vitals.bloodPressure || '-'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Pulse</p>
                            <p className="font-semibold">{apt.vitals.pulse || '-'} bpm</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Temp</p>
                            <p className="font-semibold">{apt.vitals.temperature || '-'}°F</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">SpO2</p>
                            <p className="font-semibold">{apt.vitals.spo2 || '-'}%</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p>• Click "Record Vitals" to open the vitals form for each patient</p>
            <p>• Patients appear here when appointments are newly created</p>
            <p>• The page auto-refreshes every 30 seconds - stay updated</p>
            <p>• After recording vitals, the doctor will be automatically notified</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NurseDashboard;
