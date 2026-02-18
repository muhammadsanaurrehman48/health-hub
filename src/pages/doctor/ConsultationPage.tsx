import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  User,
  FileText,
  Pill,
  Beaker,
  Scan,
  Save,
  Plus,
  X,
  ArrowLeft,
  ClipboardList,
  Calendar,
  Printer,
  Send,
  Loader2,
} from 'lucide-react';
import PrescriptionTemplate from '@/components/templates/PrescriptionTemplate';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Predefined common lab & radiology tests (services, not stock items)
const COMMON_LAB_TESTS = [
  'CPC & ESR',
  'MPICT',
  'Hb %',
  'H.C.V & Hbs Ag',
  'Urine D/R',
  'Pregnancy Test',
  'Stool DR',
  'FBS',
  'RBS',
  'LFT\'s',
  'SGPT',
  'Dengue',
  'H Pylori (Stool)',
  'H Pylori (Blood)',
  'Lipid Profile',
  'Cholesterol',
  'Uric Acid',
  'Blood Grouping',
  'ALK Phos',
  'T.G',
  'HDL',
  'Urea',
  'Creatinine',
  'Platelets',
  'HIV',
  'MP',
];

const COMMON_RADIOLOGY_TESTS = [
  'Chest PA',
  'L/Spine AP Lateral',
  'Knee Joint Lateral',
  'Cervical Spine AP Lateral',
];

const ConsultationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Inventory state
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
  const [availableLabTests, setAvailableLabTests] = useState<string[]>(COMMON_LAB_TESTS);
  const [availableRadiologyTests, setAvailableRadiologyTests] = useState<any[]>(
    COMMON_RADIOLOGY_TESTS.map((name, i) => ({ id: `rad-${i}`, name }))
  );
  const [inventoryLoading, setInventoryLoading] = useState(true);
  
  const patient = location.state?.patient || {
    patientName: 'Muhammad Ali',
    patientNo: 'MR-001234',
    forceNo: 'F-12345',
    age: 45,
    gender: 'Male',
    complaint: 'Chest pain',
  };

  // Fetch medicines from inventory on mount (lab/radiology tests use predefined lists)
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setInventoryLoading(true);
        const response = await api.request('/inventory');
        
        if (response.success && Array.isArray(response.data)) {
          // Filter medicines (category: Medicine or Pharmacy)
          const medicines = response.data.filter((item: any) => 
            (item.category === 'Medicine' || item.category === 'pharmacy') && item.quantity > 0
          ).map((m: any) => m.name);
          
          setAvailableMedicines([...new Set(medicines)]);
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        toast.error('Failed to load medicines from inventory');
      } finally {
        setInventoryLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  // Fetch vitals recorded by nurse (with polling until vitals arrive)
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    const fetchVitals = async () => {
      try {
        const appointmentId = location.state?.appointmentId || location.state?.id;
        if (!appointmentId) {
          console.log('⚠️ [DOCTOR] No appointment ID found');
          return;
        }
        
        setVitalsLoading(true);
        const response = await api.getAppointmentVitals(appointmentId);
        
        if (response.success && response.data) {
          console.log('✅ [DOCTOR] Vitals fetched from nurse:', response.data);
          setBloodPressure(response.data.bloodPressure || '');
          setPulse(response.data.pulse?.toString() || '');
          setTemperature(response.data.temperature?.toString() || '');
          setSpo2(response.data.spo2?.toString() || '');
          setVitalsRecorded(true);
          if (response.data.nurseId?.name) {
            setNurseName(response.data.nurseId.name);
          }
          // Stop polling once vitals are found
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        } else {
          console.log('⚠️ [DOCTOR] No vitals recorded yet by nurse');
          setVitalsRecorded(false);
        }
      } catch (error) {
        console.error('❌ [DOCTOR] Error fetching vitals:', error);
        setVitalsRecorded(false);
      } finally {
        setVitalsLoading(false);
      }
    };
    
    fetchVitals();
    
    // Poll every 10 seconds until vitals are recorded
    const appointmentId = location.state?.appointmentId || location.state?.id;
    if (appointmentId) {
      pollInterval = setInterval(fetchVitals, 10000);
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [location.state]);
  
  // Vitals
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [spo2, setSpo2] = useState('');
  const [vitalsRecorded, setVitalsRecorded] = useState(false);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [nurseName, setNurseName] = useState('');

  // Diagnosis
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Medicines
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  // Lab & Radiology
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [selectedRadiologyTests, setSelectedRadiologyTests] = useState<string[]>([]);

  // Follow-up
  const [followUpDate, setFollowUpDate] = useState('');
  const [referToHospital, setReferToHospital] = useState('');

  // View prescription
  const [showPrescription, setShowPrescription] = useState(false);

  // Track already-saved prescription to prevent duplicates
  const [savedPrescriptionId, setSavedPrescriptionId] = useState<string | null>(null);

  const addMedicine = () => {
    if (newMedicineName) {
      setMedicines([
        ...medicines,
        {
          id: Date.now().toString(),
          name: newMedicineName,
          dosage: newDosage,
          frequency: newFrequency,
          duration: newDuration,
          instructions: newInstructions,
        },
      ]);
      setNewMedicineName('');
      setNewDosage('');
      setNewFrequency('');
      setNewDuration('');
      setNewInstructions('');
    }
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const toggleLabTest = (test: string) => {
    setSelectedLabTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const toggleRadiologyTest = (test: string) => {
    setSelectedRadiologyTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleSave = async () => {
    if (completing) return; // Guard against concurrent calls
    setCompleting(true);

    const appointmentId = location.state?.appointmentId || location.state?.id;

    // Reuse patient resolution used in complete flow
    let patientId: string | undefined;
    const rawPatientId = location.state?.patient?.patientId;
    if (rawPatientId) {
      if (typeof rawPatientId === 'string') {
        patientId = rawPatientId;
      } else if (typeof rawPatientId === 'object') {
        patientId = rawPatientId._id?.toString() || rawPatientId.id?.toString();
      }
    }
    if (!patientId && location.state?.patient?._id) {
      patientId = location.state.patient._id.toString();
    }
    if (!patientId && appointmentId) {
      try {
        const aptRes = await api.request(`/appointments/${appointmentId}`);
        if (aptRes.success && aptRes.data) {
          const aptPatientId = aptRes.data.patientId;
          if (typeof aptPatientId === 'string') {
            patientId = aptPatientId;
          } else if (aptPatientId) {
            patientId = aptPatientId._id?.toString() || aptPatientId.id?.toString();
          }
        }
      } catch (e) {
        console.error('⚠️ [DOCTOR] Could not fetch appointment for draft save:', e);
      }
    }

    if (!patientId) {
      toast.error('Could not identify the patient to save draft.');
      setCompleting(false);
      return;
    }

    try {
      const payload = {
        patientId,
        appointmentId: appointmentId || undefined,
        mrNo: patient.patientNo || patient.mrNo || patient.patientId?.patientNo || '',
        forceNo: patient.forceNo || patient.patientId?.forceNo || '',
        diagnosis: diagnosis || 'Draft - pending diagnosis',
        medicines: medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        })),
        labTests: selectedLabTests,
        radiologyTests: selectedRadiologyTests,
        notes: notes || '',
      };

      let res;
      if (savedPrescriptionId) {
        // Update existing prescription instead of creating a new one
        res = await api.updatePrescription(savedPrescriptionId, payload);
      } else {
        res = await api.createPrescription(payload);
      }
      if (res.success) {
        if (!savedPrescriptionId && res.data?.id) {
          setSavedPrescriptionId(res.data.id);
        }
        toast.success('Draft saved');
      } else {
        toast.error(res.message || 'Failed to save draft');
      }
    } catch (error: any) {
      console.error('❌ [DOCTOR] Error saving draft:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setCompleting(false);
    }
  };

  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    // Immediately guard against double-clicks
    if (completing) return;
    setCompleting(true);

    console.log('🚀 [DOCTOR] handleComplete called. location.state:', JSON.stringify(location.state, null, 2));
    const appointmentId = location.state?.appointmentId || location.state?.id;
    
    // Extract patientId robustly from multiple sources
    let patientId: string | undefined;
    
    // Source 1: Direct from patient object in state
    const rawPatientId = location.state?.patient?.patientId;
    if (rawPatientId) {
      if (typeof rawPatientId === 'string') {
        patientId = rawPatientId;
      } else if (typeof rawPatientId === 'object') {
        patientId = rawPatientId._id?.toString() || rawPatientId.id?.toString() || undefined;
      }
    }
    
    // Source 2: From patient._id directly
    if (!patientId && location.state?.patient?._id) {
      patientId = location.state.patient._id.toString();
    }
    
    // Source 3: Fetch from appointment if still not found
    if (!patientId && appointmentId) {
      try {
        const aptRes = await api.request(`/appointments/${appointmentId}`);
        if (aptRes.success && aptRes.data) {
          const aptPatientId = aptRes.data.patientId;
          if (typeof aptPatientId === 'string') {
            patientId = aptPatientId;
          } else if (typeof aptPatientId === 'object' && aptPatientId) {
            patientId = aptPatientId._id?.toString() || aptPatientId.id?.toString();
          }
        }
      } catch (e) {
        console.error('⚠️ [DOCTOR] Could not fetch appointment for patientId:', e);
      }
    }
    
    console.log('🔍 [DOCTOR] Resolved patientId:', patientId, '| appointmentId:', appointmentId);
    
    if (!patientId) {
      toast.error('Could not identify the patient. Please go back and try again.');
      setCompleting(false);
      return;
    }
    
    if (!diagnosis) {
      toast.error('Please enter a diagnosis before completing');
      setCompleting(false);
      return;
    }
    
    try {
      // 1. Save prescription to database (create or update)
      const prescriptionPayload = {
        patientId,
        appointmentId: appointmentId || undefined,
        mrNo: patient.patientNo || patient.mrNo || patient.patientId?.patientNo || '',
        forceNo: patient.forceNo || patient.patientId?.forceNo || '',
        diagnosis,
        medicines: medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        })),
        labTests: selectedLabTests,
        radiologyTests: selectedRadiologyTests,
        notes: notes || '',
      };

      console.log('📝 [DOCTOR] Saving prescription:', prescriptionPayload);
      let rxRes;
      if (savedPrescriptionId) {
        // Update the already-saved draft instead of creating a duplicate
        rxRes = await api.updatePrescription(savedPrescriptionId, prescriptionPayload);
        // Treat update as success with existing data
        if (rxRes.success) {
          rxRes.data = rxRes.data || { id: savedPrescriptionId };
          console.log('✅ [DOCTOR] Prescription updated:', savedPrescriptionId);
        }
      } else {
        rxRes = await api.createPrescription(prescriptionPayload);
      }
      
      if (rxRes.success) {
        console.log('✅ [DOCTOR] Prescription saved:', rxRes.data?.rxNo || rxRes.data?.id);
      } else {
        console.error('❌ [DOCTOR] Failed to save prescription:', rxRes.message);
        toast.error(rxRes.message || 'Failed to save prescription');
        return;
      }

      // 2. Mark appointment as completed
      if (appointmentId) {
        await api.updateAppointment(appointmentId, { status: 'completed' });
        console.log('✅ [DOCTOR] Appointment marked as completed:', appointmentId);
      }

      // Build description based on what was prescribed
      const parts = [];
      if (medicines.length > 0) parts.push('Prescription sent to Pharmacy');
      if (selectedLabTests.length > 0) parts.push('Lab requests sent to Laboratory');
      if (selectedRadiologyTests.length > 0) parts.push('Radiology requests sent');
      if (parts.length === 0) parts.push('Consultation recorded');
      
      toast.success('Consultation completed!', {
        description: parts.join('. ') + '.',
      });
      navigate('/doctor/appointments');
    } catch (error: any) {
      console.error('❌ [DOCTOR] Error completing consultation:', error);
      toast.error(error.message || 'Failed to complete consultation');
    } finally {
      setCompleting(false);
    }
  };

  const prescriptionData = {
    prescriptionNo: `RX-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString(),
    patient: {
      name: patient.patientName,
      patientNo: patient.patientNo,
      forceNo: patient.forceNo || 'N/A',
      age: patient.age || 0,
      gender: patient.gender || 'Unknown',
      phone: patient.phone || patient.patientId?.phone || 'N/A',
    },
    doctor: {
      name: user?.name || 'Doctor',
      specialization: user?.department || 'General',
      qualification: '',
      regNo: '',
    },
    vitals: {
      bloodPressure: bloodPressure || '120/80 mmHg',
      pulse: pulse || '72 bpm',
      temperature: temperature || '98.6°F',
      weight: weight || '70 kg',
    },
    diagnosis: diagnosis || 'Under observation',
    medicines,
    labTests: selectedLabTests,
    radiologyTests: selectedRadiologyTests,
    notes,
    followUpDate,
  };

  if (showPrescription) {
    return (
      <DashboardLayout requiredRole="doctor">
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setShowPrescription(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Consultation
          </Button>
          <PrescriptionTemplate data={prescriptionData} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/doctor/appointments')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Patient Consultation</h2>
              <p className="text-muted-foreground">Record diagnosis, prescriptions, and tests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => setShowPrescription(true)}>
              <Printer className="w-4 h-4 mr-2" />
              Preview Rx
            </Button>
            <Button onClick={handleComplete} disabled={completing}>
              {completing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {completing ? 'Saving...' : 'Complete & Send'}
            </Button>
          </div>
        </div>

        {/* Patient Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{patient.patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {patient.patientNo} | {patient.forceNo} | {patient.age}y / {patient.gender}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Chief Complaint</p>
                <Badge variant="outline" className="mt-1">{patient.complaint}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="vitals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
            <TabsTrigger value="tests">Lab & Radiology</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
          </TabsList>

          {/* Vitals Tab */}
          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patient Vitals</CardTitle>
                    <CardDescription>Record patient's current vital signs</CardDescription>
                  </div>
                  {vitalsRecorded ? (
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        ✓ Recorded by Nurse
                      </Badge>
                      {nurseName && <p className="text-xs text-muted-foreground mt-1">{nurseName}</p>}
                    </div>
                  ) : (
                    <Badge variant="secondary">
                      ⏳ Awaiting Nurse Input
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {vitalsLoading && (
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading vitals...</span>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Blood Pressure</Label>
                    <Input
                      placeholder="120/80"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pulse (bpm)</Label>
                    <Input
                      placeholder="72"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature (°F)</Label>
                    <Input
                      placeholder="98.6"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SpO2 (%)</Label>
                    <Input
                      placeholder="98"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis">
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis & Notes</CardTitle>
                <CardDescription>Record diagnosis and clinical observations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Textarea
                    placeholder="Enter diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Clinical Notes / Instructions</Label>
                  <Textarea
                    placeholder="Additional notes, special instructions for patient..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescription Tab */}
          <TabsContent value="prescription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medications
                </CardTitle>
                <CardDescription>Add medicines to the prescription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Medicine Form */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="md:col-span-2">
                    <Label>Medicine Name</Label>
                    <Select value={newMedicineName} onValueChange={setNewMedicineName} disabled={inventoryLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={inventoryLoading ? "Loading medicines..." : "Select medicine"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMedicines.length === 0 ? (
                          <SelectItem value="no-medicines" disabled>No medicines available in inventory</SelectItem>
                        ) : (
                          availableMedicines.map((med) => (
                            <SelectItem key={med} value={med}>{med}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dosage</Label>
                    <Select value={newDosage} onValueChange={setNewDosage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dosage" />
                      </SelectTrigger>
                      <SelectContent>
                        {['1 tablet', '2 tablets', '1/2 tablet', '1 tsp', '2 tsp', '5ml', '10ml'].map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={newFrequency} onValueChange={setNewFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Once daily', 'Twice daily', 'Three times daily', 'Every 6 hours', 'Every 8 hours', 'As needed'].map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Select value={newDuration} onValueChange={setNewDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', 'Ongoing'].map((dur) => (
                          <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addMedicine} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Input
                    placeholder="e.g., Take after meals, Avoid dairy products..."
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                  />
                </div>

                <Separator />

                {/* Medicine List */}
                {medicines.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No medicines added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {medicines.map((med, index) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-primary">{index + 1}</span>
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                            {med.instructions && (
                              <p className="text-xs text-muted-foreground italic">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeMedicine(med.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Lab Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="w-5 h-5" />
                    Laboratory Tests
                  </CardTitle>
                  <CardDescription>Select tests to request from laboratory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {availableLabTests.map((test) => (
                      <div key={test} className="flex items-center space-x-3">
                        <Checkbox
                          id={`lab-${test}`}
                          checked={selectedLabTests.includes(test)}
                          onCheckedChange={() => toggleLabTest(test)}
                        />
                        <label htmlFor={`lab-${test}`} className="text-sm font-medium cursor-pointer">
                          {test}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedLabTests.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Selected ({selectedLabTests.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedLabTests.map((test) => (
                          <Badge key={test} variant="secondary">
                            {test}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() => toggleLabTest(test)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Radiology Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    Radiology Tests
                  </CardTitle>
                  <CardDescription>Select imaging tests to request</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {availableRadiologyTests.map((test: any) => (
                      <div key={test.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`rad-${test.id}`}
                          checked={selectedRadiologyTests.includes(test.name)}
                          onCheckedChange={() => toggleRadiologyTest(test.name)}
                        />
                        <label htmlFor={`rad-${test.id}`} className="text-sm font-medium cursor-pointer">
                          {test.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedRadiologyTests.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Selected ({selectedRadiologyTests.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRadiologyTests.map((test) => (
                          <Badge key={test} variant="secondary">
                            {test}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() => toggleRadiologyTest(test)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Follow-up Tab */}
          <TabsContent value="followup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Follow-up & Referral
                </CardTitle>
                <CardDescription>Schedule follow-up or refer to another hospital</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Refer to Hospital</Label>
                    <Select value={referToHospital} onValueChange={setReferToHospital}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hospital if referral needed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cmh-rawalpindi">CMH Rawalpindi</SelectItem>
                        <SelectItem value="cmh-lahore">CMH Lahore</SelectItem>
                        <SelectItem value="afic">AFIC/NIHD</SelectItem>
                        <SelectItem value="pims">PIMS Islamabad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ConsultationPage;
