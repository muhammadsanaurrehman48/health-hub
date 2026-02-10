import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, Download } from 'lucide-react';
import Logo from '@/assets/logo.png';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionData {
  prescriptionNo: string;
  date: string;
  patient: {
    name: string;
    forceNo: string;
    age: number;
    gender: string;
    phone: string;
  };
  doctor: {
    name: string;
    specialization: string;
    qualification: string;
    regNo: string;
  };
  vitals: {
    bloodPressure: string;
    pulse: string;
    temperature: string;
    weight: string;
  };
  diagnosis: string;
  medicines: Medicine[];
  labTests: string[];
  radiologyTests: string[];
  notes: string;
  followUpDate: string;
}

interface PrescriptionTemplateProps {
  data: PrescriptionData;
}

const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto print:shadow-none print:border-none">
        <CardContent className="p-8" ref={printRef}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img src={Logo} alt="ASF Medical" className="w-16 h-16 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-primary">ASF Medical</h1>
                <p className="text-sm text-muted-foreground">Health Management System</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Karachi | Tel: 021-1234567
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Prescription No:</p>
              <p className="text-primary font-bold">{data.prescriptionNo}</p>
              <p className="text-sm text-muted-foreground mt-1">{data.date}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">PATIENT INFORMATION</h3>
              <div className="space-y-1">
                <p className="font-semibold text-lg">{data.patient.name}</p>
                <p className="text-sm">Force No: <span className="font-medium">{data.patient.forceNo}</span></p>
                <p className="text-sm">{data.patient.gender}, {data.patient.age} years</p>
                <p className="text-sm">Phone: {data.patient.phone}</p>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">DOCTOR INFORMATION</h3>
              <div className="space-y-1">
                <p className="font-semibold text-lg">{data.doctor.name}</p>
                <p className="text-sm text-primary font-medium">{data.doctor.specialization}</p>
                <p className="text-sm">{data.doctor.qualification}</p>
                <p className="text-sm">Reg No: {data.doctor.regNo}</p>
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-primary/5 p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Blood Pressure</p>
              <p className="font-semibold">{data.vitals.bloodPressure}</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Pulse</p>
              <p className="font-semibold">{data.vitals.pulse}</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="font-semibold">{data.vitals.temperature}</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="font-semibold">{data.vitals.weight}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">DIAGNOSIS</h3>
            <p className="bg-warning/10 p-3 rounded-lg font-medium">{data.diagnosis}</p>
          </div>

          <Separator className="my-4" />

          {/* Medications - Rx Symbol */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl font-serif text-primary">℞</span>
              <h3 className="font-semibold text-lg">MEDICATIONS</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-semibold">#</th>
                  <th className="text-left py-2 text-sm font-semibold">Medicine</th>
                  <th className="text-left py-2 text-sm font-semibold">Dosage</th>
                  <th className="text-left py-2 text-sm font-semibold">Frequency</th>
                  <th className="text-left py-2 text-sm font-semibold">Duration</th>
                  <th className="text-left py-2 text-sm font-semibold">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {data.medicines.map((medicine, index) => (
                  <tr key={index} className="border-b border-dashed">
                    <td className="py-3">{index + 1}</td>
                    <td className="py-3 font-medium">{medicine.name}</td>
                    <td className="py-3">{medicine.dosage}</td>
                    <td className="py-3">{medicine.frequency}</td>
                    <td className="py-3">{medicine.duration}</td>
                    <td className="py-3 text-sm text-muted-foreground">{medicine.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lab Tests & Radiology */}
          {(data.labTests.length > 0 || data.radiologyTests.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {data.labTests.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">LAB TESTS ADVISED</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.labTests.map((test, i) => (
                      <li key={i} className="text-sm">{test}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.radiologyTests.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">RADIOLOGY TESTS ADVISED</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.radiologyTests.map((test, i) => (
                      <li key={i} className="text-sm">{test}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Notes & Follow-up */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">SPECIAL INSTRUCTIONS</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-lg">{data.notes || 'None'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">FOLLOW-UP DATE</h4>
              <p className="text-lg font-semibold bg-success/10 text-success p-3 rounded-lg">
                {data.followUpDate || 'As needed'}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Footer / Signature */}
          <div className="flex justify-between items-end mt-8">
            <div className="text-xs text-muted-foreground">
              <p>This is a computer-generated prescription.</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-t border-foreground pt-2">
                <p className="font-semibold">{data.doctor.name}</p>
                <p className="text-sm text-muted-foreground">{data.doctor.specialization}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionTemplate;
