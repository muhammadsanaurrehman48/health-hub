import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const commonMedicines = [
  'Paracetamol 500mg',
  'Amoxicillin 500mg',
  'Omeprazole 20mg',
  'Metformin 500mg',
  'Amlodipine 5mg',
  'Atorvastatin 10mg',
  'Ibuprofen 400mg',
  'Azithromycin 500mg',
  'Ciprofloxacin 500mg',
  'Clopidogrel 75mg',
];

const labTests = [
  'Complete Blood Count (CBC)',
  'Blood Sugar Fasting',
  'Blood Sugar Random',
  'HbA1c',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Function Test',
  'Urine Complete',
  'Uric Acid',
];

const radiologyTests = [
  'X-Ray Chest PA View',
  'X-Ray Spine',
  'Ultrasound Abdomen',
  'CT Scan Brain',
  'CT Scan Chest',
  'MRI Brain',
  'MRI Spine',
  'ECG',
  'Echocardiography',
];

const ConsultationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient || {
    patientName: 'Muhammad Ali',
    mrNo: 'MR-001234',
    forceNo: 'F-12345',
    age: 45,
    gender: 'Male',
    complaint: 'Chest pain',
  };

  // Vitals
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [spo2, setSpo2] = useState('');

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

  const handleSave = () => {
    toast.success('Consultation saved successfully!');
  };

  const handleComplete = () => {
    toast.success('Consultation completed!', {
      description: 'Prescription sent to Pharmacy. Lab requests sent to Laboratory.',
    });
    navigate('/doctor/appointments');
  };

  const prescriptionData = {
    prescriptionNo: `RX-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString(),
    patient: {
      name: patient.patientName,
      mrNo: patient.mrNo,
      forceNo: patient.forceNo,
      age: patient.age,
      gender: patient.gender,
      phone: '0300-1234567',
    },
    doctor: {
      name: 'Dr. Ahmad Khan',
      specialization: 'Cardiologist',
      qualification: 'MBBS, FCPS (Cardiology)',
      regNo: 'PMC-12345',
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
            <Button onClick={handleComplete}>
              <Send className="w-4 h-4 mr-2" />
              Complete & Send
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
                    {patient.mrNo} | {patient.forceNo} | {patient.age}y / {patient.gender}
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
                <CardTitle>Patient Vitals</CardTitle>
                <CardDescription>Record patient's current vital signs</CardDescription>
              </CardHeader>
              <CardContent>
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
                    <Select value={newMedicineName} onValueChange={setNewMedicineName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or type medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMedicines.map((med) => (
                          <SelectItem key={med} value={med}>{med}</SelectItem>
                        ))}
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
                  <div className="space-y-3">
                    {labTests.map((test) => (
                      <div key={test} className="flex items-center space-x-3">
                        <Checkbox
                          id={test}
                          checked={selectedLabTests.includes(test)}
                          onCheckedChange={() => toggleLabTest(test)}
                        />
                        <label htmlFor={test} className="text-sm font-medium cursor-pointer">
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
                  <div className="space-y-3">
                    {radiologyTests.map((test) => (
                      <div key={test} className="flex items-center space-x-3">
                        <Checkbox
                          id={test}
                          checked={selectedRadiologyTests.includes(test)}
                          onCheckedChange={() => toggleRadiologyTest(test)}
                        />
                        <label htmlFor={test} className="text-sm font-medium cursor-pointer">
                          {test}
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
