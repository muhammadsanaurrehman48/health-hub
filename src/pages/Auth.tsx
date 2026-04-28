import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { rolesList, UserRole, ROLES } from '@/types/roles';
import Logo from '@/assets/logo.png';
import { AnimatedBackground } from '@/components/common/AnimatedBackground';
import { ThemeToggle } from '@/components/common/ThemeToggle';
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
} from 'lucide-react';

const roleIcons: Record<UserRole, React.ElementType> = {
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

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('doctor');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!loginEmail || !loginPassword) {
        throw new Error('Please fill in all fields');
      }
      await login(loginEmail, loginPassword, loginRole);
      navigate(ROLES[loginRole].path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8 slide-in-top">
          <div className="flex justify-center mb-4">
            <img 
              src={Logo} 
              alt="Smart Hospital Management System" 
              className="w-48 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 float-animate" 
              style={{maxWidth: '100%', height: 'auto'}} 
            />
          </div>
        </div>

        <Card className="border-border shadow-lg backdrop-blur-sm bg-card/95 hover:shadow-xl transition-all duration-300 slide-in-bottom fade-in-scale">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in with your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@smarthospital.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-role">Select Your Role</Label>
                <Select value={loginRole} onValueChange={(v) => setLoginRole(v as UserRole)}>
                  <SelectTrigger id="login-role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesList.map((role) => {
                      const Icon = roleIcons[role.role];
                      return (
                        <SelectItem key={role.role} value={role.role}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{role.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full transition-all duration-300 hover:scale-105 active:scale-95 pulse-glow" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Contact administrator if you need access credentials
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6 slide-in-bottom" style={{animationDelay: '0.2s'}}>
          © 2025 Smart Hospital HMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Auth;
