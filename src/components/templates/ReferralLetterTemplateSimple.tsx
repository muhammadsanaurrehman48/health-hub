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
  };
  referringDoctor: {
    name: string;
  };
  referredTo: string;
  diagnosis?: string;
}

interface ReferralLetterTemplateSimpleProps {
  data: ReferralData;
}

const ReferralLetterTemplateSimple: React.FC<ReferralLetterTemplateSimpleProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Referral Letter</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 12px; }
            .content { margin: 30px 0; }
            .field { margin: 20px 0; }
            .label { font-weight: bold; }
            .value { margin-top: 5px; padding: 10px; border-bottom: 1px solid #ccc; min-height: 20px; }
            .signature-section { margin-top: 50px; }
            .signature-line { margin-top: 30px; padding-top: 10px; border-top: 1px solid #333; width: 200px; }
            .signature-text { font-size: 12px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      <Card>
        <CardContent className="p-8" ref={printRef}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={Logo} alt="Smart Hospital Management System" className="w-16 h-16" style={{maxWidth: '100%', height: 'auto'}} />
            </div>
            <h1 className="text-2xl font-bold mt-2">Smart Hospital</h1>
            <p className="text-sm text-muted-foreground">Management System</p>
            <h2 className="text-xl font-semibold mt-4">REFERRAL LETTER</h2>
          </div>

          <Separator className="mb-6" />

          {/* Content */}
          <div className="space-y-6">
            {/* Referral Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Referral Number</p>
                <p className="text-lg font-mono">{data.referralNo}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Date</p>
                <p className="text-lg">{new Date(data.date).toLocaleDateString()}</p>
              </div>
            </div>

            <Separator />

            {/* Patient Details */}
            <div>
              <h3 className="font-semibold mb-3">Patient Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="text-lg font-medium">{data.patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Force Number</p>
                  <p className="text-lg font-medium">{data.patient.forceNo}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Referral Information */}
            <div>
              <h3 className="font-semibold mb-3">Referral Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Referred To</p>
                  <p className="text-lg font-medium">{data.referredTo}</p>
                </div>
                {data.diagnosis && (
                  <div>
                    <p className="text-sm text-muted-foreground">Diagnosis</p>
                    <p className="text-lg font-medium">{data.diagnosis}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Doctor Information */}
            <div>
              <h3 className="font-semibold mb-3">Referring Doctor</h3>
              <p className="text-lg font-medium">{data.referringDoctor.name}</p>
            </div>

            {/* Signature Section */}
            <div className="mt-12">
              <p className="text-sm text-muted-foreground mb-2">Doctor's Signature</p>
              <div className="w-40 h-20 border border-dashed border-gray-300 rounded flex items-end justify-center pb-2">
                <p className="text-xs text-muted-foreground">Sign here</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{data.referringDoctor.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralLetterTemplateSimple;
