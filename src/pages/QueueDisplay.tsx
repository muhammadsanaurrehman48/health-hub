import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Stethoscope, Building, Loader2 } from 'lucide-react';
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
 * - Full-screen display optimized for large monitors
 * - Auto-refresh every 30 seconds
 * - Large, readable fonts
 * - High contrast for visibility
 * 
 * Usage: Navigate to /queue-display and display on external monitor
 * Recommended: Use browser's full-screen mode (F11)
 */

interface QueuePatient {
  tokenNo: string;
  patientName: string;
  forceNo: string;
  status: 'serving' | 'waiting';
}

interface QueueData {
  department: string;
  doctor: string;
  room: string;
  currentToken: string;
  patients: QueuePatient[];
}

const QueueDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queueData, setQueueData] = useState<QueueData>({
    department: 'General Medicine',
    doctor: 'Loading...',
    room: 'Room 101',
    currentToken: '',
    patients: []
  });
  const [loading, setLoading] = useState(true);

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
        const response = await api.getQueueData('general');
        if (response.success) {
          setQueueData(response.data);
        }
      } catch (error) {
        console.error('Error fetching queue data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueueData();

    // Refresh every 30 seconds
    const refreshTimer = setInterval(fetchQueueData, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  const servingPatient = queueData.patients.find(p => p.status === 'serving');
  const waitingPatients = queueData.patients.filter(p => p.status === 'waiting');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Smart Hospital" className="w-20 h-20 rounded-xl" />
          <div>
            <h1 className="text-4xl font-bold text-primary">Smart Hospital</h1>
            <p className="text-xl text-muted-foreground">Patient Queue Display</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-mono font-bold text-foreground">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xl text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Department Info */}
      <div className="flex items-center justify-center gap-8 mb-8 bg-card rounded-2xl p-6 border">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="text-2xl font-bold">{queueData.department}</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-16" />
        <div className="flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Doctor</p>
            <p className="text-2xl font-bold">{queueData.doctor}</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-16" />
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="text-2xl font-bold">{queueData.room}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Currently Serving - Large Display */}
        <div className="lg:col-span-1">
          <Card className="bg-primary text-primary-foreground p-8 text-center h-full">
            <p className="text-xl uppercase tracking-wider mb-4">Now Serving</p>
            {servingPatient ? (
              <>
                <div className="bg-primary-foreground/20 rounded-2xl p-8 mb-6">
                  <p className="text-8xl font-bold">{servingPatient.tokenNo.split('-')[1]}</p>
                  <p className="text-2xl mt-2">{servingPatient.tokenNo}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-semibold">{servingPatient.patientName}</p>
                  <p className="text-xl opacity-80">{servingPatient.forceNo}</p>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="w-3 h-3 bg-primary-foreground rounded-full animate-pulse" />
                  <span className="text-lg">Please proceed to {queueData.room}</span>
                </div>
              </>
            ) : (
              <p className="text-2xl">No patient currently being served</p>
            )}
          </Card>
        </div>

        {/* Waiting Queue */}
        <div className="lg:col-span-2">
          <Card className="bg-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Waiting Queue
              </h2>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {waitingPatients.length} patients waiting
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {waitingPatients.slice(0, 6).map((patient, index) => (
                <div
                  key={patient.tokenNo}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    index === 0 
                      ? 'bg-warning/10 border-warning' 
                      : 'bg-muted/30 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                      index === 0 ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{patient.tokenNo}</p>
                      <p className="text-lg font-medium">{patient.patientName}</p>
                      <p className="text-sm text-muted-foreground">{patient.forceNo}</p>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-warning text-warning-foreground text-lg px-3 py-1">
                      Next
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {waitingPatients.length > 6 && (
              <div className="mt-4 text-center text-muted-foreground text-lg">
                +{waitingPatients.length - 6} more patients in queue
              </div>
            )}

            {waitingPatients.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-xl">
                No patients waiting in queue
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-muted-foreground">
        <p className="text-lg">Please wait for your token number to be called • Keep your token safe</p>
        <p className="text-sm mt-2">Queue auto-refreshes every 30 seconds</p>
      </div>
    </div>
  );
};

export default QueueDisplay;
