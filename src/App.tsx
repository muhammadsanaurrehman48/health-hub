import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ReceptionistDashboard from "./pages/dashboards/ReceptionistDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import RadiologistDashboard from "./pages/dashboards/RadiologistDashboard";
import LaboratoryDashboard from "./pages/dashboards/LaboratoryDashboard";
import PharmacyDashboard from "./pages/dashboards/PharmacyDashboard";
import InventoryDashboard from "./pages/dashboards/InventoryDashboard";
import BillingDashboard from "./pages/dashboards/BillingDashboard";
import NurseDashboard from "./pages/dashboards/NurseDashboard";

// Receptionist Pages
import PatientRegister from "./pages/receptionist/PatientRegister";
import PatientSearchPage from "./pages/receptionist/PatientSearchPage";
import AppointmentsPage from "./pages/receptionist/AppointmentsPage";
import EntriesPage from "./pages/receptionist/EntriesPage";
import BillingPage from "./pages/receptionist/BillingPage";

// Doctor Pages
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import ConsultationPage from "./pages/doctor/ConsultationPage";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorPatientHistory from "./pages/doctor/DoctorPatientHistory";
import DoctorLabRequests from "./pages/doctor/DoctorLabRequests";
import DoctorRadiologyRequests from "./pages/doctor/DoctorRadiologyRequests";

// Pharmacy Pages
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyInventory from "./pages/pharmacy/PharmacyInventory";

// Laboratory Pages
import LaboratoryRequests from "./pages/laboratory/LaboratoryRequests";

// Radiology Pages
import RadiologyRequests from "./pages/radiology/RadiologyRequests";

// Inventory Pages
import InventoryItems from "./pages/inventory/InventoryItems";

// Nurse Pages
import NurseVitals from "./pages/nurse/NurseVitals";
import NurseWards from "./pages/nurse/NurseWards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            
            {/* Receptionist Routes */}
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/patients/register" element={<PatientRegister />} />
            <Route path="/receptionist/patients/search" element={<PatientSearchPage />} />
            <Route path="/receptionist/appointments" element={<AppointmentsPage />} />
            <Route path="/receptionist/entries" element={<EntriesPage />} />
            <Route path="/receptionist/billing" element={<BillingPage />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/consultation/:mrNo" element={<ConsultationPage />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
            <Route path="/doctor/history" element={<DoctorPatientHistory />} />
            <Route path="/doctor/lab-requests" element={<DoctorLabRequests />} />
            <Route path="/doctor/radiology-requests" element={<DoctorRadiologyRequests />} />
            
            {/* Radiologist Routes */}
            <Route path="/radiologist" element={<RadiologistDashboard />} />
            <Route path="/radiologist/requests" element={<RadiologyRequests />} />
            <Route path="/radiologist/*" element={<RadiologistDashboard />} />
            
            {/* Laboratory Routes */}
            <Route path="/laboratory" element={<LaboratoryDashboard />} />
            <Route path="/laboratory/requests" element={<LaboratoryRequests />} />
            <Route path="/laboratory/*" element={<LaboratoryDashboard />} />
            
            {/* Pharmacy Routes */}
            <Route path="/pharmacy" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/prescriptions" element={<PharmacyPrescriptions />} />
            <Route path="/pharmacy/dispense" element={<PharmacyPrescriptions />} />
            <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
            <Route path="/pharmacy/*" element={<PharmacyDashboard />} />
            
            {/* Inventory Routes */}
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/inventory/items" element={<InventoryItems />} />
            <Route path="/inventory/*" element={<InventoryDashboard />} />
            
            {/* Billing Routes */}
            <Route path="/billing" element={<BillingDashboard />} />
            <Route path="/billing/*" element={<BillingDashboard />} />
            
            {/* Nurse Routes */}
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/vitals" element={<NurseVitals />} />
            <Route path="/nurse/wards" element={<NurseWards />} />
            <Route path="/nurse/*" element={<NurseDashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
