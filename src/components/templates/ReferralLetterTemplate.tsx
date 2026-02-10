import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, Download } from 'lucide-react';
import Logo from '@/assets/logo.png';

interface ReferralData {
  referralNo: string;
  date: string;
  patient: {
    name: string;
    forceNo: string;
    age: number;
    gender: string;
    phone: string;
  };
  referringDoctor: {
    name: string;
    specialization: string;
    qualification: string;
    department: string;
  };
  referredTo: {
    department: string;
    doctor?: string;
    hospital?: string;
  };
  diagnosis: string;
  reasonForReferral: string;
  clinicalHistory: string;
  treatmentGiven: string;
  investigationsDone: string[];
  urgency: 'routine' | 'urgent' | 'emergency';
  notes: string;
}

interface ReferralLetterTemplateProps {
  data: ReferralData;
}

/**
 * Referral Letter Template
 * Standard A4 size for professional medical referrals
 */
const ReferralLetterTemplate: React.FC<ReferralLetterTemplateProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=1000');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Referral Letter - ${data.referralNo}</title>
          <style>
            @page { 
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Times New Roman', serif;
              margin: 0;
              padding: 20px;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24pt; color: #1a5f7a; }
            .header p { margin: 5px 0; font-size: 10pt; }
            .divider { border-top: 2px solid #1a5f7a; margin: 15px 0; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; font-size: 11pt; color: #1a5f7a; margin-bottom: 5px; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-box { background: #f5f5f5; padding: 10px; border-radius: 5px; }
            .label { font-weight: bold; display: inline-block; min-width: 120px; }
            .urgency-urgent { color: #f59e0b; font-weight: bold; }
            .urgency-emergency { color: #ef4444; font-weight: bold; }
            .urgency-routine { color: #10b981; }
            .signature { margin-top: 40px; text-align: right; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin-left: auto; padding-top: 5px; }
            .footer { margin-top: 30px; font-size: 9pt; color: #666; text-align: center; }
            ul { margin: 5px 0; padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ASF MEDICAL</h1>
            <p>Health Management System</p>
            <p>Karachi | Tel: 021-1234567 | Email: info@asfmedical.pk</p>
          </div>
          
          <div class="divider"></div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <strong>REFERRAL LETTER</strong>
            </div>
            <div style="text-align: right;">
              <p><strong>Ref No:</strong> ${data.referralNo}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p class="urgency-${data.urgency}"><strong>Priority:</strong> ${data.urgency.toUpperCase()}</p>
            </div>
          </div>

          <div class="grid">
            <div class="info-box">
              <div class="section-title">Patient Information</div>
              <p><span class="label">Name:</span> ${data.patient.name}</p>
              <p><span class="label">Force No:</span> ${data.patient.forceNo}</p>
              <p><span class="label">Age/Gender:</span> ${data.patient.age} years / ${data.patient.gender}</p>
              <p><span class="label">Contact:</span> ${data.patient.phone}</p>
            </div>
            <div class="info-box">
              <div class="section-title">Referred To</div>
              <p><span class="label">Department:</span> ${data.referredTo.department}</p>
              ${data.referredTo.doctor ? `<p><span class="label">Doctor:</span> ${data.referredTo.doctor}</p>` : ''}
              ${data.referredTo.hospital ? `<p><span class="label">Hospital:</span> ${data.referredTo.hospital}</p>` : ''}
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="section-title">Provisional Diagnosis</div>
            <p>${data.diagnosis}</p>
          </div>

          <div class="section">
            <div class="section-title">Reason for Referral</div>
            <p>${data.reasonForReferral}</p>
          </div>

          <div class="section">
            <div class="section-title">Clinical History</div>
            <p>${data.clinicalHistory}</p>
          </div>

          <div class="section">
            <div class="section-title">Treatment Given</div>
            <p>${data.treatmentGiven}</p>
          </div>

          ${data.investigationsDone.length > 0 ? `
          <div class="section">
            <div class="section-title">Investigations Done</div>
            <ul>
              ${data.investigationsDone.map(inv => `<li>${inv}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${data.notes ? `
          <div class="section">
            <div class="section-title">Additional Notes</div>
            <p>${data.notes}</p>
          </div>
          ` : ''}

          <div class="signature">
            <div class="signature-line">
              <p><strong>${data.referringDoctor.name}</strong></p>
              <p>${data.referringDoctor.specialization}</p>
              <p>${data.referringDoctor.qualification}</p>
              <p>${data.referringDoctor.department}</p>
            </div>
          </div>

          <div class="footer">
            <div class="divider"></div>
            <p>This is a computer-generated referral letter from Smart Hospital HMS.</p>
            <p>For verification, please contact the issuing department.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-destructive text-destructive-foreground';
      case 'urgent': return 'bg-warning text-warning-foreground';
      default: return 'bg-success text-success-foreground';
    }
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
              <img src={Logo} alt="Smart Hospital" className="w-16 h-16 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Smart Hospital</h1>
                <p className="text-sm text-muted-foreground">Health Management System</p>
                <p className="text-xs text-muted-foreground mt-1">
                  123 Medical Center, Rawalpindi | Tel: 051-1234567
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Referral No:</p>
              <p className="text-primary font-bold">{data.referralNo}</p>
              <p className="text-sm text-muted-foreground mt-1">{data.date}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${getUrgencyColor(data.urgency)}`}>
                {data.urgency.toUpperCase()}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <h2 className="text-xl font-bold text-center mb-6">REFERRAL LETTER</h2>

          {/* Patient & Referral Info */}
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
            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">REFERRED TO</h3>
              <div className="space-y-1">
                <p className="font-semibold text-lg text-primary">{data.referredTo.department}</p>
                {data.referredTo.doctor && (
                  <p className="text-sm">Doctor: <span className="font-medium">{data.referredTo.doctor}</span></p>
                )}
                {data.referredTo.hospital && (
                  <p className="text-sm">Hospital: <span className="font-medium">{data.referredTo.hospital}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">PROVISIONAL DIAGNOSIS</h3>
            <p className="bg-warning/10 p-3 rounded-lg font-medium">{data.diagnosis}</p>
          </div>

          {/* Reason for Referral */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">REASON FOR REFERRAL</h3>
            <p className="bg-muted/30 p-3 rounded-lg">{data.reasonForReferral}</p>
          </div>

          {/* Clinical History */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">CLINICAL HISTORY</h3>
            <p className="bg-muted/30 p-3 rounded-lg">{data.clinicalHistory}</p>
          </div>

          {/* Treatment Given */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">TREATMENT GIVEN</h3>
            <p className="bg-muted/30 p-3 rounded-lg">{data.treatmentGiven}</p>
          </div>

          {/* Investigations Done */}
          {data.investigationsDone.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">INVESTIGATIONS DONE</h3>
              <ul className="list-disc list-inside bg-muted/30 p-3 rounded-lg space-y-1">
                {data.investigationsDone.map((inv, i) => (
                  <li key={i} className="text-sm">{inv}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">ADDITIONAL NOTES</h3>
              <p className="bg-muted/30 p-3 rounded-lg text-sm">{data.notes}</p>
            </div>
          )}

          <Separator className="my-4" />

          {/* Footer / Signature */}
          <div className="flex justify-between items-end mt-8">
            <div className="text-xs text-muted-foreground">
              <p>This is a computer-generated referral letter.</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="w-56 border-t border-foreground pt-2">
                <p className="font-semibold">{data.referringDoctor.name}</p>
                <p className="text-sm text-primary">{data.referringDoctor.specialization}</p>
                <p className="text-xs text-muted-foreground">{data.referringDoctor.qualification}</p>
                <p className="text-xs text-muted-foreground">{data.referringDoctor.department}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralLetterTemplate;
