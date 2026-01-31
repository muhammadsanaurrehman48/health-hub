import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/types/roles';
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
  ArrowRight,
  CheckCircle,
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

const features = [
  { title: 'Role-Based Access', description: 'Each user sees only their relevant modules and data' },
  { title: 'Digital Prescriptions', description: 'Generate and manage electronic prescriptions' },
  { title: 'Lab & Radiology Integration', description: 'Seamless test ordering and report viewing' },
  { title: 'Inventory Management', description: 'Track medicines, equipment, and supplies' },
  { title: 'Billing & Invoicing', description: 'Generate bills for all departments' },
  { title: 'Patient Records', description: 'Complete medical history at your fingertips' },
];

const Index: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      navigate(ROLES[user.role].path);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Smart Hospital" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="font-semibold text-foreground">Smart Hospital</h1>
              <p className="text-xs text-muted-foreground">Health Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {user.name}
                </span>
                <Button onClick={() => navigate(ROLES[user.role].path)}>
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Trusted by Healthcare Professionals
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Complete Hospital
            <br />
            <span className="text-primary">Management Solution</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your hospital operations with our comprehensive, role-based health management system. 
            From patient registration to billing - everything in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleGetStarted} className="px-8">
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Role-Based Dashboards</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each user role has a dedicated dashboard with features specific to their responsibilities
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.values(ROLES).map((role) => {
              const Icon = roleIcons[role.role];
              return (
                <div
                  key={role.role}
                  className="bg-card rounded-xl border border-border p-4 text-center hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{role.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete solution designed to digitize and streamline all hospital operations
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join healthcare professionals who have already digitized their workflow with Smart Hospital HMS.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="px-8">
            {isAuthenticated ? 'Go to Dashboard' : 'Start Now'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Smart Hospital" className="w-8 h-8 rounded-lg" />
            <span className="font-medium text-foreground">Smart Hospital HMS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Smart Hospital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
