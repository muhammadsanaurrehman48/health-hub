import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
            <Route path="/receptionist/*" element={<ReceptionistDashboard />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/*" element={<DoctorDashboard />} />
            
            {/* Radiologist Routes */}
            <Route path="/radiologist" element={<RadiologistDashboard />} />
            <Route path="/radiologist/*" element={<RadiologistDashboard />} />
            
            {/* Laboratory Routes */}
            <Route path="/laboratory" element={<LaboratoryDashboard />} />
            <Route path="/laboratory/*" element={<LaboratoryDashboard />} />
            
            {/* Pharmacy Routes */}
            <Route path="/pharmacy" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/*" element={<PharmacyDashboard />} />
            
            {/* Inventory Routes */}
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/inventory/*" element={<InventoryDashboard />} />
            
            {/* Billing Routes */}
            <Route path="/billing" element={<BillingDashboard />} />
            <Route path="/billing/*" element={<BillingDashboard />} />
            
            {/* Nurse Routes */}
            <Route path="/nurse" element={<NurseDashboard />} />
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
