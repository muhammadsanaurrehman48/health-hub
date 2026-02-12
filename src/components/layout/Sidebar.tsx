import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Logo from '@/assets/logo.png';
import {
  Shield,
  UserPlus,
  Stethoscope,
  Scan,
  FlaskConical,
  Pill,
  Package,
  Receipt,
  HeartPulse,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  ClipboardList,
  Activity,
  Beaker,
  Boxes,
  CreditCard,
  BedDouble,
  BarChart3,
  Building2,
} from 'lucide-react';

const roleIcons = {
  admin: Shield,
  receptionist: UserPlus,
  doctor: Stethoscope,
  radiologist: Scan,
  laboratory: FlaskConical,
  pharmacy: Pill,
  inventory: Package,
  billing: Receipt,
  nurse: HeartPulse,
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const getNavItems = (role: string): NavItem[] => {
  const basePath = `/${role}`;
  
  const commonItems: NavItem[] = [
    { label: 'Dashboard', path: basePath, icon: LayoutDashboard },
  ];

  const roleSpecificItems: Record<string, NavItem[]> = {
    admin: [
      { label: 'User Management', path: `${basePath}/users`, icon: Users },
      { label: 'Departments', path: `${basePath}/departments`, icon: Building2 },
      { label: 'Reports', path: `${basePath}/reports`, icon: BarChart3 },
      { label: 'Billing Overview', path: `${basePath}/billing`, icon: CreditCard },
      { label: 'Settings', path: `${basePath}/settings`, icon: Settings },
    ],
    receptionist: [
      { label: 'Patient Registration', path: `${basePath}/patients/register`, icon: UserPlus },
      { label: 'Search Patients', path: `${basePath}/patients/search`, icon: Users },
      { label: 'Appointments', path: `${basePath}/appointments`, icon: Calendar },
      { label: 'OPD/IPD Entries', path: `${basePath}/entries`, icon: ClipboardList },
      { label: 'Billing', path: `${basePath}/billing`, icon: Receipt },
    ],
    doctor: [
      { label: 'Appointments', path: `${basePath}/appointments`, icon: Calendar },
      { label: 'Patient History', path: `${basePath}/history`, icon: FileText },
      { label: 'Prescriptions', path: `${basePath}/prescriptions`, icon: ClipboardList },
      { label: 'Lab Requests', path: `${basePath}/lab-requests`, icon: Beaker },
      { label: 'Radiology Requests', path: `${basePath}/radiology-requests`, icon: Scan },
    ],
    radiologist: [
      { label: 'Test Requests', path: `${basePath}/requests`, icon: ClipboardList },
      { label: 'Upload Reports', path: `${basePath}/upload`, icon: FileText },
      { label: 'Completed Reports', path: `${basePath}/completed`, icon: FileText },
    ],
    laboratory: [
      { label: 'Test Requests', path: `${basePath}/requests`, icon: ClipboardList },
      { label: 'Sample Collection', path: `${basePath}/samples`, icon: Beaker },
      { label: 'Results Entry', path: `${basePath}/results`, icon: Activity },
      { label: 'Reports', path: `${basePath}/reports`, icon: FileText },
    ],
    pharmacy: [
      { label: 'Prescriptions', path: `${basePath}/prescriptions`, icon: ClipboardList },
      { label: 'Dispense Medicine', path: `${basePath}/dispense`, icon: Pill },
      { label: 'Inventory', path: `${basePath}/inventory`, icon: Boxes },
      { label: 'Stock Alerts', path: `${basePath}/alerts`, icon: Activity },
    ],
    inventory: [
      { label: 'All Items', path: `${basePath}/items`, icon: Boxes },
      { label: 'Add Stock', path: `${basePath}/add`, icon: Package },
      { label: 'Stock Alerts', path: `${basePath}/alerts`, icon: Activity },
      { label: 'Transactions', path: `${basePath}/transactions`, icon: ClipboardList },
      { label: 'Reports', path: `${basePath}/reports`, icon: BarChart3 },
    ],
    billing: [
      { label: 'Generate Invoice', path: `${basePath}/generate`, icon: Receipt },
      { label: 'Payments', path: `${basePath}/payments`, icon: CreditCard },
      { label: 'Reports', path: `${basePath}/reports`, icon: BarChart3 },
    ],
    nurse: [
      { label: 'Patient Vitals', path: `${basePath}/vitals`, icon: Activity },
      { label: 'Ward Management', path: `${basePath}/wards`, icon: BedDouble },
      { label: 'Medication Records', path: `${basePath}/medications`, icon: Pill },
      { label: 'Care Notes', path: `${basePath}/notes`, icon: FileText },
    ],
  };

  return [...commonItems, ...(roleSpecificItems[role] || [])];
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const RoleIcon = roleIcons[user.role];
  const navItems = getNavItems(user.role);

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo & Brand */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="ASF Medical Center" className="w-10 h-10 rounded-lg" />
          <div>
            <h1 className="font-semibold text-sidebar-foreground">ASF Medical</h1>
            <p className="text-xs text-muted-foreground">Karachi</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent rounded-lg">
          <RoleIcon className="w-4 h-4 text-sidebar-primary" />
          <span className="text-sm font-medium text-sidebar-accent-foreground capitalize">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item',
                isActive && 'nav-item-active'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="text-xs text-center text-muted-foreground">
          © 2025 ASF Medical HMS
        </div>
      </div>
    </aside>
  );
};
