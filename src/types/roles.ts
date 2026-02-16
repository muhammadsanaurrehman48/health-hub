export type UserRole = 
  | 'admin'
  | 'receptionist'
  | 'doctor'
  | 'radiologist'
  | 'laboratory'
  | 'pharmacy'
  | 'inventory'
  | 'billing'
  | 'nurse';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  roomNo?: string;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    label: 'Administrator',
    description: 'Full system access and management',
    icon: 'Shield',
    color: 'bg-primary',
    path: '/admin',
  },
  receptionist: {
    role: 'receptionist',
    label: 'Receptionist',
    description: 'Patient registration and appointments',
    icon: 'UserPlus',
    color: 'bg-primary',
    path: '/receptionist',
  },
  doctor: {
    role: 'doctor',
    label: 'Doctor',
    description: 'Patient consultations and prescriptions',
    icon: 'Stethoscope',
    color: 'bg-primary',
    path: '/doctor',
  },
  radiologist: {
    role: 'radiologist',
    label: 'Radiologist',
    description: 'Radiology tests and reports',
    icon: 'Scan',
    color: 'bg-primary',
    path: '/radiologist',
  },
  laboratory: {
    role: 'laboratory',
    label: 'Laboratory',
    description: 'Lab tests and results',
    icon: 'FlaskConical',
    color: 'bg-primary',
    path: '/laboratory',
  },
  pharmacy: {
    role: 'pharmacy',
    label: 'Pharmacist',
    description: 'Medicine dispensing and inventory',
    icon: 'Pill',
    color: 'bg-primary',
    path: '/pharmacy',
  },
  inventory: {
    role: 'inventory',
    label: 'Inventory Manager',
    description: 'Stock and supplies management',
    icon: 'Package',
    color: 'bg-primary',
    path: '/inventory',
  },
  billing: {
    role: 'billing',
    label: 'Billing & Accounts',
    description: 'Invoices and payments',
    icon: 'Receipt',
    color: 'bg-primary',
    path: '/billing',
  },
  nurse: {
    role: 'nurse',
    label: 'Nurse',
    description: 'Patient care and vitals',
    icon: 'HeartPulse',
    color: 'bg-primary',
    path: '/nurse',
  },
};

export const rolesList = Object.values(ROLES);
