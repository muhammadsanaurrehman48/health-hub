import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Logo from '@/assets/logo.png';
import api from '@/utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Eye,
  Printer,
  Clock,
  CheckCircle,
  FileText,
  Loader2,
} from 'lucide-react';

const ReceptionistDocuments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [radiologyRequests, setRadiologyRequests] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prescRes, labRes, radRes, refRes] = await Promise.all([
          api.getPrescriptions(),
          api.getLabRequests(),
          api.getRadiologyRequests(),
          api.getReferrals()
        ]);
        
        if (prescRes.success) setPrescriptions(prescRes.data || []);
        if (labRes.success) setLabRequests(labRes.data || []);
        if (radRes.success) setRadiologyRequests(radRes.data || []);
        if (refRes.success) setReferrals(refRes.data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.patient?.forceNo && p.patient.forceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.rxNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabRequests = labRequests.filter(l =>
    l.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.forceNo && l.forceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    l.labNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRadiologyRequests = radiologyRequests.filter(r =>
    r.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.forceNo && r.forceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.radNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requestNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReferrals = referrals.filter(r =>
    r.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.forceNo && r.forceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.referralNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrintPrescription = (prescription: any) => {
    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) return;
    
    const forceNoRow = prescription.patient.forceNo ? `<p><strong>Force No:</strong> <span style="font-weight: 500;">${prescription.patient.forceNo}</span></p>` : '';
    const medicinesTable = prescription.medicines.map((med: any, idx: number) => `
      <tr style="border-bottom: 1px dashed #ddd;">
        <td style="padding: 8px;">${idx + 1}</td>
        <td style="padding: 8px; font-weight: 500;">${med.name}</td>
        <td style="padding: 8px;">${med.dosage}</td>
        <td style="padding: 8px;">${med.frequency}</td>
        <td style="padding: 8px;">${med.duration}</td>
        <td style="padding: 8px; font-size: 12px; color: #666;">${med.instructions}</td>
      </tr>
    `).join('');
    
    const labTestsList = prescription.labTests.length > 0 
      ? prescription.labTests.map((test: any) => `<li style="margin: 5px 0; margin-left: 20px;">${test}</li>`).join('')
      : '';
    
    const radiologyTestsList = prescription.radiologyTests.length > 0 
      ? prescription.radiologyTests.map((test: any) => `<li style="margin: 5px 0; margin-left: 20px;">${test}</li>`).join('')
      : '';
    
    const labRadiologyHtml = (labTestsList || radiologyTestsList) ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        ${labTestsList ? `
          <div style="background: #ecf0f9; padding: 15px; border-radius: 5px;">
            <h4 style="font-weight: 600; font-size: 12px; margin: 0 0 8px 0; color: #666;">LAB TESTS ADVISED</h4>
            <ul style="margin: 0; padding: 0; list-style: disc;">${labTestsList}</ul>
          </div>
        ` : ''}
        ${radiologyTestsList ? `
          <div style="background: #f0e6ff; padding: 15px; border-radius: 5px;">
            <h4 style="font-weight: 600; font-size: 12px; margin: 0 0 8px 0; color: #666;">RADIOLOGY TESTS ADVISED</h4>
            <ul style="margin: 0; padding: 0; list-style: disc;">${radiologyTestsList}</ul>
          </div>
        ` : ''}
      </div>
    ` : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Prescription - ${prescription.rxNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              background: white;
              max-width: 900px;
              margin: 0 auto;
              padding: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e0e0e0;
            }
            .header-left {
              display: flex;
              gap: 12px;
              align-items: center;
              min-width: 0;
            }
            .logo {
              min-width: 70px;
              width: 70px;
              height: 70px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              overflow: hidden;
            }
            .logo img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .hospital-info {
              flex: 1;
              min-width: 0;
            }
            .hospital-info h1 {
              font-size: 24px;
              color: #1f2937;
              margin: 0;
              font-weight: 700;
              word-break: break-word;
            }
            .hospital-info p {
              margin: 2px 0;
              font-size: 11px;
              color: #666;
              word-break: break-word;
            }
            .prescription-no {
              text-align: right;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .prescription-no p:first-child {
              font-size: 11px;
              font-weight: 600;
              color: #666;
              margin-bottom: 4px;
            }
            .prescription-no p:nth-child(2) {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
            }
            .prescription-no p:nth-child(3) {
              font-size: 11px;
              color: #999;
              margin-top: 4px;
            }
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .info-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #10b981;
            }
            .info-box h3 {
              font-size: 11px;
              font-weight: 700;
              color: #999;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .patient-name, .doctor-name {
              font-size: 16px;
              font-weight: 700;
              color: #000;
              margin-bottom: 6px;
            }
            .info-box p {
              font-size: 12px;
              margin: 4px 0;
              color: #555;
            }
            .info-box .specialty {
              color: #10b981;
              font-weight: 600;
            }
            .vitals {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 20px;
            }
            .vital-box {
              background: #ecfdf5;
              padding: 12px;
              border-radius: 5px;
              text-align: center;
              border: 1px solid #d1fae5;
            }
            .vital-box p:first-child {
              font-size: 10px;
              color: #666;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .vital-box p:nth-child(2) {
              font-size: 13px;
              font-weight: 700;
              color: #000;
            }
            .diagnosis {
              margin-bottom: 20px;
            }
            .diagnosis h3 {
              font-size: 11px;
              font-weight: 700;
              color: #999;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .diagnosis-content {
              background: #fff3cd;
              padding: 12px;
              border-radius: 5px;
              font-weight: 500;
              font-size: 13px;
            }
            .medicines-section {
              margin-bottom: 20px;
            }
            .medicines-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 12px;
            }
            .rx-symbol {
              font-size: 36px;
              font-family: serif;
              color: #10b981;
            }
            .medicines-header h3 {
              font-weight: 700;
              font-size: 14px;
              color: #1f2937;
            }
            .medicines-table {
              width: 100%;
              border-collapse: collapse;
            }
            .medicines-table thead {
              border-bottom: 2px solid #1f2937;
              background: #f8f9fa;
            }
            .medicines-table th {
              text-align: left;
              padding: 10px;
              font-size: 11px;
              font-weight: 700;
              color: #333;
            }
            .medicines-table td {
              padding: 10px;
              font-size: 12px;
              color: #555;
            }
            .separator {
              border-top: 1px solid #e0e0e0;
              margin: 20px 0;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 30px;
              padding-top: 20px;
            }
            .footer-left p {
              font-size: 10px;
              color: #999;
              margin: 3px 0;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              width: 180px;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .signature-name {
              font-weight: 600;
              font-size: 12px;
            }
            .signature-title {
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { background: white; padding: 0; }
              .container { box-shadow: none; padding: 30px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="header-left">
                <div class="logo"><img src="${Logo}" alt="ASF Medical Logo" /></div>
                <div class="hospital-info">
                  <h1>ASF Medical</h1>
                  <p>Healthcare Management System</p>
                  <p>Karachi, Pakistan | Emergency: 0XXX-XXXXXXX</p>
                </div>
              </div>
              <div class="prescription-no">
                <p>Prescription No:</p>
                <p>${prescription.rxNo}</p>
                <p>${new Date(prescription.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <!-- Patient & Doctor Info -->
            <div class="info-section">
              <div class="info-box">
                <h3>Patient Information</h3>
                <p class="patient-name">${prescription.patient.name}</p>
                ${forceNoRow}
                <p>${prescription.patient.gender}, ${prescription.patient.age} years</p>
                <p>Phone: ${prescription.patient.phone}</p>
              </div>
              <div class="info-box">
                <h3>Doctor Information</h3>
                <p class="doctor-name">${prescription.doctor.name}</p>
                <p class="specialty">${prescription.doctor.specialization}</p>
                <p>${prescription.doctor.qualification}</p>
                <p>Reg No: ${prescription.doctor.regNo}</p>
              </div>
            </div>

            <!-- Vitals -->
            <div class="vitals">
              <div class="vital-box">
                <p>Blood Pressure</p>
                <p>${prescription.vitals.bloodPressure}</p>
              </div>
              <div class="vital-box">
                <p>Pulse</p>
                <p>${prescription.vitals.pulse}</p>
              </div>
              <div class="vital-box">
                <p>Temperature</p>
                <p>${prescription.vitals.temperature}</p>
              </div>
              <div class="vital-box">
                <p>Weight</p>
                <p>${prescription.vitals.weight}</p>
              </div>
            </div>

            <!-- Diagnosis -->
            <div class="diagnosis">
              <h3>Diagnosis</h3>
              <div class="diagnosis-content">${prescription.diagnosis}</div>
            </div>

            <div class="separator"></div>

            <!-- Medications -->
            <div class="medicines-section">
              <div class="medicines-header">
                <span class="rx-symbol">℞</span>
                <h3>Medications</h3>
              </div>
              <table class="medicines-table">
                <thead>
                  <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 20%;">Medicine</th>
                    <th style="width: 15%;">Dosage</th>
                    <th style="width: 15%;">Frequency</th>
                    <th style="width: 15%;">Duration</th>
                    <th style="width: 30%;">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${medicinesTable}
                </tbody>
              </table>
            </div>

            ${labRadiologyHtml}

            <!-- Instructions & Follow-up -->
            <div class="info-section" style="margin-bottom: 20px;">
              <div>
                <h3 style="font-size: 11px; font-weight: 700; color: #999; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Special Instructions</h3>
                <p style="background: #f8f9fa; padding: 12px; border-radius: 5px; font-size: 12px; color: #555;">${prescription.notes || 'None'}</p>
              </div>
              <div>
                <h3 style="font-size: 11px; font-weight: 700; color: #999; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Follow-up Date</h3>
                <p style="background: #f0fff4; padding: 12px; border-radius: 5px; font-size: 14px; font-weight: 700; color: #10b981;">${prescription.followUpDate}</p>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-left">
                <p>This is a computer-generated prescription.</p>
                <p>Generated on: ${new Date().toLocaleString()}</p>
              </div>
              <div class="signature">
                <div style="width: 180px; margin-bottom: 10px;"></div>
                <div class="signature-line"></div>
                <p class="signature-name">${prescription.doctor.name}</p>
                <p class="signature-title">${prescription.doctor.specialization}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintReferral = (referral: any) => {
    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) return;
    
    const forceNoRow = referral.forceNo ? `<p><span class="label">Force No:</span> ${referral.forceNo}</p>` : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Referral - ${referral.refNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              background: white;
              max-width: 900px;
              margin: 0 auto;
              padding: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #10b981;
            }
            .header-left {
              display: flex;
              gap: 12px;
              align-items: center;
              min-width: 0;
            }
            .logo {
              min-width: 70px;
              width: 70px;
              height: 70px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              overflow: hidden;
            }
            .logo img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .hospital-info h1 {
              font-size: 24px;
              color: #1f2937;
              margin: 0;
              font-weight: 700;
              word-break: break-word;
            }
            .hospital-info p {
              margin: 2px 0;
              font-size: 11px;
              color: #666;
              word-break: break-word;
            }
            .refno-section {
              text-align: right;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .refno-section p:first-child {
              font-size: 11px;
              font-weight: 600;
              color: #666;
              margin-bottom: 4px;
            }
            .refno-section p:nth-child(2) {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
            }
            .refno-section p:nth-child(3) {
              font-size: 11px;
              color: #999;
              margin-top: 4px;
            }
            .title {
              text-align: center;
              margin-bottom: 25px;
            }
            .title h1 {
              font-size: 22px;
              font-weight: 700;
              color: #1f2937;
              margin: 0;
            }
            .title p {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .content {
              margin: 25px 0;
            }
            .content-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 15px;
            }
            .content-item {
              background: #f8f9fa;
              padding: 12px;
              border-radius: 6px;
              border-left: 4px solid #10b981;
            }
            .content-item label {
              font-size: 11px;
              font-weight: 700;
              color: #999;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: block;
              margin-bottom: 6px;
            }
            .content-item p {
              font-size: 13px;
              color: #1f2937;
              margin: 0;
              font-weight: 500;
            }
            .label {
              font-weight: 600;
              color: #1f2937;
            }
            .separator {
              border-top: 1px solid #e0e0e0;
              margin: 25px 0;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
            }
            .footer-left p {
              font-size: 10px;
              color: #999;
              margin: 3px 0;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #000;
              padding-top: 8px;
              margin-bottom: 5px;
            }
            .signature-name {
              font-weight: 600;
              font-size: 12px;
              color: #1f2937;
            }
            .signature-title {
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { background: white; padding: 0; }
              .container { box-shadow: none; padding: 30px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="header-left">
                <div class="logo"><img src="${Logo}" alt="ASF Medical Logo" /></div>
                <div class="hospital-info">
                  <h1>ASF Medical</h1>
                  <p>Healthcare Management System</p>
                  <p>Karachi, Pakistan | Emergency: 0XXX-XXXXXXX</p>
                </div>
              </div>
              <div class="refno-section">
                <p>Referral No:</p>
                <p>${referral.refNo}</p>
                <p>${new Date(referral.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <!-- Title -->
            <div class="title">
              <h1>REFERRAL LETTER</h1>
              <p>Patient Transfer Request for Specialized Care</p>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="content-row">
                <div class="content-item">
                  <label>Patient Name</label>
                  <p>${referral.patientName}</p>
                </div>
                ${forceNoRow ? `
                <div class="content-item">
                  <label>Force No</label>
                  <p>${referral.forceNo}</p>
                </div>
                ` : ''}
              </div>

              <div class="content-row">
                <div class="content-item">
                  <label>Referred To (Hospital)</label>
                  <p>${referral.hospital}</p>
                </div>
                <div class="content-item">
                  <label>Referring Doctor</label>
                  <p>${referral.doctor}</p>
                </div>
              </div>

              <div class="content-item">
                <label>Reason for Referral</label>
                <p>Patient requires specialized treatment and consultation at the above-mentioned facility.</p>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-left">
                <p>This is a computer-generated referral letter.</p>
                <p>Generated on: ${new Date().toLocaleString()}</p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-name">${referral.doctor}</p>
                <p class="signature-title">Referring Physician</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ready: 'bg-success text-success-foreground',
      pending: 'bg-warning text-warning-foreground',
      completed: 'bg-success text-success-foreground',
    };
    return <Badge className={styles[status] || styles.ready}>{status}</Badge>;
  };

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Medical Documents</h2>
          <p className="text-muted-foreground">View and print prescriptions, referrals, and test requests</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or Force No..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="prescriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="prescriptions">
              <FileText className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <FileText className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="lab">
              Lab Requests
            </TabsTrigger>
            <TabsTrigger value="radiology">
              Radiology Requests
            </TabsTrigger>
          </TabsList>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RX No</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Force No</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono font-semibold">{p.rxNo}</TableCell>
                        <TableCell>{p.patient.name}</TableCell>
                        <TableCell>{p.patient.forceNo || '-'}</TableCell>
                        <TableCell>{p.doctor.name}</TableCell>
                        <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintPrescription(p)}
                              className="gap-1"
                            >
                              <Printer className="w-4 h-4" />
                              Print
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref No</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Force No</TableHead>
                      <TableHead>Referred To</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.map((r) => (
                      <TableRow key={r._id || r.id}>
                        <TableCell className="font-mono font-semibold">{r.referralNo}</TableCell>
                        <TableCell>{r.patientName}</TableCell>
                        <TableCell>{r.forceNo || '-'}</TableCell>
                        <TableCell>{r.referredTo}</TableCell>
                        <TableCell>{r.referredDoctor || '-'}</TableCell>
                        <TableCell>{new Date(r.date || r.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintReferral(r)}
                              className="gap-1"
                            >
                              <Printer className="w-4 h-4" />
                              Print
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Requests Tab */}
          <TabsContent value="lab">
            <Card>
              <CardHeader>
                <CardTitle>Lab Test Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lab No</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Force No</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabRequests.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-mono font-semibold">{l.labNo}</TableCell>
                        <TableCell>{l.patientName}</TableCell>
                        <TableCell>{l.forceNo || '-'}</TableCell>
                        <TableCell>{l.test}</TableCell>
                        <TableCell>{new Date(l.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(l.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Printer className="w-4 h-4" />
                            Print
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Radiology Requests Tab */}
          <TabsContent value="radiology">
            <Card>
              <CardHeader>
                <CardTitle>Radiology Test Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rad No</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Force No</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRadiologyRequests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono font-semibold">{r.radNo}</TableCell>
                        <TableCell>{r.patientName}</TableCell>
                        <TableCell>{r.forceNo || '-'}</TableCell>
                        <TableCell>{r.test}</TableCell>
                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Printer className="w-4 h-4" />
                            Print
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDocuments;
