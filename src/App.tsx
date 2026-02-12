import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import QueueDisplay from "./pages/QueueDisplay";

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ReceptionistDashboard from "./pages/dashboards/ReceptionistDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import RadiologistDashboard from "./pages/dashboards/RadiologistDashboard";
import LaboratoryDashboard from "./pages/dashboards/LaboratoryDashboard";
import PharmacyDashboard from "./pages/dashboards/PharmacyDashboard";
import InventoryDashboard from "./pages/dashboards/InventoryDashboard";
import BillingDashboard from "./pages/dashboards/BillingDashboard";
import NurseDashboard from "./pages/nurse/NurseDashboard";

// Admin Pages
import UserManagement from "./pages/admin/UserManagement";
import Departments from "./pages/admin/Departments";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminBillingOverview from "./pages/admin/AdminBillingOverview";

// Receptionist Pages
import PatientRegister from "./pages/receptionist/PatientRegister";
import PatientSearchPage from "./pages/receptionist/PatientSearchPage";
import AppointmentsPage from "./pages/receptionist/AppointmentsPage";
import EntriesPage from "./pages/receptionist/EntriesPage";
import BillingPage from "./pages/receptionist/BillingPage";
import ReceptionistDocuments from "./pages/receptionist/ReceptionistDocuments";
import ReceptionistReferrals from "./pages/receptionist/ReceptionistReferrals";

// Doctor Pages
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import ConsultationPage from "./pages/doctor/ConsultationPage";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorPatientHistory from "./pages/doctor/DoctorPatientHistory";
import DoctorLabRequests from "./pages/doctor/DoctorLabRequests";
import DoctorRadiologyRequests from "./pages/doctor/DoctorRadiologyRequests";
import DoctorReferrals from "./pages/doctor/DoctorReferrals";

// Pharmacy Pages
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyInventory from "./pages/pharmacy/PharmacyInventory";
import PharmacyAlerts from "./pages/pharmacy/PharmacyAlerts";

// Laboratory Pages
import LaboratoryRequests from "./pages/laboratory/LaboratoryRequests";
import SampleCollection from "./pages/laboratory/SampleCollection";
import ResultsEntry from "./pages/laboratory/ResultsEntry";
import LabReports from "./pages/laboratory/LabReports";

// Radiology Pages
import RadiologyRequests from "./pages/radiology/RadiologyRequests";
import UploadReports from "./pages/radiology/UploadReports";
import CompletedReports from "./pages/radiology/CompletedReports";

// Inventory Pages
import InventoryItems from "./pages/inventory/InventoryItems";
import AddStock from "./pages/inventory/AddStock";
import StockAlerts from "./pages/inventory/StockAlerts";
import Transactions from "./pages/inventory/Transactions";
import InventoryReports from "./pages/inventory/InventoryReports";

// Billing Pages
import GenerateInvoice from "./pages/billing/GenerateInvoice";
import Payments from "./pages/billing/Payments";
import BillingReports from "./pages/billing/BillingReports";

// Nurse Pages
import NurseVitals from "./pages/nurse/NurseVitals";
import NurseWards from "./pages/nurse/NurseWards";
import MedicationRecords from "./pages/nurse/MedicationRecords";
import CareNotes from "./pages/nurse/CareNotes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/queue-display/:roomNo" element={<QueueDisplay />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/billing" element={<AdminBillingOverview />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            {/* Receptionist Routes */}
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/patients/register" element={<PatientRegister />} />
            <Route path="/receptionist/patients/search" element={<PatientSearchPage />} />
            <Route path="/receptionist/appointments" element={<AppointmentsPage />} />
            <Route path="/receptionist/entries" element={<EntriesPage />} />
            <Route path="/receptionist/billing" element={<BillingPage />} />
            <Route path="/receptionist/referrals" element={<ReceptionistReferrals />} />
            <Route path="/receptionist/documents" element={<ReceptionistDocuments />} />
            
              {/* Doctor Routes */}
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/consultation/:forceNo" element={<ConsultationPage />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/history" element={<DoctorPatientHistory />} />
              <Route path="/doctor/lab-requests" element={<DoctorLabRequests />} />
              <Route path="/doctor/radiology-requests" element={<DoctorRadiologyRequests />} />
              <Route path="/doctor/referrals" element={<DoctorReferrals />} />
            
            {/* Radiologist Routes */}
            <Route path="/radiologist" element={<RadiologistDashboard />} />
            <Route path="/radiologist/requests" element={<RadiologyRequests />} />
            <Route path="/radiologist/upload" element={<UploadReports />} />
            <Route path="/radiologist/completed" element={<CompletedReports />} />
            
            {/* Laboratory Routes */}
            <Route path="/laboratory" element={<LaboratoryDashboard />} />
            <Route path="/laboratory/requests" element={<LaboratoryRequests />} />
            <Route path="/laboratory/samples" element={<SampleCollection />} />
            <Route path="/laboratory/results" element={<ResultsEntry />} />
            <Route path="/laboratory/reports" element={<LabReports />} />
            
            {/* Pharmacy Routes */}
            <Route path="/pharmacy" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/prescriptions" element={<PharmacyPrescriptions />} />
            <Route path="/pharmacy/dispense" element={<PharmacyPrescriptions />} />
            <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
            <Route path="/pharmacy/alerts" element={<PharmacyAlerts />} />
            
            {/* Inventory Routes */}
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/inventory/items" element={<InventoryItems />} />
            <Route path="/inventory/add" element={<AddStock />} />
            <Route path="/inventory/alerts" element={<StockAlerts />} />
            <Route path="/inventory/transactions" element={<Transactions />} />
            <Route path="/inventory/reports" element={<InventoryReports />} />
            
            {/* Billing Routes */}
            <Route path="/billing" element={<BillingDashboard />} />
            <Route path="/billing/generate" element={<GenerateInvoice />} />
            <Route path="/billing/payments" element={<Payments />} />
            <Route path="/billing/reports" element={<BillingReports />} />
            
            {/* Nurse Routes */}
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/vitals" element={<NurseVitals />} />
            <Route path="/nurse/wards" element={<NurseWards />} />
            <Route path="/nurse/medications" element={<MedicationRecords />} />
            <Route path="/nurse/notes" element={<CareNotes />} />
            
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
