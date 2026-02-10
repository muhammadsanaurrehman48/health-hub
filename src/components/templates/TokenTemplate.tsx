 import React, { useRef } from 'react';
 import { Button } from '@/components/ui/button';
 import { Separator } from '@/components/ui/separator';
 import { Printer } from 'lucide-react';
 
interface TokenData {
  tokenNo: string;
  patientName: string;
  mrNo?: string;
  department: string;
  doctor: string;
  date: string;
  time: string;
  type: 'OPD' | 'IPD';
}
 
 interface TokenTemplateProps {
   data: TokenData;
   onClose?: () => void;
 }
 
 /**
  * Token Template for Thermal Printer
  * Dimensions: 80mm width (standard thermal roll)
  * Optimized for receipt printers commonly used in hospitals
  */
 const TokenTemplate: React.FC<TokenTemplateProps> = ({ data, onClose }) => {
   const printRef = useRef<HTMLDivElement>(null);
 
   const handlePrint = () => {
     const printContent = printRef.current;
     if (!printContent) return;
 
     const printWindow = window.open('', '', 'width=302,height=500');
     if (!printWindow) return;
 
     printWindow.document.write(`
       <html>
         <head>
           <title>Token - ${data.tokenNo}</title>
           <style>
             @page { 
               size: 80mm auto;
               margin: 2mm;
             }
             body {
               font-family: 'Courier New', monospace;
               width: 76mm;
               margin: 0;
               padding: 2mm;
               font-size: 12px;
               line-height: 1.4;
             }
             .center { text-align: center; }
             .bold { font-weight: bold; }
             .large { font-size: 24px; }
             .medium { font-size: 14px; }
             .small { font-size: 10px; }
             .divider { border-top: 1px dashed #000; margin: 4mm 0; }
             .row { display: flex; justify-content: space-between; margin: 1mm 0; }
             .token-box {
               border: 2px solid #000;
               padding: 3mm;
               margin: 2mm 0;
               text-align: center;
             }
           </style>
         </head>
         <body>
           <div class="center bold medium">ASF MEDICAL</div>
           <div class="center small">Health Management System</div>
           <div class="center small">Karachi | Tel: 021-1234567</div>
           <div class="divider"></div>
           
           <div class="token-box">
             <div class="small">${data.type} TOKEN</div>
             <div class="large bold">${data.tokenNo}</div>
           </div>
           
           <div class="divider"></div>
           
            <div class="row">
              <span>Patient:</span>
              <span class="bold">${data.patientName}</span>
            </div>
            ${data.mrNo ? '<div class="row"><span>MR No:</span><span>' + data.mrNo + '</span></div>' : ''}
           <div class="row">
             <span>Department:</span>
             <span>${data.department}</span>
           </div>
           <div class="row">
             <span>Doctor:</span>
             <span>${data.doctor}</span>
           </div>
           
           <div class="divider"></div>
           
           <div class="row">
             <span>Date:</span>
             <span>${data.date}</span>
           </div>
           <div class="row">
             <span>Time:</span>
             <span>${data.time}</span>
           </div>
           
           <div class="divider"></div>
           
           <div class="center small">
             Please wait for your turn.<br/>
             Keep this token safe.
           </div>
           
           <div class="center small" style="margin-top: 3mm;">
             *** Thank You ***
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
 
   return (
     <div className="space-y-4">
       <div className="flex justify-end gap-2 print:hidden">
         <Button onClick={handlePrint}>
           <Printer className="w-4 h-4 mr-2" />
           Print Token
         </Button>
       </div>
 
       {/* Preview - 80mm width simulation */}
       <div
         ref={printRef}
        className="mx-auto bg-card text-card-foreground p-4 font-mono text-sm shadow-lg border"
         style={{ width: '302px' }} // 80mm ≈ 302px at 96dpi
       >
         {/* Header */}
         <div className="text-center">
           <p className="font-bold text-base">ASF MEDICAL</p>
          <p className="text-xs text-muted-foreground">Health Management System</p>
          <p className="text-xs text-muted-foreground">Karachi | Tel: 021-1234567</p>
         </div>
 
         <Separator className="my-3 border-dashed" />
 
         {/* Token Number Box */}
        <div className="border-2 border-foreground p-3 text-center my-3">
          <p className="text-xs text-muted-foreground">{data.type} TOKEN</p>
           <p className="text-3xl font-bold">{data.tokenNo}</p>
         </div>
 
         <Separator className="my-3 border-dashed" />
 
         {/* Patient Details */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Patient:</span>
              <span className="font-bold">{data.patientName}</span>
            </div>
            {data.mrNo && (
              <div className="flex justify-between">
                <span>MR No:</span>
                <span>{data.mrNo}</span>
              </div>
            )}
           <div className="flex justify-between">
             <span>Department:</span>
             <span>{data.department}</span>
           </div>
           <div className="flex justify-between">
             <span>Doctor:</span>
             <span>{data.doctor}</span>
           </div>
         </div>
 
         <Separator className="my-3 border-dashed" />
 
         {/* Date & Time */}
         <div className="space-y-1 text-xs">
           <div className="flex justify-between">
             <span>Date:</span>
             <span>{data.date}</span>
           </div>
           <div className="flex justify-between">
             <span>Time:</span>
             <span>{data.time}</span>
           </div>
         </div>
 
         <Separator className="my-3 border-dashed" />
 
         {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
           <p>Please wait for your turn.</p>
           <p>Keep this token safe.</p>
           <p className="mt-2">*** Thank You ***</p>
         </div>
       </div>
     </div>
   );
 };
 
 export default TokenTemplate;