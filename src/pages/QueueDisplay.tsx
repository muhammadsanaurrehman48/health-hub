import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Stethoscope, Building, Loader2, AlertCircle } from 'lucide-react';
import api from '@/utils/api';
import Logo from '@/assets/logo.png';

/**
 * Queue Display Page
 * 
 * This page is designed to be displayed on an external monitor/SMD
 * outside the consultation room. It shows:
 * - Currently serving patient
 * - Upcoming patients in queue
 * 
 * Features:
 * - Room-specific queue display
 * - Full-screen display optimized for large monitors
 * - Auto-refresh every 10 seconds
 * - Large, readable fonts
 * - High contrast for visibility
 * - Responsive design
 * 
 * Usage: Navigate to /queue-display/{roomNo} and display on external monitor
 * Example: /queue-display/101, /queue-display/102
 * Recommended: Use browser's full-screen mode (F11)
 */

interface QueuePatient {
  tokenNo: string;
  patientName: string;
  patientNo: string;
  forceNo?: string;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
  position: number;
}

interface QueueData {
  roomNo: string;
  doctorName: string;
  department: string;
  currentToken: string;
  currentPatient: QueuePatient | null;
  currentPatientIndex: number;
  totalPatients: number;
  waitingPatients: number;
  patients: QueuePatient[];
}

const QueueDisplay: React.FC = () => {
  const { roomNo } = useParams<{ roomNo: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch queue data from API
  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        if (!roomNo) {
          setError('Room number not specified');
          setLoading(false);
          return;
        }

        console.log('🔄 [Queue Display] Fetching queue data for room:', roomNo);
        const response = await api.request(`/queue/room/${roomNo}`);
        if (response.success) {
          console.log('✅ [Queue Display] Queue data received:', {
            room: response.data.roomNo,
            doctor: response.data.doctorName,
            current: response.data.currentPatient?.patientName,
            waiting: response.data.waitingPatients,
            total: response.data.totalPatients,
            patients: response.data.patients.map((p: any) => ({
              token: p.tokenNo,
              name: p.patientName,
              status: p.status,
            })),
          });
          setQueueData(response.data);
          setError(null);
        } else {
          console.error('❌ [Queue Display] Failed to fetch:', response.message);
          setError(response.message || 'Failed to fetch queue data');
        }
      } catch (error) {
        console.error('❌ [Queue Display] Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch queue data');
      } finally {
        setLoading(false);
      }
    };

    fetchQueueData();

    // Refresh every 3 seconds for real-time updates
    const refreshTimer = setInterval(() => {
      console.log('🔄 [Queue Display] Auto-refresh triggered for room:', roomNo);
      fetchQueueData();
    }, 3000);
    return () => clearInterval(refreshTimer);
  }, [roomNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Loading queue display...</p>
        </div>
      </div>
    );
  }

  if (error || !queueData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-8">
        <Card className="bg-red-50 border-red-200 p-8 max-w-md">
          <div className="flex items-center gap-4 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
          </div>
          <p className="text-lg text-red-700 mb-4">{error || 'Queue data not available'}</p>
          <p className="text-sm text-red-600">Room: {roomNo}</p>
        </Card>
      </div>
    );
  }

  const currentPatient = queueData.currentPatient;
  
  // Filter only WAITING patients for upcoming display (exclude completed/serving)
  const waitingPatients = queueData.patients.filter(p => p.status === 'waiting');
  
  // Show next 5 waiting patients from the list
  const upcomingPatients = waitingPatients.slice(0, 5);

  console.log('📊 Queue Display Debug:', {
    roomNo: queueData.roomNo,
    currentPatientIndex: queueData.currentPatientIndex,
    totalPatients: queueData.totalPatients,
    waitingPatients: queueData.waitingPatients,
    currentPatient: currentPatient?.patientName,
    upcomingCount: upcomingPatients.length,
    allPatientStatuses: queueData.patients.map(p => ({ name: p.patientName, status: p.status })),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Smart Hospital" className="w-20 h-20 rounded-xl shadow-lg" />
          <div>
            <h1 className="text-4xl font-bold text-primary">Smart Hospital</h1>
            <p className="text-xl text-muted-foreground">Queue Management System</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-mono font-bold text-foreground">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-lg text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Room & Doctor Info */}
      <div className="flex items-center justify-center gap-8 mb-8 bg-card rounded-2xl p-6 border-2 border-primary/30 shadow-lg">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Room</p>
            <p className="text-3xl font-bold text-primary">{queueData.roomNo}</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-20" />
        <div className="flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Doctor</p>
            <p className="text-2xl font-bold">{queueData.doctorName}</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-20" />
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Waiting</p>
            <p className="text-3xl font-bold text-primary">{queueData.waitingPatients}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Currently Serving - Large Display */}
        <div className="lg:col-span-1">
          {currentPatient ? (
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 text-center h-full shadow-2xl">
              <p className="text-2xl uppercase tracking-widest mb-6 font-semibold">Now Serving</p>
              <div className="bg-white/20 backdrop-blur rounded-3xl p-8 mb-8">
                <p className="text-7xl font-bold font-mono">{currentPatient.tokenNo}</p>
              </div>
              <div className="space-y-4">
                <p className="text-4xl font-bold">{currentPatient.patientName}</p>
                <p className="text-2xl opacity-90">Patient No: {currentPatient.patientNo}</p>
                {currentPatient.forceNo && (
                  <p className="text-xl opacity-80">Force No: {currentPatient.forceNo}</p>
                )}
              </div>
              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="w-4 h-4 bg-white rounded-full animate-pulse" />
                <span className="text-xl font-semibold">Please proceed to Room {queueData.roomNo}</span>
              </div>
            </Card>
          ) : (
            <Card className="bg-card p-8 text-center h-full flex flex-col items-center justify-center border-2 border-dashed border-muted">
              <Clock className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-2xl font-semibold text-muted-foreground">No Patient</p>
              <p className="text-muted-foreground">Currently Being Served</p>
            </Card>
          )}
        </div>

        {/* Upcoming Queue */}
        <div className="lg:col-span-2">
          <Card className="bg-card p-8 h-full shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                Upcoming Patients
              </h2>
              <Badge variant="secondary" className="text-lg px-4 py-2 bg-primary/10">
                {queueData.waitingPatients} waiting
              </Badge>
            </div>
            
            {upcomingPatients.length > 0 ? (
              <div className="space-y-3">
                {upcomingPatients.map((patient, index) => {
                  const actualPosition = index + 1;
                  const isNext = actualPosition === 1;
                  
                  return (
                    <div
                      key={patient.tokenNo}
                      className={`flex gap-4 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        isNext
                          ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400 shadow-lg scale-105'
                          : 'bg-muted/50 border-transparent hover:bg-muted/70'
                      }`}
                    >
                      <div className={`w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg flex-shrink-0 ${
                        isNext
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {actualPosition}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-3xl font-bold text-primary mb-1 break-words">{patient.tokenNo}</p>
                        <p className="text-xl font-semibold text-foreground truncate">{patient.patientName}</p>
                        <p className="text-base text-muted-foreground">{patient.patientNo}</p>
                        {patient.forceNo && (
                          <p className="text-sm text-muted-foreground">Force: {patient.forceNo}</p>
                        )}
                      </div>
                      {isNext && (
                        <div className="flex items-center">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-4 py-2 font-bold h-fit animate-pulse">
                            NEXT
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No more patients in queue</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="text-base">Please wait for your token number to be called • Keep your token safe</p>
        <p className="mt-2 opacity-75">Auto-refresh every 10 seconds • Last updated: {currentTime.toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default QueueDisplay;
