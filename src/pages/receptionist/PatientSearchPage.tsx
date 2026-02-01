import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PatientSearch from '@/components/patients/PatientSearch';

const PatientSearchPage: React.FC = () => {
  return (
    <DashboardLayout requiredRole="receptionist">
      <PatientSearch />
    </DashboardLayout>
  );
};

export default PatientSearchPage;
