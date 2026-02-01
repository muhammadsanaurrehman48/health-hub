import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PatientRegistrationForm from '@/components/patients/PatientRegistrationForm';

const PatientRegister: React.FC = () => {
  return (
    <DashboardLayout requiredRole="receptionist">
      <PatientRegistrationForm />
    </DashboardLayout>
  );
};

export default PatientRegister;
