import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { rolesList, UserRole, ROLES } from '@/types/roles';
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
  const { login, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('doctor');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('doctor');

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
        throw new Error('Please fill in all fields');
      }
      if (signupPassword !== signupConfirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (signupPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      await signup(signupName, signupEmail, signupPassword, signupRole);
      navigate(ROLES[signupRole].path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Smart Hospital" className="w-20 h-20 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Smart Hospital</h1>
          <p className="text-muted-foreground mt-1">Health Management System</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 bg-destructive-muted text-destructive text-sm rounded-lg">
                  {error}
                </div>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
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
                    <Label htmlFor="login-role">Role</Label>
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Dr. John Smith"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select value={signupRole} onValueChange={(v) => setSignupRole(v as UserRole)}>
                      <SelectTrigger id="signup-role">
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
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 Smart Hospital HMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Auth;
